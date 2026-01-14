import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Stall } from "./entities/stall.entity";
import { Repository } from "typeorm";
import { CreateStallDto } from "./dto/create-stall.dto";
import { UpdateStallDto } from "./dto/update-stall.dto";
import { USERS_SERVICE } from "./common/constants";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";

@Injectable()
export class StallsService {
    constructor(
        @InjectRepository(Stall)
        private stallRepository: Repository<Stall>,
        @Inject(USERS_SERVICE) // Inyección del cliente del microservicio de usuarios
        private usersClient: ClientProxy,
    ) {}

    private async validateOwner(ownerId: string): Promise<void> {
        try {
            const response = await firstValueFrom(
                this.usersClient.send('auth_validate_user', { userId: ownerId, role: 'emprendedor' }),
            );
            if(response.status !== 'success') {
                throw new Error('Propietario no válido o no tiene el rol adecuado');
            }
        } catch (error) {
            throw new Error('Error al validar el propietario: ' + error.message);
        }
    }

    private async validateUserRole(userId: string, role: string): Promise<void> {
        try {
            const response = await firstValueFrom(
                this.usersClient.send('auth_validate_user', { userId, role }),
            );

            if(response.status !== 'success') {
                throw new Error('Usuario no tiene el rol adecuado');
            }

        } catch (error) {
            throw new Error('Error al validar el rol del usuario: ' + error.message);
        }
    }

    async createStall(ownerId: string, createDto: CreateStallDto) {
        await this.validateOwner(ownerId);
        const stall = this.stallRepository.create({
            ownerId, ...createDto, status: 'pendiente',
        });
        return this.stallRepository.save(stall);
    }

    async findAll() {
        return this.stallRepository.find();
    }

    async findActiveStalls() {
        return this.stallRepository.findBy({ status: 'activo' });
    }

    async findOne(id: string) {
        return this.stallRepository.findOneBy({id});
    }

    async updateStall(userId: string, id: string, updateDto: UpdateStallDto) {

        // await this.validateOwner(id);
        const stall = await this.stallRepository.findOneBy({ id });
        
        if(!stall) {
            throw new Error('Puesto no encontrado');
        }

        if(stall.ownerId !== userId) {
            throw new Error('No eres propietario del puesto. No estás autorizado para actualizar este puesto');
        }

        if(updateDto.status) {
            if (stall.status === 'aprobado' && updateDto.status === 'activo') {
                // Permitido
            } else if (stall.status === 'activo' && updateDto.status === 'pendiente') {
                // Permitido
            } else {
                throw new Error('Transición de estado no permitida para emprendedores');
            }
        }

        await this.stallRepository.update(id, updateDto);
        return this.stallRepository.findOneBy({id});
    }

    async approveStall(userId: string, id: string) {
        await this.validateUserRole(userId, 'organizador');

        const stall = await this.stallRepository.findOneBy({ id });
        if(!stall) {
            throw new Error('Puesto no encontrado');
        }
        if(stall.status !== 'pendiente') {
            throw new Error('Solo se pueden aprobar puestos en estado pendiente');
        }
        stall.status = 'aprobado';
        return this.stallRepository.save(stall);
    }

    async removeStall(userId: string,id: string) {
        // await this.validateOwner(id);
        const stall = await this.stallRepository.findOneBy({ id });
        if(!stall) {
            throw new Error('Puesto no encontrado');
        }
        if(stall.ownerId !== userId) {
            throw new Error('No eres propietario del puesto. No estás autorizado para eliminar este puesto');
        }
        await this.stallRepository.delete(id);
    }

    // Para el catalogo
    async findActiveStallsPublic() {
        return this.stallRepository.createQueryBuilder('stall').select(['stall.id', 'stall.name', 'stall.description']).where('stall.status = :status', { status: 'activo' }).getMany();
    }

    async findAllForAdmin(filters: any = {}) {
        const query = this.stallRepository.createQueryBuilder('stall');
    
        // Filtros básicos
        if (filters.status) {
            query.andWhere('stall.status = :status', { status: filters.status });
        }

        return query.getMany();
    }    
}