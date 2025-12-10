import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiKey } from './api_key.entity';
import { Log } from 'src/logs/entities/log.entity';
import { UsuarioRol } from './usuario_rol.entity';
import { Requisicion } from 'src/requisiciones/entities/requisicion.entity';
import { Entrada } from 'src/entradas/entities/entrada.entity';
import { Salida } from 'src/salidas/entities/salida.entity';
import { Almacen } from 'src/almacenes/entities/almacen.entity';
import { Obra } from 'src/obras/entities/obra.entity';
import { AlmacenEncargado } from 'src/almacenes/entities/almacenEncargados.entity';
import { AlmacenAdminConta } from 'src/almacenes/entities/almacenAdminConta.entity';

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

  @OneToMany(() => Entrada, (entrada) => entrada.recibidoPor)
  entradas: Entrada[];

  @ManyToOne(() => Obra, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'obra_id' })
  obra?: Obra;

  // @OneToMany(() => Almacen, almacen => almacen.encargado)
  // almacenesEncargados?: Almacen[];

  @OneToMany(() => AlmacenAdminConta, (ae) => ae.user)
  almacenAdminConta: AlmacenAdminConta[];

  @OneToMany(() => AlmacenEncargado, (ae) => ae.user)
  almacenEncargados: AlmacenEncargado[];

}
