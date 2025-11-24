import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Index } from 'typeorm';
import { RolPermiso } from './rol_permiso.entity';
import { UsuarioRol } from './usuario_rol.entity';

@Entity('roles')
export class Rol {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @OneToMany(() => RolPermiso, (rp) => rp.rol)
  permisos: RolPermiso[];

  @OneToMany(() => UsuarioRol, (ur) => ur.rol)
  usuarioRoles: UsuarioRol[];
}
