import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { ApiKey } from './api_key.entity';
import { Log } from 'src/logs/entities/log.entity';
import { UsuarioRol } from './usuario_rol.entity';
import { Requisicion } from 'src/requisiciones/entities/requisicion.entity';
import { Entrada } from 'src/entradas/entities/entrada.entity';
import { Salida } from 'src/salidas/entities/salida.entity';
import { PeticionProducto } from 'src/requisiciones/entities/peticion_producto.entity';
import { Almacen } from 'src/almacenes/entities/almacen.entity';
import { Obra } from 'src/obras/entities/obra.entity';

@Entity('usuarios')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { unique: true })
  email: string;

  @Column('text', { select: false })
  password: string;

  @Column('text')
  name: string;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column('bool', { default: true })
  isActive: boolean;

  @OneToMany(() => UsuarioRol, (ur: UsuarioRol) => ur.usuario)
  usuarioRoles: UsuarioRol[];

  @OneToMany(() => ApiKey, (apiKey) => apiKey.user)
  apiKeys: ApiKey[];

  @OneToMany(() => Log, (logs) => logs.user)
  logs: Log[];

  @OneToMany(() => Requisicion, (requisicion) => requisicion.pedidoPor)
  requisiciones: Requisicion[];

  @OneToMany(() => Requisicion, (requisicion) => requisicion.revisadoPor)
  requisicionesAprovadas: Requisicion[];

  @OneToMany(() => Entrada, (entrada) => entrada.creadoPor)
  entradas: Entrada[];

  @OneToMany(() => Salida, (salida) => salida.recibidaPor)
  salidas: Salida[];

  @OneToMany(() => PeticionProducto, (peticion) => peticion.creadoPor)
  peticionesCreadas: PeticionProducto[];

  @OneToMany(() => PeticionProducto, (peticion) => peticion.revisadoPor)
  peticionesAprobadas: PeticionProducto[];

  @ManyToOne(() => Obra, { nullable: true, onDelete: 'SET NULL' })
  obra?: Obra;

  @OneToMany(() => Almacen, almacen => almacen.encargado)
  almacenesEncargados?: Almacen[];

}
