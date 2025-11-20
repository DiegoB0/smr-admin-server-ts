import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FiltroRequirement } from './filtro-requirements.entity';

@Entity('filtro_items')
export class FiltroItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  nombre: string;

  @Column()
  cantidad: number;

  @Column('text')
  unidad: string;

  @ManyToOne(() => FiltroRequirement, (req) => req.items)
  requirement: FiltroRequirement;
}
