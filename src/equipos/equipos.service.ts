import { Injectable, NotFoundException } from '@nestjs/common';
import { Brackets, Repository } from 'typeorm';
import { Equipo } from './entities/equipo.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { LogsService } from 'src/logs/logs.service';
import { PaginationDto, PaginationMetaData } from 'src/common/dto/pagination.dto';
import { GetEquipoDto, PaginatedEquipoDto } from './dto/response.dto';

@Injectable()
export class EquiposService {
  constructor(
    @InjectRepository(Equipo)
    private readonly equipoRepo: Repository<Equipo>,

    private readonly logService: LogsService
  ) { }

  async findAll(pagination: PaginationDto): Promise<PaginatedEquipoDto> {

    const { page = 1, limit = 10, search, order = 'ASC' } = pagination;

    const skip = (page - 1) * limit;

    const queryBuilder = this.equipoRepo.createQueryBuilder('equipo');

    queryBuilder.where({ isActive: true });

    if (search) {
      const term = `%${search}%`;
      queryBuilder.andWhere(new Brackets(qb2 => {
        qb2
          .where('equipo.equipo ILIKE :term', { term })
          .orWhere('equipo.id ILIKE :term', { term });
      }));
    }

    queryBuilder.orderBy('equipo.equipo', order);

    const [equipos, totalItems] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount()

    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    // Map fields to JSON Data
    const mappedEquipos: GetEquipoDto[] = equipos.map((equipo) => ({
      id: equipo.id,
      equipo: equipo.equipo,
      no_economico: equipo.no_economico,
      modelo: equipo.modelo,
      serie: equipo.serie,
      isActive: equipo.isActive,
    }))

    const meta: PaginationMetaData = {
      currentPage: page,
      totalPages: totalPages,
      totalItems: totalItems,
      itemsPerPage: limit,
      hasNextPage: hasNextPage,
      hasPreviousPage: hasPreviousPage,
    }

    return new PaginatedEquipoDto(mappedEquipos, meta)
  }

  async getOne(id: number): Promise<Equipo> {
    const equipo = await this.equipoRepo.findOneBy({id});
    if (!equipo) {
      throw new NotFoundException('Equipo not found')
    }

    return equipo
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
