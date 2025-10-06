import { Almacen } from "src/almacenes/entities/almacen.entity";
import { Producto } from "src/productos/entities/producto.entity";
import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity({name: 'inventarios'})
@Unique(['almacen', 'producto'])
@Index(['almacen', 'producto'])
export class Inventario {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Almacen, a => a.inventarios, {onDelete: "CASCADE"})
  almacen: Almacen;

  @ManyToOne(() => Producto, p => p.inventarios, {onDelete: "CASCADE"})
  producto: Producto;

  @Column('int', {default: 0})
  stock: number;
  
}
