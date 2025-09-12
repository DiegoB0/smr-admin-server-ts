import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Equipo } from './entities/equipo.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { LogsService } from 'src/logs/logs.service';

@Injectable()
export class EquiposService {
  constructor(
    @InjectRepository(Equipo)
    private readonly equipoRepo: Repository<Equipo>,

    private readonly logService: LogsService
  ) { }

  async findAll(): Promise<Equipo[]> {
    return this.equipoRepo.find();
  }

  async create(data: Partial<Equipo>): Promise<Equipo> {
    const newEquipo = this.equipoRepo.create(data);
    return this.equipoRepo.save(newEquipo);
  }

  async update(id: number, data: Partial<Equipo>): Promise<Equipo> {
    const equipo = await this.equipoRepo.findOne({ where: { id } });
    if (!equipo) {
      throw new NotFoundException(`Equipo with id ${id} not found`);
    }
    Object.assign(equipo, data);
    return this.equipoRepo.save(equipo);
  }

  async remove(id: number): Promise<void> {
    const equipo = await this.equipoRepo.findOne({ where: { id } });
    if (!equipo) {
      throw new NotFoundException(`Equipo with id ${id} not found`);
    }
    await this.equipoRepo.remove(equipo);
  }
}
