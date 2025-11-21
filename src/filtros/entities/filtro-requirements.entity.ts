import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { FiltroItem } from './filtro-item.entity';
import { CategoriaFiltro } from './filtro-category.entity';

@Entity('filtro_requirements')
export class FiltroRequirement {
  @PrimaryColumn()
  categoriaId: number;

  @PrimaryColumn()
  hrs: number;

  @Column('text')
  nombre: string;

  @ManyToOne(() => CategoriaFiltro, (cat) => cat.requirements, {
    onDelete: 'CASCADE',
  })
  categoria: CategoriaFiltro;

  @OneToMany(() => FiltroItem, (item) => item.requirement, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  items: FiltroItem[];
}
