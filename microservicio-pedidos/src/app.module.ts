import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ENV } from './common/constants';
import { LogsModule } from './logs/logs.module';
import { OrdersModule } from './orders/orders.module';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';
import { Log } from './logs/entities/log.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: ENV.DB_HOST,
      port: parseInt(ENV.DB_PORT, 10),
      username: ENV.DB_USERNAME,
      password: ENV.DB_PASSWORD,
      database: ENV.DB_NAME,
      entities: [Order, OrderItem, Log],
      synchronize: true,
    }),
    LogsModule,
    OrdersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
