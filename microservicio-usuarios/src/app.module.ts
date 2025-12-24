import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';


@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10), // -> || 5432 (afuera del parentesis)
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'db_usuarios',
      entities: [User],
      synchronize: false, // falso en produccion
      logging: true,
    }),
    // UsersModule,
    // AuthModule,
  ],
})
export class AppModule {}
