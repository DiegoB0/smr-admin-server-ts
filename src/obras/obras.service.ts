import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Obra } from './entities/obra.entity';
import { Brackets, Repository } from 'typeorm';
import { LogsService } from 'src/logs/logs.service';
import { CreateObraDto, UpdateObraDto } from './dto/request.dto';
import { PaginationDto, PaginationMetaData } from 'src/common/dto/pagination.dto';
import { GetObraDto, PaginatedObraDto } from './dto/response.dto';

@Injectable()
export class ObrasService {
  constructor(
    @InjectRepository(Obra)
    private readonly obraRepository: Repository<Obra>,

    private readonly logService: LogsService
  ) { }

  async create(dto: CreateObraDto): Promise<Obra> {
    const obra = this.obraRepository.create({
      ...dto,
      isActive: true
    });
    return await this.obraRepository.save(obra);
  }


  async findAll(pagination: PaginationDto): Promise<PaginatedObraDto> {
    const { page = 1, limit = 10, search, order = 'ASC' } = pagination;

    const skip = (page - 1) * limit;

    const queryBuilder = this.obraRepository.createQueryBuilder('obra');

    queryBuilder.leftJoin('obra.almacenes', 'almacen');

    queryBuilder.where('obra.isActive = :isActive', { isActive: true });

    if (search) {
      const term = `%${search}%`;
      queryBuilder.andWhere(new Brackets(qb2 => {
        qb2
          .where('obra.name ILIKE :term', { term });
      }));
    }

    queryBuilder.orderBy('obra.name', order);

    const [obras, totalItems] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount()

    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    // Map fields to JSON Data
    const mappedProductos: GetObraDto[] = obras.map((obra) => ({
      id: obra.id,
      name: obra.name,
      description: obra.description,
      location: obra.location,
      isActive: obra.isActive,
    }))

    const meta: PaginationMetaData = {
      currentPage: page,
      totalPages: totalPages,
      totalItems: totalItems,
      itemsPerPage: limit,
      hasNextPage: hasNextPage,
      hasPreviousPage: hasPreviousPage,
    }

    return new PaginatedObraDto(mappedProductos, meta)

  }

  async findAllowedAlmacenes(pagination: PaginationDto, currentAlmacenId?: number): Promise<PaginatedObraDto> {
    const { page = 1, limit = 10, search, order = 'ASC' } = pagination;

    const skip = (page - 1) * limit;

    const queryBuilder = this.obraRepository.createQueryBuilder('obra');

    queryBuilder.leftJoin('obra.almacenes', 'almacen');

    queryBuilder.where('obra.isActive = :isActive', { isActive: true });

    if (currentAlmacenId) {
      queryBuilder.andWhere('almacen.id = :currentAlmacenId', {
        currentAlmacenId,
      });
    } else {
      queryBuilder.andWhere('almacen.id IS NULL');
    }

    if (search) {
      const term = `%${search}%`;
      queryBuilder.andWhere(new Brackets(qb2 => {
        qb2
          .where('obra.name ILIKE :term', { term });
      }));
    }

    queryBuilder.orderBy('obra.name', order);

    const [obras, totalItems] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount()

    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    // Map fields to JSON Data
    const mappedProductos: GetObraDto[] = obras.map((obra) => ({
      id: obra.id,
      name: obra.name,
      description: obra.description,
      location: obra.location,
      isActive: obra.isActive,
    }))

    const meta: PaginationMetaData = {
      currentPage: page,
      totalPages: totalPages,
      totalItems: totalItems,
      itemsPerPage: limit,
      hasNextPage: hasNextPage,
      hasPreviousPage: hasPreviousPage,
    }

    return new PaginatedObraDto(mappedProductos, meta)

  }

  async findOne(id: number): Promise<Obra> {
    const obra = await this.obraRepository.findOne({
      where: { id },
      relations: ['almacenes'],
    });

    if (!obra) {
      throw new NotFoundException(`Obra with ID ${id} not found`);
    }

    return obra;
  }

  async update(id: number, dto: UpdateObraDto): Promise<Obra> {
    const obra = await this.findOne(id);
    Object.assign(obra, dto);
    return await this.obraRepository.save(obra);
  }

  async remove(id: number): Promise<void> {
    const obra = await this.findOne(id);
    await this.obraRepository.remove(obra);
  }


}
