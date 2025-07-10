import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './usuario.entity';
import { Rol } from './rol.entity';

@Entity('usuario_rol')
export class UsuarioRol {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (usuario) => usuario.usuarioRoles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @ManyToOne(() => Rol, (rol) => rol.usuarioRoles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rol_id' })
  rol: Rol;
}
