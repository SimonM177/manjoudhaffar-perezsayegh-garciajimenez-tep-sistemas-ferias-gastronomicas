import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { USERS_SERVICE } from '../common/constants';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    ClientsModule.registerAsync([
      {
        name: 'ORDERS',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>('ORDERS_HOST') ?? 'localhost',
            port: Number(configService.get<string>('ORDERS_PORT') ?? 3004),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: USERS_SERVICE,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>('USERS_HOST') ?? 'localhost',
            port: Number(configService.get<string>('USERS_PORT') ?? 3001),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}