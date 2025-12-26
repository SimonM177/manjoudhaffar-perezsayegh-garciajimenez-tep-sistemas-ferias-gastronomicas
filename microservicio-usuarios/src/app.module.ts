import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { AuthModule } from './auth/auth.module';
import { ApiLog } from './logs/entities/api-log.entity';
import { LogService } from './logs/logs.service';
import { LogsModule } from './logs/logs.module';

/* 
@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
*/ 

@Module({
  imports: [
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
    LogsModule,
  ],
  // providers: [LogService],
  // exports: [LogService],
})
export class AppModule {}
