import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { RolPermiso } from './rol_permiso.entity';
import { UsuarioRol } from './usuario_rol.entity';

@Entity('roles')
export class Rol {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  // Key of each role
  @Column({ unique: true })
  slug: string;

  @OneToMany(() => RolPermiso, (rp) => rp.rol)
  permisos: RolPermiso[];

  @OneToMany(() => UsuarioRol, (ur) => ur.rol)
  usuarioRoles: UsuarioRol[];
}
