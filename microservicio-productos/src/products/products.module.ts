import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Product } from "./entities/product.entity";
import { LogsModule } from "src/logs/logs.module";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { STALLS_SERVICE } from "src/common/constants";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
    imports: [
        TypeOrmModule.forFeature([Product]),
        LogsModule,

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
        ConfigModule,
    ],
    controllers: [ProductsController],
    providers: [ProductsService],
    exports: [ProductsService],
})
export class ProductsModule {}