import { Almacen } from "src/almacenes/entities/almacen.entity";
import { Producto } from "src/productos/entities/producto.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'inventarios'})
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
