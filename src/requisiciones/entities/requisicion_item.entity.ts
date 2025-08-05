import { Producto } from 'src/productos/entities/producto.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Requisicion } from './requisicion.entity';
import { EntradaItem } from 'src/entradas/entities/entrada_item.entity';
import { SalidaItem } from 'src/salidas/entities/salida_item.entity';

@Entity('requisicion_items')
export class RequisicionItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  cantidadSolicitada: number;

  @OneToMany(() => EntradaItem, ei => ei.requisicionItem)
  entradas: EntradaItem[];

  @OneToMany(() => SalidaItem, si => si.requisicionItem)
  salidas: SalidaItem[];

  @ManyToOne(() => Producto, {eager: true})
  producto: Producto;

  @ManyToOne(() => Requisicion, r => r.items, {onDelete: 'CASCADE'})
  requisicion: Requisicion;
}
