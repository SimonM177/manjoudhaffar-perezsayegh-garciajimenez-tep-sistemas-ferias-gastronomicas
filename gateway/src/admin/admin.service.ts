import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ORDERS_SERVICE, PRODUCTS_SERVICE, STALLS_SERVICE } from '../common/constants';

@Injectable()
export class AdminService {
  constructor(
    @Inject(STALLS_SERVICE) private stallsClient: ClientProxy,
    @Inject(PRODUCTS_SERVICE) private productsClient: ClientProxy,
    @Inject(ORDERS_SERVICE) private ordersClient: ClientProxy,
  ) {}

  async getDashboard(filters: {
    startDate?: string;
    endDate?: string;
    stallId?: string;
    status?: string;
    category?: string;
  }) {
    // Obtener puestos
    const stallsPromise = firstValueFrom(
      this.stallsClient.send('stalls_find_all_admin', { filters }),
    );

    // Obtener productos
    const productsPromise = firstValueFrom(
      this.productsClient.send('products_find_all_admin', { filters }),
    );

    // Obtener pedidos y estadísticas
    const ordersPromise = firstValueFrom(
      this.ordersClient.send('orders_get_statistics', { filters }),
    );

    // Ejecutar en paralelo
    const [stalls, products, orders] = await Promise.all([
      stallsPromise,
      productsPromise,
      ordersPromise,
    ]);

    return {
      overview: {
        totalStalls: stalls.data?.length || 0,
        totalProducts: products.data?.length || 0,
        totalOrders: orders.data?.totalOrders || 0,
        totalRevenue: orders.data?.totalRevenue || 0,
      },
      stalls: stalls.data || [],
      products: products.data || [],
      orders: orders.data?.recentOrders || [],
      statistics: {
        salesByStall: orders.data?.salesByStall || [],
        topProducts: orders.data?.topProducts || [],
        dailyVolume: orders.data?.dailyVolume || [],
        completedOrders: orders.data?.completedOrders || 0,
      },
    };
  }
}