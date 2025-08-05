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
import { RequisicionAprovalLevel } from '../types/requisicion-type';

@Entity('requsiciones')
export class Requisicion {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  fechaSolicitud: Date;

  @Column({ type: 'enum', enum: RequisicionStatus })
  status: string;

  @Column({ type: 'enum', enum: RequisicionAprovalLevel, default: RequisicionAprovalLevel.NONE })
  requisicionType: RequisicionAprovalLevel;

  @Column('decimal')
  cantidad_dinero: number;

  @ManyToOne(() => Almacen, (almacen) => almacen.requisiciones)
  almacenDestino: Almacen;

  @ManyToOne(() => User, user => user.requisiciones)
  pedidoPor: User;

  @ManyToOne(() => User, { nullable: true })
  aprobadoPor?: User;

  @Column({ type: 'timestamptz', nullable: true })
  fechaAprobacion?: Date;

  // Relacion con cada item
  @OneToMany(() => RequisicionItem, ri => ri.requisicion, { cascade: true })
  items: RequisicionItem[];

}
