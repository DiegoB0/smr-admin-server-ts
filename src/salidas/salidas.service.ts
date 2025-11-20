import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Brackets, DeepPartial, Repository } from 'typeorm';
import { Salida } from './entities/salida.entity';
import { SalidaItem } from './entities/salida_item.entity';
import { CreateSalidaDto } from './dto/request.dto';
import { User } from 'src/auth/entities/usuario.entity';
import { Inventario } from 'src/almacenes/entities/inventario.entity';
import { Producto } from 'src/productos/entities/producto.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { GetSalidaDto, PaginatedSalidaDto } from './dto/response.dto';

@Injectable()
export class SalidasService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Salida)
    private readonly salidaRepo: Repository<Salida>,
  ) { }

  // async create(dto: CreateSalidaDto, user: User) {
  //   if (!dto.items?.length) {
  //     throw new BadRequestException('La salida requiere items.');
  //   }
  //
  //   return this.dataSource.transaction(async (manager) => {
  //     if (user.id) {
  //       await manager.findOneByOrFail(User, { id: user.id });
  //     }
  //
  //     const salida = manager.create(Salida, {
  //       almacenOrigenId: dto.almacenOrigenId,
  //       recibidaPor: dto.recibidaPor,
  //       authoriza: user.id
  //         ? ({ id: user.id } as DeepPartial<User>)
  //         : undefined,
  //       items: [],
  //     });
  //     await manager.save(salida);
  //
  //     const grouped = new Map<string, number>();
  //     for (const it of dto.items) {
  //       if (it.cantidad <= 0) {
  //         throw new BadRequestException(
  //           `Cantidad inválida para producto=${it.productoId}`
  //         );
  //       }
  //       grouped.set(
  //         it.productoId,
  //         (grouped.get(it.productoId) ?? 0) + it.cantidad
  //       );
  //     }
  //
  //     for (const [productoId, qty] of grouped.entries()) {
  //       const inv = await manager
  //         .createQueryBuilder(Inventario, 'inv')
  //         .setLock('pessimistic_write')
  //         .innerJoin('inv.producto', 'p')
  //         .innerJoin('inv.almacen', 'a')
  //         .where('a.id = :almacenId', { almacenId: dto.almacenOrigenId })
  //         .andWhere('p.id = :productoId', { productoId })
  //         .getOne();
  //
  //       if (!inv) {
  //         throw new BadRequestException(
  //           `No existe inventario para producto=${productoId} en almacén=${dto.almacenOrigenId}`
  //         );
  //       }
  //       if (inv.stock < qty) {
  //         throw new BadRequestException(
  //           `Stock insuficiente para producto=${productoId}. Disponible=${inv.stock}, solicitado=${qty}`
  //         );
  //       }
  //
  //       inv.stock -= qty;
  //       await manager.save(inv);
  //     }
  //
  //     for (const item of dto.items) {
  //       const salidaItem = manager.create(SalidaItem, {
  //         salida: { id: salida.id } as any,
  //         producto: { id: item.productoId } as DeepPartial<Producto>,
  //         cantidadRetirada: item.cantidad,
  //       });
  //       await manager.save(salidaItem);
  //     }
  //
  //     return await manager.findOneOrFail(Salida, {
  //       where: { id: salida.id },
  //       relations: {
  //         items: { producto: true },
  //         authoriza: true,
  //         almacenOrigen: true,
  //       },
  //     });
  //   });
  // }
  //
  // async findByAlmacen(
  //   almacenId: number,
  //   pagination: PaginationDto
  // ): Promise<PaginatedSalidaDto> {
  //   const { page = 1, limit = 10, order = 'DESC', search } = pagination;
  //   const skip = (page - 1) * limit;
  //
  //   // Base QB filtered by almacén
  //   const baseQB = this.salidaRepo
  //     .createQueryBuilder('s')
  //     .leftJoin('s.almacenOrigen', 'almacen')
  //     .where('s.almacen_origen_id = :almacenId', { almacenId });
  //
  //   // Optional free-text search across a few columns (adjust as needed)
  //   if (search) {
  //     const term = `%${search}%`;
  //     baseQB.andWhere(
  //       new Brackets((qb) => {
  //         qb.where('almacen.name ILIKE :term', { term })
  //           .orWhere('s.id::text ILIKE :term', { term })
  //           .orWhere('s.fecha::text ILIKE :term', { term });
  //       })
  //     );
  //   }
  //
  //   const totalItems = await baseQB.getCount();
  //   const totalPages = Math.ceil(totalItems / limit);
  //
  //   if (totalItems === 0) {
  //     return new PaginatedSalidaDto([], {
  //       currentPage: page,
  //       totalPages,
  //       totalItems,
  //       itemsPerPage: limit,
  //       hasNextPage: false,
  //       hasPreviousPage: false,
  //     });
  //   }
  //
  //   // Page of IDs only
  //   const ids = (
  //     await baseQB
  //       .clone()
  //       .select('s.id', 'id')
  //       .orderBy('s.fecha', order)
  //       .addOrderBy('s.id', order)
  //       .skip(skip)
  //       .take(limit)
  //       .getRawMany<{ id: number }>()
  //   ).map((r) => r.id);
  //
  //   if (ids.length === 0) {
  //     return new PaginatedSalidaDto([], {
  //       currentPage: page,
  //       totalPages,
  //       totalItems,
  //       itemsPerPage: limit,
  //       hasNextPage: page < totalPages,
  //       hasPreviousPage: page > 1,
  //     });
  //   }
  //
  //   // Load full rows for those IDs with selective selects
  //   const salidas = await this.salidaRepo
  //     .createQueryBuilder('s')
  //     .select(['s.id', 's.fecha', 's.recibidaPor'])
  //     .leftJoin('s.almacenOrigen', 'almacen')
  //     .addSelect(['almacen.id', 'almacen.name'])
  //     .leftJoin('s.authoriza', 'authoriza')
  //     .addSelect(['authoriza.id', 'authoriza.name'])
  //     .leftJoin('s.items', 'item')
  //     .addSelect(['item.id', 'item.cantidadRetirada'])
  //     .leftJoin('item.producto', 'producto')
  //     .addSelect(['producto.id', 'producto.name'])
  //     .where('s.id IN (:...ids)', { ids })
  //     .orderBy('s.fecha', order)
  //     .addOrderBy('s.id', order)
  //     .getMany();
  //
  //   // Map to DTO
  //   const data: GetSalidaDto[] = salidas.map((s) => ({
  //     id: s.id,
  //     fecha: s.fecha,
  //     almacenOrigen: {
  //       id: s.almacenOrigen?.id,
  //       name: s.almacenOrigen?.name,
  //     } as any,
  //     recibidaPor: s.recibidaPor,
  //     authoriza: s.authoriza
  //       ? { id: s.authoriza.id, name: s.authoriza.name }
  //       : null,
  //     items: (s.items ?? []).map((it) => ({
  //       id: it.id,
  //       cantidadRetirada: it.cantidadRetirada,
  //       producto: {
  //         id: it.producto.id,
  //         name: it.producto.name,
  //       },
  //     })),
  //   }));
  //
  //   return new PaginatedSalidaDto(data, {
  //     currentPage: page,
  //     totalPages,
  //     totalItems,
  //     itemsPerPage: limit,
  //     hasNextPage: page < totalPages,
  //     hasPreviousPage: page > 1,
  //   });
  // }

}
