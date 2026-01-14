import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class OrdersService {
  constructor(@Inject('ORDERS') private readonly ordersClient: ClientProxy) {}

  create(dto: { userId: string; stallId: string; order: { customerId: string; items: Array<{ productId: string; quantity: number }>; notes?: string } }) {
    return this.ordersClient.send('orders_create', dto);
  }

  updateStatus(dto: { id: string; userId: string; status: 'pendiente' | 'preparando' | 'listo' | 'entregado' }) {
    return this.ordersClient.send('orders_update_status', dto);
  }

  findByCustomer(dto: { userId: string; customerId: string }) {
    return this.ordersClient.send('orders_find_by_customer', dto);
  }

  findByStall(dto: { userId: string; stallId: string }) {
    return this.ordersClient.send('orders_find_by_stall', dto);
  }
}