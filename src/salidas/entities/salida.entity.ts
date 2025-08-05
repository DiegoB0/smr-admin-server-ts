import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Almacen } from 'src/almacenes/entities/almacen.entity';
import { User } from 'src/auth/entities/usuario.entity';
import { SalidaItem } from './salida_item.entity';

@Entity('salidas')
export class Salida {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  cantidad: string;

  @OneToMany(() => User, u => u.salidas)
  recibidaPor: User;

  @OneToMany(() => SalidaItem, it => it.salida, {cascade: true})
  items: SalidaItem;

  @ManyToOne(() => Almacen, a => a.salidas)
  almacenOrigen: Almacen;
}
