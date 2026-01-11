import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { firstValueFrom } from 'rxjs';

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
}