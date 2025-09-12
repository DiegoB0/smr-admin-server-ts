import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Requisicion } from './entities/requisicion.entity';
import { LogsService } from 'src/logs/logs.service';
import { Brackets, Repository } from 'typeorm';
import { RequisicionItem } from './entities/requisicion_item.entity';
import { PeticionProducto } from './entities/peticion_producto.entity';
import { PeticionProductoItem } from './entities/peticion_producto_item.entity';
import { CreatePeticionProductoDto, CreateRequisicionDto, CreateServiceRequisicionDto, UpdatePeticionProductoDto } from './dto/request.dto';
import { PeticionStatus } from './types/peticion-status';
import { User } from 'src/auth/entities/usuario.entity';
import { GetPeticionProductDto, PaginatedPeticionProductoDto, ReporteQueryDto } from './dto/response.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { RequisicionStatus } from './types/requisicion-status';
import { RequisicionAprovalLevel, RequisicionType } from './types/requisicion-type';
import { Producto } from 'src/productos/entities/producto.entity';
import { Almacen } from 'src/almacenes/entities/almacen.entity';
import { PeticionGenerada } from './types/peticion-generada';
import { Equipo } from 'src/equipos/entities/equipo.entity';

@Injectable()
export class RequisicionesService {
  constructor(
    @InjectRepository(Requisicion)
    private requisicionRepo: Repository<Requisicion>,

    @InjectRepository(RequisicionItem)
    private requisicionItemRepo: Repository<RequisicionItem>,

    @InjectRepository(PeticionProducto)
    private peticionRepo: Repository<PeticionProducto>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(PeticionProductoItem)
    private peticionItemRepo: Repository<PeticionProductoItem>,

    @InjectRepository(Almacen)
    private almacenRepo: Repository<Almacen>,

    @InjectRepository(Equipo)
    private equipoRepo: Repository<Equipo>,

    private readonly logService: LogsService
  ) { }

  // TODO: Endpoint to get peticiones por almacen
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

  async getAllPeticionesAprobadas(
    pagination: PaginationDto
  ): Promise<PaginatedPeticionProductoDto> {
    const { page = 1, limit = 10, search, order = 'DESC' } = pagination;
    const skip = (page - 1) * limit;

    const queryBuilder = this.peticionRepo
      .createQueryBuilder('peticion')
      .select([
        'peticion.id',
        'peticion.fechaCreacion',
        'peticion.status',
        'peticion.generado',
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

      // 👇 only aprobadas
      .where('peticion.status = :status', {
        status: PeticionStatus.APROBADO,
      })
      .andWhere('peticion.generado =:generado', {
        generado: PeticionGenerada.PENDIENTE

      });

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
      generado: p.generado,
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
          qb.where('peticion.status::text ILIKE :term', { term })
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

    const currentUser = await this.userRepo.findOne({
      where: { id: user.id },
      relations: ['obra', 'obra.almacenes']
    })


    if (!currentUser) throw new NotFoundException('User not found')

    if (!currentUser?.obra?.almacenes?.length) {
      throw new BadRequestException(
        'El usuario no tiene un almacén asignado a su obra.'
      );
    }

    const almacenId = currentUser.obra.almacenes[0].id;

    const equipo = await this.equipoRepo.findOne({
      where: {id: dto.equipoId}
    })

    if (!equipo) {
      throw new NotFoundException('No se encontro el equipo')
    }

    const peticion = this.peticionRepo.create({
      observaciones: dto.observaciones,
      almacen: { id: almacenId } as any,
      creadoPor: { id: user.id } as any,
      equipo,
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

  // TODO: CHECK IF THERE'S ENOUGH STOCK BEFORE DOING THE REQUISICION. IF THERE'S ENOUGH CREATE an ENTRADA
  // TODO: METODOS PARA LAS REQUISICIONES
  async createServiceRequisicion(
    dto: CreateServiceRequisicionDto,
    user: User
  ) {
    const {
      almacenCargoId,
      almacenDestinoId,
      cantidad_dinero,
      description,
      concepto,
      prioridad,
      metodo_pago,
    } = dto;

    const almacenCargo = await this.almacenRepo.findOne({
      where: { id: almacenCargoId }
    })

    if (!almacenCargo) {
      throw new NotFoundException('No se encontro el almacen')
    }

    const almacenDestino = await this.almacenRepo.findOne({
      where: { id: almacenDestinoId }
    })

    if (!almacenDestino) {
      throw new NotFoundException('No se encontro el almacen')
    }


    if (!cantidad_dinero || cantidad_dinero <= 0) {
      throw new BadRequestException(
        'La requisición de servicio requiere una cantidad de dinero válida.'
      );
    }

    // Same approval logic as product path
    let aprovalType: RequisicionAprovalLevel;
    if (cantidad_dinero < 2000) {
      aprovalType = RequisicionAprovalLevel.NONE;
    } else if (cantidad_dinero <= 5000) {
      aprovalType = RequisicionAprovalLevel.ADMIN;
    } else {
      aprovalType = RequisicionAprovalLevel.SPECIAL_PERMISSION;
    }

    const requisicion = this.requisicionRepo.create({
      status: RequisicionStatus.PENDIENTE,
      aprovalType,
      cantidad_dinero,
      metodo_pago,
      prioridad,
      concepto,
      almacenCargo,
      almacenDestino,
      requisicionType: RequisicionType.SERVICE,
      pedidoPor: user ?? null,
      descripcion: description,
    });

    const saved = await this.requisicionRepo.save(requisicion);

    return this.requisicionRepo.findOne({
      where: { id: saved.id },
      relations: ['almacenCargo', 'pedidoPor'],
    });
  }

  async createRequisicion(dto: CreateRequisicionDto, user: User) {
    const { peticionId, metodo_pago, prioridad, hrm, concepto, almacenCargoId } = dto;

    const almacenCargo = await this.almacenRepo.findOne({
      where: { id: almacenCargoId }
    })

    if (!almacenCargo) {
      throw new NotFoundException('No se encontro el almacen')
    }

    const exists = await this.requisicionRepo.findOne({
      where: { peticion: { id: peticionId } },
    });
    if (exists) {
      throw new BadRequestException('Ya existe una requisición para esta petición.');
    }

    const peticion = await this.peticionRepo.findOne({
      where: { id: peticionId },
      relations: ['items', 'items.producto', 'almacen'],
    });

    if (!peticion) {
      throw new NotFoundException('Petición no encontrada.');
    }

    if (peticion.status !== 'APROBADO') {
      throw new BadRequestException('Solo se pueden crear requisiciones de peticiones aprobadas.');
    }

    let totalCost = 0;
    for (const item of peticion.items) {
      if (item.producto.precio == null) {
        throw new BadRequestException(
          `El producto ${item.producto.id} no tiene precio asignado.`
        );
      }
      totalCost += Number(item.cantidad) * Number(item.producto.precio);
    }


    let aprovalType: RequisicionAprovalLevel;
    if (totalCost < 2000) {
      aprovalType = RequisicionAprovalLevel.NONE;
    } else if (totalCost <= 5000) {
      aprovalType = RequisicionAprovalLevel.ADMIN;
    } else {
      aprovalType = RequisicionAprovalLevel.SPECIAL_PERMISSION;
    }

    const savedRequisicion = await this.requisicionRepo.save(
      this.requisicionRepo.create({
        status: RequisicionStatus.PENDIENTE,
        aprovalType,
        cantidad_dinero: totalCost,
        metodo_pago,
        prioridad,
        concepto,
        almacenCargo,
        almacenDestino: peticion.almacen,
        requisicionType: RequisicionType.PRODUCT,
        pedidoPor: user ?? null,
        peticion,
        hrm,
      })
    );


    const items = peticion.items.map((item) => {

      return this.requisicionItemRepo.create({
        cantidadSolicitada: Number(item.cantidad),
        producto: { id: item.producto.id } as Producto,
        requisicion: savedRequisicion,
      });
    });

    await this.requisicionItemRepo.save(items);

    await this.peticionRepo.update(peticion.id, {
      generado: PeticionGenerada.GENERADA,
    });

    return this.requisicionRepo.findOne({
      where: { id: savedRequisicion.id },
      relations: ['items', 'items.producto', 'almacenDestino', 'pedidoPor'],
    });
  }

  async getAllRequisiciones() {
    return this.requisicionRepo.find({
      relations: [
        'items',
        'items.producto',
        'almacenDestino',
        'pedidoPor',
        'revisadoPor',
      ],
      order: { fechaSolicitud: 'DESC' },
    });
  }


  // TODO: LET DIFFERENT ROLES DO THIS OPERATION BASED ON THE RequisicionType field
  async acceptRequisicion(id: number, user: User) {
    const requisicion = await this.requisicionRepo.findOne({
      where: { id },
      relations: ['revisadoPor'],
    });

    if (!requisicion) {
      throw new NotFoundException('Requisición no encontrada.');
    }

    if (requisicion.status !== RequisicionStatus.PENDIENTE) {
      throw new BadRequestException(
        `No se puede aprobar una requisición con estado ${requisicion.status}.`
      );
    }

    requisicion.status = RequisicionStatus.APROBADA;
    requisicion.revisadoPor = user;
    requisicion.fechaRevision = new Date();

    return this.requisicionRepo.save(requisicion);
  }

  async rejectRequisicion(id: number, user: User) {
    const requisicion = await this.requisicionRepo.findOne({
      where: { id },
      relations: ['revisadoPor'],
    });

    if (!requisicion) {
      throw new NotFoundException('Requisición no encontrada.');
    }

    if (requisicion.status !== RequisicionStatus.PENDIENTE) {
      throw new BadRequestException(
        `No se puede rechazar una requisición con estado ${requisicion.status}.`
      );
    }

    requisicion.status = RequisicionStatus.RECHAZADA;
    requisicion.revisadoPor = user;
    requisicion.fechaRevision = new Date();

    return this.requisicionRepo.save(requisicion);
  }

}
