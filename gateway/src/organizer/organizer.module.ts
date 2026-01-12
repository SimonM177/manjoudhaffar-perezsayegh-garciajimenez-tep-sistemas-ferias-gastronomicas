import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OrganizerController } from './organizer.controller';
import { OrganizerService } from './organizer.service';
import { PRODUCTS_SERVICE, STALLS_SERVICE, USERS_SERVICE } from 'src/common/constants';

@Module({
  imports: [
    ConfigModule,
    ClientsModule.registerAsync([
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
      {
        name: STALLS_SERVICE,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>('STALLS_HOST') ?? 'localhost',
            port: Number(configService.get<string>('STALLS_PORT') ?? 3002),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: PRODUCTS_SERVICE,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>('PRODUCTS_HOST') ?? 'localhost',
            port: Number(configService.get<string>('PRODUCTS_PORT') ?? 3003),
          },
        }),
        inject: [ConfigService],
      },
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
    ]),
  ],
  controllers: [OrganizerController],
  providers: [OrganizerService],
})
export class OrganizerModule {}
