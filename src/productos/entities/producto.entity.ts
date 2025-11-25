import { Inventario } from 'src/almacenes/entities/inventario.entity';
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('productos')
export class Producto {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, unique: true })
  customId: string;

  @Column('text', { unique: true })
  name: string;

  @Column('text')
  description: string;

  // 1 pieza, 1 litro, etc.
  @Column('text')
  unidad: string;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column('bool', { default: true })
  isActive: boolean;

  @OneToMany(() => Inventario, i => i.producto)
  inventarios: Inventario[];
}
