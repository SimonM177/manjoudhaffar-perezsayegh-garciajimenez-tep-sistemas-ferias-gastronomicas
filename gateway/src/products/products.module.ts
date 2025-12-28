import { Module } from "@nestjs/common";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { PRODUCTS_SERVICE } from "src/common/constants";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
    imports: [
        ClientsModule.registerAsync([
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
        ConfigModule,
    ],
    controllers: [ProductsController],
    providers: [ProductsService],
})
export class ProductsModule {}