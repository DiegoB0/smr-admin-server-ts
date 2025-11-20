import { Equipo } from 'src/equipos/entities/equipo.entity';
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FiltroRequirement } from './filtro-requirements.entity';

@Entity('filtro_categorias')
export class CategoriaFiltro {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  nombre: string;

  @OneToMany(() => Equipo, (equipo) => equipo.filtro_categoria)
  equipos: Equipo[];

  @OneToMany(() => FiltroRequirement, (req) => req.categoria)
  requirements: FiltroRequirement[];
}
