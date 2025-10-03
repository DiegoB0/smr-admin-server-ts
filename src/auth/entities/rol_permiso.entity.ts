import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Rol } from './rol.entity';
import { Permiso } from './permiso.entity';

@Entity('rol_permiso')
@Unique(['rol', 'permiso'])
export class RolPermiso {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Rol, (rol) => rol.permisos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rol_id' })
  rol: Rol;

  @ManyToOne(() => Permiso, (permiso) => permiso.roles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'permiso_id' })
  permiso: Permiso;
}
