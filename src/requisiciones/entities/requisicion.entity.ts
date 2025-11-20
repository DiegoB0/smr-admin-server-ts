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
import { RequisicionAprovalLevel, RequisicionType } from '../types/requisicion-type';
import { MetodoPago } from '../types/metodo-pago';
import { RequisicionInsumoItem } from './customRequis/requisicion_insumo_items.entity';
import { PrioridadType } from '../types/prioridad-type';
import { Proveedor } from 'src/proveedores/entities/proveedor.entity';
import { RequisicionRefaccionItem } from './customRequis/requisicion_refaccion.items.entity';
import { RequisicionFilterItem } from './customRequis/requisicion_filter_items.entity';
import { ConceptoType } from '../types/concepto-type';

@Entity('requisiciones')
export class Requisicion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, unique: true })
  rcp: number;

  @Column({ nullable: true })
  titulo: string;

  @Column({ nullable: true })
  observaciones: string;

  @Column({ enum: PrioridadType })
  prioridad: PrioridadType;

  @Column({ nullable: true })
  hrm: number; 

  @Column({ enum: ConceptoType })
  concepto: ConceptoType;

  @ManyToOne(() => Almacen, (almacen) => almacen.requisiciones)
  almacenCargo: Almacen

  @ManyToOne(() => Almacen, (almacen) => almacen.requisiciones)
  almacenDestino: Almacen;

  @ManyToOne(() => User, user => user.requisiciones)
  pedidoPor: User;

  @ManyToOne(() => User, { nullable: true })
  revisadoPor?: User;

  @Column({ type: 'enum', enum: RequisicionStatus, default: RequisicionStatus.PENDIENTE })
  status: RequisicionStatus;

  @ManyToOne(() => Proveedor, { nullable: true })
  proveedor?: Proveedor;

  @Column({ type: 'enum', enum: RequisicionAprovalLevel, default: RequisicionAprovalLevel.NONE })
  aprovalType: RequisicionAprovalLevel;

  @Column({ type: 'enum', enum: RequisicionType, default: RequisicionType.REFACCIONES })
  requisicionType: RequisicionType;

  @Column('int', { nullable: true })
  cantidadEstimada: number;

  @Column('int', { nullable: true })
  cantidadActual: number;

  @Column({ type: 'enum', enum: MetodoPago, default: MetodoPago.SIN_PAGAR })
  metodo_pago: MetodoPago;

  @CreateDateColumn()
  fechaSolicitud: Date;

  @Column({ type: 'timestamptz', nullable: true })
  fechaRevision?: Date;

  // REFACCIONES type
  @OneToMany(() => RequisicionRefaccionItem, ri => ri.requisicion, { cascade: true })
  refacciones: RequisicionRefaccionItem[];

  // INSUMOS type
  @OneToMany(() => RequisicionInsumoItem, ri => ri.requisicion, { cascade: true })
  insumos: RequisicionInsumoItem[];

  // FILTROS type
  @OneToMany(() => RequisicionFilterItem, ri => ri.requisicion, { cascade: true })
  filtros: RequisicionFilterItem[];

}
