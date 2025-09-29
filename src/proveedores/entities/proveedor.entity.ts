import { Requisicion } from 'src/requisiciones/entities/requisicion.entity';
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('proveedores')
export class Proveedor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text', { unique: true })
  name: string;

  @OneToMany(() => Requisicion, (requisicion) => requisicion.proveedor)
  requisiciones: Requisicion[];

  @Column('bool', { default: true })
  isActive: boolean;
}
