import { Controller, Get, Param, Patch, Post, Body, Inject, Request, UseGuards, HttpException, UnauthorizedException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { OrdersService } from './orders.service';
import { USERS_SERVICE } from '../common/constants';
import { AuthGuard } from '@nestjs/passport';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    @Inject(USERS_SERVICE) private readonly usersClient: ClientProxy,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Request() req, @Body() dto: { userId: string; stallId: string; order: { customerId: string; items: Array<{ productId: string; quantity: number }>; notes?: string } }) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new HttpException('JWT inválido', 401);
    }
    const authResp = await firstValueFrom(
      this.usersClient.send('auth_validate_user', { userId, role: 'cliente' }),
    );
    if (authResp?.status !== 'success') {
      throw new HttpException('Solo usuarios cliente pueden crear órdenes', 403);
    }
    const resp = await firstValueFrom(this.ordersService.create({ ...dto, userId }));
    if (resp?.status === 'error') {
      throw new HttpException(resp.message ?? 'Error', resp.statusCode ?? 400);
    }
    return resp;
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard('jwt'))
  async updateStatus(@Request() req, @Param('id') id: string, @Body() body: { status: 'pendiente' | 'preparando' | 'listo' | 'entregado' }) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new HttpException('JWT inválido', 401);
    }
    const resp = await firstValueFrom(this.ordersService.updateStatus({ id, userId, status: body.status }));
    if (resp?.status === 'error') {
      throw new HttpException(resp.message ?? 'Error', resp.statusCode ?? 400);
    }
    return resp;
  }

  @Get('customer/:customerId')
  @UseGuards(AuthGuard('jwt'))
  async findByCustomer(@Request() req, @Param('customerId') customerId: string) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new HttpException('JWT inválido', 401);
    }
    const resp = await firstValueFrom(this.ordersService.findByCustomer({ userId, customerId }));
    if (resp?.status === 'error') {
      throw new HttpException(resp.message ?? 'Error', resp.statusCode ?? 500);
    }
    return resp;
  }

  @Get('stall/:stallId')
  @UseGuards(AuthGuard('jwt'))
  async findByStall(@Request() req, @Param('stallId') stallId: string) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new HttpException('JWT inválido', 401);
    }
    const resp = await firstValueFrom(this.ordersService.findByStall({ userId, stallId }));
    if (resp?.status === 'error') {
      throw new HttpException(resp.message ?? 'Error', resp.statusCode ?? 500);
    }
    return resp;
  }
}