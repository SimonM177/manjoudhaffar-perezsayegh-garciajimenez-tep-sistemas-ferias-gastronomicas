import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { AuthModule } from './auth/auth.module';
import { ApiLog } from './logs/entities/api-log.entity';
import { LogService } from './logs/logs.service';
import { LogsModule } from './logs/logs.module';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

/* 
@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
*/ 

/*@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5433', 10), // -> || 5432 (afuera del parentesis)
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'PostgresBD',
      database: process.env.DB_NAME || 'auth_service',
      entities: [User, ApiLog],
      synchronize: false, // falso en produccion
      logging: true,
    }),
    TypeOrmModule.forFeature([User, ApiLog]),
    // UsersModule,
    AuthModule,
    UsersModule,
    LogsModule,
  ],
  // providers: [LogService],
  // exports: [LogService],
})*/

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [User, ApiLog],
        synchronize: false,
        logging: true,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, ApiLog]),
    AuthModule,
    UsersModule,
    LogsModule,
  ]
})
export class AppModule {}
