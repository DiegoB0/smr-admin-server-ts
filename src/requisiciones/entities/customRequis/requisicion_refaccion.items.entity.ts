import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Requisicion } from '../requisicion.entity';
import { Equipo } from 'src/equipos/entities/equipo.entity';

@Entity('requisicion_refaccion_items')
export class RequisicionRefaccionItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({nullable: true})
  no_economico: string;

  @Column()
  customId: string;

  @Column({ nullable: true })
  descripcion: string;

  @Column()
  unidad: string;

  @Column()
  cantidad: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  precio: number;

  @Column({ nullable: true, default: false })
  paid: boolean;

  @Column({ nullable: true})
  cantidadPagada: number;

  @Column({ nullable: true })
  currency: string;

  @ManyToOne(() => Requisicion, r => r.refacciones, { onDelete: 'CASCADE' })
  requisicion: Requisicion;
}
