import { Controller, Get, Query } from "@nestjs/common";
import { CatalogService } from "./catalog.service";

@Controller('catalog')
export class CatalogController {
    constructor(private catalogService: CatalogService) {}

    @Get('stalls')
    async getActiveStalls() {
        return this.catalogService.getActiveStalls();
    }

    @Get('products')
    async getAvailableProducts(@Query('category') category?: string, @Query('stallId') stallId?: string, @Query('minPrice') minPrice?: string, @Query('maxPrice') maxPrice?: string) {
        return this.catalogService.getAvailableProducts({ category, stallId, minPrice: minPrice ? parseFloat(minPrice) : undefined, maxPrice: maxPrice ? parseFloat(maxPrice) : undefined });
    }
}