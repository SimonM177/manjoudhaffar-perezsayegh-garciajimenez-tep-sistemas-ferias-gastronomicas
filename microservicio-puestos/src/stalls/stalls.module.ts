import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Stall } from "./entities/stall.entity";
import { StallsController } from "./stalls.controller";
import { StallsService } from "./stalls.service";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { USERS_SERVICE } from "./common/constants";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { LogsModule } from "./logs/logs.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Stall]),

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
        ConfigModule,
        LogsModule,
    ], 
    controllers: [StallsController],
    providers: [StallsService],
    exports: [StallsService],
})

export class StallsModule {}