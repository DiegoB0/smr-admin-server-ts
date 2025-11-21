import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equipo } from 'src/equipos/entities/equipo.entity';
import { Brackets, Repository } from 'typeorm';
import { FiltroRequirement } from './entities/filtro-requirements.entity';
import { FiltroItem } from './entities/filtro-item.entity';
import { CategoriaFiltro } from './entities/filtro-category.entity';
import { PaginatedResponseDto, PaginationDto } from 'src/common/dto/pagination.dto';
import { GetCategoriaFiltroDto, PaginatedCategoriaFiltroDto } from './dto/response.dto';

const ALLOWED_HRS = new Set([250, 500, 1000, 2000]);

@Injectable()
export class FiltrosService {
  constructor(
    @InjectRepository(Equipo)
    private readonly equipoRepo: Repository<Equipo>,

    @InjectRepository(CategoriaFiltro)
    private readonly categoryRepo: Repository<CategoriaFiltro>,

    @InjectRepository(FiltroRequirement)
    private readonly requirementRepo: Repository<FiltroRequirement>,

    @InjectRepository(FiltroItem)
    private readonly itemRepo: Repository<FiltroItem>
  ) { }

  async listCategorias(
    pagination: PaginationDto
  ): Promise<PaginatedCategoriaFiltroDto> {
    const { page = 1, limit = 10, search, order = 'ASC' } = pagination;
    const skip = (page - 1) * limit;

    const qb = this.categoryRepo.createQueryBuilder('cat');

    if (search) {
      const term = `%${search}%`;
      qb.where(
        new Brackets((qb2) => {
          qb2
            .where('cat.nombre ILIKE :term', { term })
            .orWhere('cat.id::text ILIKE :term', { term });
        })
      );
    }

    qb.orderBy('cat.nombre', order);

    const [rows, totalItems] = await qb.skip(skip).take(limit).getManyAndCount();

    const data: GetCategoriaFiltroDto[] = rows.map((c) => ({
      id: c.id,
      nombre: c.nombre,
    }));

    const totalPages = Math.ceil(totalItems / limit);

    const meta: PaginatedResponseDto<GetCategoriaFiltroDto>['meta'] = {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };

    return new PaginatedCategoriaFiltroDto(data, meta);
  }


  async getItemsByNoEconomicoAndHrsQB(no_economico: string, hrs: number) {
    if (!ALLOWED_HRS.has(hrs)) {
      throw new BadRequestException(
        'hrs must be one of 250, 500, 1000, 2000'
      );
    }

    const rows = await this.itemRepo
      .createQueryBuilder('item')
      .innerJoinAndSelect('item.requirement', 'req')
      .innerJoin('req.categoria', 'cat')
      .innerJoin('cat.equipos', 'eq')
      .where('eq.no_economico = :no_economico', { no_economico })
      .andWhere('req.hrs = :hrs', { hrs })
      .orderBy('item.id', 'ASC')
      .getMany();

    if (rows.length === 0) {
      // Distinguish between equipo missing vs no items
      const equipo = await this.equipoRepo.findOne({
        where: { no_economico },
        relations: ['filtro_categoria'],
      });
      if (!equipo) throw new NotFoundException('Equipo not found');
      if (!equipo.filtro_categoria)
        throw new NotFoundException('Equipo has no filtro_categoria assigned');

      // Check if requirement exists
      const req = await this.requirementRepo.findOne({
        where: {
          categoriaId: equipo.filtro_categoria.id,
          hrs,
        },
      });
      if (!req) {
        throw new NotFoundException(
          `No requirement for categoriaId=${equipo.filtro_categoria.id} and hrs=${hrs}`
        );
      }
      // Requirement exists but no items
      return {
        no_economico,
        categoriaId: equipo.filtro_categoria.id,
        hrs,
        requirementNombre: req.nombre,
        items: [],
      };
    }

    // req and cat are loaded for the first item, grab metadata
    const any = rows[0] as any;
    return {
      no_economico,
      categoriaId: any.requirement?.categoriaId,
      hrs,
      requirementNombre: any.requirement?.nombre,
      items: rows,
    };
  }



}
