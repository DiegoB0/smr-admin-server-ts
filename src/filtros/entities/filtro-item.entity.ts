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
  numero: string;

  @Column('text', { nullable: true })
  equivalente: string | null;

  @Column('text', { nullable: true })
  descripcion: string | null;

  @Column()
  cantidad: number;

  @Column('text')
  unidad: string;

  @ManyToOne(() => FiltroRequirement, (req) => req.items, {
    onDelete: 'CASCADE',
  })
  requirement: FiltroRequirement;
}
