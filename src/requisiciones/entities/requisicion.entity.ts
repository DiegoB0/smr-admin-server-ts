import { User } from 'src/auth/entities/usuario.entity';
import { Equipo } from 'src/equipos/entities/equipo.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RequisicionStatus } from '../types/requisicion-status';
import { Almacen } from 'src/almacenes/entities/almacen.entity';
import { RequisicionItem } from './requisicion_item.entity';
import { RequisicionAprovalLevel, RequisicionType } from '../types/requisicion-type';
import { MetodoPago } from '../types/metodo-pago';
import { PeticionProducto } from './peticion_producto.entity';
import { RequisicionServiceItem } from './requisicion_service_item.entity';
import { PrioridadType } from '../types/prioridad-type';

@Entity('requisiciones')
export class Requisicion {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  fechaSolicitud: Date;

  @Column({ nullable: true })
  rcp: number;

  @Column({ nullable: true })
  titulo: string;

  @Column({ enum: PrioridadType })
  prioridad: PrioridadType;

  @Column({ nullable: true })
  hrm: number; // Horas de servicio

  @Column({ nullable: true })
  concepto: string;

  @ManyToOne(() => Almacen, (almacen) => almacen.requisiciones)
  almacenCargo: Almacen

  @Column({ type: 'enum', enum: RequisicionStatus, default: RequisicionStatus.PENDIENTE })
  status: RequisicionStatus;

  @Column({ type: 'enum', enum: RequisicionAprovalLevel, default: RequisicionAprovalLevel.NONE })
  aprovalType: RequisicionAprovalLevel;

  @Column({ type: 'enum', enum: RequisicionType, default: RequisicionType.PRODUCT })
  requisicionType: RequisicionType;

  @Column('int')
  cantidad_dinero: number;

  @Column({ type: 'enum', enum: MetodoPago, default: MetodoPago.SIN_PAGAR })
  metodo_pago: MetodoPago;

  @ManyToOne(() => Almacen, (almacen) => almacen.requisiciones)
  almacenDestino: Almacen;

  @ManyToOne(() => User, user => user.requisiciones)
  pedidoPor: User;

  @ManyToOne(() => User, { nullable: true })
  revisadoPor?: User;

  @Column({ type: 'timestamptz', nullable: true })
  fechaRevision?: Date;

  @ManyToOne(() => PeticionProducto, { eager: true, nullable: true })
  @JoinColumn({ name: 'peticionId' })
  peticion: PeticionProducto;

  @Column({ name: 'peticionId', unique: true, nullable: true })
  peticionId: number;

  // Relacion con cada item
  @OneToMany(() => RequisicionItem, ri => ri.requisicion, { cascade: true })
  items: RequisicionItem[];

  @OneToMany(() => RequisicionServiceItem, ri => ri.requisicion, { cascade: true })
  service_items: RequisicionServiceItem[];

  @ManyToOne(() => Equipo, (equipo) => equipo.requisiciones, { nullable: true })
  equipo: Equipo;

  // TODO:
  // - Add the obra the requisicion belongs
  // - Add description of the equipment

}
