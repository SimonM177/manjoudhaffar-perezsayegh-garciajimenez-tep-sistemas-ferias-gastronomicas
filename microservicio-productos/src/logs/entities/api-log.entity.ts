import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('api_logs')
export class ApiLog {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 255 })
    route: string;

    @Column({ length: 20 })
    method: string;

    @Column({ name: 'user_id', type: 'uuid', nullable: true })
    userId: string | null;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    timestamp: Date;

    @Column()
    status_code: number;

    @Column('text', { nullable: true })
    message: string | null;
    
}