import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { LogsService } from '../logs/logs.service';
import { OrderStatus } from './entities/order.entity';

type OrganizerStatsFilters = {
  from?: string;
  to?: string;
  stallId?: string;
  status?: OrderStatus;
  productIds?: string[];
};

@Controller()
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly logsService: LogsService,
  ) {}

  @MessagePattern('orders_create')
  async create(@Payload() data: { userId: string; stallId: string; order: { customerId: string; items: Array<{ productId: string; quantity: number }>; notes?: string } }) {
    try {
      const saved = await this.ordersService.create(data.userId, data.stallId, data.order);
      await this.logsService.createLog('orders_create', 'RPC', data.userId, 201, 'Pedido creado correctamente');
      return { status: 'success', data: { id: saved.id, total: saved.totalAmount, order: saved } };
    } catch (error: any) {
      const fallback = typeof error === 'object' ? JSON.stringify(error) : String(error);
      const msg = error?.message ? String(error.message) : fallback;
      const stackInfo = error?.stack ? ` | stack: ${String(error.stack).slice(0, 500)}` : '';
      await this.logsService.createLog('orders_create', 'RPC', data.userId, 400, `${msg}${stackInfo}`);
      return { status: 'error', message: msg, statusCode: 400 };
    }
  }

  @MessagePattern('orders_update_status')
  async updateStatus(@Payload() data: { userId: string; id: string; status: OrderStatus }) {
    try {
      const result = await this.ordersService.updateStatus(data.userId, data.id, data.status);
      await this.logsService.createLog('orders_update_status', 'RPC', data.userId, 200, 'Estado de pedido actualizado');
      return { status: 'success', data: { id: result.id, status: result.status } };
    } catch (error: any) {
      const fallback = typeof error === 'object' ? JSON.stringify(error) : String(error);
      const msg = error?.message ? String(error.message) : fallback;
      const stackInfo = error?.stack ? ` | stack: ${String(error.stack).slice(0, 500)}` : '';
      await this.logsService.createLog('orders_update_status', 'RPC', data.userId, 400, `${msg}${stackInfo}`);
      return { status: 'error', message: msg, statusCode: 400 };
    }
  }

  @MessagePattern('orders_find_by_customer')
  async findByCustomer(@Payload() data: { userId: string; customerId: string }) {
    try {
      const result = await this.ordersService.findByCustomer(data.customerId);
      await this.logsService.createLog('orders_find_by_customer', 'RPC', data.userId, 200, 'Pedidos por cliente');
      return { status: 'success', data: result };
    } catch (error: any) {
      const fallback = typeof error === 'object' ? JSON.stringify(error) : String(error);
      const msg = error?.message ? String(error.message) : fallback;
      const stackInfo = error?.stack ? ` | stack: ${String(error.stack).slice(0, 500)}` : '';
      await this.logsService.createLog('orders_find_by_customer', 'RPC', data.userId, 500, `${msg}${stackInfo}`);
      return { status: 'error', message: msg, statusCode: 500 };
    }
  }

  @MessagePattern('orders_find_by_stall')
  async findByStall(@Payload() data: { userId: string; stallId: string }) {
    try {
      const result = await this.ordersService.findByStall(data.stallId);
      await this.logsService.createLog('orders_find_by_stall', 'RPC', data.userId, 200, 'Pedidos por puesto');
      return { status: 'success', data: result };
    } catch (error: any) {
      const fallback = typeof error === 'object' ? JSON.stringify(error) : String(error);
      const msg = error?.message ? String(error.message) : fallback;
      const stackInfo = error?.stack ? ` | stack: ${String(error.stack).slice(0, 500)}` : '';
      await this.logsService.createLog('orders_find_by_stall', 'RPC', data.userId, 500, `${msg}${stackInfo}`);
      return { status: 'error', message: msg, statusCode: 500 };
    }
  }


  @MessagePattern('orders_overview')
  async organizerOverview(@Payload() data: { userId: string; filters?: OrganizerStatsFilters }) {
    try {
      const result = await this.ordersService.organizerOverview(data.userId, data.filters);
      await this.logsService.createLog('orders_overview', 'RPC', data.userId, 200, 'Overview organizador');
      return { status: 'success', data: result };
    } catch (error: any) {
      const msg = error?.message ? String(error.message) : String(error);
      await this.logsService.createLog('orders_overview', 'RPC', data.userId, msg.includes('rol') ? 403 : 500, msg);
      return { status: 'error', message: msg, statusCode: msg.includes('rol') ? 403 : 500 };
    }
  }

  @MessagePattern('orders_stats_sales_by_stall')
  async salesByStall(@Payload() data: { userId: string; filters?: OrganizerStatsFilters }) {
    try {
      const result = await this.ordersService.organizerSalesByStall(data.userId, data.filters);
      await this.logsService.createLog('orders_stats_sales_by_stall', 'RPC', data.userId, 200, 'Ventas por puesto');
      return { status: 'success', data: result };
    } catch (error: any) {
      const msg = error?.message ? String(error.message) : String(error);
      await this.logsService.createLog('orders_stats_sales_by_stall', 'RPC', data.userId, msg.includes('rol') ? 403 : 500, msg);
      return { status: 'error', message: msg, statusCode: msg.includes('rol') ? 403 : 500 };
    }
  }

  @MessagePattern('orders_stats_top_product')
  async topProduct(@Payload() data: { userId: string; filters?: OrganizerStatsFilters }) {
    try {
      const result = await this.ordersService.organizerTopProduct(data.userId, data.filters);
      await this.logsService.createLog('orders_stats_top_product', 'RPC', data.userId, 200, 'Producto más vendido');
      return { status: 'success', data: result };
    } catch (error: any) {
      const msg = error?.message ? String(error.message) : String(error);
      await this.logsService.createLog('orders_stats_top_product', 'RPC', data.userId, msg.includes('rol') ? 403 : 500, msg);
      return { status: 'error', message: msg, statusCode: msg.includes('rol') ? 403 : 500 };
    }
  }

  @MessagePattern('orders_stats_volume_by_day')
  async volumeByDay(@Payload() data: { userId: string; filters?: OrganizerStatsFilters }) {
    try {
      const result = await this.ordersService.organizerVolumeByDay(data.userId, data.filters);
      await this.logsService.createLog('orders_stats_volume_by_day', 'RPC', data.userId, 200, 'Volumen total por día');
      return { status: 'success', data: result };
    } catch (error: any) {
      const msg = error?.message ? String(error.message) : String(error);
      await this.logsService.createLog('orders_stats_volume_by_day', 'RPC', data.userId, msg.includes('rol') ? 403 : 500, msg);
      return { status: 'error', message: msg, statusCode: msg.includes('rol') ? 403 : 500 };
    }
  }

  @MessagePattern('orders_stats_completed_count')
  async completedCount(@Payload() data: { userId: string; filters?: OrganizerStatsFilters }) {
    try {
      const result = await this.ordersService.organizerCompletedCount(data.userId, data.filters);
      await this.logsService.createLog('orders_stats_completed_count', 'RPC', data.userId, 200, 'Cantidad pedidos completados');
      return { status: 'success', data: result };
    } catch (error: any) {
      const msg = error?.message ? String(error.message) : String(error);
      await this.logsService.createLog('orders_stats_completed_count', 'RPC', data.userId, msg.includes('rol') ? 403 : 500, msg);
      return { status: 'error', message: msg, statusCode: msg.includes('rol') ? 403 : 500 };
    }
  }
}