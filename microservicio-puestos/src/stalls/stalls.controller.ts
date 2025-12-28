import { Controller } from "@nestjs/common";
import { StallsService } from "./stalls.service";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { LogsService } from "./logs/logs.service";

@Controller()
export class StallsController {
    constructor(private stallsService: StallsService, private logsService: LogsService) {}

    @MessagePattern('stalls_create')
    async createStall(@Payload() data: {ownerId: string; stall: any}) {
        try {
            const result = await this.stallsService.createStall(data.ownerId, data.stall);
            await this.logsService.createLog('stalls_create', 'RPC', data.ownerId, 201, 'Puesto creado correctamente');
            return { status: 'success', data: result };
        } catch (error) {
            await this.logsService.createLog('stalls_create', 'RPC', data.ownerId, 400, error.message);
            return { status: 'error', message: error.message, statusCode: 400 };
        }
    }

    @MessagePattern('stalls_find_all')
    async findAll(@Payload() data: {userId: string}) {
        try {
            const result = await this.stallsService.findAll();
            await this.logsService.createLog('stalls_find_all', 'RPC', data.userId, 200, 'Puestos obtenidos correctamente');
            return { status: 'success', data: result };
        } catch (error) {
            await this.logsService.createLog('stalls_find_all', 'RPC', data.userId, 500, error.message);
            return { status: 'error', message: error.message, statusCode: 500 };
        }
    }

    @MessagePattern('stalls_find_active')
    async findActiveStalls() { // Endpoint publico no requiere userId
        try {
            const result = await this.stallsService.findActiveStalls();
            await this.logsService.createLog('stalls_find_active', 'RPC', null, 200, 'Puestos activos obtenidos correctamente');
            return { status: 'success', data: result };
        } catch (error) {
            await this.logsService.createLog('stalls_find_active', 'RPC', null, 500, error.message);
            return { status: 'error', message: error.message, statusCode: 500 };
        }
    }

    @MessagePattern('stalls_find_one')
    async findOne(@Payload() data: {userId: string;id: string}) {
        try {
            const result = await this.stallsService.findOne(data.id);
            if (!result) {
                throw new Error('Puesto no encontrado');
            }
            await this.logsService.createLog('stalls_find_one', 'RPC', data.userId, 200, 'Puesto consultado');
            return { status: 'success', data: result };
        } catch (error) {
            await this.logsService.createLog('stalls_find_one', 'RPC', data.userId, 404, error.message);
            return { status: 'error', message: error.message, statusCode: 404 };
        }
    }

    @MessagePattern('stalls_update')
    async updateStall(@Payload() data: {userId: string; id: string; stall: any}) {
        try {
            const result = await this.stallsService.updateStall(data.userId, data.id, data.stall);
            await this.logsService.createLog('stalls_update', 'RPC', data.userId, 200, 'Puesto actualizado correctamente');
            return { status: 'success', data: result };
        } catch (error) {
            await this.logsService.createLog('stalls_update', 'RPC', data.userId, 400, error.message);
            return { status: 'error', message: error.message, statusCode: 400 };
        }
    }

    @MessagePattern('stalls_approve')
    async approveStall(@Payload() data: {userId: string; id: string}) {
        try {
            const result = await this.stallsService.approveStall(data.userId, data.id);
            await this.logsService.createLog('stalls_approve', 'RPC', data.userId, 200, 'Puesto aprobado correctamente');
            return { status: 'success', data: result };
        } catch (error) {
            await this.logsService.createLog('stalls_approve', 'RPC', data.userId, 403, error.message);
            return { status: 'error', message: error.message, statusCode: 403 };
        }
    }

    @MessagePattern('stalls_remove')
    async removeStall(@Payload() data: {userId: string; id: string}) {
        try {
            await this.stallsService.removeStall(data.userId, data.id);
            await this.logsService.createLog('stalls_remove', 'RPC', data.userId, 200, 'Puesto eliminado correctamente');
            return { status: 'success', message: 'Puesto eliminado correctamente' };
        } catch (error) {
            await this.logsService.createLog('stalls_remove', 'RPC', data.userId, 400, error.message);
            return { status: 'error', message: error.message, statusCode: 400 };
        }
    }

    // Para el microservicio de productos
    @MessagePattern('stalls_validate_ownership')
    async validateOwnership(@Payload() data: {stallId: string, userId: string}) {
        try {
            const stall = await this.stallsService.findOne(data.stallId);
            
            if (!stall) {
                throw new Error('Puesto no encontrado');
            }

            if(stall.ownerId !== data.userId) {
                throw new Error('No eres el propietario del puesto')
            }

            await this.logsService.createLog('stalls_validate_ownership', 'RPC', data.userId, 200, 'Validacion de ownership exitosa');
            return { status: 'success', message: 'Validación exitosa' };
        } catch (error) {
            await this.logsService.createLog('stalls_validate_ownership', 'RPC', data.userId, 403, error.message);
            return { status: 'error', message: error.message, statusCode: 403 };
        }
    }

    // Para el catalogo
    @MessagePattern('stalls_find_active_catalog')
    async findActiveStallsPublic() {
        try {
            const result = await this.stallsService.findActiveStalls();
            await this.logsService.createLog('stalls_find_active_catalog', 'RPC', null, 200, 'Catálogo público: puestos activos');
            return { status: 'success',  result };
        } catch (error) {
            await this.logsService.createLog('stalls_find_active_catalog', 'RPC', null, 500, error.message);
            return { status: 'error', message: error.message, statusCode: 500 };
        }
    }
}