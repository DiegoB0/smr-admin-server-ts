import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Requisicion } from './requisicion.entity';

@Entity('requisicion_service_items')
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

  @ManyToOne(() => Requisicion, r => r.service_items, { onDelete: 'CASCADE' })
  requisicion: Requisicion;
}
