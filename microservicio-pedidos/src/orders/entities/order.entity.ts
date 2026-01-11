import { Column, CreateDateColumn, UpdateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { OrderItem } from './order-item.entity';
// Definición de los posibles estados de una orden
export type OrderStatus = 'pendiente' | 'preparando' | 'listo' | 'entregado';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'customer_id' })
  customerId: string;

  @Column({ name: 'stall_id' })
  stallId: string;

  @Column({ type: 'varchar' })
  status: OrderStatus;

  @Column({ name: 'total', type: 'numeric', precision: 10, scale: 2 })
  totalAmount: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => OrderItem, (item: OrderItem) => item.order, { cascade: true })
  items: OrderItem[];
}