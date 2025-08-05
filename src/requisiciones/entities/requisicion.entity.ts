import { User } from 'src/auth/entities/usuario.entity';
import {
    Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RequisicionStatus } from '../types/requisicion-status';
import { Almacen } from 'src/almacenes/entities/almacen.entity';
import { RequisicionItem } from './requisicion_item.entity';

@Entity('requsiciones')
export class Requisicion {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  fechaSolicitud: Date;

  @Column({type: 'enum', enum: RequisicionStatus})
  status: string;

  // Usuario que hizo la requisicion
  @ManyToOne(() => User, user => user.requisiciones)
  pedidoPor: User;

  // Almacen destino
  @ManyToOne(() => Almacen, (almacen) => almacen.requisiciones)
  almacenDestino: Almacen;

  // Relacion con cada item
  @OneToMany(() => RequisicionItem, ri => ri.requisicion, {cascade: true})
  items: RequisicionItem[];
}
