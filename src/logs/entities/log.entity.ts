import { User } from 'src/auth/entities/usuario.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('logs')
export class Log {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (usuario: User) => usuario.logs, { nullable: true })
  @JoinColumn({ name: 'usuario_id' })
  user: User;

  @Column()
  message: string;

  @Column()
  actionType: string;

  @Column({ nullable: true })
  requestBody: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
