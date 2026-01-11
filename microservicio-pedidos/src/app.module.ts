import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ENV } from './common/constants';
import { LogsModule } from './logs/logs.module';
import { OrdersModule } from './orders/orders.module';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';
import { Log } from './logs/entities/log.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Switch to async configuration to read from .env via ConfigService
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: Number(configService.get<string>('DB_PORT')),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [Order, OrderItem, Log],
        synchronize: true, // habilitar creación automática de tablas
        logging: true,
      }),
      inject: [ConfigService],
    }),
    LogsModule,
    OrdersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
