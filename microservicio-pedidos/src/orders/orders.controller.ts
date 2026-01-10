import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { LogsService } from '../logs/logs.service';

@Controller()
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly logsService: LogsService,
  ) {}

  @MessagePattern('orders_create')
  async create(@Payload() data: { userId: string; stallId: string; order: any }) {
    try {
      const result = await this.ordersService.create(data.userId, data.stallId, data.order);
      await this.logsService.createLog('orders_create', 'RPC', data.userId, 201, 'Pedido creado correctamente');
      return { status: 'success', data: result };
    } catch (error) {
      await this.logsService.createLog('orders_create', 'RPC', data.userId, 400, error.message);
      return { status: 'error', message: error.message, statusCode: 400 };
    }
  }

  @MessagePattern('orders_update_status')
  async updateStatus(@Payload() data: { userId: string; id: string; status: string }) {
    try {
      const result = await this.ordersService.updateStatus(data.userId, data.id, data.status);
      await this.logsService.createLog('orders_update_status', 'RPC', data.userId, 200, 'Estado de pedido actualizado');
      return { status: 'success', data: result };
    } catch (error) {
      await this.logsService.createLog('orders_update_status', 'RPC', data.userId, 400, error.message);
      return { status: 'error', message: error.message, statusCode: 400 };
    }
  }

  @MessagePattern('orders_find_by_customer')
  async findByCustomer(@Payload() data: { userId: string; customerId: string }) {
    try {
      const result = await this.ordersService.findByCustomer(data.customerId);
      await this.logsService.createLog('orders_find_by_customer', 'RPC', data.userId, 200, 'Pedidos por cliente');
      return { status: 'success', data: result };
    } catch (error) {
      await this.logsService.createLog('orders_find_by_customer', 'RPC', data.userId, 500, error.message);
      return { status: 'error', message: error.message, statusCode: 500 };
    }
  }

  @MessagePattern('orders_find_by_stall')
  async findByStall(@Payload() data: { userId: string; stallId: string }) {
    try {
      const result = await this.ordersService.findByStall(data.stallId);
      await this.logsService.createLog('orders_find_by_stall', 'RPC', data.userId, 200, 'Pedidos por puesto');
      return { status: 'success', data: result };
    } catch (error) {
      await this.logsService.createLog('orders_find_by_stall', 'RPC', data.userId, 500, error.message);
      return { status: 'error', message: error.message, statusCode: 500 };
    }
  }
}