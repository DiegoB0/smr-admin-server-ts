import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Index } from 'typeorm';
import { RolPermiso } from './rol_permiso.entity';

@Entity('permisos')
export class Permiso {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  description: string;

  @OneToMany(() => RolPermiso, (rp) => rp.permiso)
  roles: RolPermiso[];
}
