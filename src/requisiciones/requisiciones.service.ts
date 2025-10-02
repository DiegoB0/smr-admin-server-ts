import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Requisicion } from './entities/requisicion.entity';
import { LogsService } from 'src/logs/logs.service';
import { Brackets, DataSource, In, Repository } from 'typeorm';
import { RequisicionItem } from './entities/requisicion_item.entity';
import { Componente, Fase, PeticionProducto } from './entities/peticion_producto.entity';
import { PeticionProductoItem } from './entities/peticion_producto_item.entity';
import { CreatePeticionProductoDto, CreateRequisicionDto, CreateServiceRequisicionDto, UpdatePeticionProductoDto } from './dto/request.dto';
import { PeticionStatus } from './types/peticion-status';
import { User } from 'src/auth/entities/usuario.entity';
import { GetPeticionProductDto, GetRequisicionDto, PaginatedPeticionProductoDto, PaginatedRequisicionDto, ReporteQueryDto } from './dto/response.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { RequisicionStatus } from './types/requisicion-status';
import { RequisicionAprovalLevel, RequisicionType } from './types/requisicion-type';
import { Producto } from 'src/productos/entities/producto.entity';
import { Almacen } from 'src/almacenes/entities/almacen.entity';
import { PeticionGenerada } from './types/peticion-generada';
import { Equipo } from 'src/equipos/entities/equipo.entity';
import { RequisicionServiceItem } from './entities/requisicion_service_item.entity';
import { Proveedor } from 'src/proveedores/entities/proveedor.entity';
import { EntradaStatus } from 'src/entradas/types/entradas-status';
import { Entrada } from 'src/entradas/entities/entrada.entity';
import { EntradaItem } from 'src/entradas/entities/entrada_item.entity';

@Injectable()
export class RequisicionesService {
  constructor(
    @InjectRepository(Requisicion)
    private requisicionRepo: Repository<Requisicion>,

    @InjectRepository(RequisicionItem)
    private requisicionItemRepo: Repository<RequisicionItem>,

    @InjectRepository(RequisicionServiceItem)
    private serviceItemRepo: Repository<RequisicionServiceItem>,

    @InjectRepository(PeticionProducto)
    private peticionRepo: Repository<PeticionProducto>,

    @InjectRepository(PeticionProductoItem)
    private peticionItemRepo: Repository<PeticionProductoItem>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Almacen)
    private almacenRepo: Repository<Almacen>,

    @InjectRepository(Equipo)
    private equipoRepo: Repository<Equipo>,

    @InjectRepository(Proveedor)
    private proveedorRepo: Repository<Proveedor>,

    @InjectRepository(Entrada)
    private entradaRepo: Repository<Entrada>,

    @InjectRepository(Componente)
    private readonly componenteRepo: Repository<Componente>,
    @InjectRepository(Fase)
    private readonly faseRepo: Repository<Fase>,

    private readonly logService: LogsService,
    private readonly dataSource: DataSource
  ) { }

  // TODO: Endpoint to get peticiones por almacen
  async getAllPeticiones(
    pagination: PaginationDto
  ): Promise<PaginatedPeticionProductoDto> {
    const { page = 1, limit = 10, search, order = 'DESC' } = pagination;
    const skip = (page - 1) * limit;

    // Base QB without M2M joins, for count + ids
    const baseQB = this.peticionRepo
      .createQueryBuilder('peticion')
      .leftJoin('peticion.almacen', 'almacen')
      .leftJoin('peticion.creadoPor', 'creadoPor');

    if (search) {
      const term = `%${search}%`;
      baseQB.andWhere(
        new Brackets((qb) => {
          qb.where('peticion.observaciones ILIKE :term', { term })
            .orWhere('almacen.name ILIKE :term', { term })
            .orWhere('creadoPor.email ILIKE :term', { term });
        })
      );
    }

    const totalItems = await baseQB.getCount();
    const totalPages = Math.ceil(totalItems / limit);
    if (totalItems === 0) {
      return new PaginatedPeticionProductoDto([], {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      });
    }

    // Get page of IDs only
    const idRows = await baseQB
      .select('peticion.id', 'id')
      .orderBy('peticion.fechaCreacion', order)
      .skip(skip)
      .take(limit)
      .getRawMany<{ id: number }>();

    const ids = idRows.map((r) => r.id);
    if (ids.length === 0) {
      return new PaginatedPeticionProductoDto([], {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      });
    }

    // Load rows with all needed relations for those ids
    const peticiones = await this.peticionRepo
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
      .leftJoin('peticion.equipo', 'equipo')
      .addSelect([
        'equipo.equipo',
        'equipo.modelo',
        'equipo.horometro',
        'equipo.serie',
      ])
      .leftJoin('peticion.items', 'items')
      .addSelect(['items.id', 'items.cantidad'])
      .leftJoin('items.producto', 'producto')
      .addSelect(['producto.id', 'producto.name'])
      .leftJoin('peticion.componentes', 'componentes')
      .addSelect(['componentes.key'])
      .leftJoin('peticion.fases', 'fases')
      .addSelect(['fases.key'])
      .where('peticion.id IN (:...ids)', { ids })
      // preserve order by fechaCreacion (optional). To strictly keep page order, order by FIELD(ids...)
      .orderBy('peticion.fechaCreacion', order)
      .getMany();

    // Map
    const mapped: GetPeticionProductDto[] = peticiones.map((p) => ({
      id: p.id,
      fechaCreacion: p.fechaCreacion,
      status: p.status,
      observaciones: p.observaciones,
      fechaRevision: p.fechaRevision ?? null,
      equipo: p.equipo?.equipo,
      modelo: p.equipo?.modelo,
      horometro: p.equipo?.horometro,
      serie: p.equipo?.serie,
      almacen: { name: p.almacen?.name },
      creadoPor: { email: p.creadoPor?.email },
      revisadoPor: p.revisadoPor ? { email: p.revisadoPor.email } : null,
      componentes: (p.componentes ?? []).map((c) => c.key),
      fases: (p.fases ?? []).map((f) => f.key),
      items: (p.items ?? []).map((i) => ({
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

  // TODO: FIX THE REST OF GETS FO REQUISICIONES
  async getAllPeticionesAprobadas(
    pagination: PaginationDto
  ): Promise<PaginatedPeticionProductoDto> {
    const { page = 1, limit = 10, search, order = 'DESC' } = pagination;
    const skip = (page - 1) * limit;

    // 1) Base QB for count + ids (no M2M joins)
    const baseQB = this.peticionRepo
      .createQueryBuilder('peticion')
      .leftJoin('peticion.almacen', 'almacen')
      .leftJoin('peticion.creadoPor', 'creadoPor')
      .where('peticion.status = :status', {
        status: PeticionStatus.APROBADO,
      })
      .andWhere('peticion.generado = :generado', {
        generado: PeticionGenerada.PENDIENTE,
      });

    if (search) {
      const term = `%${search}%`;
      baseQB.andWhere(
        new Brackets((qb) => {
          qb.where('peticion.observaciones ILIKE :term', { term })
            .orWhere('almacen.name ILIKE :term', { term })
            .orWhere('creadoPor.email ILIKE :term', { term });
        })
      );
    }

    const totalItems = await baseQB.getCount();
    const totalPages = Math.ceil(totalItems / limit);

    if (totalItems === 0) {
      return new PaginatedPeticionProductoDto([], {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      });
    }

    // 2) Page of IDs only
    const idRows = await baseQB
      .select('peticion.id', 'id')
      .orderBy('peticion.fechaCreacion', order)
      .skip(skip)
      .take(limit)
      .getRawMany<{ id: number }>();

    const ids = idRows.map((r) => r.id);
    if (ids.length === 0) {
      return new PaginatedPeticionProductoDto([], {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      });
    }

    // 3) Load full rows for those IDs with all needed relations
    const peticiones = await this.peticionRepo
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
      .leftJoin('peticion.equipo', 'equipo')
      .addSelect([
        'equipo.equipo',
        'equipo.modelo',
        'equipo.horometro',
        'equipo.serie',
      ])
      .leftJoin('peticion.items', 'items')
      .addSelect(['items.id', 'items.cantidad'])
      .leftJoin('items.producto', 'producto')
      .addSelect(['producto.id', 'producto.name'])
      .leftJoin('peticion.componentes', 'componentes')
      .addSelect(['componentes.key'])
      .leftJoin('peticion.fases', 'fases')
      .addSelect(['fases.key'])
      .where('peticion.id IN (:...ids)', { ids })
      .orderBy('peticion.fechaCreacion', order)
      .getMany();

    // 4) Map
    const mapped: GetPeticionProductDto[] = peticiones.map((p) => ({
      id: p.id,
      fechaCreacion: p.fechaCreacion,
      status: p.status,
      generado: p.generado,
      observaciones: p.observaciones,
      fechaRevision: p.fechaRevision ?? null,
      equipo: p.equipo?.equipo,
      modelo: p.equipo?.modelo,
      horometro: p.equipo?.horometro,
      serie: p.equipo?.serie,
      almacen: { name: p.almacen?.name },
      creadoPor: { email: p.creadoPor?.email },
      revisadoPor: p.revisadoPor ? { email: p.revisadoPor.email } : null,
      componentes: (p.componentes ?? []).map((c) => c.key),
      fases: (p.fases ?? []).map((f) => f.key),
      items: (p.items ?? []).map((i) => ({
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

  async getPeticionesByUser(
    dto: ReporteQueryDto
  ): Promise<PaginatedPeticionProductoDto> {
    const { userId, page = 1, limit = 10, search, order = 'DESC' } = dto;
    const skip = (page - 1) * limit;

    const baseQB = this.peticionRepo
      .createQueryBuilder('peticion')
      .leftJoin('peticion.almacen', 'almacen')
      .leftJoin('peticion.creadoPor', 'creadoPor')
      .where('creadoPor.id = :userId', { userId });

    if (search) {
      const term = `%${search}%`;
      baseQB.andWhere(
        new Brackets((qb) => {
          qb.where('peticion.status::text ILIKE :term', { term })
            .orWhere('almacen.name ILIKE :term', { term })
            .orWhere('creadoPor.email ILIKE :term', { term });
        })
      );
    }

    const totalItems = await baseQB.getCount();
    const totalPages = Math.ceil(totalItems / limit);

    if (totalItems === 0) {
      return new PaginatedPeticionProductoDto([], {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      });
    }

    // 2) Page of IDs only
    const idRows = await baseQB
      .select('peticion.id', 'id')
      .orderBy('peticion.fechaCreacion', order)
      .skip(skip)
      .take(limit)
      .getRawMany<{ id: number }>();

    const ids = idRows.map((r) => r.id);
    if (ids.length === 0) {
      return new PaginatedPeticionProductoDto([], {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      });
    }

    // 3) Load full rows for those IDs with all needed relations
    const peticiones = await this.peticionRepo
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
      .leftJoin('peticion.equipo', 'equipo')
      .addSelect(['equipo.equipo', 'equipo.modelo', 'equipo.horometro', 'equipo.serie'])
      .leftJoin('peticion.items', 'items')
      .addSelect(['items.id', 'items.cantidad'])
      .leftJoin('items.producto', 'producto')
      .addSelect(['producto.id', 'producto.name'])
      .leftJoin('peticion.componentes', 'componentes')
      .addSelect(['componentes.key'])
      .leftJoin('peticion.fases', 'fases')
      .addSelect(['fases.key'])
      .where('peticion.id IN (:...ids)', { ids })
      .orderBy('peticion.fechaCreacion', order)
      .getMany();

    // 4) Map
    const mapped: GetPeticionProductDto[] = peticiones.map((p) => ({
      id: p.id,
      fechaCreacion: p.fechaCreacion,
      status: p.status,
      observaciones: p.observaciones,
      fechaRevision: p.fechaRevision ?? null,
      almacen: { name: p.almacen?.name },
      creadoPor: { email: p.creadoPor?.email },
      revisadoPor: p.revisadoPor ? { email: p.revisadoPor.email } : null,
      equipo: p.equipo?.equipo,
      modelo: p.equipo?.modelo,
      horometro: p.equipo?.horometro,
      serie: p.equipo?.serie,
      componentes: (p.componentes ?? []).map((c) => c.key),
      fases: (p.fases ?? []).map((f) => f.key),
      items: (p.items ?? []).map((i) => ({
        id: i.id,
        cantidad: i.cantidad,
        producto: { id: i.producto.id, name: i.producto.name },
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
      throw new BadRequestException(
        'Debe incluir al menos un producto en la petición.'
      );
    }

    const currentUser = await this.userRepo.findOne({
      where: { id: user.id },
      relations: ['obra', 'obra.almacenes'],
    });
    if (!currentUser) throw new NotFoundException('User not found');
    if (!currentUser?.obra?.almacenes?.length) {
      throw new BadRequestException(
        'El usuario no tiene un almacén asignado a su obra.'
      );
    }
    const almacenId = currentUser.obra.almacenes[0].id;

    const equipo = await this.equipoRepo.findOne({
      where: { id: dto.equipoId },
    });
    if (!equipo) throw new NotFoundException('No se encontro el equipo');

    // Resolve componentes and fases from keys
    const componentes = await this.componenteRepo.findBy({
      key: In(dto.componentes),
    });
    if (componentes.length !== dto.componentes.length) {
      throw new BadRequestException('Componente(s) inválidos');
    }
    if (componentes.length === 0) {
      throw new BadRequestException(
        'Debe seleccionar al menos un componente.'
      );
    }

    const fases = await this.faseRepo.findBy({
      key: In(dto.fases),
    });
    if (fases.length !== dto.fases.length) {
      throw new BadRequestException('Fase(s) inválidas');
    }
    if (fases.length === 0) {
      throw new BadRequestException('Debe seleccionar al menos una fase.');
    }

    return await this.dataSource.transaction(async (manager) => {
      const peticion = this.peticionRepo.create({
        observaciones: dto.observaciones,
        almacen: { id: almacenId } as any,
        creadoPor: { id: user.id } as any,
        equipo,
        status: PeticionStatus.PENDIENTE,
        componentes,
        fases,
        items: [],
      });

      const saved = await manager.getRepository(PeticionProducto).save(peticion);

      for (const item of dto.items) {
        const peticionItem = this.peticionItemRepo.create({
          cantidad: item.cantidad,
          producto: { id: item.productoId } as any,
          reporte: saved,
        });
        await manager.getRepository(PeticionProductoItem).save(peticionItem);
      }

      await this.logService.createLog(
        user,
        `El usuario ${user.name} creó el reporte ${saved.id}`,
        'CREATE_REPORTE',
        JSON.stringify({ id: saved.id })
      );

      return await manager.getRepository(PeticionProducto).findOne({
        where: { id: saved.id },
        relations: ['componentes', 'fases', 'items', 'equipo', 'almacen'],
      });
    });
  }

  async updatePeticionProducto(
    id: number,
    dto: UpdatePeticionProductoDto,
    user: User
  ) {
    // Load current entity with relations we might replace
    const peticion = await this.peticionRepo.findOne({
      where: { id },
      relations: ['items', 'componentes', 'fases'],
    });

    if (!peticion) {
      throw new NotFoundException('Petición no encontrada.');
    }

    if (peticion.status !== PeticionStatus.PENDIENTE) {
      throw new BadRequestException(
        'Solo se pueden modificar peticiones pendientes.'
      );
    }

    // Resolve componentes/fases if provided
    let componentesToSet = undefined as undefined | typeof peticion.componentes;
    let fasesToSet = undefined as undefined | typeof peticion.fases;

    if (dto.componentes !== undefined) {
      if (!Array.isArray(dto.componentes)) {
        throw new BadRequestException('Componentes inválidos.');
      }
      if (dto.componentes.length === 0) {
        // enforce at least one if field is provided
        throw new BadRequestException(
          'Debe seleccionar al menos un componente.'
        );
      }
      const comps = await this.componenteRepo.findBy({
        key: In(dto.componentes),
      });
      if (comps.length !== dto.componentes.length) {
        throw new BadRequestException('Componente(s) inválidos.');
      }
      componentesToSet = comps;
    }

    if (dto.fases !== undefined) {
      if (!Array.isArray(dto.fases)) {
        throw new BadRequestException('Fases inválidas.');
      }
      if (dto.fases.length === 0) {
        // enforce at least one if field is provided
        throw new BadRequestException('Debe seleccionar al menos una fase.');
      }
      const fs = await this.faseRepo.findBy({
        key: In(dto.fases),
      });
      if (fs.length !== dto.fases.length) {
        throw new BadRequestException('Fase(s) inválidas.');
      }
      fasesToSet = fs;
    }

    // Apply simple fields
    if (dto.observaciones !== undefined) {
      peticion.observaciones = dto.observaciones;
    }
    if (dto.equipoId !== undefined) {
      peticion.equipo = { id: dto.equipoId } as any;
    }

    // Transaction: replace items and M2M sets atomically
    return await this.dataSource.transaction(async (manager) => {
      const peticionRepository = manager.getRepository(PeticionProducto);
      const peticionItemRepository = manager.getRepository(PeticionProductoItem);

      // Replace items if provided
      if (dto.items !== undefined) {
        await peticionItemRepository.delete({ reporte: { id } as any });
        peticion.items = dto.items.map((i) =>
          peticionItemRepository.create({
            cantidad: i.cantidad,
            producto: { id: i.productoId } as any,
          })
        );
      }

      // Replace componentes/fases if provided
      if (componentesToSet !== undefined) {
        peticion.componentes = componentesToSet;
      }
      if (fasesToSet !== undefined) {
        peticion.fases = fasesToSet;
      }

      const updated = await peticionRepository.save(peticion);

      await this.logService.createLog(
        user,
        `El usuario ${user.name} actualizó el reporte ${updated.id}`,
        'UPDATE_REPORTE',
        JSON.stringify({ id: updated.id })
      );

      // Optionally return with relations
      return await peticionRepository.findOne({
        where: { id: updated.id },
        relations: ['componentes', 'fases', 'items', 'equipo', 'almacen'],
      });
    });
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
  async getAllRequisiciones(
    pagination: PaginationDto
  ): Promise<PaginatedRequisicionDto> {
    const { page = 1, limit = 10, order = 'DESC' } = pagination;
    const skip = (page - 1) * limit;

    const [requisiciones, totalItems] = await this.requisicionRepo.findAndCount({
      relations: [
        'items',
        'items.producto',
        'service_items',
        'equipo',
        'almacenCargo',
        'almacenDestino',
        'pedidoPor',
        'revisadoPor',
      ],
      skip,
      take: limit,
      order: { fechaSolicitud: order as any },
    });

    const totalPages = Math.ceil(totalItems / limit);

    const mappedData: GetRequisicionDto[] = requisiciones.map((r) => ({
      id: r.id,
      fechaSolicitud: r.fechaSolicitud,
      rcp: r.rcp,
      titulo: r.titulo,
      prioridad: r.prioridad,
      hrm: r.hrm,
      concepto: r.concepto,
      status: r.status,
      aprovalType: r.aprovalType,
      requisicionType: r.requisicionType,
      cantidad_dinero: r.cantidad_dinero,
      metodo_pago: r.metodo_pago,
      equipo: r.equipo
        ? {
          equipo: r.equipo.equipo,
          serie: r.equipo.serie,
          no_economico: r.equipo.no_economico,
        }
        : null,
      almacenDestino: {
        id: r.almacenDestino.id,
        name: r.almacenDestino.name,
        location: r.almacenDestino.location,
        isActive: r.almacenDestino.isActive,
      },
      almacenCargo: {
        id: r.almacenCargo.id,
        name: r.almacenCargo.name,
        location: r.almacenCargo.location,
        isActive: r.almacenCargo.isActive,
      },
      pedidoPor: {
        id: r.pedidoPor.id,
        email: r.pedidoPor.email,
        name: r.pedidoPor.name,
        imageUrl: r.pedidoPor.imageUrl,
        isActive: r.pedidoPor.isActive,
      },
      revisadoPor: r.revisadoPor
        ? {
          id: r.revisadoPor.id,
          email: r.revisadoPor.email,
          name: r.revisadoPor.name,
          imageUrl: r.revisadoPor.imageUrl,
          isActive: r.revisadoPor.isActive,
        }
        : null,
      fechaRevision: r.fechaRevision ?? null,
      items: r.requisicionType === RequisicionType.PRODUCT
        ? r.items.map((i) => ({
          id: i.id,
          cantidadSolicitada: i.cantidadSolicitada,
          producto: {
            id: i.producto.id,
            name: i.producto.name,
            description: i.producto.description,
            unidad: i.producto.unidad,
            precio: i.producto.precio,
            isActive: i.producto.isActive,
          },
        }))
        : r.service_items.map((si) => ({
          id: si.id,
          cantidad: si.cantidad,
          unidad: si.unidad,
          descripcion: si.descripcion,
          precio_unitario: si.precio_unitario,
        })),
    }));

    return new PaginatedRequisicionDto(mappedData, {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    });
  }

  async getRequisicionesAprobadas(
    pagination: PaginationDto
  ): Promise<PaginatedRequisicionDto> {
    const { page = 1, limit = 10, order = 'DESC' } = pagination;
    const skip = (page - 1) * limit;

    const [requisiciones, totalItems] = await this.requisicionRepo.findAndCount({
      relations: [
        'items',
        'items.producto',
        'service_items',
        'equipo',
        'almacenCargo',
        'almacenDestino',
        'pedidoPor',
        'revisadoPor',
      ],
      where: { status: RequisicionStatus.APROBADA },
      skip,
      take: limit,
      order: { fechaSolicitud: order as any },
    });

    const totalPages = Math.ceil(totalItems / limit);

    const mappedData: GetRequisicionDto[] = requisiciones.map((r) => ({
      id: r.id,
      fechaSolicitud: r.fechaSolicitud,
      rcp: r.rcp,
      titulo: r.titulo,
      prioridad: r.prioridad,
      hrm: r.hrm,
      concepto: r.concepto,
      status: r.status,
      aprovalType: r.aprovalType,
      requisicionType: r.requisicionType,
      cantidad_dinero: r.cantidad_dinero,
      metodo_pago: r.metodo_pago,
      equipo: r.equipo
        ? {
          equipo: r.equipo.equipo,
          serie: r.equipo.serie,
          no_economico: r.equipo.no_economico,
        }
        : null,
      almacenDestino: {
        id: r.almacenDestino.id,
        name: r.almacenDestino.name,
        location: r.almacenDestino.location,
        isActive: r.almacenDestino.isActive,
      },
      almacenCargo: {
        id: r.almacenCargo.id,
        name: r.almacenCargo.name,
        location: r.almacenCargo.location,
        isActive: r.almacenCargo.isActive,
      },
      pedidoPor: {
        id: r.pedidoPor.id,
        email: r.pedidoPor.email,
        name: r.pedidoPor.name,
        imageUrl: r.pedidoPor.imageUrl,
        isActive: r.pedidoPor.isActive,
      },
      revisadoPor: r.revisadoPor
        ? {
          id: r.revisadoPor.id,
          email: r.revisadoPor.email,
          name: r.revisadoPor.name,
          imageUrl: r.revisadoPor.imageUrl,
          isActive: r.revisadoPor.isActive,
        }
        : null,
      fechaRevision: r.fechaRevision ?? null,
      items: r.requisicionType === RequisicionType.PRODUCT
        ? r.items.map((i) => ({
          id: i.id,
          cantidadSolicitada: i.cantidadSolicitada,
          producto: {
            id: i.producto.id,
            name: i.producto.name,
            description: i.producto.description,
            unidad: i.producto.unidad,
            precio: i.producto.precio,
            isActive: i.producto.isActive,
          },
        }))
        : r.service_items.map((si) => ({
          id: si.id,
          cantidad: si.cantidad,
          unidad: si.unidad,
          descripcion: si.descripcion,
          precio_unitario: si.precio_unitario,
        })),
    }));

    return new PaginatedRequisicionDto(mappedData, {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    });
  }

  async createServiceRequisicion(
    dto: CreateServiceRequisicionDto,
    user: User
  ) {
    const {
      almacenCargoId,
      almacenDestinoId,
      proveedorId,
      concepto,
      prioridad,
      titulo,
      rcp,
      items
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

    const proveedor = await this.proveedorRepo.findOne({
      where: { id: dto.proveedorId }
    })

    if (!proveedor) {
      throw new NotFoundException('Proveedor not found')
    }


    let totalCost = 0;
    for (const item of items) {
      if (item.precio_unitario == null) {
        throw new BadRequestException(
          `El item no tiene precio asignado.`
        );
      }
      totalCost += Number(item.cantidad) * Number(item.precio_unitario);
    }

    // Same approval logic as product path
    let aprovalType: RequisicionAprovalLevel;
    if (totalCost < 2000) {
      aprovalType = RequisicionAprovalLevel.NONE;
    } else if (totalCost <= 5000) {
      aprovalType = RequisicionAprovalLevel.ADMIN;
    } else {
      aprovalType = RequisicionAprovalLevel.SPECIAL_PERMISSION;
    }

    const requisicion = this.requisicionRepo.create({
      status: RequisicionStatus.PENDIENTE,
      aprovalType,
      cantidad_dinero: totalCost,
      prioridad,
      rcp,
      titulo,
      concepto,
      almacenCargo,
      almacenDestino,
      proveedor,
      requisicionType: RequisicionType.CONSUMIBLES,
      pedidoPor: user ?? null,
    });

    const saved = await this.requisicionRepo.save(requisicion);

    const serviceItems = items.map(item => ({
      cantidad: item.cantidad,
      unidad: item.unidad,
      descripcion: item.descripcion,
      precio_unitario: item.precio_unitario,
      requisicion: saved,
    }));

    await this.serviceItemRepo.save(serviceItems);

    return this.requisicionRepo.findOne({
      where: { id: saved.id },
      relations: ['almacenCargo', 'pedidoPor', 'service_items'],
    });
  }

  async createRequisicion(dto: CreateRequisicionDto, user: User) {
    const { peticionId, prioridad, hrm, concepto, almacenCargoId, titulo, rcp } = dto;

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
      relations: ['items', 'items.producto', 'almacen', 'equipo'],
    });

    if (!peticion) {
      throw new NotFoundException('Petición no encontrada.');
    }

    if (peticion.status !== 'APROBADO') {
      throw new BadRequestException('Solo se pueden crear requisiciones de peticiones aprobadas.');
    }


    const proveedor = await this.proveedorRepo.findOne({
      where: { id: dto.proveedorId }
    })

    if (!proveedor) {
      throw new NotFoundException('Proveedor not found')
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
        prioridad,
        concepto,
        rcp,
        titulo,
        almacenCargo,
        almacenDestino: peticion.almacen,
        requisicionType: RequisicionType.PRODUCT,
        pedidoPor: user ?? null,
        peticion,
        proveedor,
        hrm,
        equipo: peticion?.equipo,
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
      status: PeticionStatus.PROCESADO
    });

    return this.requisicionRepo.findOne({
      where: { id: savedRequisicion.id },
      relations: ['items', 'items.producto', 'almacenDestino', 'pedidoPor'],
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

  async markAsPagada(id: number, user: User, fechaEsperada?: string) {
    const requisicion = await this.requisicionRepo.findOne({
      where: { id },
      relations: ['items', 'items.producto', 'almacenDestino', 'almacenCargo'],
    });

    if (!requisicion) {
      throw new NotFoundException('Requisición no encontrada.');
    }

    if (requisicion.status !== RequisicionStatus.APROBADA) {
      throw new BadRequestException(
        `Solo se puede marcar como pagada una requisición aprobada. Estado actual: ${requisicion.status}`
      );
    }

    // Only generate entrada for product requisiciones
    if (requisicion.requisicionType !== RequisicionType.PRODUCT) {
      throw new BadRequestException(
        'Solo las requisiciones de productos generan entradas automáticas.'

      );
    }

    if (!requisicion.items || requisicion.items.length === 0) {

      throw new BadRequestException(
        'La requisición no tiene items de productos.'
      );

    }

    // Mark requisicion as PAGADA
    requisicion.status = RequisicionStatus.PAGADA;

    // Create the entrada
    const entrada = this.entradaRepo.create({
      fechaEsperada: fechaEsperada,
      status: EntradaStatus.PENDIENTE,
      almacenDestino: requisicion.almacenCargo,
      creadoPor: user,
      requisicion: requisicion,
      items: requisicion.items.map(reqItem => {
        const entradaItem = new EntradaItem();
        entradaItem.cantidadEsperada = reqItem.cantidadSolicitada;
        entradaItem.cantidadRecibida = 0;
        entradaItem.producto = reqItem.producto;
        entradaItem.requisicionItem = reqItem;
        return entradaItem;
      }),
    });

    await this.requisicionRepo.save(requisicion);
    const savedEntrada = await this.entradaRepo.save(entrada);

    return {
      requisicion,
      entrada: savedEntrada,
    };
  }

}
