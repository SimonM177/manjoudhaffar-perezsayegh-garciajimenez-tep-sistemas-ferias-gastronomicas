import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ENV } from '../common/constants';
import { LogsModule } from '../logs/logs.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    LogsModule,
    ClientsModule.register([
      { name: 'PRODUCTS', transport: Transport.TCP, options: { host: ENV.PRODUCTS_TCP_HOST, port: ENV.PRODUCTS_TCP_PORT } },
      { name: 'STALLS', transport: Transport.TCP, options: { host: ENV.STALLS_TCP_HOST, port: ENV.STALLS_TCP_PORT } },
      { name: 'USERS', transport: Transport.TCP, options: { host: ENV.USERS_TCP_HOST, port: ENV.USERS_TCP_PORT } },
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}