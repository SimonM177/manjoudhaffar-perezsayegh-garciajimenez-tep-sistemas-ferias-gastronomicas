import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { STALLS_SERVICE } from "src/common/constants";
import { StallsController } from "./stalls.controller";
import { StallsService } from "./stalls.service";

@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: STALLS_SERVICE,
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.TCP,
                    options: {
                        host: configService.get('STALLS_HOST'),
                        port: configService.get('STALLS_PORT'),
                    },
                }),
                inject: [ConfigService],
            },
        ]),
    ],
    controllers: [StallsController],
    providers: [StallsService],
})

export class StallsModule {}