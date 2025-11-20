import { Entrada } from 'src/entradas/entities/entrada.entity';
import { Salida } from 'src/salidas/entities/salida.entity';
import { Requisicion } from 'src/requisiciones/entities/requisicion.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Inventario } from './inventario.entity';
import { Obra } from 'src/obras/entities/obra.entity';
import { User } from 'src/auth/entities/usuario.entity';

@Entity('almacenes')
export class Almacen {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text', { unique: true })
  name: string;

  @Column('text')
  location: string;

  @Column('bool', { default: true })
  isActive: boolean;

  @OneToMany(() => Inventario, inv => inv.almacen)
  inventarios: Inventario[];

  @OneToMany(() => Requisicion, (requesicion) => requesicion.pedidoPor)
  requisiciones: Requisicion[];

  @OneToMany(() => Entrada, (entrada) => entrada.almacenDestino)
  entradas: Entrada[];

  @OneToMany(() => Salida, s => s.almacenOrigen)
  salidas: Salida[];


  @ManyToOne(() => Obra, obra => obra.almacenes, { onDelete: 'SET NULL' })
  obra: Obra

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  encargado?: User;

}
