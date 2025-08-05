import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RequisicionItem } from 'src/requisiciones/entities/requisicion_item.entity';
import { Producto } from '../../productos/entities/producto.entity';
import { Entrada } from './entrada.entity';

@Entity('entrada_items')
export class EntradaItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  cantidadEsperada: number;

  @Column('int')
  cantidadRecibida: number;

  @ManyToOne(() => Producto, { eager: true })
  producto: Producto;

  @ManyToOne(() => Entrada, e => e.items)
  entrada: Entrada;

  @ManyToOne(() => RequisicionItem, ri => ri.entradas, { nullable: true })
  requisicionItem?: RequisicionItem;
}
