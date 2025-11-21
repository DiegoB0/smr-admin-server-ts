import { CategoriaFiltro } from 'src/filtros/entities/filtro-category.entity';
import { RequisicionFilterItem } from 'src/requisiciones/entities/customRequis/requisicion_filter_items.entity';
import { RequisicionRefaccionItem } from 'src/requisiciones/entities/customRequis/requisicion_refaccion.items.entity';
import { Salida } from 'src/salidas/entities/salida.entity';
import {
  Column,
  Entity,
  ManyToOne,
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

  @Column('numeric', { nullable: true })
  horometro: number;

  @Column('bool', { default: true })
  isActive: boolean;

  @OneToMany(() => Salida, (salida) => salida.equipo)
  salidas: Salida[];

  @ManyToOne(() => CategoriaFiltro, (cat) => cat.equipos)
  filtro_categoria: CategoriaFiltro;
}
