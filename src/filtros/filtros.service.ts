import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equipo } from 'src/equipos/entities/equipo.entity';
import { Brackets, Repository } from 'typeorm';
import { FiltroRequirement } from './entities/filtro-requirements.entity';
import { FiltroItem } from './entities/filtro-item.entity';
import { CategoriaFiltro } from './entities/filtro-category.entity';
import { PaginatedResponseDto, PaginationDto } from 'src/common/dto/pagination.dto';
import { GetCategoriaFiltroDto, PaginatedCategoriaFiltroDto } from './dto/response.dto';
import { CreateCategoriaFiltroDto, CreatedCategoriaFiltroDto, CreatedFiltroItemDto, CreateFiltroItemsForRequirementDto, FiltroRequirementGroupDto, GetCategoriaFiltroWithItemsDto, UpdateCategoriaFiltroDto, UpdatedCategoriaFiltroDto, UpdatedFiltroItemDto, UpdateFiltroItemDto } from './dto/request.dto';

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

  async getCategoriaWithItems(
    categoriaId: number,
    hrs: number
  ): Promise<GetCategoriaFiltroWithItemsDto> {
    if (!ALLOWED_HRS.has(hrs)) {
      throw new BadRequestException(
        'hrs must be one of 250, 500, 1000, 2000'
      );
    }

    const requirement = await this.requirementRepo.findOne({
      where: { categoriaId, hrs },
      relations: ['categoria', 'items'],
    });

    if (!requirement) {
      throw new NotFoundException(
        `No requirement found for categoriaId=${categoriaId} and hrs=${hrs}`
      );
    }

    const items = requirement.items.map((item) => ({
      id: item.id,
      numero: item.numero,
      equivalente: item.equivalente,
      descripcion: item.descripcion,
      cantidad: item.cantidad,
      unidad: item.unidad,
    }));

    return {
      id: requirement.categoria.id,
      nombre: requirement.categoria.nombre,
      hrs: requirement.hrs,
      requirementNombre: requirement.nombre,
      items,
    };
  }

  async createCategoria(
    dto: CreateCategoriaFiltroDto
  ): Promise<CreatedCategoriaFiltroDto> {
    const categoria = this.categoryRepo.create({
      nombre: dto.nombre,
    });

    const savedCategoria = await this.categoryRepo.save(categoria);

    // Create requirements for all allowed hrs
    const requirements: { hrs: number; nombre: string }[] = [];
    for (const hrs of ALLOWED_HRS) {
      const req = this.requirementRepo.create({
        categoriaId: savedCategoria.id,
        hrs,
        nombre: `Mantenimiento ${hrs} HRS`,
      });
      const savedReq = await this.requirementRepo.save(req);
      requirements.push({
        hrs: savedReq.hrs,
        nombre: savedReq.nombre,
      });
    }

    return {
      id: savedCategoria.id,
      nombre: savedCategoria.nombre,
      requirements,
    };
  }

  async createItemsForRequirement(
    categoriaId: number,
    hrs: number,
    dto: CreateFiltroItemsForRequirementDto
  ): Promise<CreatedFiltroItemDto[]> {
    if (!ALLOWED_HRS.has(hrs)) {
      throw new BadRequestException(
        'hrs must be one of 250, 500, 1000, 2000'
      );
    }

    // Check if requirement exists
    const requirement = await this.requirementRepo.findOne({
      where: { categoriaId, hrs },
    });

    if (!requirement) {
      throw new NotFoundException(
        `No requirement found for categoriaId=${categoriaId} and hrs=${hrs}`
      );
    }

    // Create items
    const items = dto.items.map((itemDto) => {
      const item = this.itemRepo.create();
      item.numero = itemDto.numero;
      item.equivalente = itemDto.equivalente || null;
      item.descripcion = itemDto.descripcion || null;
      item.cantidad = itemDto.cantidad;
      item.unidad = itemDto.unidad;
      item.requirement = requirement;
      return item;
    });

    const savedItems = await this.itemRepo.save(items);

    return savedItems.map((item) => ({
      id: item.id,
      numero: item.numero,
      equivalente: item.equivalente,
      descripcion: item.descripcion,
      cantidad: item.cantidad,
      unidad: item.unidad,
    }));
  }

  async updateCategoria(
    categoriaId: number,
    dto: UpdateCategoriaFiltroDto
  ): Promise<UpdatedCategoriaFiltroDto> {
    const categoria = await this.categoryRepo.findOne({
      where: { id: categoriaId },
    });

    if (!categoria) {
      throw new NotFoundException('Categoria not found');
    }

    categoria.nombre = dto.nombre;
    const updated = await this.categoryRepo.save(categoria);

    return {
      id: updated.id,
      nombre: updated.nombre,
    };
  }

  async updateFiltroItem(
    itemId: number,
    dto: UpdateFiltroItemDto
  ): Promise<UpdatedFiltroItemDto> {
    const item = await this.itemRepo.findOne({
      where: { id: itemId },
    });

    if (!item) {
      throw new NotFoundException('Filtro item not found');
    }

    if (dto.numero !== undefined) item.numero = dto.numero;
    if (dto.equivalente !== undefined) item.equivalente = dto.equivalente;
    if (dto.descripcion !== undefined) item.descripcion = dto.descripcion;
    if (dto.cantidad !== undefined) item.cantidad = dto.cantidad;
    if (dto.unidad !== undefined) item.unidad = dto.unidad;

    const updated = await this.itemRepo.save(item);

    return {
      id: updated.id,
      numero: updated.numero,
      equivalente: updated.equivalente,
      descripcion: updated.descripcion,
      cantidad: updated.cantidad,
      unidad: updated.unidad,
    };
  }

  async deleteFiltroItem(itemId: number): Promise<{ message: string }> {
    const item = await this.itemRepo.findOne({
      where: { id: itemId },
    });

    if (!item) {
      throw new NotFoundException('Filtro item not found');
    }

    await this.itemRepo.remove(item);

    return { message: 'Filtro item deleted successfully' };
  }

  async deleteCategoria(categoriaId: number): Promise<{ message: string }> {
    const categoria = await this.categoryRepo.findOne({
      where: { id: categoriaId },
      relations: ['requirements'],
    });

    if (!categoria) {
      throw new NotFoundException('Categoria not found');
    }

    await this.categoryRepo.remove(categoria);

    return { message: 'Categoria and all related requirements and items deleted successfully' };
  }


}
