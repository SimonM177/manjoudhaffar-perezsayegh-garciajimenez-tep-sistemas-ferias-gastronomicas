import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { USERS_SERVICE } from "src/common/constants";
import { ConfigService } from "@nestjs/config";

@Module({
    imports: [
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
        ]),
    ],
    controllers: [UsersController],
    providers: [UsersService],
})

export class UsersModule{}