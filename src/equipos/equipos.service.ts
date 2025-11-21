import { Injectable, NotFoundException } from '@nestjs/common';
import { Brackets, Repository } from 'typeorm';
import { Equipo } from './entities/equipo.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { LogsService } from 'src/logs/logs.service';
import { PaginationDto, PaginationMetaData } from 'src/common/dto/pagination.dto';
import { GetEquipoDto, PaginatedEquipoDto } from './dto/response.dto';
import { CreateEquipoDto, UpdateEquipoDto } from './dto/request.dto';
import { CategoriaFiltro } from 'src/filtros/entities/filtro-category.entity';

@Injectable()
export class EquiposService {
  constructor(
    @InjectRepository(Equipo)
    private readonly equipoRepo: Repository<Equipo>,
    @InjectRepository(CategoriaFiltro)
    private readonly categoriaRepo: Repository<CategoriaFiltro>,

    private readonly logService: LogsService
  ) { }

  async findAll(pagination: PaginationDto): Promise<PaginatedEquipoDto> {
    const { page = 1, limit = 10, search, order = 'ASC' } = pagination;

    const skip = (page - 1) * limit;

    const qb = this.equipoRepo
      .createQueryBuilder('equipo')
      .leftJoinAndSelect('equipo.filtro_categoria', 'categoria')
      .where('equipo.isActive = :active', { active: true });

    if (search) {
      const term = `%${search}%`;
      qb.andWhere(new Brackets(qb2 => {
        qb2
          .where('equipo.equipo ILIKE :term', { term })
          .orWhere('equipo.no_economico ILIKE :term', { term })
          .orWhere('equipo.modelo ILIKE :term', { term })
          .orWhere('equipo.serie ILIKE :term', { term })
      }));
    }

    qb.orderBy('equipo.equipo', order);

    const [equipos, totalItems] = await qb
      .skip(skip)
      .take(limit)
      .getManyAndCount()

    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    const meta: PaginationMetaData = {
      currentPage: page,
      totalPages: totalPages,
      totalItems: totalItems,
      itemsPerPage: limit,
      hasNextPage: hasNextPage,
      hasPreviousPage: hasPreviousPage,
    }

    const mappedEquipos: GetEquipoDto[] = equipos.map((equipo) => ({
      id: equipo.id,
      equipo: equipo.equipo,
      no_economico: equipo.no_economico,
      modelo: equipo.modelo,
      serie: equipo.serie,
      isActive: equipo.isActive,
      filtroCategoriaNombre: equipo.filtro_categoria?.nombre ?? null,
    }))

    return new PaginatedEquipoDto(mappedEquipos, meta)
  }

  async getOne(id: number): Promise<Equipo> {
    const equipo = await this.equipoRepo.findOneBy({ id });
    if (!equipo) {
      throw new NotFoundException('Equipo not found')
    }

    return equipo
  }

  async create(dto: CreateEquipoDto): Promise<Equipo> {
    const equipo = this.equipoRepo.create({
      equipo: dto.equipo,
      no_economico: dto.no_economico,
      modelo: dto.modelo,
      serie: dto.serie,
    });

    if (dto.filtroCategoriaId != null) {
      const categoria = await this.categoriaRepo.findOne({
        where: { id: dto.filtroCategoriaId },
      });
      if (!categoria) {
        throw new NotFoundException('CategoriaFiltro not found');
      }
      equipo.filtro_categoria = categoria;
    }

    return this.equipoRepo.save(equipo);
  }

  async update(id: number, dto: UpdateEquipoDto): Promise<Equipo> {
    const equipo = await this.equipoRepo.findOne({
      where: { id },
      relations: ['filtro_categoria'],
    });
    if (!equipo) throw new NotFoundException('Equipo not found');

    if (dto.equipo !== undefined) equipo.equipo = dto.equipo;
    if (dto.no_economico !== undefined)
      equipo.no_economico = dto.no_economico;
    if (dto.modelo !== undefined) equipo.modelo = dto.modelo;
    if (dto.serie !== undefined) equipo.serie = dto.serie;
    if (dto.isActive !== undefined) equipo.isActive = dto.isActive;

    if (dto.filtroCategoriaId !== undefined) {
      if (dto.filtroCategoriaId === null as any) {
        // if you want to allow unsetting, else remove this branch
        equipo.filtro_categoria = null as any;
      } else {
        const categoria = await this.categoriaRepo.findOne({
          where: { id: dto.filtroCategoriaId },
        });
        if (!categoria) {
          throw new NotFoundException('CategoriaFiltro not found');
        }
        equipo.filtro_categoria = categoria;
      }
    }

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
