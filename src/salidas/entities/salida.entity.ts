import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Almacen } from 'src/almacenes/entities/almacen.entity';
import { User } from 'src/auth/entities/usuario.entity';
import { SalidaItem } from './salida_item.entity';
import { Equipo } from 'src/equipos/entities/equipo.entity';

@Entity('salidas')
export class Salida {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({nullable: true})
  recibidaPor: string;

  @ManyToOne(() => User, { nullable: true })
  authoriza?: User;

  @OneToMany(() => SalidaItem, it => it.salida, { cascade: true })
  items: SalidaItem[];

  @CreateDateColumn()
  fecha: Date;

  @ManyToOne(() => Almacen, a => a.salidas)
  @JoinColumn({ name: 'almacen_origen_id' })
  almacenOrigen: Almacen;

  @Column({ name: 'almacen_origen_id' })
  almacenOrigenId: number;

  @ManyToOne(() => Equipo, (equipo) => equipo.salidas)
  equipo?: Equipo;
}
