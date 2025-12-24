import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export type Rol = 'cliente' | 'emprendedor' | 'organizador';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid') // UUID -> Alfanumérico
    id: string;

    @Column({unique: true})
    email: string;

    @Column()
    password_hash: string;

    @Column({
        type: 'enum',
        enum: ['cliente', 'emprendedor', 'organizador'],
        default: 'cliente',
    })
    role: Rol;

    @Column({name: 'full_name', length: 255})
    fullname: string;

    @CreateDateColumn({name: 'created_at'})
    created_at: Date;

    @UpdateDateColumn({name: 'updated_at'})
    updated_at: Date;
}