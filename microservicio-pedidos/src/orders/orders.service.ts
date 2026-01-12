import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { firstValueFrom } from 'rxjs';

type OrganizerStatsFilters = {
  from?: string;
  to?: string;
  stallId?: string;
  status?: OrderStatus;
  productIds?: string[];
};

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private readonly itemRepo: Repository<OrderItem>,
    private readonly dataSource: DataSource,
    @Inject('PRODUCTS_SERVICE') private readonly productsClient: ClientProxy,
    @Inject('STALLS_SERVICE') private readonly stallsClient: ClientProxy,
    @Inject('USERS_SERVICE') private readonly usersClient: ClientProxy,
  ) {}

  private async validateCustomer(userId: string): Promise<void> {
    const resp = await firstValueFrom(this.usersClient.send('auth_validate_user', { userId, role: 'cliente' }));
    if (resp?.status !== 'success') throw new Error('Solo usuarios con rol cliente pueden crear órdenes');
  }

  private async validateUserRole(userId: string, role: string): Promise<void> {
    const response = await firstValueFrom(this.usersClient.send('auth_validate_user', { userId, role }));
    if (response?.status !== 'success') throw new Error('Usuario no tiene el rol adecuado');
  }

  private getDateRange(filters?: OrganizerStatsFilters): { from?: Date; toExclusive?: Date } {
    if (!filters?.from && !filters?.to) return {};

    const from = filters.from ? new Date(`${filters.from}T00:00:00.000Z`) : undefined;
    const toExclusive = filters.to ? new Date(`${filters.to}T00:00:00.000Z`) : undefined;
    if (toExclusive) {
      toExclusive.setUTCDate(toExclusive.getUTCDate() + 1);
    }

    return { from, toExclusive };
  }

  async create(userId: string, stallId: string, order: { customerId: string; items: Array<{ productId: string; quantity: number }>; notes?: string }) {
    await this.validateUserRole(userId, 'cliente');
    await this.validateCustomer(userId);

    if (!stallId) throw new Error('stallId es requerido');
    if (!order?.customerId) throw new Error('customerId es requerido');
    if (!Array.isArray(order?.items) || order.items.length === 0) throw new Error('items es requerido');

    // Validar puesto activo usando stalls_find_one (no existe stalls_validate_active)
    const stallResp = await firstValueFrom(this.stallsClient.send('stalls_find_one', { id: stallId }));
    if (stallResp?.status !== 'success' || !stallResp.data) {
      throw new Error(stallResp?.message || `Puesto no encontrado: ${stallId}`);
    }
    if (stallResp.data.status !== 'activo') {
      throw new Error(`Puesto no activo: estado actual '${stallResp.data.status}'`);
    }

    // Obtener info de productos, validar pertenencia al stall, stock y calcular totales
    const itemsDetailed: Array<{ productId: string; quantity: number; unitPrice: number; subtotal: number }>= [];
    let total = 0;
    const productsSnapshot: Record<string, { stock: number; price: string; isAvailable: boolean; stallId: string }> = {};
    for (const item of order.items) {
      const pResp = await firstValueFrom(this.productsClient.send('products_find_one', { userId, id: item.productId }));
      if (pResp?.status !== 'success' || !pResp.data) {
        throw new Error(pResp?.message || `Producto no encontrado: ${item.productId}`);
      }
      const product = pResp.data;
      if (product.stallId !== stallId) {
        throw new Error(`Producto ${product.id} no pertenece al puesto ${stallId}`);
      }
      if (!product.isAvailable || product.stock < item.quantity) {
        throw new Error(`Stock insuficiente o producto no disponible: ${product.id}`);
      }
      productsSnapshot[item.productId] = { stock: product.stock, price: product.price, isAvailable: product.isAvailable, stallId: product.stallId };
      const unitPrice = Number(product.price);
      const subtotal = unitPrice * item.quantity;
      itemsDetailed.push({ productId: item.productId, quantity: item.quantity, unitPrice, subtotal });
      total += subtotal;
    }

    // Descontar stock usando products_update (no existe products_decrement_stock)
    for (const item of order.items) {
      const current = productsSnapshot[item.productId];
      const newStock = current.stock - item.quantity;
      const updResp = await firstValueFrom(this.productsClient.send('products_update', { userId, id: item.productId, product: { stock: newStock } }));
      if (updResp?.status !== 'success') {
        throw new Error(updResp?.message || `No se pudo actualizar stock del producto ${item.productId}`);
      }
    }

    // Transacción: guardar la orden y sus items
    return await this.dataSource.transaction(async (manager) => {
      const orderEntity = manager.create(Order, {
        customerId: order.customerId,
        stallId,
        status: 'pendiente' as OrderStatus,
        totalAmount: total.toFixed(2),
        items: itemsDetailed.map((i) => manager.create(OrderItem, {
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.unitPrice.toFixed(2),
        })),
      });
      return manager.save(orderEntity);
    });
  }

  async updateStatus(userId: string, id: string, status: OrderStatus) {
    const allowed: OrderStatus[] = ['pendiente', 'preparando', 'listo', 'entregado'];
    if (!allowed.includes(status)) throw new Error('Estado inválido');
    const order = await this.orderRepo.findOne({ where: { id }, relations: ['items'] });
    if (!order) throw new Error('Pedido no encontrado');
    order.status = status;
    return this.orderRepo.save(order);
  }

  async findByCustomer(customerId: string) {
    return this.orderRepo.find({ where: { customerId }, relations: ['items'] });
  }

  async findByStall(stallId: string) {
    return this.orderRepo.find({ where: { stallId }, relations: ['items'] });
  }


  async organizerOverview(userId: string, filters?: OrganizerStatsFilters) {
    await this.validateUserRole(userId, 'organizador');

    if (filters?.productIds && filters.productIds.length === 0) {
      return {
        totalOrders: 0,
        completedOrders: 0,
        totalSales: '0',
        totalSalesAll: '0',
        uniqueStalls: 0,
      };
    }

    const { from, toExclusive } = this.getDateRange(filters);

    const baseOrdersQb = this.orderRepo.createQueryBuilder('o');
    if (filters?.stallId) baseOrdersQb.andWhere('o.stallId = :stallId', { stallId: filters.stallId });
    if (filters?.status) baseOrdersQb.andWhere('o.status = :status', { status: filters.status });
    if (from) baseOrdersQb.andWhere('o.createdAt >= :from', { from });
    if (toExclusive) baseOrdersQb.andWhere('o.createdAt < :toExclusive', { toExclusive });

    const totalOrders = await baseOrdersQb.getCount();

    const completedOrdersQb = this.orderRepo.createQueryBuilder('o');
    if (filters?.stallId) completedOrdersQb.andWhere('o.stallId = :stallId', { stallId: filters.stallId });
    if (from) completedOrdersQb.andWhere('o.createdAt >= :from', { from });
    if (toExclusive) completedOrdersQb.andWhere('o.createdAt < :toExclusive', { toExclusive });
    completedOrdersQb.andWhere('o.status = :status', { status: 'entregado' });
    const completedOrdersCount = await completedOrdersQb.getCount();

    const totalSalesQb = this.itemRepo
      .createQueryBuilder('i')
      .innerJoin('i.order', 'o')
      .select('COALESCE(SUM(i.quantity * i.unitPrice), 0)', 'total')
      .where('o.status = :delivered', { delivered: 'entregado' });
    if (filters?.stallId) totalSalesQb.andWhere('o.stallId = :stallId', { stallId: filters.stallId });
    if (filters?.status) totalSalesQb.andWhere('o.status = :status', { status: filters.status });
    if (from) totalSalesQb.andWhere('o.createdAt >= :from', { from });
    if (toExclusive) totalSalesQb.andWhere('o.createdAt < :toExclusive', { toExclusive });
    if (filters?.productIds) totalSalesQb.andWhere('i.productId IN (:...productIds)', { productIds: filters.productIds });
    const totalSalesRaw = await totalSalesQb.getRawOne<{ total: string }>();

    const totalSalesAllQb = this.itemRepo
      .createQueryBuilder('i')
      .innerJoin('i.order', 'o')
      .select('COALESCE(SUM(i.quantity * i.unitPrice), 0)', 'total');
    if (filters?.stallId) totalSalesAllQb.andWhere('o.stallId = :stallId', { stallId: filters.stallId });
    if (filters?.status) totalSalesAllQb.andWhere('o.status = :status', { status: filters.status });
    if (from) totalSalesAllQb.andWhere('o.createdAt >= :from', { from });
    if (toExclusive) totalSalesAllQb.andWhere('o.createdAt < :toExclusive', { toExclusive });
    if (filters?.productIds) totalSalesAllQb.andWhere('i.productId IN (:...productIds)', { productIds: filters.productIds });
    const totalSalesAllRaw = await totalSalesAllQb.getRawOne<{ total: string }>();

    const uniqueStallsQb = this.orderRepo.createQueryBuilder('o').select('COUNT(DISTINCT o.stallId)', 'count');
    if (filters?.stallId) uniqueStallsQb.andWhere('o.stallId = :stallId', { stallId: filters.stallId });
    if (filters?.status) uniqueStallsQb.andWhere('o.status = :status', { status: filters.status });
    if (from) uniqueStallsQb.andWhere('o.createdAt >= :from', { from });
    if (toExclusive) uniqueStallsQb.andWhere('o.createdAt < :toExclusive', { toExclusive });
    const uniqueStallsRaw = await uniqueStallsQb.getRawOne<{ count: string }>();

    return {
      totalOrders,
      completedOrders: completedOrdersCount,
      totalSales: totalSalesRaw?.total ?? '0',
      totalSalesAll: totalSalesAllRaw?.total ?? '0',
      uniqueStalls: Number(uniqueStallsRaw?.count ?? 0),
    };
  }

  async organizerSalesByStall(userId: string, filters?: OrganizerStatsFilters) {
    await this.validateUserRole(userId, 'organizador');

    if (filters?.productIds && filters.productIds.length === 0) {
      return [];
    }

    const { from, toExclusive } = this.getDateRange(filters);

    const qb = this.itemRepo
      .createQueryBuilder('i')
      .innerJoin('i.order', 'o')
      .select('o.stallId', 'stallId')
      .addSelect('COALESCE(SUM(i.quantity * i.unitPrice), 0)', 'totalsales');

    if (filters?.stallId) qb.where('o.stallId = :stallId', { stallId: filters.stallId });
    if (filters?.status) {
      if (filters?.stallId) qb.andWhere('o.status = :status', { status: filters.status });
      else qb.where('o.status = :status', { status: filters.status });
    } else {
      if (filters?.stallId) qb.andWhere('o.status = :delivered', { delivered: 'entregado' });
      else qb.where('o.status = :delivered', { delivered: 'entregado' });
    }
    if (from) qb.andWhere('o.createdAt >= :from', { from });
    if (toExclusive) qb.andWhere('o.createdAt < :toExclusive', { toExclusive });
    if (filters?.productIds) qb.andWhere('i.productId IN (:...productIds)', { productIds: filters.productIds });

    const rows = await qb
      .groupBy('o.stallId')
      .orderBy('totalsales', 'DESC')
      .getRawMany<{ stallId: string; totalsales: string }>();

    return rows.map((r) => ({ stallId: r.stallId, totalSales: r.totalsales }));
  }

  async organizerTopProduct(userId: string, filters?: OrganizerStatsFilters) {
    await this.validateUserRole(userId, 'organizador');

    if (filters?.productIds && filters.productIds.length === 0) {
      return { productId: null, totalQuantity: '0' };
    }

    const { from, toExclusive } = this.getDateRange(filters);

    const row = await this.itemRepo
      .createQueryBuilder('i')
      .innerJoin('i.order', 'o')
      .select('i.productId', 'productId')
      // Use lowercase aliases to avoid Postgres case-sensitive alias issues in ORDER BY.
      .addSelect('COALESCE(SUM(i.quantity), 0)', 'totalquantity')
      .where('o.status = :status', { status: filters?.status ?? 'entregado' })
      .andWhere(filters?.stallId ? 'o.stallId = :stallId' : '1=1', { stallId: filters?.stallId })
      .andWhere(from ? 'o.createdAt >= :from' : '1=1', { from })
      .andWhere(toExclusive ? 'o.createdAt < :toExclusive' : '1=1', { toExclusive })
      .andWhere(filters?.productIds ? 'i.productId IN (:...productIds)' : '1=1', { productIds: filters?.productIds })
      .groupBy('i.productId')
      .orderBy('totalquantity', 'DESC')
      .limit(1)
      .getRawOne<{ productId: string; totalquantity: string }>();

    if (!row) return { productId: null, totalQuantity: '0' };
    return { productId: row.productId, totalQuantity: row.totalquantity };
  }

  async organizerVolumeByDay(userId: string, filters?: OrganizerStatsFilters) {
    await this.validateUserRole(userId, 'organizador');

    if (filters?.productIds && filters.productIds.length === 0) {
      return [];
    }

    const { from, toExclusive } = this.getDateRange(filters);

    const qb = this.itemRepo
      .createQueryBuilder('i')
      .innerJoin('i.order', 'o')
      .select("date_trunc('day', o.createdAt)", 'day')
      .addSelect('COALESCE(SUM(i.quantity * i.unitPrice), 0)', 'totalsales')
      .where('o.status = :status', { status: filters?.status ?? 'entregado' });

    if (filters?.stallId) qb.andWhere('o.stallId = :stallId', { stallId: filters.stallId });
    if (from) qb.andWhere('o.createdAt >= :from', { from });
    if (toExclusive) qb.andWhere('o.createdAt < :toExclusive', { toExclusive });
    if (filters?.productIds) qb.andWhere('i.productId IN (:...productIds)', { productIds: filters.productIds });

    return qb
      .groupBy("date_trunc('day', o.createdAt)")
      .orderBy('day', 'ASC')
      .getRawMany<{ day: string; totalsales: string }>()
      .then((rows) => rows.map((r) => ({ day: r.day, totalSales: r.totalsales })));
  }

  async organizerCompletedCount(userId: string, filters?: OrganizerStatsFilters) {
    await this.validateUserRole(userId, 'organizador');

    if (filters?.productIds && filters.productIds.length === 0) {
      return { count: 0 };
    }

    const { from, toExclusive } = this.getDateRange(filters);
    const status = filters?.status ?? 'entregado';

    if (filters?.productIds) {
      const raw = await this.orderRepo
        .createQueryBuilder('o')
        .innerJoin(OrderItem, 'i', 'i.order_id = o.id')
        .select('COUNT(DISTINCT o.id)', 'count')
        .where('o.status = :status', { status })
        .andWhere(filters?.stallId ? 'o.stallId = :stallId' : '1=1', { stallId: filters?.stallId })
        .andWhere(from ? 'o.createdAt >= :from' : '1=1', { from })
        .andWhere(toExclusive ? 'o.createdAt < :toExclusive' : '1=1', { toExclusive })
        .andWhere('i.product_id IN (:...productIds)', { productIds: filters.productIds })
        .getRawOne<{ count: string }>();
      return { count: Number(raw?.count ?? 0) };
    }

    const qb = this.orderRepo.createQueryBuilder('o').select('COUNT(*)', 'count').where('o.status = :status', { status });
    if (filters?.stallId) qb.andWhere('o.stallId = :stallId', { stallId: filters.stallId });
    if (from) qb.andWhere('o.createdAt >= :from', { from });
    if (toExclusive) qb.andWhere('o.createdAt < :toExclusive', { toExclusive });

    const raw = await qb.getRawOne<{ count: string }>();
    return { count: Number(raw?.count ?? 0) };
  }
}