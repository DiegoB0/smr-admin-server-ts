import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Producto } from 'src/productos/entities/producto.entity';
import { PeticionProducto } from './peticion_producto.entity';

@Entity('peticion_producto_items')
export class PeticionProductoItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  cantidad: number;

  @ManyToOne(() => Producto, { eager: true })
  producto: Producto;

  @ManyToOne(() => PeticionProducto, (reporte) => reporte.items, { onDelete: 'CASCADE' })
  reporte: PeticionProducto;
}
