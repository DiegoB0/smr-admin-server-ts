import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiKey } from './api_key.entity';
import { Log } from 'src/logs/entities/log.entity';
import { UsuarioRol } from './usuario_rol.entity';

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

}
