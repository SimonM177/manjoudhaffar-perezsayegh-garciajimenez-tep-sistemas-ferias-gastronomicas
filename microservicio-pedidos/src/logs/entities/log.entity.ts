import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('logs')
export class Log {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  action: string;

  @Column()
  channel: string;

  @Column({ type: 'uuid', nullable: true })
  userId: string | null;

  @Column({ type: 'int' })
  statusCode: number;

  // Make message non-null with default
  @Column({ type: 'text', default: '' })
  message: string;

  @Column({ type: 'timestamptz' })
  timestamp: Date;
}