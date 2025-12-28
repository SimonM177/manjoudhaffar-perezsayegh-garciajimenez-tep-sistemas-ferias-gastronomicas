import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";
import { PRODUCTS_SERVICE } from "src/common/constants";

@Injectable()
export class ProductsService {
    constructor(
        @Inject(PRODUCTS_SERVICE)
        private productsClient: ClientProxy,
    ) {}

    async createProduct(userId: string, stallId: string, dto: any) {
        return firstValueFrom(
            this.productsClient.send('products_create', { userId, stallId, product: dto }),
        );
    }

    async findProductsByStall(userId: string, stallId: string) {
        return firstValueFrom(
            this.productsClient.send('products_find_by_stall', { userId, stallId }),
        );
    }

    async findOneProduct(userId: string, id: string) {
        return firstValueFrom(
            this.productsClient.send('products_find_one', { userId, id }),
        );
    }

    async updateProduct(userId: string, id: string, dto: any) {
        return firstValueFrom(
            this.productsClient.send('products_update', { userId, id, product: dto }),
        );
    }

    async removeProduct(userId: string, id: string) {
        return firstValueFrom(
            this.productsClient.send('products_remove', { userId, id }),
        );
    }
}