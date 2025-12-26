import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { jwtConstants, USERS_SERVICE } from "src/common/constants";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./strategies/jwt.strategy";

/*@Module({
    controllers: [AuthController],
    providers: [AuthService],
})*/

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret || 'mi_secreto_super_secreto',
      signOptions: { expiresIn: '1h' },
    }),

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
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule{}