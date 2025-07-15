import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('almacenes')
export class Almacen {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text', { unique: true })
  name: string;

  @Column('text')
  location: string;

  @Column('bool', { default: true })
  isActive: boolean;

}
