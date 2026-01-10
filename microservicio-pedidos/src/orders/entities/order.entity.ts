import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { OrderItem } from './order-item.entity';
// Definición de los posibles estados de una orden
export type OrderStatus = 'pendiente' | 'preparando' | 'listo' | 'entregado';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  customerId: string;

  @Column()
  stallId: string;

  @Column({ type: 'varchar' })
  status: OrderStatus;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  totalAmount: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @OneToMany(() => OrderItem, (item: OrderItem) => item.order, { cascade: true })
  items: OrderItem[];
}