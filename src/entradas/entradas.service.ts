import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Entrada } from './entities/entrada.entity';
import { Repository } from 'typeorm';
import { EntradaItem } from './entities/entrada_item.entity';
import { EntradaStatus } from './types/entradas-status';
import { Inventario } from 'src/almacenes/entities/inventario.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { GetEntradaDto, PaginatedEntradaDto } from './dto/response.dto';

@Injectable()
export class EntradasService {
  constructor(
    @InjectRepository(Entrada)
    private readonly entradaRepo: Repository<Entrada>,

    @InjectRepository(Inventario)
    private inventarioRepo: Repository<Inventario>,

    @InjectRepository(EntradaItem)
    private readonly itemRepo: Repository<EntradaItem>,
  ) { }

  async findAll(
    pagination: PaginationDto
  ): Promise<PaginatedEntradaDto> {
    const { page = 1, limit = 10, order = 'DESC' } = pagination;
    const skip = (page - 1) * limit;

    // 1) Base QB for count + ids
    const baseQB = this.entradaRepo
      .createQueryBuilder('entrada');

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

    // 2) Page of IDs only
    const idRows = await baseQB
      .select('entrada.id', 'id')
      .orderBy('entrada.fechaCreacion', order)
      .skip(skip)
      .take(limit)
      .getRawMany<{ id: number }>();

    const ids = idRows.map((r) => r.id);
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

    // 3) Load full rows for those IDs
    const entradas = await this.entradaRepo
      .createQueryBuilder('entrada')
      .select(['entrada.id', 'entrada.fechaCreacion'])
      .leftJoin('entrada.items', 'items')
      .addSelect(['items.id', 'items.cantidadRecibida', 'items.cantidadEsperada'])
      .leftJoin('items.producto', 'producto')
      .addSelect(['producto.id', 'producto.name'])
      .leftJoin('entrada.almacenDestino', 'almacen')
      .addSelect(['almacen.id', 'almacen.name'])
      .leftJoin('entrada.creadoPor', 'creadoPor')
      .addSelect(['creadoPor.id', 'creadoPor.name'])
      .leftJoin('entrada.requisicion', 'requisicion')
      .addSelect(['requisicion.id', 'requisicion.rcp'])
      .where('entrada.id IN (:...ids)', { ids })
      .orderBy('entrada.fechaCreacion', order)
      .getMany();

    // 4) Map to DTO
    const mapped: GetEntradaDto[] = entradas.map((e) => ({
      id: e.id,
      fechaCreacion: e.fechaCreacion,
      items: (e.items ?? []).map((i) => ({
        id: i.id,
        cantidadRecibida: i.cantidadRecibida,
        cantidadEsperada: i.cantidadEsperada,
        producto: {
          id: i.producto.id,
          name: i.producto.name,
        },
      })),
      almacenDestino: {
        id: e.almacenDestino?.id,
        name: e.almacenDestino?.name,
      },
      creadoPor: {
        id: e.creadoPor?.id,
        name: e.creadoPor?.name,
      },
      requisicion: e.requisicion
        ? {
          id: e.requisicion.id,
          rcp: e.requisicion.rcp,
        }
        : null,
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
      relations: ['items', 'almacenDestino', 'items.producto'],
    });

    if (!entrada) throw new NotFoundException('Entrada not found');

    for (const { itemId, cantidadRecibida } of updates) {
      const item = entrada.items.find(i => i.id === itemId);
      if (!item) throw new NotFoundException(`Item ${itemId} not found in this entrada`);

      const nuevaCantidad = item.cantidadRecibida + cantidadRecibida;

      if (nuevaCantidad > item.cantidadEsperada) {
        throw new BadRequestException(
          `Cannot add ${cantidadRecibida}. Total received (${nuevaCantidad}) exceeds expected (${item.cantidadEsperada})`,
        );
      }

      // Increment cantidadRecibida
      item.cantidadRecibida = nuevaCantidad;
      await this.itemRepo.save(item);

      // Add stock to the almacen
      await this.addStock(
        entrada.almacenDestino.id,
        item.producto.id,
        cantidadRecibida, // only the newly received quantity
      );
    }

    // Re-check entrada status
    const total = entrada.items.length;
    const fullyReceived = entrada.items.filter(i => i.cantidadRecibida === i.cantidadEsperada).length;
    const partiallyReceived = entrada.items.filter(i => i.cantidadRecibida > 0).length;

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

  // Example helper function (you already have something like this)
  async addStock(almacenId: number, productId: string, cantidad: number = 1) {
    let inventario = await this.inventarioRepo.findOne({
      where: {
        almacen: { id: almacenId },
        producto: { id: productId },
      },
      relations: ['almacen', 'producto'],
    });

    if (!inventario) {
      inventario = this.inventarioRepo.create({
        almacen: { id: almacenId },
        producto: { id: productId },
        stock: cantidad,
      });
    } else {
      inventario.stock += cantidad;
    }

    return this.inventarioRepo.save(inventario);
  }
}
