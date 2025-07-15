import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Almacen } from './entities/almacen.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogsService } from 'src/logs/logs.service';
import { User } from 'src/auth/entities/usuario.entity';
import { CreateAlmacenDto, ParamAlmacenID, UpdateAlmacenDto } from './dto/request.dto';
import { GetAlmacenDto, PaginatedAlmacenDto } from './dto/response.dto';
import { PaginationDto, PaginationMetaData } from 'src/common/dto/pagination.dto';

@Injectable()
export class AlmacenesService {
  constructor(
    @InjectRepository(Almacen)
    private almacenRepo: Repository<Almacen>,

    private readonly logService: LogsService

  ) { }

  async createAlmacen(dto: CreateAlmacenDto, user: User): Promise<Almacen> {
    const { name, location } = dto

    const almacen = await this.almacenRepo.findOne({ where: { name } })

    if (almacen) throw new ConflictException('An almacen with that name already exists')

    const newAlmacen = this.almacenRepo.create({
      location: location,
      name: name,
      isActive: true
    })

    const savedAlmacen = this.almacenRepo.save(newAlmacen)

    await this.logService.createLog(
      user,
      `El usuario ${user.name} creo el almacen ${newAlmacen.name}`,
      'CREATE_ALMACEN',
      JSON.stringify(savedAlmacen),
    )

    return savedAlmacen;
  }

  async findAll(pagination: PaginationDto): Promise<PaginatedAlmacenDto> {

    const { page = 1, limit = 10, sortBy, order = 'ASC' } = pagination;

    const skip = (page - 1) * limit;

    const queryBuilder = this.almacenRepo.createQueryBuilder('almacen');

    queryBuilder.where({ isActive: true });

    if (sortBy) {
      queryBuilder.orderBy(`almacen.${sortBy}`, order);
    }

    const [almacenes, totalItems] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount()

    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    // Map fields to JSON Data
    const mappedAlmacenes: GetAlmacenDto[] = almacenes.map((almacen) => ({
      id: almacen.id,
      location: almacen.location,
      isActive: almacen.isActive,
      name: almacen.name,
    }))

    const meta: PaginationMetaData = {
      currentPage: page,
      totalPages: totalPages,
      totalItems: totalItems,
      itemsPerPage: limit,
      hasNextPage: hasNextPage,
      hasPreviousPage: hasPreviousPage,
    }

    return new PaginatedAlmacenDto(mappedAlmacenes, meta)
  }

  async findOne(dto: ParamAlmacenID): Promise<GetAlmacenDto> {
    const { id } = dto

    const almacen = await this.almacenRepo.findOne({ where: { id, isActive: true } })

    if (!almacen) throw new NotFoundException('Almacen not found')

    const mappedAlmacen: GetAlmacenDto = {
      id: almacen.id,
      location: almacen.location,
      isActive: almacen.isActive,
      name: almacen.name,
    };

    return mappedAlmacen
  }

  async deleteAlmacen(dto: ParamAlmacenID, user: User) {
    const { id } = dto

    const almacen = await this.almacenRepo.findOne({ where: { id, isActive: true } })

    if (!almacen) throw new NotFoundException('Almacen not found')

    almacen.isActive = false

    this.almacenRepo.save(almacen)


    await this.logService.createLog(
      user,
      `El usuario ${user.name} elimino el almacen ${almacen.name}`,
      'DELETE_ALMACEN',
      JSON.stringify(almacen),
    )

    return { message: 'Almacen deleted successfully' }

  }

  async updateAlmacen(almacenId: ParamAlmacenID, dto: UpdateAlmacenDto, user: User): Promise<Almacen> {

    const { id } = almacenId

    const { location, isActive, name } = dto

    const almacen = await this.almacenRepo.findOne({ where: { id, isActive: true } })

    if (!almacen) throw new NotFoundException('Almacen not found')

    if (location !== undefined) {
      almacen.location = location
    }

    if (isActive !== undefined) {
      almacen.isActive = isActive
    }

    if (name !== undefined) {
      almacen.name = name
    }

    this.almacenRepo.save(almacen)

    await this.logService.createLog(
      user,
      `El usuario ${user.name} actualizo el almacen ${almacen.name}`,
      'UPDATE_ALMACEN',
      JSON.stringify(almacen),
    )

    return almacen
  }
}
