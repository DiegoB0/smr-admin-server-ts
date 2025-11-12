import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Requisicion } from './requisicion.entity';

@Entity('requisicion_manual_items')
export class RequisicionServiceItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cantidad: number;

  @Column()
  unidad: string;

  @Column()
  descripcion: string;

  @Column()
  precio_unitario: number;

  @Column({ nullable: true, default: false })
  is_product: boolean;

  @ManyToOne(() => Requisicion, r => r.service_items, { onDelete: 'CASCADE' })
  requisicion: Requisicion;
}
