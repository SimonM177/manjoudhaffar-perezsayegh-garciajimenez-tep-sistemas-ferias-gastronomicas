import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Product } from "./entities/product.entity";
import { Repository } from "typeorm";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { firstValueFrom } from "rxjs";
import { STALLS_SERVICE } from "src/common/constants";
import { ClientProxy } from "@nestjs/microservices";

@Injectable()
export class ProductsService {

    constructor(
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
        @Inject(STALLS_SERVICE)
        private stallsClient: ClientProxy,
    ) {}

    // Para validar que cualquier cambio al producto o los productos sean por parte del dueño del puesto
    private async validateStallOwnership(userId: string, stallId: string): Promise<void> {
        try {
            const response = await firstValueFrom(
                this.stallsClient.send('stalls_validate_ownership', {
                    userId,
                    stallId
                }),
            );

            if(response.status !== 'success') {
                throw new Error('No tienes permiso para gestionar los productos en este puesto.');
            }
            
        } catch (error) {
            throw new Error('Error al validar la propiedad del puesto.');
        }
    }

    async create(userId: string, stallId: string, createDto: CreateProductDto) {
        await this.validateStallOwnership(userId, stallId);

        const isAvailable = createDto.stock > 0 ? (createDto.isAvailable ?? true) : false;

        const product = this.productRepository.create({
            stallId,
            ...createDto,
            isAvailable
        });
        return this.productRepository.save(product);
    }

    async findAll() {
        return this.productRepository.find();
    }

    async findByStall(stallId: string) {
        return this.productRepository.findBy({ stallId });
    }

    async findOne(id: string) {
        return this.productRepository.findOneBy({ id });
    }

    async update(userId: string, id: string, updateDto: UpdateProductDto) {
        
        const product = await await this.productRepository.findOneBy({ id });
        if (!product) {
            throw new Error('Producto no encontrado');
        }

        await this.validateStallOwnership(userId, product.stallId);

        if (updateDto.stock !== undefined) {
            if (updateDto.stock === 0) {
                updateDto.isAvailable = false;
            } else if (updateDto.isAvailable === undefined) {
                updateDto.isAvailable = product.isAvailable;
            }
        }

        await this.productRepository.update(id, updateDto);
        return this.productRepository.findOneBy({ id });
    }

    async remove(userId: string, id: string) {
        const product = await this.productRepository.findOneBy({ id });
        if (!product) {
            throw new Error('Producto no encontrado');
        }

        await this.validateStallOwnership(userId, product.stallId);
        await this.productRepository.remove(product);
    }

    // Catalogo
    async findAvailableProductsPublic(filters: {category?: string; stallId?: string; minPrice?: number; maxPrice?: number;}) {
        // const query = this.productRepository.createQueryBuilder('product').leftJoinAndSelect('stall', 'stall', 'product.stall_id = stall.id').select(['product.id', 'product.name', 'product.price', 'product.category', 'product.stallId', 'stall.name as stallName',]).where('product.is_available = :available', { available: true }).andWhere('stall.status = :status', { status: 'activo' });

        const query = this.productRepository.createQueryBuilder('product').select(['product.id', 'product.name', 'product.price', 'product.category', 'product.stallId',]).where('product.is_available = :available', { available: true });

        if (filters.category) {
            query.andWhere('product.category = :category', { category: filters.category });
        }

        if (filters.stallId) {
            query.andWhere('product.stallId = :stallId', { stallId: filters.stallId });
        }

        if (filters.minPrice !== undefined) {
            query.andWhere('product.price >= :minPrice', { minPrice: filters.minPrice });
        }

        if (filters.maxPrice !== undefined) {
            query.andWhere('product.price <= :maxPrice', { maxPrice: filters.maxPrice });
        }

        return query.getRawMany();
    }

    async findAllForAdmin(filters: any = {}) {
        const query = this.productRepository.createQueryBuilder('product');
    
      // Aplicar filtros
        if (filters.category) {

            query.andWhere('product.category = :category', { category: filters.category });
        }
        if (filters.stallId) {
            query.andWhere('product.stallId = :stallId', { stallId: filters.stallId });
        }

        return query.getMany();
    }    

}