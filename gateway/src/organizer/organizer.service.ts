import { HttpException, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { PRODUCTS_SERVICE, STALLS_SERVICE, USERS_SERVICE } from 'src/common/constants';

type RpcOk<T> = { status: 'success'; data?: T; result?: T };
type RpcErr = { status: 'error'; message?: string; statusCode?: number };

type OrganizerFilters = {
  from?: string;
  to?: string;
  stallId?: string;
  status?: string;
  category?: string;
};

type OrdersFiltersPayload = {
  from?: string;
  to?: string;
  stallId?: string;
  status?: string;
  productIds?: string[];
};

@Injectable()
export class OrganizerService {
  constructor(
    @Inject(USERS_SERVICE) private readonly usersClient: ClientProxy,
    @Inject(STALLS_SERVICE) private readonly stallsClient: ClientProxy,
    @Inject(PRODUCTS_SERVICE) private readonly productsClient: ClientProxy,
    @Inject('ORDERS') private readonly ordersClient: ClientProxy,
  ) {}

  private async assertOrganizer(userId: string): Promise<void> {
    const authResp = await firstValueFrom(this.usersClient.send('auth_validate_user', { userId, role: 'organizador' }));
    if (authResp?.status !== 'success') {
      throw new HttpException('Solo usuarios organizador pueden acceder a este panel', 403);
    }
  }

  private unwrap<T>(resp: RpcOk<T> | RpcErr, fallbackStatus: number): T {
    if (!resp || (resp as any).status !== 'success') {
      const err = resp as RpcErr;
      throw new HttpException(err?.message ?? 'Error', err?.statusCode ?? fallbackStatus);
    }

    const ok = resp as RpcOk<T>;
    return (ok.data ?? ok.result) as T;
  }

  private buildOrdersFilters(filters?: OrganizerFilters, productIds?: string[]): OrdersFiltersPayload {
    return {
      from: filters?.from,
      to: filters?.to,
      stallId: filters?.stallId,
      status: filters?.status,
      productIds,
    };
  }

  private async resolveProductIdsForCategory(userId: string, filters?: OrganizerFilters): Promise<string[] | undefined> {
    if (!filters?.category) return undefined;

    const resp = await firstValueFrom(
      this.productsClient.send('products_find_ids_by_filters', {
        userId,
        category: filters.category,
        stallId: filters.stallId,
      }),
    );

    const ids = this.unwrap<string[]>(resp, 500);
    return Array.isArray(ids) ? ids : [];
  }

  async overview(userId: string, filters?: OrganizerFilters) {
    await this.assertOrganizer(userId);

    const productIds = await this.resolveProductIdsForCategory(userId, filters);

    const [stallsResp, productsResp, ordersResp] = await Promise.all([
      firstValueFrom(this.stallsClient.send('stalls_find_all', { userId })),
      firstValueFrom(this.productsClient.send('products_find_all', { userId })),
      firstValueFrom(this.ordersClient.send('orders_overview', { userId, filters: this.buildOrdersFilters(filters, productIds) })),
    ]);

    const stalls = this.unwrap<any[]>(stallsResp, 500);
    const products = this.unwrap<any[]>(productsResp, 500);
    const ordersOverview = this.unwrap<any>(ordersResp, 500);

    return {
      status: 'success',
      data: {
        stallsCount: Array.isArray(stalls) ? stalls.length : 0,
        productsCount: Array.isArray(products) ? products.length : 0,
        orders: ordersOverview,
      },
    };
  }

  async salesByStall(userId: string, filters?: OrganizerFilters) {
    await this.assertOrganizer(userId);
    const productIds = await this.resolveProductIdsForCategory(userId, filters);
    const resp = await firstValueFrom(
      this.ordersClient.send('orders_stats_sales_by_stall', { userId, filters: this.buildOrdersFilters(filters, productIds) }),
    );
    return { status: 'success', data: this.unwrap<any>(resp, 500) };
  }

  async topProduct(userId: string, filters?: OrganizerFilters) {
    await this.assertOrganizer(userId);
    const productIds = await this.resolveProductIdsForCategory(userId, filters);
    const resp = await firstValueFrom(
      this.ordersClient.send('orders_stats_top_product', { userId, filters: this.buildOrdersFilters(filters, productIds) }),
    );
    return { status: 'success', data: this.unwrap<any>(resp, 500) };
  }

  async volumeByDay(userId: string, filters?: OrganizerFilters) {
    await this.assertOrganizer(userId);
    const productIds = await this.resolveProductIdsForCategory(userId, filters);
    const resp = await firstValueFrom(
      this.ordersClient.send('orders_stats_volume_by_day', { userId, filters: this.buildOrdersFilters(filters, productIds) }),
    );
    return { status: 'success', data: this.unwrap<any>(resp, 500) };
  }

  async completedCount(userId: string, filters?: OrganizerFilters) {
    await this.assertOrganizer(userId);
    const productIds = await this.resolveProductIdsForCategory(userId, filters);
    const resp = await firstValueFrom(
      this.ordersClient.send('orders_stats_completed_count', { userId, filters: this.buildOrdersFilters(filters, productIds) }),
    );
    return { status: 'success', data: this.unwrap<any>(resp, 500) };
  }
}
