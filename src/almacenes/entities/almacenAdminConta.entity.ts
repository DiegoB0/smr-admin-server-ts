import {
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Almacen } from './almacen.entity';
import { User } from 'src/auth/entities/usuario.entity';

@Entity('almacen_admin_conta')
export class AlmacenAdminConta {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Almacen, (almacen) => almacen.adminConta, {
    onDelete: 'CASCADE',
  })
  almacen: Almacen;

  @ManyToOne(() => User, (user) => user.almacenAdminConta, {
    onDelete: 'CASCADE',
  })
  user: User;
}
