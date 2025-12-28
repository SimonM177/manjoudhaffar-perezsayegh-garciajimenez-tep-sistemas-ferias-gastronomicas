import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { PRODUCTS_SERVICE, STALLS_SERVICE } from "src/common/constants";
import { CatalogController } from "./catalog.controller";
import { CatalogService } from "./catalog.service";

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

            {
                name: PRODUCTS_SERVICE,
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.TCP,
                    options: {
                        host: configService.get('PRODUCTS_HOST'),
                        port: configService.get('PRODUCTS_PORT'),
                    },
                }),
                inject: [ConfigService],
            },
        ]),
    ],
    controllers: [CatalogController],
    providers: [CatalogService],
})

export class CatalogModule {}