import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Requisicion } from './entities/requisicion.entity';
import { LogsService } from 'src/logs/logs.service';
import { Brackets, DataSource, In, Not, QueryRunner, Repository } from 'typeorm';
import { User } from 'src/auth/entities/usuario.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { RequisicionStatus } from './types/requisicion-status';
import { RequisicionAprovalLevel, RequisicionType } from './types/requisicion-type';
import { Almacen } from 'src/almacenes/entities/almacen.entity';
import { Equipo } from 'src/equipos/entities/equipo.entity';
import { RequisicionInsumoItem } from './entities/customRequis/requisicion_insumo_items.entity';
import { Proveedor } from 'src/proveedores/entities/proveedor.entity';
import { EntradaStatus } from 'src/entradas/types/entradas-status';
import { Entrada } from 'src/entradas/entities/entrada.entity';
import { EntradaItem } from 'src/entradas/entities/entrada_item.entity';
import { RequisicionRefaccionItem } from './entities/customRequis/requisicion_refaccion.items.entity';
import { RequisicionFilterItem } from './entities/customRequis/requisicion_filter_items.entity';
import { CreateFilterItemDto, CreateInsumoItemDto, CreateRefaccionItemDto, CreateRequisicionDto, MarkItemsAsPaidDto, UpdateItemDto, UpdateRequisicionItemsDto } from './dto/request.v2.dto';
import { PagarRequisicionDto } from './dto/request.dto';
import { MetodoPago } from './types/metodo-pago';
import { GetRequisicionDto, PaginatedRequisicionDto } from './dto/response.dto';

@Injectable()
export class RequisicionesService {
  constructor(
    @InjectRepository(Requisicion)
    private requisicionRepo: Repository<Requisicion>,

    @InjectRepository(RequisicionInsumoItem)
    private insumoItemRepo: Repository<RequisicionInsumoItem>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(RequisicionRefaccionItem)
    private refaccionItemRepo: Repository<RequisicionRefaccionItem>,

    @InjectRepository(RequisicionFilterItem)
    private filterItemRepo: Repository<RequisicionFilterItem>,

    @InjectRepository(Entrada)
    private entradaRepo: Repository<Entrada>,

    @InjectRepository(EntradaItem)
    private entradaItemRepo: Repository<EntradaItem>,

    private readonly logService: LogsService,
    private readonly dataSource: DataSource,
  ) { }

  // TODO: Endpoint to get peticiones por almacen
  async getStats() {
    const [pagada, aprobada, pendiente, rechazada] = await Promise.all([
      this.requisicionRepo.count({ where: { status: RequisicionStatus.PAGADA } }),
      this.requisicionRepo.count({ where: { status: RequisicionStatus.APROBADA } }),
      this.requisicionRepo.count({ where: { status: RequisicionStatus.PENDIENTE } }),
      this.requisicionRepo.count({ where: { status: RequisicionStatus.RECHAZADA } }),
    ]);

    return {
      pagada,
      aprobada,
      pendiente,
      rechazada,
      total: pagada + aprobada + pendiente + rechazada,
    };
  }


  async getAllRequisiciones(
    pagination: PaginationDto,
    status?: RequisicionStatus,
    user?: User
  ): Promise<PaginatedRequisicionDto> {
    const { search, page = 1, limit = 10, order = 'DESC' } = pagination;
    const skip = (page - 1) * limit;

    let almacenId: number | null = null;
    const userAny = user as any;

    if (userAny && userAny.roles && userAny.roles.length > 0) {
      const isAdminAlmacen = userAny.roles.some(
        (role: any) => role.name === 'Admin almacen'
      );

      if (isAdminAlmacen && user) {
        const fullUser = await this.userRepo.findOne({
          where: { id: user.id },
          relations: ['almacenEncargados', 'almacenEncargados.almacen'],
        });


        if (fullUser && fullUser.almacenEncargados && fullUser.almacenEncargados.length > 0) {
          almacenId = fullUser.almacenEncargados[0].almacen.id;
        }
      }
    }


    const query = this.requisicionRepo
      .createQueryBuilder('r')
      .select([
        'r.id',
        'r.fechaSolicitud',
        'r.rcp',
        'r.titulo',
        'r.observaciones',
        'r.observacionesCompras',
        'r.prioridad',
        'r.hrs',
        'r.concepto',
        'r.status',
        'r.aprovalType',
        'r.requisicionType',
        'r.cantidadEstimada',
        'r.cantidadActual',
        'r.metodo_pago',
        'r.fechaRevision',
      ])
      .leftJoinAndSelect('r.almacenCargo', 'almacenCargo')
      .addSelect(['almacenCargo.id', 'almacenCargo.name'])
      .leftJoinAndSelect('r.almacenDestino', 'almacenDestino')
      .addSelect(['almacenDestino.id', 'almacenDestino.name', 'almacenDestino.requisicionPrefix'])
      .leftJoinAndSelect('r.pedidoPor', 'pedidoPor')
      .addSelect(['pedidoPor.email', 'pedidoPor.name'])
      .leftJoinAndSelect('r.revisadoPor', 'revisadoPor')
      .addSelect(['revisadoPor.email', 'revisadoPor.name'])
      .leftJoinAndSelect('r.refacciones', 'refacciones')
      .addSelect([
        'refacciones.id',
        'refacciones.customId',
        'refacciones.cantidad',
        'refacciones.descripcion',
        'refacciones.unidad',
        'refacciones.precio',
        'refacciones.currency',
        'refacciones.no_economico',
        'refacciones.paid',
        'refacciones.cantidadPagada',
      ])
      .leftJoinAndSelect('r.insumos', 'insumos')
      .addSelect([
        'insumos.id',
        'insumos.cantidad',
        'insumos.descripcion',
        'insumos.unidad',
        'insumos.precio',
        'insumos.currency',
        'insumos.is_product',
        'insumos.paid',
        'insumos.cantidadPagada',
      ])
      .leftJoinAndSelect('r.filtros', 'filtros')
      .addSelect([
        'filtros.id',
        'filtros.customId',
        'filtros.cantidad',
        'filtros.descripcion',
        'filtros.unidad',
        'filtros.precio',
        'filtros.currency',
        'filtros.no_economico',
        'filtros.paid',
        'filtros.cantidadPagada',
      ])
      .orderBy('r.fechaSolicitud', order as 'ASC' | 'DESC');

    if (almacenId) {
      query.where('r.almacenDestino.id = :almacenId', { almacenId });
    }

    if (status) {
      query.where('r.status = :status', { status });
    }

    if (search) {
      const term = `%${search}%`;
      query.andWhere(
        new Brackets((qb2) => {
          qb2
            .where('r.rcp::text ILIKE :term', { term })
            .orWhere('r.titulo ILIKE :term', { term })
            .orWhere('refacciones.customId ILIKE :term', { term })
            .orWhere('REPLACE(refacciones.customId, \'-\', \'\') ILIKE :term', { term })
            .orWhere('refacciones.no_economico ILIKE :term', { term })
            .orWhere('filtros.customId ILIKE :term', { term })
            .orWhere('REPLACE(REPLACE(filtros.customId, \'-\', \'\'), \' \', \'\') ILIKE :term', { term })
            .orWhere('filtros.no_economico ILIKE :term', { term })
            .orWhere('insumos.descripcion ILIKE :term', { term })
        })
      );
    }

    const [requisiciones, totalItems] = await query
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(totalItems / limit);

    const mappedData: GetRequisicionDto[] = requisiciones.map((r) => ({
      id: r.id,
      fechaSolicitud: r.fechaSolicitud,
      rcp: r.rcp,
      formattedRcp: `${r.almacenDestino.requisicionPrefix}-${r.rcp}`,
      titulo: r.titulo,
      observaciones: r.observaciones,
      observacionesCompras: r.observacionesCompras,
      prioridad: r.prioridad,
      hrs: r.hrs,
      concepto: r.concepto,
      status: r.status,
      aprovalType: r.aprovalType,
      requisicionType: r.requisicionType,
      cantidadEstimada: r.cantidadEstimada,
      cantidadActual: r.cantidadActual,
      metodo_pago: r.metodo_pago,
      almacenDestino: {
        id: r.almacenDestino.id,
        name: r.almacenDestino.name,
      },
      almacenCargo: {
        id: r.almacenCargo.id,
        name: r.almacenCargo.name,
      },
      pedidoPor: {
        email: r.pedidoPor.email,
        name: r.pedidoPor.name,
      },
      revisadoPor: r.revisadoPor
        ? {
          email: r.revisadoPor.email,
          name: r.revisadoPor.name,
        }
        : null,
      fechaRevision: r.fechaRevision ?? null,
      refacciones: r.refacciones.map((ref) => ({
        id: ref.id,
        customId: ref.customId,
        cantidad: ref.cantidad,
        no_economico: ref.no_economico,
        descripcion: ref.descripcion,
        unidad: ref.unidad,
        precio: ref.precio || 0,
        currency: ref.currency,
        paid: ref.paid,
        cantidadPagada: ref.cantidadPagada,
      })),
      insumos: r.insumos.map((ins) => ({
        id: ins.id,
        cantidad: ins.cantidad,
        descripcion: ins.descripcion,
        unidad: ins.unidad,
        precio: ins.precio || 0,
        currency: ins.currency,
        is_product: ins.is_product,
        paid: ins.paid,
        cantidadPagada: ins.cantidadPagada,
      })),
      filtros: r.filtros.map((fil) => ({
        id: fil.id,
        customId: fil.customId,
        cantidad: fil.cantidad,
        no_economico: fil.no_economico,
        descripcion: fil.descripcion,
        unidad: fil.unidad,
        precio: fil.precio || 0,
        currency: fil.currency,
        paid: fil.paid,
        cantidadPagada: fil.cantidadPagada,
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
    pagination: PaginationDto,
    status?: RequisicionStatus
  ): Promise<PaginatedRequisicionDto> {
    const { search, page = 1, limit = 10, order = 'DESC' } = pagination;
    const skip = (page - 1) * limit;

    const query = this.requisicionRepo
      .createQueryBuilder('r')
      .select([
        'r.id',
        'r.fechaSolicitud',
        'r.rcp',
        'r.titulo',
        'r.observaciones',
        'r.observacionesCompras',
        'r.prioridad',
        'r.hrs',
        'r.concepto',
        'r.status',
        'r.aprovalType',
        'r.requisicionType',
        'r.cantidadActual',
        'r.cantidadEstimada',
        'r.metodo_pago',
        'r.fechaRevision',
      ])
      .leftJoinAndSelect('r.almacenCargo', 'almacenCargo')
      .addSelect(['almacenCargo.id', 'almacenCargo.name'])
      .leftJoinAndSelect('r.almacenDestino', 'almacenDestino')
      .addSelect(['almacenDestino.id', 'almacenDestino.name', 'almacenDestino.requisicionPrefix'])
      .leftJoinAndSelect('r.pedidoPor', 'pedidoPor')
      .addSelect(['pedidoPor.email', 'pedidoPor.name'])
      .leftJoinAndSelect('r.revisadoPor', 'revisadoPor')
      .addSelect(['revisadoPor.email', 'revisadoPor.name'])
      .leftJoinAndSelect('r.refacciones', 'refacciones')
      .addSelect([
        'refacciones.id',
        'refacciones.customId',
        'refacciones.cantidad',
        'refacciones.descripcion',
        'refacciones.unidad',
        'refacciones.precio',
        'refacciones.currency',
        'refacciones.paid',
        'refacciones.cantidadPagada',
      ])
      .leftJoinAndSelect('r.insumos', 'insumos')
      .addSelect([
        'insumos.id',
        'insumos.cantidad',
        'insumos.descripcion',
        'insumos.unidad',
        'insumos.precio',
        'insumos.currency',
        'insumos.is_product',
        'insumos.paid',
        'insumos.cantidadPagada',
      ])
      .leftJoinAndSelect('r.filtros', 'filtros')
      .addSelect([
        'filtros.id',
        'filtros.customId',
        'filtros.cantidad',
        'filtros.descripcion',
        'filtros.unidad',
        'filtros.precio',
        'filtros.currency',
        'filtros.paid',
        'filtros.cantidadPagada',
      ])
      .where('r.status IN (:...statuses)', {
        statuses: [RequisicionStatus.APROBADA, RequisicionStatus.PAGADA]
      })
      .orderBy('r.fechaSolicitud', order as 'ASC' | 'DESC');


    if (status) {
      query.where('r.status = :status', { status });
    }

    if (search) {
      const term = `%${search}%`;
      query.andWhere(
        new Brackets((qb2) => {
          qb2
            .where('r.rcp::text ILIKE :term', { term })
            .orWhere('r.titulo ILIKE :term', { term })
            .orWhere('refacciones.customId ILIKE :term', { term })
            .orWhere('REPLACE(refacciones.customId, \'-\', \'\') ILIKE :term', { term })
            .orWhere('refacciones.no_economico ILIKE :term', { term })
            .orWhere('filtros.customId ILIKE :term', { term })
            .orWhere('REPLACE(REPLACE(filtros.customId, \'-\', \'\'), \' \', \'\') ILIKE :term', { term })
            .orWhere('filtros.no_economico ILIKE :term', { term })
            .orWhere('insumos.descripcion ILIKE :term', { term })
        })
      );
    }

    const [requisiciones, totalItems] = await query
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(totalItems / limit);

    const mappedData: GetRequisicionDto[] = requisiciones.map((r) => ({
      id: r.id,
      fechaSolicitud: r.fechaSolicitud,
      rcp: r.rcp,
      formattedRcp: `${r.almacenDestino.requisicionPrefix}-${r.rcp}`,
      titulo: r.titulo,
      observaciones: r.observaciones,
      observacionesCompras: r.observacionesCompras,
      prioridad: r.prioridad,
      hrs: r.hrs,
      concepto: r.concepto,
      status: r.status,
      aprovalType: r.aprovalType,
      requisicionType: r.requisicionType,
      cantidadEstimada: r.cantidadEstimada,
      cantidadActual: r.cantidadActual,
      metodo_pago: r.metodo_pago,
      almacenDestino: {
        id: r.almacenDestino.id,
        name: r.almacenDestino.name,
      },
      almacenCargo: {
        id: r.almacenCargo.id,
        name: r.almacenCargo.name,
      },
      pedidoPor: {
        email: r.pedidoPor.email,
        name: r.pedidoPor.name,
      },
      revisadoPor: r.revisadoPor
        ? {
          email: r.revisadoPor.email,
          name: r.revisadoPor.name,
        }
        : null,
      fechaRevision: r.fechaRevision ?? null,
      refacciones: r.refacciones.map((ref) => ({
        id: ref.id,
        customId: ref.customId,
        cantidad: ref.cantidad,
        descripcion: ref.descripcion,
        unidad: ref.unidad,
        precio: ref.precio || 0,
        currency: ref.currency,
        paid: ref.paid,
        cantidadPagada: ref.cantidadPagada,
      })),
      insumos: r.insumos.map((ins) => ({
        id: ins.id,
        cantidad: ins.cantidad,
        descripcion: ins.descripcion,
        unidad: ins.unidad,
        precio: ins.precio || 0,
        currency: ins.currency,
        is_product: ins.is_product,
        paid: ins.paid,
        cantidadPagada: ins.cantidadPagada,
      })),
      filtros: r.filtros.map((fil) => ({
        id: fil.id,
        customId: fil.customId,
        cantidad: fil.cantidad,
        descripcion: fil.descripcion,
        unidad: fil.unidad,
        precio: fil.precio || 0,
        currency: fil.currency,
        paid: fil.paid,
        cantidadPagada: fil.cantidadPagada,
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

  // WARN: Legacy
  async markAsPagada(id: number, user: User, dto: PagarRequisicionDto) {
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
    if (requisicion.requisicionType !== RequisicionType.REFACCIONES) {
      throw new BadRequestException(
        'Solo las requisiciones de productos generan entradas automáticas.'
      );
    }


    // Mark requisicion as PAGADA
    requisicion.status = RequisicionStatus.PAGADA;
    requisicion.metodo_pago = dto.metodo_pago;
    requisicion.observacionesCompras = dto.observaciones;
    // Create the entrada
    const entrada = this.entradaRepo.create({
      fechaEsperada: dto.fechaEsperada,
      status: EntradaStatus.PENDIENTE,
      almacenDestino: requisicion.almacenDestino,
      recibidoPor: user,
      requisicion: requisicion,
    });
    await this.requisicionRepo.save(requisicion);
    const savedEntrada = await this.entradaRepo.save(entrada);
    return {
      requisicion,
      entrada: savedEntrada,
    };
  }

  async createRequisicion(dto: CreateRequisicionDto, user: User) {

    console.log(dto)
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let rcp: number;
      try {
        if (dto.rcp) {
          rcp = dto.rcp;
        } else {
          rcp = await this.getNextRcp();
        }
      } catch (error) {
        throw new BadRequestException('Failed to generate RCP number');
      }

      const userWithAlmacen = await queryRunner.manager.findOne(User, {
        where: { id: user.id },
        relations: [
          'almacenEncargados',
          'almacenEncargados.almacen',
          'adminContaAlmacen',
          'adminContaAlmacen.almacen',
        ],
      });

      if (!userWithAlmacen?.almacenEncargados?.length) {
        throw new BadRequestException('User is not assigned to any almacen');
      }

      if (!userWithAlmacen?.almacenAdminConta?.length) {
        throw new BadRequestException('User is not assigned to any almacen');
      }

      let almacenDestino: Almacen | { id: number }

      if (userWithAlmacen.almacenEncargados[0].almacen !== undefined) {
        almacenDestino = userWithAlmacen.almacenEncargados[0].almacen;

      } else if (userWithAlmacen.almacenAdminConta[0].almacen !== undefined) {
        almacenDestino = userWithAlmacen.almacenAdminConta[0].almacen

      } else if (dto.almacenDestinoId) {
        almacenDestino = { id: dto.almacenDestinoId }

      } else {

        throw new BadRequestException('almacenDestino is required')
      }

      let proveedor: Proveedor | null = null;
      if (dto.proveedorId) {
        proveedor = await queryRunner.manager.findOne(Proveedor, {
          where: { id: dto.proveedorId },
        });
        if (!proveedor) throw new NotFoundException('Proveedor not found');
      }


      const result = await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(Requisicion)
        .values({
          rcp,
          titulo: dto.titulo,
          observaciones: dto.observaciones,
          prioridad: dto.prioridad,
          hrs: dto.hrs,
          concepto: dto.concepto,
          requisicionType: dto.requisicionType,
          almacenCargo: { id: dto.almacenCargoId },
          almacenDestino: { id: almacenDestino.id },
          pedidoPor: { id: user.id },
          ...(proveedor && { proveedor: { id: proveedor.id } }),
          metodo_pago: MetodoPago.SIN_PAGAR,
          status: RequisicionStatus.PENDIENTE,
          aprovalType: RequisicionAprovalLevel.NONE,
          cantidadEstimada: 0,
          cantidadActual: 0,
          fechaSolicitud: new Date(),
        })
        .execute();

      const saved = await queryRunner.manager.findOne(Requisicion, {
        where: { id: result.identifiers[0].id },
      });

      if (!saved) throw new Error('Requisicion not found after creation');

      // Add items using queryRunner
      switch (dto.requisicionType) {
        case RequisicionType.REFACCIONES:
          await this.addRefaccionItems(saved, dto.items as CreateRefaccionItemDto[], queryRunner);
          break;
        case RequisicionType.CONSUMIBLES:
          await this.addInsumoItems(saved, dto.items as CreateInsumoItemDto[], queryRunner);
          break;
        case RequisicionType.FILTROS:
          await this.addFilterItems(saved, dto.items as CreateFilterItemDto[], queryRunner);
          break;
      }

      await this.calculateAndSetApprovalLevel(saved.id, queryRunner);

      await queryRunner.commitTransaction();

      const finalResult = await queryRunner.manager.findOne(Requisicion, {
        where: { id: saved.id },
        relations: {
          refacciones: true,
          insumos: true,
          filtros: true,
        },
      });
      if (!finalResult) throw new NotFoundException('Error creando la requi')

      this.recalculateRequisicionAmounts(finalResult.id);

      return finalResult;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(`Failed to create requisicion: ${error.message}`);

    } finally {
      await queryRunner.release();
    }
  }

  // WARN: Provicional update just about the items of the requisicion
  // -- I will have to update this later to handle the whole requisicion
  async updateRequisicion(
    requiId: number,
    dto: UpdateRequisicionItemsDto,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const requisicion = await queryRunner.manager.findOne(Requisicion, {
        where: { id: requiId },
        relations: ['refacciones', 'insumos', 'filtros'],
      });

      if (!requisicion) {
        throw new NotFoundException('Requisicion not found');
      }

      const existingItems = dto.items.filter((item) => item.id);
      const newItems = dto.items.filter((item) => !item.id);
      const existingIds = existingItems.map((item) => item.id);

      switch (dto.requisicionType) {
        case RequisicionType.REFACCIONES:
          await queryRunner.manager.delete(RequisicionRefaccionItem, {
            requisicion: { id: requiId },
            id: Not(In(existingIds)),
          });
          await this.updateRefaccionItems(existingItems, queryRunner);
          await this.addRefaccionItems(
            requisicion,
            newItems.map((item) => ({
              customId: item.customId || `ref-${Date.now()}`,
              no_economico: item.no_economico || "",
              cantidad: item.cantidad || 0,
              unidad: item.unidad || "",
              descripcion: item.descripcion || "",
              precio: item.precio || 0,
              currency: item.currency || "USD",
            })) as CreateRefaccionItemDto[],
            queryRunner,
          );
          break;

        case RequisicionType.CONSUMIBLES:
          await queryRunner.manager.delete(RequisicionInsumoItem, {
            requisicion: { id: requiId },
            id: Not(In(existingIds)),
          });
          await this.updateInsumoItems(existingItems, queryRunner);
          await this.addInsumoItems(
            requisicion,
            newItems.map((item) => ({
              cantidad: item.cantidad || 0,
              unidad: item.unidad || "",
              descripcion: item.descripcion || "",
              precio: item.precio || 0,
              currency: item.currency || "USD",
              is_product: item.is_product || false,
            })) as CreateInsumoItemDto[],
            queryRunner,
          );
          break;

        case RequisicionType.FILTROS:
          await queryRunner.manager.delete(RequisicionFilterItem, {
            requisicion: { id: requiId },
            id: Not(In(existingIds)),
          });
          await this.updateFilterItems(existingItems, queryRunner);
          await this.addFilterItems(
            requisicion,
            newItems.map((item) => ({
              customId: item.customId || `fil-${Date.now()}`,
              hrs_snapshot: item.hrs_snapshot,
              no_economico: item.no_economico || "",
              cantidad: item.cantidad || 0,
              unidad: item.unidad || "",
              descripcion: item.descripcion || "",
              precio: item.precio || 0,
              currency: item.currency || "USD",
            })) as CreateFilterItemDto[],
            queryRunner,
          );
          break;
      }

      this.recalculateRequisicionAmounts(requiId);

      await queryRunner.commitTransaction();

      return await queryRunner.manager.findOne(Requisicion, {
        where: { id: requiId },
        relations: {
          refacciones: true,
          insumos: true,
          filtros: true,
        },
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(
        `Failed to update requisicion: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }


  async markItemsAsPaid(
    requisicionId: number,
    dto: MarkItemsAsPaidDto,
    user: User
  ) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('No items selected to mark as paid');
    }

    const requisicion = await this.requisicionRepo.findOne({
      where: { id: requisicionId },
      relations: ['refacciones', 'insumos', 'filtros', 'almacenDestino'],
    });

    if (!requisicion) {
      throw new NotFoundException('Requisicion not found');
    }

    const entradaItems: EntradaItem[] = [];

    switch (dto.requisicionType) {
      case RequisicionType.REFACCIONES:
        for (const item of dto.items) {
          const refaccionItem = await this.refaccionItemRepo.findOne({
            where: { id: item.id },
          });

          if (!refaccionItem) continue;

          await this.refaccionItemRepo.update(
            { id: item.id },
            { paid: true, cantidadPagada: item.cantidadPagada },
          );

          entradaItems.push(
            this.entradaItemRepo.create({
              cantidadEsperada: item.cantidadPagada, // Remove Number() wrapper
              descripcion: refaccionItem.descripcion,
              unidad: refaccionItem.unidad,
              refaccionItem,
            }),
          );
        }
        break;

      case RequisicionType.CONSUMIBLES:
        for (const item of dto.items) {
          const insumoItem = await this.insumoItemRepo.findOne({
            where: { id: item.id },
          });

          if (!insumoItem) continue;

          await this.insumoItemRepo.update(
            { id: item.id },
            { paid: true, cantidadPagada: item.cantidadPagada },
          );

          if (insumoItem.is_product === true) {
            entradaItems.push(
              this.entradaItemRepo.create({
                cantidadEsperada: item.cantidadPagada,
                descripcion: insumoItem.descripcion,
                unidad: insumoItem.unidad,
                insumoItem,
              }),
            );

          }

        }
        break;

      case RequisicionType.FILTROS:
        for (const item of dto.items) {
          const filtroItem = await this.filterItemRepo.findOne({
            where: { id: item.id },
          });

          if (!filtroItem) continue;

          await this.filterItemRepo.update(
            { id: item.id },
            { paid: true, cantidadPagada: item.cantidadPagada },
          );

          entradaItems.push(
            this.entradaItemRepo.create({
              cantidadEsperada: item.cantidadPagada,
              descripcion: filtroItem.descripcion,
              unidad: filtroItem.unidad,
              filtroItem,
            }),
          );
        }
        break;

      default:
        throw new BadRequestException('Invalid requisicion type');
    }

    if (entradaItems.length > 0) {
      const savedItems = await this.entradaItemRepo.save(entradaItems);

      const entrada = this.entradaRepo.create({
        fechaEsperada: dto.fecha_esperada,
        recibidoPor: user,
        status: EntradaStatus.PENDIENTE,
        almacenDestino: requisicion.almacenDestino,
        observacionesAlmacen: requisicion.observaciones,
        observacionesCompras: dto.observaciones,
        requisicion,
        items: savedItems,
      });

      await this.entradaRepo.save(entrada);

    }

    const updateData: any = {
      metodo_pago: dto.metodo_pago,
      status: RequisicionStatus.PAGADA,
    };

    if (dto.observaciones) {
      updateData.observacionesCompras = dto.observaciones;
    }

    await this.requisicionRepo.update(
      { id: requisicionId },
      updateData,
    );

    return this.recalculateRequisicionAmounts(requisicionId);
  }


  private async recalculateRequisicionAmounts(requisicionId: number) {
    const requisicion = await this.requisicionRepo.findOne({
      where: { id: requisicionId },
      relations: {
        refacciones: true,
        insumos: true,
        filtros: true,
      },
    });

    if (!requisicion) throw new NotFoundException('Requisicion not found');

    const items = [
      ...requisicion.refacciones,
      ...requisicion.insumos,
      ...requisicion.filtros,
    ];

    const cantidadEstimada = items.reduce((sum, item) => {
      const precio = item.precio || 0;
      return sum + (item.cantidad || 0) * precio;
    }, 0);

    const cantidadActual = items
      .filter((item) => item.paid === true)
      .reduce((sum, item) => {
        const precio = item.precio || 0;
        return sum + (item.cantidadPagada || 0) * precio;
      }, 0);

    requisicion.cantidadEstimada = cantidadEstimada;
    requisicion.cantidadActual = cantidadActual;

    await this.requisicionRepo.save(requisicion);

    return {
      cantidadEstimada,
      cantidadActual,
    };
  }


  private async getNextRcp(): Promise<number> {
    const lastRequisicion = await this.requisicionRepo.findOne({
      where: {},
      order: { rcp: 'DESC' },
    });

    return lastRequisicion?.rcp ? lastRequisicion.rcp + 1 : 1;
  }

  private async calculateAndSetApprovalLevel(
    requisicionId: number,
    queryRunner: QueryRunner,
  ) {
    const requisicion = await queryRunner.manager.findOne(Requisicion, {
      where: { id: requisicionId },
      relations: ['refacciones', 'insumos', 'filtros'],
    });

    if (!requisicion) throw new Error('Requisicion not found');

    const totalUSD = await this.calculateTotalInUSD(requisicion);
    const cantidadEstimada = Math.round(totalUSD);

    let aprovalType = RequisicionAprovalLevel.NONE;
    if (totalUSD >= 2000 && totalUSD < 5000) {
      aprovalType = RequisicionAprovalLevel.ADMIN;
    } else if (totalUSD >= 5000) {
      aprovalType = RequisicionAprovalLevel.SPECIAL_PERMISSION;
    }

    await queryRunner.manager.update(
      Requisicion,
      { id: requisicionId },
      { cantidadEstimada, aprovalType },
    );
  }


  private async calculateTotalInUSD(requisicion: Requisicion): Promise<number> {
    let totalUSD = 0;

    if (requisicion.refacciones?.length) {
      requisicion.refacciones.forEach(item => {
        if (item.precio && item.cantidad) {
          const itemTotal = item.cantidad * item.precio;
          const usdAmount = this.convertToUSD(itemTotal, item.currency || 'USD');
          totalUSD += usdAmount;
        }
      });
    }

    if (requisicion.insumos?.length) {
      requisicion.insumos.forEach(item => {
        if (item.precio && item.cantidad) {
          const itemTotal = item.cantidad * item.precio;
          const usdAmount = this.convertToUSD(itemTotal, item.currency || 'USD');
          totalUSD += usdAmount;
        }
      });
    }

    if (requisicion.filtros?.length) {
      requisicion.filtros.forEach(item => {
        if (item.precio && item.cantidad) {
          const itemTotal = item.cantidad * item.precio;
          const usdAmount = this.convertToUSD(itemTotal, item.currency || 'USD');
          totalUSD += usdAmount;
        }
      });
    }

    return totalUSD;
  }

  private convertToUSD(amount: number, currency: string): number {
    if (currency === 'MXN') {
      return amount / 18;
    }
    return amount;
  }

  private async addRefaccionItems(
    requisicion: Requisicion,
    items: CreateRefaccionItemDto[],
    queryRunner: QueryRunner,
  ) {
    try {
      if (!items || items.length === 0) return;


      const refacciones = items.map(item => {
        const refaccionItem = new RequisicionRefaccionItem();
        refaccionItem.customId = item.customId || `ref-${Date.now()}`;
        refaccionItem.no_economico = item.no_economico;
        refaccionItem.cantidad = item.cantidad;
        refaccionItem.unidad = item.unidad;
        refaccionItem.descripcion = item.descripcion;
        refaccionItem.precio = item.precio;
        refaccionItem.currency = item.currency;
        refaccionItem.paid = false;
        refaccionItem.requisicion = requisicion;
        return refaccionItem;
      });

      await queryRunner.manager.save(refacciones);

    } catch (error) {
      console.error('Error in addInsumoItems:', error);
      throw error;
    } finally {
      console.log('finished trying to insert into refacciones')
    }

  }

  private async addInsumoItems(
    requisicion: Requisicion,
    items: CreateInsumoItemDto[],
    queryRunner: QueryRunner,
  ) {
    try {

      if (!items || items.length === 0) {
        console.log('No items, returning');
        return;
      }

      const insumos = items.map(item => {
        const insumoItem = new RequisicionInsumoItem();
        insumoItem.cantidad = item.cantidad;
        insumoItem.unidad = item.unidad;
        insumoItem.descripcion = item.descripcion;
        insumoItem.precio = item.precio;
        insumoItem.currency = item.currency;
        insumoItem.is_product = item.is_product || false;
        insumoItem.paid = false;
        insumoItem.requisicion = requisicion;
        return insumoItem;
      });

      await queryRunner.manager.save(insumos);
    } catch (error) {
      console.error('Error in addInsumoItems:', error);
      throw error;
    } finally {
      console.log('finished trying to insert into insumos items')
    }
  }

  private async addFilterItems(
    requisicion: Requisicion,
    items: CreateFilterItemDto[],
    queryRunner: QueryRunner,
  ) {
    try {

      if (!items || items.length === 0) return;

      const filtros = items.map(item => {
        const filtroItem = new RequisicionFilterItem();
        filtroItem.customId = item.customId || `fil-${Date.now()}`;
        filtroItem.hrs_snapshot = item.hrs_snapshot;
        filtroItem.no_economico = item.no_economico;
        filtroItem.cantidad = item.cantidad;
        filtroItem.unidad = item.unidad;
        filtroItem.descripcion = item.descripcion;
        filtroItem.precio = item.precio;
        filtroItem.currency = item.currency;
        filtroItem.paid = false;
        filtroItem.requisicion = requisicion;
        return filtroItem;
      });

      await queryRunner.manager.save(filtros);

    } catch (error) {
      console.error('Error in addInsumoItems:', error);
      throw error;
    } finally {
      console.log('finished trying to insert into filters items')
    }

  }

  // Update items of requisicion
  private async updateRefaccionItems(
    items: UpdateItemDto[],
    queryRunner: QueryRunner,
  ) {
    for (const item of items) {
      const updateData: any = {};

      if (item.cantidad !== undefined)
        updateData.cantidad = item.cantidad;
      if (item.precio !== undefined)
        updateData.precio = item.precio;
      if (item.currency !== undefined)
        updateData.currency = item.currency;
      if (item.unidad !== undefined)
        updateData.unidad = item.unidad;
      if (item.descripcion !== undefined)
        updateData.descripcion = item.descripcion;
      if (item.customId !== undefined)
        updateData.customId = item.customId;
      if (item.no_economico !== undefined)
        updateData.no_economico = item.no_economico;

      await queryRunner.manager.update(
        RequisicionRefaccionItem,
        { id: item.id },
        updateData,
      );
    }
  }

  private async updateInsumoItems(
    items: UpdateItemDto[],
    queryRunner: QueryRunner,
  ) {
    for (const item of items) {
      const updateData: any = {};

      if (item.cantidad !== undefined)
        updateData.cantidad = item.cantidad;
      if (item.precio !== undefined)
        updateData.precio = item.precio;
      if (item.currency !== undefined)
        updateData.currency = item.currency;
      if (item.unidad !== undefined)
        updateData.unidad = item.unidad;
      if (item.descripcion !== undefined)
        updateData.descripcion = item.descripcion;
      if (item.is_product !== undefined)
        updateData.is_product = item.is_product;

      await queryRunner.manager.update(
        RequisicionInsumoItem,
        { id: item.id },
        updateData,
      );
    }
  }

  private async updateFilterItems(
    items: UpdateItemDto[],
    queryRunner: QueryRunner,
  ) {
    for (const item of items) {
      const updateData: any = {};

      if (item.cantidad !== undefined)
        updateData.cantidad = item.cantidad;
      if (item.precio !== undefined)
        updateData.precio = item.precio;
      if (item.currency !== undefined)
        updateData.currency = item.currency;
      if (item.unidad !== undefined)
        updateData.unidad = item.unidad;
      if (item.descripcion !== undefined)
        updateData.descripcion = item.descripcion;
      if (item.customId !== undefined)
        updateData.customId = item.customId;
      if (item.no_economico !== undefined)
        updateData.no_economico = item.no_economico;
      if (item.hrs_snapshot !== undefined)
        updateData.hrs_snapshot = item.hrs_snapshot;

      await queryRunner.manager.update(
        RequisicionFilterItem,
        { id: item.id },
        updateData,
      );
    }
  }


}
