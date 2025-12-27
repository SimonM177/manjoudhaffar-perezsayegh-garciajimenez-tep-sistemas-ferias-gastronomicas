import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICE_USERS, USERS_SERVICE } from './common/constants';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
@Module({
  imports: [

    ConfigModule.forRoot({
      isGlobal: true,
    }),

    ClientsModule.registerAsync([
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
