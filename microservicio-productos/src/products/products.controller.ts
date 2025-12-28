import { Controller } from "@nestjs/common";
import { ProductsService } from "./products.service";
import { LogsService } from "src/logs/logs.service";
import { MessagePattern, Payload } from "@nestjs/microservices";

@Controller()
export class ProductsController {

    constructor(
        private productsService: ProductsService,
        private logsService: LogsService,
    ) {}

    @MessagePattern('products_create')
    async create(@Payload() data: {userId: string; stallId: string; product: any}) {
        try {
            const result = await this.productsService.create(data.userId, data.stallId, data.product);
            await this.logsService.createLog('products_create', 'RPC', data.userId, 201, 'Producto creado correctamente');
            return { status: 'success', data: result };
        } catch (error) {
            await this.logsService.createLog('products_create', 'RPC', data.userId, 400, error.message);
            return { status: 'error', message: error.message, statusCode: 400 };
        }
    }

    @MessagePattern('products_find_by_stall')
    async findByStall(@Payload() data: {userId: string; stallId: string}) {
        try {
            const result = await this.productsService.findByStall(data.stallId);
            await this.logsService.createLog('products_find_by_stall', 'RPC', data.userId, 200, 'Productos obtenidos correctamente');
            return { status: 'success', data: result };
        } catch (error) {
            await this.logsService.createLog('products_find_by_stall', 'RPC', data.userId, 500, error.message);
            return { status: 'error', message: error.message, statusCode: 500 };
        }
    }

    @MessagePattern('products_find_one')
    async findOne(@Payload() data: {userId: string; id: string}) {
        try {
            const result = await this.productsService.findOne(data.id);
            await this.logsService.createLog('products_find_one', 'RPC', data.userId, 200, 'Producto consultado correctamente');
            return { status: 'success', data: result };
        } catch (error) {
            await this.logsService.createLog('products_find_one', 'RPC', data.userId, 404, error.message);
            return { status: 'error', message: error.message, statusCode: 404 };
        }
    }

    @MessagePattern('products_update')
    async update(@Payload() data: {userId: string; id: string; product: any}) {
        try {
            const result = await this.productsService.update(data.userId, data.id, data.product);
            await this.logsService.createLog('products_update', 'RPC', data.userId, 200, 'Producto actualizado correctamente');
            return { status: 'success', data: result };
        } catch (error) {
            await this.logsService.createLog('products_update', 'RPC', data.userId, 400, error.message);
            return { status: 'error', message: error.message, statusCode: 400 };
        }
    }

    @MessagePattern('products_remove')
    async remove(@Payload() data: {userId: string; id: string}) {
        try {
            await this.productsService.remove(data.userId, data.id);
            await this.logsService.createLog('products_remove', 'RPC', data.userId, 200, 'Producto eliminado correctamente');
            return { status: 'success', message: 'Producto eliminado correctamente' };
        } catch (error) {
            await this.logsService.createLog('products_remove', 'RPC', data.userId, 400, error.message);
            return { status: 'error', message: error.message, statusCode: 400 };
        }
    }

    // Para el catalogo
    @MessagePattern('products_find_available_catalog')
    async findAvailableProductsPublic(@Payload() filters: any) {
        try {
            const result = await this.productsService.findAvailableProductsPublic(filters);
            await this.logsService.createLog('products_find_available_public', 'RPC', null, 200, 'Catálogo público: productos disponibles'); // El id en los logs es NULL porque es un endpoint público
            return { status: 'success',  result };
        } catch (error) {
            await this.logsService.createLog('products_find_available_public', 'RPC', null, 500, error.message);
            return { status: 'error', message: error.message, statusCode: 500 };
        }
    }
}