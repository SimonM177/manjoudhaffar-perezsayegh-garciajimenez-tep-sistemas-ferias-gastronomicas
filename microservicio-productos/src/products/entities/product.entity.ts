import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('products')
export class Product {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'stall_id' })
    stallId: string;

    @Column({ name: 'name' })
    name: string;

    @Column({ type: 'numeric', precision: 10, scale: 2 })
    price: number;

    @Column({ name: 'category' })
    category: string;

    @Column({ name: 'stock' })
    stock: number;

    @Column({ name: 'is_available', default: true })
    isAvailable: boolean;

    @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
}