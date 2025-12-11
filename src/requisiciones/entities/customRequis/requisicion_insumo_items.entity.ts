import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Requisicion } from '../requisicion.entity';

@Entity('requisicion_insumo_items')
export class RequisicionInsumoItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cantidad: number;

  @Column()
  unidad: string;

  @Column({ nullable: true })
  descripcion: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  precio: number;

  @Column({ nullable: true, default: false })
  is_product: boolean;

  @Column({ nullable: true, default: false })
  paid: boolean;

  @Column({ nullable: true})
  cantidadPagada: number;

  @Column({ nullable: true })
  currency: string;

  @ManyToOne(() => Requisicion, r => r.insumos, { onDelete: 'CASCADE' })
  requisicion: Requisicion;
}
