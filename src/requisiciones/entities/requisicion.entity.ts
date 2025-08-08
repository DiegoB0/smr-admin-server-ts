import { User } from 'src/auth/entities/usuario.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RequisicionStatus } from '../types/requisicion-status';
import { Almacen } from 'src/almacenes/entities/almacen.entity';
import { RequisicionItem } from './requisicion_item.entity';
import { RequisicionAprovalLevel } from '../types/requisicion-type';
import { MetodoPago } from '../types/metodo-pago';
import { PeticionProducto } from './peticion_producto.entity';

@Entity('requsiciones')
export class Requisicion {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  fechaSolicitud: Date;

  @Column({ type: 'enum', enum: RequisicionStatus, default: RequisicionStatus.PENDIENTE })
  status: RequisicionStatus;

  @Column({ type: 'enum', enum: RequisicionAprovalLevel, default: RequisicionAprovalLevel.NONE })
  requisicionType: RequisicionAprovalLevel;

  @Column('int')
  cantidad_dinero: number;

  @Column({ type: 'enum', enum: MetodoPago, default: MetodoPago.TARJETA })
  metodo_pago: MetodoPago;

  @ManyToOne(() => Almacen, (almacen) => almacen.requisiciones)
  almacenDestino: Almacen;

  @ManyToOne(() => User, user => user.requisiciones)
  pedidoPor: User;

  @ManyToOne(() => User, { nullable: true })
  revisadoPor?: User;

  @Column({ type: 'timestamptz', nullable: true })
  fechaRevision?: Date;

  @ManyToOne(() => PeticionProducto, { eager: true })
  @JoinColumn({ name: 'peticionId' })
  peticion: PeticionProducto;

  @Column({ name: 'peticionId', unique: true })
  peticionId: number;

  // Relacion con cada item
  @OneToMany(() => RequisicionItem, ri => ri.requisicion, { cascade: true })
  items: RequisicionItem[];

  // TODO:
  // - Add the obra the requisicion belongs
  // - Add description of the equipment

}
