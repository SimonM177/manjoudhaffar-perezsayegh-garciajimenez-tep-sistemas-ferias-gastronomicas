import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";
import { PRODUCTS_SERVICE, STALLS_SERVICE } from "src/common/constants";

@Injectable()
export class CatalogService {
    constructor(
        @Inject(STALLS_SERVICE) private stallsClient: ClientProxy,
        @Inject(PRODUCTS_SERVICE) private productsClient: ClientProxy,
    ) {}

    async getActiveStalls() {
        return firstValueFrom(
            this.stallsClient.send('stalls_find_active_catalog', {}),
        );
    }

    async getAvailableProducts(filters: { category?: string; stallId?: string; minPrice?: number; maxPrice?: number; }) {
        return firstValueFrom(
            this.productsClient.send('products_find_available_catalog', filters),
        );
    }
}