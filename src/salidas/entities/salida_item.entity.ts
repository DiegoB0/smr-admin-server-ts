import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Entrada } from '../../entradas/entities/entrada.entity';
import { RequisicionItem } from 'src/requisiciones/entities/requisicion_item.entity';
import { Producto } from '../../productos/entities/producto.entity';
import { Salida } from './salida.entity';

@Entity('salida_items')
export class SalidaItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  cantidadRetirada: number;

  @ManyToOne(() => Producto, { eager: true })
  producto: Producto;

  @ManyToOne(() => Salida, e => e.items, { onDelete: "CASCADE" })
  salida: Salida;

  @ManyToOne(() => RequisicionItem, ri => ri.entradas, { nullable: true })
  requisicionItem?: RequisicionItem;
}
