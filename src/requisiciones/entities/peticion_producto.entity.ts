import { User } from 'src/auth/entities/usuario.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Almacen } from 'src/almacenes/entities/almacen.entity';
import { PeticionProductoItem } from './peticion_producto_item.entity';
import { PeticionStatus } from '../types/peticion-status';

@Entity('peticion_productos')
export class PeticionProducto {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  fechaCreacion: Date;

  @Column({ type: 'enum', enum: PeticionStatus, default: PeticionStatus.PENDIENTE })
  status: PeticionStatus;

  @Column('varchar')
  observaciones: string;

  @ManyToOne(() => Almacen, (almacen) => almacen.peticionesProducto)
  almacen: Almacen;

  @ManyToOne(() => User, (user) => user.peticionesCreadas)
  creadoPor: User;

  @ManyToOne(() => User, { nullable: true })
  revisadoPor?: User;

  @Column({ type: 'timestamptz', nullable: true })
  fechaRevision?: Date;

  @OneToMany(() => PeticionProductoItem, (ri) => ri.reporte, { cascade: true })
  items: PeticionProductoItem[];
}
