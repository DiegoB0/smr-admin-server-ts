import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Entrada } from './entities/entrada.entity';
import { Brackets, Repository } from 'typeorm';
import { EntradaItem } from './entities/entrada_item.entity';
import { EntradaStatus } from './types/entradas-status';
import { Inventario } from 'src/almacenes/entities/inventario.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { GetEntradaDto, PaginatedEntradaDto } from './dto/response.dto';
import { Producto } from 'src/productos/entities/producto.entity';
import { Almacen } from 'src/almacenes/entities/almacen.entity';

@Injectable()
export class EntradasService {
  constructor(
    @InjectRepository(Entrada)
    private readonly entradaRepo: Repository<Entrada>,

    @InjectRepository(Inventario)
    private inventarioRepo: Repository<Inventario>,

    @InjectRepository(Almacen)
    private almacenRepo: Repository<Almacen>,

    @InjectRepository(Producto)
    private productoRepo: Repository<Producto>,

    @InjectRepository(EntradaItem)
    private readonly itemRepo: Repository<EntradaItem>,
  ) { }

  async findAll(
    almacenId: number,
    pagination: PaginationDto,
    status?: EntradaStatus
  ): Promise<PaginatedEntradaDto> {
    const { page = 1, limit = 10, order = 'DESC', search } = pagination;
    const skip = (page - 1) * limit;

    const baseQB = this.entradaRepo
      .createQueryBuilder('entrada')
      .leftJoin('entrada.almacenDestino', 'almacen')
      .where('almacen.id = :almacenId', { almacenId });

    const totalItems = await baseQB.getCount();
    const totalPages = Math.ceil(totalItems / limit);

    if (totalItems === 0) {
      return new PaginatedEntradaDto([], {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      });
    }

    const ids = (
      await baseQB
        .clone()
        .select('entrada.id', 'id')
        .orderBy('entrada.fechaCreacion', order)
        .skip(skip)
        .take(limit)
        .getRawMany<{ id: number }>()
    ).map((r) => r.id);

    if (ids.length === 0) {
      return new PaginatedEntradaDto([], {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      });
    }

    const query = this.entradaRepo
      .createQueryBuilder('entrada')
      .select([
        'entrada.id',
        'entrada.fechaCreacion',
        'entrada.fechaEsperada',
        'entrada.observacionesCompras',
        'entrada.observacionesAlmacen',
        'entrada.status',
      ])
      .leftJoin('entrada.items', 'items')
      .addSelect([
        'items.id',
        'items.cantidadRecibida',
        'items.cantidadEsperada',
        'items.descripcion',
        'items.customId',
        'items.unidad',
      ])
      // Load refaccion items
      .leftJoin('items.refaccionItem', 'refaccionItem')
      .addSelect([
        'refaccionItem.id',
        'refaccionItem.customId',
        'refaccionItem.no_economico',
        'refaccionItem.cantidad',
        'refaccionItem.descripcion',
        'refaccionItem.precio',
        'refaccionItem.currency',
      ])
      // Load insumo items
      .leftJoin('items.insumoItem', 'insumoItem')
      .addSelect([
        'insumoItem.id',
        'insumoItem.cantidad',
        'insumoItem.descripcion',
        'insumoItem.precio',
        'insumoItem.currency',
      ])
      // Load filter items
      .leftJoin('items.filtroItem', 'filtroItem')
      .addSelect([
        'filtroItem.id',
        'filtroItem.customId',
        'filtroItem.no_economico',
        'filtroItem.cantidad',
        'filtroItem.descripcion',
        'filtroItem.precio',
        'filtroItem.currency',
      ])
      .leftJoin('entrada.almacenDestino', 'almacen')
      .addSelect(['almacen.id', 'almacen.name'])
      .leftJoin('entrada.recibidoPor', 'recibidoPor')
      .addSelect(['recibidoPor.id', 'recibidoPor.name'])
      .leftJoin('entrada.requisicion', 'requisicion')
      .addSelect(['requisicion.id', 'requisicion.rcp', 'requisicion.metodo_pago'])
      .where('entrada.id IN (:...ids)', { ids })
      .orderBy('entrada.fechaCreacion', order)


    if (status) {
      query.where('entrada.status = :status', { status });
    }

    if (search) {
      const term = `%${search}%`;
      query.andWhere(
        new Brackets((qb2) => {
          qb2
            .where('requisicion.rcp::text ILIKE :term', { term })
            .orWhere('requisicion.titulo ILIKE :term', { term })
            .orWhere('refaccionItem.customId ILIKE :term', { term })
            .orWhere('REPLACE(refaccionItem.customId, \'-\', \'\') ILIKE :term', { term })
            .orWhere('refaccionItem.no_economico ILIKE :term', { term })
            .orWhere('filtroItem.customId ILIKE :term', { term })
            .orWhere('REPLACE(REPLACE(filtroItem.customId, \'-\', \'\'), \' \', \'\') ILIKE :term', { term })
            .orWhere('filtroItem.no_economico ILIKE :term', { term })
            .orWhere('insumoItem.descripcion ILIKE :term', { term })
        })
      );
    }


    const [entradas] = await query
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const mapped: GetEntradaDto[] = entradas.map((e) => ({
      id: e.id,
      fechaCreacion: e.fechaCreacion,
      fechaEsperada: e.fechaEsperada,
      status: e.status,
      observacionesCompras: e.observacionesCompras,
      observacionesAlmacen: e.observacionesAlmacen,
      almacenDestino: { id: e.almacenDestino?.id, name: e.almacenDestino?.name },
      recibidoPor: { id: e.recibidoPor?.id, name: e.recibidoPor?.name },
      requisicion: e.requisicion
        ? { id: e.requisicion.id, rcp: e.requisicion.rcp, metodo_pago: e.requisicion.metodo_pago }
        : null,
      items: e.items.map((item) => ({
        id: item.id,
        cantidadEsperada: item.cantidadEsperada,
        cantidadRecibida: item.cantidadRecibida,
        descripcion: item.descripcion,
        unidad: item.unidad,
        customId: item.customId,
        refaccionItem: item.refaccionItem,
        insumoItem: item.insumoItem,
        filtroItem: item.filtroItem,
      })),
    }));

    return new PaginatedEntradaDto(mapped, {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    });
  }


  async updateCantidadRecibida(
    entradaId: number,
    updates: { itemId: number; cantidadRecibida: number }[],
  ) {
    const entrada = await this.entradaRepo.findOne({
      where: { id: entradaId },
      relations: [
        'items',
        'almacenDestino',
        'items.refaccionItem',
        'items.insumoItem',
        'items.filtroItem',
      ],
    });

    if (!entrada) throw new NotFoundException('Entrada not found');

    for (const { itemId, cantidadRecibida } of updates) {
      const item = entrada.items.find(i => i.id === itemId);
      if (!item)
        throw new NotFoundException(
          `Item ${itemId} not found in this entrada`,
        );

      const currentCantidad = item.cantidadRecibida ?? 0;
      const nuevaCantidad = currentCantidad + cantidadRecibida;

      if (nuevaCantidad > item.cantidadEsperada) {
        throw new BadRequestException(
          `Cannot add ${cantidadRecibida}. Total received (${nuevaCantidad}) exceeds expected (${item.cantidadEsperada})`,
        );
      }

      item.cantidadRecibida = nuevaCantidad;
      await this.itemRepo.save(item);

      await this.addStock(
        entrada.almacenDestino.id,
        item,
        cantidadRecibida,
      );
    }

    const total = entrada.items.length;
    const fullyReceived = entrada.items.filter(
      i => (i.cantidadRecibida ?? 0) === i.cantidadEsperada,
    ).length;
    const partiallyReceived = entrada.items.filter(
      i => (i.cantidadRecibida ?? 0) > 0,
    ).length;

    if (fullyReceived === total) {
      entrada.status = EntradaStatus.RECIBIDA;
    } else if (partiallyReceived > 0) {
      entrada.status = EntradaStatus.PARCIAL;
    } else {
      entrada.status = EntradaStatus.PENDIENTE;
    }

    await this.entradaRepo.save(entrada);

    return entrada;
  }

  private async addStock(
    almacenId: number,
    item: EntradaItem,
    cantidad: number = 1,
  ) {
    let customId: string;
    let productName: string;
    let unidad: string;

    if (item.refaccionItem) {
      customId = item.refaccionItem.customId;
      productName = item.refaccionItem.descripcion;
      unidad = item.refaccionItem.unidad || 'unidad';
    } else if (item.filtroItem) {
      customId = item.filtroItem.customId;
      productName = item.filtroItem.descripcion;
      unidad = item.filtroItem.unidad || 'unidad';
    } else if (item.insumoItem && item.insumoItem.is_product) {
      customId = `INSUMO_${item.insumoItem.id}`;
      productName = item.insumoItem.descripcion;
      unidad = item.insumoItem.unidad;
    } else {
      return;
    }

    // Always search by customId, never by the requisicion item ID
    let productoEntity = await this.productoRepo.findOne({
      where: { customId },
    });

    if (!productoEntity) {
      productoEntity = this.productoRepo.create({
        customId,
        name: productName,
        description: productName,
        unidad,
        isActive: true,
      });
      productoEntity = await this.productoRepo.save(productoEntity);
    }

    const almacen = await this.almacenRepo.findOne({
      where: { id: almacenId },
    });

    if (!almacen) {
      throw new NotFoundException(`Almacen ${almacenId} not found`);
    }

    let inventario = await this.inventarioRepo.findOne({
      where: {
        almacen: { id: almacenId },
        producto: { id: productoEntity.id },
      },
      relations: ['almacen', 'producto'],
    });

    if (!inventario) {
      inventario = this.inventarioRepo.create({
        almacen,
        producto: productoEntity,
        stock: cantidad,
      });
    } else {
      inventario.stock += cantidad;
    }

    return this.inventarioRepo.save(inventario);
  }
}
