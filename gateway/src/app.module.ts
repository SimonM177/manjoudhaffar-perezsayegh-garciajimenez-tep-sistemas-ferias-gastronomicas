import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICE_USERS, USERS_SERVICE } from './common/constants';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
@Module({
  imports: [
    ClientsModule.register([
      {
        name: USERS_SERVICE,
        transport: Transport.TCP,
        options: { 
          host: process.env.USERS_HOST || 'localhost', 
          port: parseInt(process.env.USUARIOS_PORT ?? "3001", 10), 
        },
      },
      // Otros microservicios aqui
    ]),
    AuthModule,
    UsersModule,
    // El resto de modulos
  ],
  // controllers: [AppController],
  // providers: [AppService],
})
export class AppModule {}
