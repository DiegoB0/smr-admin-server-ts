import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Producto } from '../../productos/entities/producto.entity';
import { Entrada } from './entrada.entity';
import { RequisicionRefaccionItem } from 'src/requisiciones/entities/customRequis/requisicion_refaccion.items.entity';
import { RequisicionInsumoItem } from 'src/requisiciones/entities/customRequis/requisicion_insumo_items.entity';
import { RequisicionFilterItem } from 'src/requisiciones/entities/customRequis/requisicion_filter_items.entity';

@Entity('entrada_items')
export class EntradaItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int', { nullable: true })
  cantidadEsperada: number;

  @Column('int', { nullable: true })
  cantidadRecibida: number | null;

  @Column({ nullable: true })
  descripcion: string;

  @Column({ nullable: true })
  unidad: string;

  // Link to one of the requisicion item types
  @ManyToOne(() => RequisicionRefaccionItem, { nullable: true })
  refaccionItem?: RequisicionRefaccionItem;

  @ManyToOne(() => RequisicionInsumoItem, { nullable: true })
  insumoItem?: RequisicionInsumoItem;

  @ManyToOne(() => RequisicionFilterItem, { nullable: true })
  filtroItem?: RequisicionFilterItem;

  @ManyToOne(() => Entrada, e => e.items)
  entrada: Entrada;

}
