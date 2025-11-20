import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Requisicion } from '../requisicion.entity';
import { Equipo } from 'src/equipos/entities/equipo.entity';
import { FiltroRequirement } from 'src/filtros/entities/filtro-requirements.entity';

@Entity('requisicion_filter_items')
export class RequisicionFilterItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  customId: string;

  @Column()
  cantidad: number;

  @Column()
  unidad: string;

  @Column({ nullable: true })
  descripcion: string;

  @Column({ nullable: true })
  precio: number;

  @Column({ nullable: true, default: false })
  paid: boolean;

  @Column({ nullable: true })
  currency: string;

  @ManyToOne(() => Requisicion, r => r.filtros, { onDelete: 'CASCADE' })
  requisicion: Requisicion;

  @Column({ nullable: true })
  hrs_snapshot: number; 

  @ManyToOne(() => FiltroRequirement, { nullable: true })
  filtro_requirement?: FiltroRequirement;

  @ManyToOne(() => Equipo, (equipo) => equipo.filtros, { nullable: true })
  equipo: Equipo;
}
