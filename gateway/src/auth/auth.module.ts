import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { USERS_SERVICE } from "src/common/constants";

/*@Module({
    controllers: [AuthController],
    providers: [AuthService],
})*/

@Module({
  imports: [
    ClientsModule.register([
      {
        name: USERS_SERVICE,
        transport: Transport.TCP,
        options: {
          host: process.env.USERS_HOST || 'localhost',
          port: parseInt(process.env.USUARIOS_PORT ?? '3001', 10),
        },
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule{}