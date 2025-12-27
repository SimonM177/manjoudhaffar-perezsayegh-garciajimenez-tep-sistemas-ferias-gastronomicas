import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('stalls')
export class Stall {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'owner_id'})
    ownerId: string;

    @Column({ name: 'name' })
    name: string;

    @Column({ nullable: true })
    description: string;

    @Column({ name: 'status' })
    status: 'pendiente' | 'aprobado' | 'activo' | 'inactivo';

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @CreateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}