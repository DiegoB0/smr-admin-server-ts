import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Requisicion } from './entities/requisicion.entity';
import { LogsService } from 'src/logs/logs.service';
import { Brackets, Repository } from 'typeorm';
import { RequisicionItem } from './entities/requisicion_item.entity';
import { PeticionProducto } from './entities/peticion_producto.entity';
import { PeticionProductoItem } from './entities/peticion_producto_item.entity';
import { CreatePeticionProductoDto, UpdatePeticionProductoDto } from './dto/request.dto';
import { PeticionStatus } from './types/peticion-status';
import { User } from 'src/auth/entities/usuario.entity';
import { GetPeticionProductDto, PaginatedPeticionProductoDto, ReporteQueryDto } from './dto/response.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class RequisicionesService {
  constructor(
    @InjectRepository(Requisicion)
    private requisicionRepo: Repository<Requisicion>,

    @InjectRepository(Requisicion)
    private requisicionItemRepo: Repository<RequisicionItem>,

    @InjectRepository(PeticionProducto)
    private peticionRepo: Repository<PeticionProducto>,

    @InjectRepository(PeticionProductoItem)
    private peticionItemRepo: Repository<PeticionProductoItem>,

    private readonly logService: LogsService
  ) { }

  async getAllPeticiones(pagination: PaginationDto): Promise<PaginatedPeticionProductoDto> {
    const { page = 1, limit = 10, search, order = 'DESC' } = pagination;
    const skip = (page - 1) * limit;

    const queryBuilder = this.peticionRepo
      .createQueryBuilder('peticion')
      .select([
        'peticion.id',
        'peticion.fechaCreacion',
        'peticion.status',
        'peticion.observaciones',
        'peticion.fechaRevision',
      ])
      .leftJoin('peticion.almacen', 'almacen')
      .addSelect(['almacen.name'])

      .leftJoin('peticion.creadoPor', 'creadoPor')
      .addSelect(['creadoPor.email'])

      .leftJoin('peticion.revisadoPor', 'revisadoPor')
      .addSelect(['revisadoPor.email'])

      .leftJoin('peticion.items', 'items')
      .addSelect(['items.id', 'items.cantidad'])

      .leftJoin('items.producto', 'producto')
      .addSelect(['producto.id', 'producto.name']);

    if (search) {
      const term = `%${search}%`;
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('peticion.observaciones ILIKE :term', { term })
            .orWhere('almacen.name ILIKE :term', { term })
            .orWhere('creadoPor.email ILIKE :term');
        })
      );
    }

    queryBuilder.orderBy('peticion.fechaCreacion', order);

    const [peticiones, totalItems] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(totalItems / limit);

    const mapped: GetPeticionProductDto[] = peticiones.map((p) => ({
      id: p.id,
      fechaCreacion: p.fechaCreacion,
      status: p.status,
      observaciones: p.observaciones,
      fechaRevision: p.fechaRevision ?? null,
      almacen: { name: p.almacen?.name },
      creadoPor: { email: p.creadoPor?.email },
      revisadoPor: p.revisadoPor ? { email: p.revisadoPor.email } : null,
      items: p.items.map((i) => ({
        id: i.id,
        cantidad: i.cantidad,
        producto: {
          id: i.producto.id,
          name: i.producto.name,
        },
      })),
    }));

    return new PaginatedPeticionProductoDto(mapped, {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    });
  }

  async getPeticionesByUser(dto: ReporteQueryDto): Promise<PaginatedPeticionProductoDto> {
    const { userId, page = 1, limit = 10, search, order = 'DESC' } = dto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.peticionRepo
      .createQueryBuilder('peticion')
      .select([
        'peticion.id',
        'peticion.fechaCreacion',
        'peticion.status',
        'peticion.observaciones',
        'peticion.fechaRevision',
      ])
      .leftJoin('peticion.almacen', 'almacen')
      .addSelect(['almacen.name'])
      .leftJoin('peticion.creadoPor', 'creadoPor')
      .addSelect(['creadoPor.email'])
      .leftJoin('peticion.revisadoPor', 'revisadoPor')
      .addSelect(['revisadoPor.email'])
      .leftJoin('peticion.items', 'items')
      .addSelect(['items.id', 'items.cantidad'])
      .leftJoin('items.producto', 'producto')
      .addSelect(['producto.id', 'producto.name'])
      .where('creadoPor.id = :userId', { userId });

    if (search) {
      const term = `%${search}%`;
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('peticion.observaciones ILIKE :term', { term })
            .orWhere('almacen.name ILIKE :term')
            .orWhere('creadoPor.email ILIKE :term');
        })
      );
    }

    queryBuilder.orderBy('peticion.fechaCreacion', order);

    const [peticiones, totalItems] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(totalItems / limit);

    const mapped: GetPeticionProductDto[] = peticiones.map((p) => ({
      id: p.id,
      fechaCreacion: p.fechaCreacion,
      status: p.status,
      observaciones: p.observaciones,
      fechaRevision: p.fechaRevision ?? null,
      almacen: { name: p.almacen?.name },
      creadoPor: { email: p.creadoPor?.email },
      revisadoPor: p.revisadoPor ? { email: p.revisadoPor.email } : null,
      items: p.items.map((i) => ({
        id: i.id,
        cantidad: i.cantidad,
        producto: {
          id: i.producto.id,
          name: i.producto.name,
        },
      })),
    }));

    return new PaginatedPeticionProductoDto(mapped, {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    });
  }

  async createPeticionProducto(dto: CreatePeticionProductoDto, user: User) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Debe incluir al menos un producto en la petición.');
    }

    const peticion = this.peticionRepo.create({
      observaciones: dto.observaciones,
      almacen: { id: dto.almacenId } as any,
      creadoPor: { id: user.id } as any,
      status: PeticionStatus.PENDIENTE,
      items: dto.items.map((i) =>
        this.peticionItemRepo.create({
          cantidad: i.cantidad,
          producto: { id: i.productoId } as any,
        })
      ),
    });

    const saved = await this.peticionRepo.save(peticion);

    await this.logService.createLog(
      user,
      `El usuario ${user.name} creo el reporte ${saved}`,
      'CREATE_REPORTE',
      JSON.stringify(saved),
    )

    return saved;
  }

  async updatePeticionProducto(id: number, dto: UpdatePeticionProductoDto, user: User) {
    const peticion = await this.peticionRepo.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!peticion) {
      throw new NotFoundException('Petición no encontrada.');
    }

    if (peticion.status !== PeticionStatus.PENDIENTE) {
      throw new BadRequestException('Solo se pueden modificar peticiones pendientes.');
    }

    if (dto.observaciones !== undefined) {
      peticion.observaciones = dto.observaciones;
    }

    if (dto.items) {
      await this.peticionItemRepo.delete({ reporte: { id } as any });
      peticion.items = dto.items.map((i) =>
        this.peticionItemRepo.create({
          cantidad: i.cantidad,
          producto: { id: i.productoId } as any,
        })
      );
    }

    const updated = await this.peticionRepo.save(peticion);

    await this.logService.createLog(
      user,
      `El usuario ${user.name} actualizo el reporte ${updated}`,
      'CREATE_REPORTE',
      JSON.stringify(updated),
    )

    return updated;
  }

  async approvePeticionProducto(id: number, user: User) {
    const peticion = await this.peticionRepo.findOne({
      where: { id },
      relations: ['almacen', 'creadoPor', 'revisadoPor'],
    });

    if (!peticion) {
      throw new NotFoundException('Petición no encontrada.');
    }

    if (peticion.status !== PeticionStatus.PENDIENTE) {
      throw new BadRequestException(
        `No se puede aprobar una petición con estado ${peticion.status}.`
      );
    }

    peticion.status = PeticionStatus.APROBADO;
    peticion.revisadoPor = { id: user.id } as any;
    peticion.fechaRevision = new Date();

    const updated = await this.peticionRepo.save(peticion);

    await this.logService.createLog(
      user,
      `El usuario ${user.id} aprobo el reporte ${id}`,
      'APROVE_REPORTE',
      JSON.stringify(updated),
    )

    return updated;
  }

  async rejectPeticionProducto(id: number, user: User) {
    const peticion = await this.peticionRepo.findOne({
      where: { id },
      relations: ['almacen', 'creadoPor', 'revisadoPor'],
    });

    if (!peticion) {
      throw new NotFoundException('Petición no encontrada.');
    }

    if (peticion.status !== PeticionStatus.PENDIENTE) {
      throw new BadRequestException(
        `No se puede rechazar una petición con estado ${peticion.status}.`
      );
    }

    peticion.status = PeticionStatus.RECHAZADO;
    peticion.revisadoPor = { id: user.id } as any;
    peticion.fechaRevision = new Date();

    const updated = await this.peticionRepo.save(peticion);

    await this.logService.createLog(
      user,
      `El usuario ${user.id} rechazo el reporte ${id}`,
      'REJECT_REPORT',
      JSON.stringify(updated),
    )

    return updated;
  }

  // TODO: METODOS PARA LAS REQUISICIONES
  // TODO: Handle the inventory in here (substract from inventory if exist. If not create the requisition)
  async createRequisicion() {

  }

  async getRequisiciones() {

  }


  async acceptRequisicion() {

  }


  async deleteRequisicion() {

  }

  async updateRequisicion() {

  }
}
