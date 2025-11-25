import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntradaStatus } from '../types/entradas-status';
import { Almacen } from 'src/almacenes/entities/almacen.entity';
import { User } from 'src/auth/entities/usuario.entity';
import { EntradaItem } from './entrada_item.entity';
import { Requisicion } from 'src/requisiciones/entities/requisicion.entity';
import { RequisicionRefaccionItem } from 'src/requisiciones/entities/customRequis/requisicion_refaccion.items.entity';
import { RequisicionFilterItem } from 'src/requisiciones/entities/customRequis/requisicion_filter_items.entity';
import { RequisicionInsumoItem } from 'src/requisiciones/entities/customRequis/requisicion_insumo_items.entity';

@Entity('entradas')
export class Entrada {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  fechaCreacion: Date;

  @Column({ nullable: true })
  observacionesAlmacen: string;

  @Column({ nullable: true })
  observacionesCompras: string;

  @Column({ type: 'date', nullable: true })
  fechaEsperada: string;

  @Column({ type: 'date', nullable: true })
  fechaRecibida: string;

  @Column({ type: 'enum', enum: EntradaStatus })
  status: EntradaStatus;

  @OneToMany(() => EntradaItem, it => it.entrada, { cascade: true })
  items: EntradaItem[];

  @ManyToOne(() => Almacen, a => a.entradas)
  almacenDestino: Almacen;

  @ManyToOne(() => User, u => u.entradas)
  creadoPor: User;

  @ManyToOne(() => Requisicion, { nullable: true })
  requisicion: Requisicion;
}
