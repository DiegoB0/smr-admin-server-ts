import { Inventario } from 'src/almacenes/entities/inventario.entity';
import {
  Column,
  Entity,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';

@Entity('productos')
export class Producto {
  @PrimaryColumn({ type: 'varchar', length: 20 })
  id: string;

  @Column('text')
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
