import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Entrada } from './entities/entrada.entity';
import { Repository } from 'typeorm';
import { EntradaItem } from './entities/entrada_item.entity';
import { EntradaStatus } from './types/entradas-status';
import { Inventario } from 'src/almacenes/entities/inventario.entity';

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

  async findAll() {
    return this.entradaRepo
      .createQueryBuilder('entrada')
      .leftJoinAndSelect('entrada.items', 'items')
      .leftJoin('items.producto', 'producto')
      .addSelect(['producto.id', 'producto.name'])
      .leftJoin('entrada.almacenDestino', 'almacen')
      .addSelect(['almacen.id', 'almacen.name'])
      .leftJoin('entrada.creadoPor', 'creadoPor')
      .addSelect(['creadoPor.id', 'creadoPor.name'])
      .leftJoin('entrada.requisicion', 'requisicion')
      .addSelect(['requisicion.id', 'requisicion.rcp'])
      .orderBy('entrada.fechaCreacion', 'DESC')
      .getMany();
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
