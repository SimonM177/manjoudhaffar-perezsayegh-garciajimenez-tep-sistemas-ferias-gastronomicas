import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private readonly itemRepo: Repository<OrderItem>,
    private readonly dataSource: DataSource,
    @Inject('PRODUCTS') private readonly productsClient: ClientProxy,
    @Inject('STALLS') private readonly stallsClient: ClientProxy,
    @Inject('USERS') private readonly usersClient: ClientProxy,
  ) {}

  async create(userId: string, stallId: string, order: { customerId: string; items: Array<{ productId: string; quantity: number }>; notes?: string }) {
    // Validate user role/identity
    await this.usersClient.send('users_validate_identity', { userId }).toPromise();
    // Validate stall is active
    await this.stallsClient.send('stalls_validate_active', { stallId }).toPromise();

    // Fetch product info and check stock, compute totals
    const itemsDetailed: Array<{ productId: string; quantity: number; unitPrice: number; subtotal: number }> = [];
    let total = 0;
    for (const item of order.items) {
      const productResp = await this.productsClient.send('products_find_one', { userId, id: item.productId }).toPromise();
      if (productResp?.status !== 'success' || !productResp.data) {
        throw new Error('Producto no encontrado');
      }
      const product = productResp.data;
      if (!product.available || product.stock < item.quantity) {
        throw new Error('Stock insuficiente o producto no disponible');
      }
      const unitPrice = Number(product.price);
      const subtotal = unitPrice * item.quantity;
      itemsDetailed.push({ productId: item.productId, quantity: item.quantity, unitPrice, subtotal });
      total += subtotal;
    }

    // Transaction: create order and decrement stock
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
          subtotal: i.subtotal.toFixed(2),
        })),
      });
      const saved = await manager.save(orderEntity);

      // Decrement stock via products microservice
      for (const item of order.items) {
        const decResp = await this.productsClient.send('products_decrement_stock', { userId, id: item.productId, quantity: item.quantity }).toPromise();
        if (decResp?.status !== 'success') {
          throw new Error('No se pudo descontar stock');
        }
      }

      return saved;
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