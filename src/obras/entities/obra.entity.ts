import { Almacen } from 'src/almacenes/entities/almacen.entity';
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('obras')
export class Obra {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  name: string;

  @Column('text')
  description: string;

  @Column('text')
  location: string;

  @Column('bool', { default: true })
  isActive: boolean;

  @OneToMany(() => Almacen, (almacen) => almacen.obra)
  almacenes: Almacen[];
}
