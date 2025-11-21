import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Requisicion } from './entities/requisicion.entity';
import { LogsService } from 'src/logs/logs.service';
import { Brackets, DataSource, QueryRunner, Repository } from 'typeorm';
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
import { CreateFilterItemDto, CreateInsumoItemDto, CreateRefaccionItemDto, CreateRequisicionDto } from './dto/request.v2.dto';
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

    @InjectRepository(RequisicionRefaccionItem)
    private refaccionItemRepo: Repository<RequisicionRefaccionItem>,

    @InjectRepository(RequisicionFilterItem)
    private filterItemRepo: Repository<RequisicionFilterItem>,

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
      .addSelect(['almacenDestino.id', 'almacenDestino.name'])
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
      ])
      .leftJoinAndSelect('r.insumos', 'insumos')
      .addSelect([
        'insumos.id',
        'insumos.cantidad',
        'insumos.descripcion',
        'insumos.unidad',
        'insumos.precio',
        'insumos.currency',
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
      ])
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
            .orWhere('refacciones.no_economico ILIKE :term', { term })
            .orWhere('filtros.customId ILIKE :term', { term })
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
      titulo: r.titulo,
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
      })),
      insumos: r.insumos.map((ins) => ({
        id: ins.id,
        cantidad: ins.cantidad,
        descripcion: ins.descripcion,
        unidad: ins.unidad,
        precio: ins.precio || 0,
        currency: ins.currency,
      })),
      filtros: r.filtros.map((fil) => ({
        id: fil.id,
        customId: fil.customId,
        cantidad: fil.cantidad,
        descripcion: fil.descripcion,
        unidad: fil.unidad,
        precio: fil.precio || 0,
        currency: fil.currency,
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
    const { search, page = 1, limit = 10, order = 'DESC' } = pagination;
    const skip = (page - 1) * limit;

    const query = this.requisicionRepo
      .createQueryBuilder('r')
      .select([
        'r.id',
        'r.fechaSolicitud',
        'r.rcp',
        'r.titulo',
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
      .addSelect(['almacenDestino.id', 'almacenDestino.name'])
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
      ])
      .leftJoinAndSelect('r.insumos', 'insumos')
      .addSelect([
        'insumos.id',
        'insumos.cantidad',
        'insumos.descripcion',
        'insumos.unidad',
        'insumos.precio',
        'insumos.currency',
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
      ])
      .where('r.status IN (:...statuses)', {
        statuses: [RequisicionStatus.APROBADA, RequisicionStatus.PAGADA]
      })
      .orderBy('r.fechaSolicitud', order as 'ASC' | 'DESC');

    if (search) {
      const term = `%${search}%`;
      query.andWhere(
        new Brackets((qb2) => {
          qb2
            .where('r.rcp::text ILIKE :term', { term })
            .orWhere('r.titulo ILIKE :term', { term })
            .orWhere('refacciones.customId ILIKE :term', { term })
            .orWhere('insumos.descripcion ILIKE :term', { term })
            .orWhere('filtros.customId ILIKE :term', { term })
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
      titulo: r.titulo,
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
      })),
      insumos: r.insumos.map((ins) => ({
        id: ins.id,
        cantidad: ins.cantidad,
        descripcion: ins.descripcion,
        unidad: ins.unidad,
        precio: ins.precio || 0,
        currency: ins.currency,
      })),
      filtros: r.filtros.map((fil) => ({
        id: fil.id,
        customId: fil.customId,
        cantidad: fil.cantidad,
        descripcion: fil.descripcion,
        unidad: fil.unidad,
        precio: fil.precio || 0,
        currency: fil.currency,
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
    requisicion.observaciones = dto.observaciones;
    // Create the entrada
    const entrada = this.entradaRepo.create({
      fechaEsperada: dto.fechaEsperada,
      status: EntradaStatus.PENDIENTE,
      almacenDestino: requisicion.almacenDestino,
      creadoPor: user,
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
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let rcp: number;
      try {
        rcp = await this.getNextRcp();
      } catch (error) {
        throw new BadRequestException('Failed to generate RCP number');
      }

      const userWithAlmacen = await queryRunner.manager.findOne(User, {
        where: { id: user.id },
        relations: ['almacenesEncargados'],
      });

      if (!userWithAlmacen?.almacenesEncargados?.length) {
        throw new BadRequestException('User is not assigned to any almacen');
      }

      const almacenDestino = userWithAlmacen.almacenesEncargados[0];

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

      return finalResult;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(`Failed to create requisicion: ${error.message}`);

    } finally {
      await queryRunner.release();
    }
  }


  async markItemAsPaid(
    requisicionId: number,
    itemId: number,
    itemType: RequisicionType,
  ) {
    let item: any;

    switch (itemType) {
      case RequisicionType.REFACCIONES:
        item = await this.refaccionItemRepo.findOne({
          where: { id: itemId },
        });
        if (!item) throw new NotFoundException('Refaccion item not found');
        item.paid = true;
        await this.refaccionItemRepo.save(item);
        break;

      case RequisicionType.CONSUMIBLES:
        item = await this.insumoItemRepo.findOne({
          where: { id: itemId as number },
        });
        if (!item) throw new NotFoundException('Insumo item not found');
        item.paid = true;
        await this.insumoItemRepo.save(item);
        break;

      case RequisicionType.FILTROS:
        item = await this.filterItemRepo.findOne({
          where: { id: itemId as number },
        });
        if (!item) throw new NotFoundException('Filter item not found');
        item.paid = true;
        await this.filterItemRepo.save(item);
        break;

      default:
        throw new BadRequestException('Invalid requisicion type');
    }

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

    // Calculate estimated (all items)
    const items = [
      ...requisicion.refacciones,
      ...requisicion.insumos,
      ...requisicion.filtros,
    ];

    const cantidadEstimada = items.reduce((sum, item) => {
      return sum + item.cantidad * item.precio;
    }, 0);

    // Calculate actual (only paid items)
    const cantidadActual = items
      .filter(item => item.paid === true)
      .reduce((sum, item) => {
        return sum + item.cantidad * item.precio;
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
        insumoItem.precio = item.precio_unitario;
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


}
