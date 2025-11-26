import {
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Almacen } from './almacen.entity';
import { User } from 'src/auth/entities/usuario.entity';

@Entity('almacen_encargados')
export class AlmacenEncargado {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Almacen, (almacen) => almacen.encargados, {
    onDelete: 'CASCADE',
  })
  almacen: Almacen;

  @ManyToOne(() => User, (user) => user.almacenEncargados, {
    onDelete: 'CASCADE',
  })
  user: User;
}
