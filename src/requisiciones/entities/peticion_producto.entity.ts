import { User } from 'src/auth/entities/usuario.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Almacen } from 'src/almacenes/entities/almacen.entity';
import { PeticionProductoItem } from './peticion_producto_item.entity';
import { PeticionStatus } from '../types/peticion-status';
import { PeticionGenerada } from '../types/peticion-generada';
import { Equipo } from 'src/equipos/entities/equipo.entity';

@Entity('peticion_productos')
export class PeticionProducto {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  fechaCreacion: Date;

  @Column({ type: 'enum', enum: PeticionStatus, default: PeticionStatus.PENDIENTE })
  status: PeticionStatus;

  @Column({ type: 'enum', enum: PeticionGenerada, default: PeticionGenerada.PENDIENTE })
  generado: PeticionGenerada;

  @Column('varchar')
  observaciones: string;

  @Column({ nullable: true })
  pdfUrl: string;

  @ManyToOne(() => Almacen, (almacen) => almacen.peticionesProducto)
  almacen: Almacen;

  @ManyToOne(() => User, (user) => user.peticionesCreadas)
  creadoPor: User;

  @ManyToOne(() => User, { nullable: true })
  revisadoPor?: User;

  @Column({ type: 'timestamptz', nullable: true })
  fechaRevision?: Date;

  @OneToMany(() => PeticionProductoItem, (ri) => ri.reporte)
  items: PeticionProductoItem[];

  @ManyToOne(() => Equipo, (equipo) => equipo.reportes)
  equipo?: Equipo;

  @ManyToMany(() => Componente, { eager: false })
  @JoinTable({
    name: 'peticion_componentes',
    joinColumn: { name: 'peticion_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'componente_id', referencedColumnName: 'id' },
  })
  componentes: Componente[];

  @ManyToMany(() => Fase, { eager: false })
  @JoinTable({
    name: 'peticion_fases',
    joinColumn: { name: 'peticion_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'fase_id', referencedColumnName: 'id' },
  })
  fases: Fase[];
}

@Entity('componentes')
export class Componente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  key: string;
}

@Entity('fases')
export class Fase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  key: string;
}
