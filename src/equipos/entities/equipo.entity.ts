import { PeticionProducto } from 'src/requisiciones/entities/peticion_producto.entity';
import { Requisicion } from 'src/requisiciones/entities/requisicion.entity';
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('equipos')
export class Equipo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  equipo: string;

  @Column('text')
  no_economico: string;

  @Column('text')
  modelo: string;

  @Column('text')
  serie: string;

  @Column('bool', { default: true })
  isActive: boolean;

  @OneToMany(() => PeticionProducto, (peticion) => peticion.equipo)
  reportes: PeticionProducto[];

  @OneToMany(() => Requisicion, (requisicion) => requisicion.equipo)
  requisiciones: Requisicion[];
}
