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

  // TODO: ENTITY EQUIPOS (para que equipo ocupan la pieza/producto)
  // TODO: ENTITY OBRAS

  @CreateDateColumn()
  fechaSolicitud: Date;

  @Column({ type: 'enum', enum: RequisicionStatus })
  status: string;

  @Column({ type: 'enum', enum: RequisicionAprovalLevel, default: RequisicionAprovalLevel.NONE })
  requisicionType: RequisicionAprovalLevel;

  @Column('decimal')
  cantidad_dinero: number;

  @Column('varchar')
  metodo_pago: string;

  @ManyToOne(() => Almacen, (almacen) => almacen.requisiciones)
  almacenDestino: Almacen;

  @ManyToOne(() => User, user => user.requisiciones)
  pedidoPor: User;

  @ManyToOne(() => User, { nullable: true })
  revisadoPor?: User;

  @Column({ type: 'timestamptz', nullable: true })
  fechaRevision?: Date;

  // Relacion con cada item
  @OneToMany(() => RequisicionItem, ri => ri.requisicion, { cascade: true })
  items: RequisicionItem[];

}
