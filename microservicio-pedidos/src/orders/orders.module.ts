import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LogsModule } from '../logs/logs.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    ClientsModule.registerAsync([
      {
        name: 'USERS_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('USERS_HOST'),
            port: configService.get('USERS_PORT'),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'STALLS_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('STALLS_HOST'),
            port: configService.get('STALLS_PORT'),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'PRODUCTS_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('PRODUCTS_HOST'),
            port: configService.get('PRODUCTS_PORT'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
    ConfigModule,
    LogsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}