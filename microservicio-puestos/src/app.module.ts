import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stall } from './stalls/entities/stall.entity';
import { StallsModule } from './stalls/stalls.module';
import { LogsModule } from './stalls/logs/logs.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { USERS_SERVICE } from './stalls/common/constants';
import { ApiLog } from './stalls/logs/entities/api-log.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    /*ClientsModule.registerAsync([
      {
        name: USERS_SERVICE,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('USERS_HOST'),
            port: configService.get('USERS_PORT'),
          },
        }),
        inject: [ConfigService],
      },
    ]),*/

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [Stall, ApiLog],     
        synchronize: false,
        logging: true,
      }),
      inject: [ConfigService],
    }),
    StallsModule,
    LogsModule,
  ],
  // controllers: [AppController],
  // providers: [AppService],
})
export class AppModule {}








