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

@Entity('entradas')
export class Entrada {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  fechaCreacion: Date;

  @Column({type: 'date', nullable: true})
  fechaEsperada: string;

  @Column({type: 'date', nullable: true})
  fechaRecibida: string;

  @Column({type: 'enum', enum: EntradaStatus})
  status: EntradaStatus;

  @OneToMany(() => EntradaItem, it => it.entrada, {cascade: true})
  items: EntradaItem;

  @ManyToOne(() => Almacen, a => a.entradas) 
  almacenDestino: Almacen;

  @ManyToOne(() => User, u => u.entradas) 
  creadoPor: User;
}
