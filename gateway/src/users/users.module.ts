import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { USERS_SERVICE } from "src/common/constants";

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
    controllers: [UsersController],
    providers: [UsersService],
})

export class UsersModule{}