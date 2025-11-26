import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Almacen } from './entities/almacen.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DeepPartial, Repository } from 'typeorm';
import { LogsService } from 'src/logs/logs.service';
import { User } from 'src/auth/entities/usuario.entity';
import { AddStockDto, CreateAlmacenDto, ParamAlmacenID, UpdateAlmacenDto } from './dto/request.dto';
import { GetAlmacenDto, GetInventarioDto, PaginatedAlmacenDto, PaginatedInventarioDto } from './dto/response.dto';
import { PaginationDto, PaginationMetaData } from 'src/common/dto/pagination.dto';
import { Inventario } from './entities/inventario.entity';
import { StockInput } from './types/inventory-stock';
import { Obra } from 'src/obras/entities/obra.entity';
import { Producto } from 'src/productos/entities/producto.entity';
import { Entrada } from 'src/entradas/entities/entrada.entity';
import { EntradaItem } from 'src/entradas/entities/entrada_item.entity';
import { EntradaStatus } from 'src/entradas/types/entradas-status';
import { SalidaItem } from 'src/salidas/entities/salida_item.entity';
import { Salida } from 'src/salidas/entities/salida.entity';

@Injectable()
export class AlmacenesService {
  constructor(
    @InjectRepository(Almacen)
    private almacenRepo: Repository<Almacen>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Inventario)
    private inventarioRepo: Repository<Inventario>,

    @InjectRepository(Producto)
    private productoRepo: Repository<Producto>,

    @InjectRepository(Entrada)
    private entradaRepo: Repository<Entrada>,

    @InjectRepository(EntradaItem)
    private entradaItemRepo: Repository<EntradaItem>,

    @InjectRepository(Salida)
    private salidaRepo: Repository<Salida>,

    @InjectRepository(SalidaItem)
    private salidaItemRepo: Repository<SalidaItem>,

    @InjectRepository(Obra)
    private obraRepo: Repository<Obra>,

    private readonly logService: LogsService

  ) { }

  async createAlmacen(dto: CreateAlmacenDto, user: User): Promise<Almacen> {
    const { name, location, obraId, encargadoId } = dto

    const almacen = await this.almacenRepo.findOne({ where: { name } })

    if (almacen) throw new ConflictException('An almacen with that name already exists')

    const obra = await this.obraRepo.findOne({ where: { id: obraId } })

    if (!obra) throw new NotFoundException('No se encontro la obra')


    const usuario = await this.userRepo.findOne({ where: { id: encargadoId } })

    if (!usuario) throw new NotFoundException('No se encontro la obra')

    const newAlmacen = this.almacenRepo.create({
      location: location,
      name: name,
      isActive: true,
      encargado: usuario,
      obra: obra
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


  async findAlmacenAdmins(currentAlmacenId?: number): Promise<User[]> {
    const query = this.userRepo
      .createQueryBuilder('user')
      .leftJoin('user.usuarioRoles', 'usuarioRoles')
      .leftJoin('usuarioRoles.rol', 'rol')
      .leftJoin('user.almacenesEncargados', 'almacen')
      .where('rol.slug = :slug', { slug: 'admin-almacen' });

    if (currentAlmacenId) {
      query.andWhere('(almacen.id IS NULL OR almacen.id = :currentAlmacenId)', {
        currentAlmacenId,
      });
    } else {
      query.andWhere('almacen.id IS NULL');
    }

    return query.getMany();
  }


  async findAlmacenes(
    pagination: PaginationDto,
    user: User
  ): Promise<PaginatedAlmacenDto> {
    const { page = 1, limit = 10 } = pagination;


    const almacenesEncargado = await this.almacenRepo
      .createQueryBuilder('almacen')
      .leftJoin('almacen.encargado', 'encargado')
      .addSelect(['encargado.name', 'encargado.id'])
      .leftJoin('almacen.obra', 'obra')
      .addSelect(['obra.name', 'obra.id'])
      .where('almacen.isActive = :isActive', { isActive: true })
      .getMany();

    if (almacenesEncargado.length === 0) {
      return new PaginatedAlmacenDto([], {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: limit,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    }

    const mappedAlmacenes: GetAlmacenDto[] = almacenesEncargado.map(
      (almacen) => ({
        id: almacen.id,
        location: almacen.location,
        isActive: almacen.isActive,
        name: almacen.name,
        encargadoName: almacen.encargado?.name || null,
        encargadoId: almacen.encargado?.id || null,
        obraName: almacen.obra?.name || null,
        obraId: almacen.obra?.id || null,
      })
    );

    return new PaginatedAlmacenDto(mappedAlmacenes, {
      currentPage: 1,
      totalPages: 1,
      totalItems: mappedAlmacenes.length,
      itemsPerPage: mappedAlmacenes.length,
      hasNextPage: false,
      hasPreviousPage: false,
    });
  }

  async findAll(
    pagination: PaginationDto,
    user: User
  ): Promise<PaginatedAlmacenDto> {
    const { page = 1, limit = 10, search, order = 'ASC' } = pagination;
    const skip = (page - 1) * limit;

    const userWithRoles = await this.userRepo.findOne({
      where: { id: user.id },
      relations: ['usuarioRoles', 'usuarioRoles.rol'],
    });


    if (!userWithRoles) {
      throw new NotFoundException(`User with ID ${user.id} not found`);
    }

    const isAdminAlmacen = userWithRoles.usuarioRoles.some(
      ur =>
        ur.rol?.name
          ?.toLowerCase()
          .replace(/\s+/g, '-')
          .trim() === 'admin-almacen'
    );

    if (isAdminAlmacen) {
      const almacenesEncargado = await this.almacenRepo
        .createQueryBuilder('almacen')
        .leftJoin('almacen.encargado', 'encargado')
        .addSelect(['encargado.name', 'encargado.id'])
        .leftJoin('almacen.obra', 'obra')
        .addSelect(['obra.name', 'obra.id'])
        .where('almacen.isActive = :isActive', { isActive: true })
        .andWhere('encargado.id = :userId', { userId: user.id })
        .getMany();

      if (almacenesEncargado.length === 0) {
        return new PaginatedAlmacenDto([], {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: limit,
          hasNextPage: false,
          hasPreviousPage: false,
        });
      }

      const mappedAlmacenes: GetAlmacenDto[] = almacenesEncargado.map(
        (almacen) => ({
          id: almacen.id,
          location: almacen.location,
          isActive: almacen.isActive,
          name: almacen.name,
          encargadoName: almacen.encargado?.name || null,
          encargadoId: almacen.encargado?.id || null,
          obraName: almacen.obra?.name || null,
          obraId: almacen.obra?.id || null,
        })
      );

      return new PaginatedAlmacenDto(mappedAlmacenes, {
        currentPage: 1,
        totalPages: 1,
        totalItems: mappedAlmacenes.length,
        itemsPerPage: mappedAlmacenes.length,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    }

    const queryBuilder = this.almacenRepo
      .createQueryBuilder('almacen')
      .leftJoin('almacen.encargado', 'encargado')
      .addSelect(['encargado.name', 'encargado.id'])
      .leftJoin('almacen.obra', 'obra')
      .addSelect(['obra.name', 'obra.id'])
      .where('almacen.isActive = :isActive', { isActive: true });

    if (search) {
      const term = `%${search}%`;
      queryBuilder.andWhere(
        new Brackets((qb2) => {
          qb2
            .where('almacen.name ILIKE :term', { term })
            .orWhere('almacen.location ILIKE :term', { term })
            .orWhere('encargado.name ILIKE :term', { term });
        })
      );
    }

    queryBuilder.orderBy('almacen.name', order);

    const [almacenes, totalItems] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(totalItems / limit);

    const mappedAlmacenes: GetAlmacenDto[] = almacenes.map((almacen) => ({
      id: almacen.id,
      location: almacen.location,
      isActive: almacen.isActive,
      name: almacen.name,
      encargadoName: almacen.encargado?.name || null,
      encargadoId: almacen.encargado?.id || null,
      obraName: almacen.obra?.name || null,
      obraId: almacen.obra?.id || null,
    }));

    return new PaginatedAlmacenDto(mappedAlmacenes, {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    });
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

    const { location, isActive, name, encargadoId, obraId } = dto

    const almacen = await this.almacenRepo.findOne({ where: { id, isActive: true } })

    if (!almacen) throw new NotFoundException('Almacen not found')

    const obra = await this.obraRepo.findOne({ where: { id: obraId } })

    if (!obra) throw new NotFoundException('No se encontro la obra')

    if (obraId) {
      almacen.obra = obra
    }

    const usuario = await this.userRepo.findOne({ where: { id: encargadoId } })

    if (!usuario) throw new NotFoundException('No se encontro la obra')

    if (encargadoId) {
      almacen.encargado = usuario
    }


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

  /* PRODUCTOS POR ALMACEN */

  // Add one to stock
  async addStockWithEntrada(
    almacenId: number,
    dto: AddStockDto,
    user: User
  ): Promise<Inventario> {
    let productId = dto.productId;

    // Create product if needed
    if (!productId && dto.productName) {
      const producto = this.productoRepo.create({
        name: dto.productName,
        description: dto.productDescription || dto.productName,
        unidad: dto.unidad || 'unidad',
        isActive: true,
      });
      const savedProducto = await this.productoRepo.save(producto);
      productId = savedProducto.id;
    }

    if (!productId) {
      throw new BadRequestException(
        'Product ID or product name required',
      );
    }

    const inventario = await this.addStock(
      almacenId,
      productId,
      dto.cantidad,
    );

    // Create entrada if requested
    if (dto.createEntrada) {
      const almacen = await this.almacenRepo.findOne({
        where: { id: almacenId },
      });

      if (!almacen) {
        throw new NotFoundException('Almacen not found');
      }

      const entradaItem = this.entradaItemRepo.create({
        cantidadEsperada: dto.cantidad,
        cantidadRecibida: dto.cantidad,
        descripcion: inventario.producto.name,
        unidad: inventario.producto.unidad,
      });

      const savedItem = await this.entradaItemRepo.save(entradaItem);

      const today = new Date().toISOString().split('T')[0];
      const entrada = this.entradaRepo.create({
        fechaRecibida: today,
        recibidoPor: user,
        status: EntradaStatus.RECIBIDA,
        almacenDestino: almacen,
        items: [savedItem],
      });

      await this.entradaRepo.save(entrada);
    }

    return inventario;
  }

  async addMultipleStock(
    almacenId: number,
    stockData: AddStockDto[],
    user: User
  ): Promise<Inventario[]> {
    const updatedInventory: Inventario[] = [];

    for (const data of stockData) {
      const inventario = await this.addStockWithEntrada(
        almacenId,
        data,
        user,
      );
      updatedInventory.push(inventario);
    }

    return updatedInventory;
  }


  async removeStock(
    almacenId: number,
    productId: number,
    cantidad: number,
    prestadaPara?: string,
    user?: User
  ) {
    let inventario = await this.inventarioRepo.findOne({
      where: {
        almacen: { id: almacenId },
        producto: { id: productId }
      },
      relations: ['almacen', 'producto']
    })

    if (!inventario) throw new NotFoundException('No inventory found');

    if (inventario.stock < cantidad)
      throw new BadRequestException('No hay suficiente stock disponible')

    inventario.stock -= cantidad;
    await this.inventarioRepo.save(inventario);

    if (prestadaPara) {
      const almacen = await this.almacenRepo.findOne({
        where: { id: almacenId }
      });

      if (!almacen) throw new NotFoundException('Almacen not found');

      const salidaItem = this.salidaItemRepo.create({
        cantidadRetirada: cantidad,
        producto: inventario.producto,
      });

      const salida = this.salidaRepo.create({
        almacenOrigenId: almacenId,
        prestadaPara,
        authoriza: user ? ({ id: user.id } as DeepPartial<User>) : undefined,
        items: [salidaItem],
      });

      await this.salidaRepo.save(salida);
    }

    return inventario;
  }


  async getProducts(almacenId: number, pagination: PaginationDto): Promise<PaginatedInventarioDto> {
    const { page = 1, limit = 10, search, order = 'ASC' } = pagination;
    const skip = (page - 1) * limit;

    const queryBuilder = this.inventarioRepo.createQueryBuilder('inventario')
      .leftJoinAndSelect('inventario.producto', 'producto')
      .where('inventario.almacenId = :almacenId', { almacenId })
      .andWhere('inventario.stock > 0');


    if (search) {
      const term = `%${search}%`;
      queryBuilder.andWhere(
        new Brackets(qb => {
          qb.where('producto.name ILIKE :term', { term })
            .orWhere('producto.id::text ILIKE :term', { term })
            .orWhere('producto.customId ILIKE :term', { term });
        }),
      );
    }

    queryBuilder.orderBy('producto.name', order);

    const [inventarios, totalItems] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    const mappedInventario: GetInventarioDto[] = inventarios.map((inv) => ({
      id: inv.id,
      producto: inv.producto,
      stock: inv.stock,
    }));

    const meta: PaginationMetaData = {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      hasNextPage,
      hasPreviousPage,
    };

    return new PaginatedInventarioDto(mappedInventario, meta);
  }

  async getProduct(almacenId: number, productId: number) {
    const inventario = await this.inventarioRepo.findOne({
      where: {
        almacen: { id: almacenId },
        producto: { id: productId }
      },
      relations: ['producto']
    })

    return inventario;
  }


  private async addStock(
    almacenId: number,
    productId: number,
    cantidad: number = 1,
  ): Promise<Inventario> {
    let inventario = await this.inventarioRepo.findOne({
      where: {
        almacen: { id: almacenId },
        producto: { id: productId },
      },
      relations: ['almacen', 'producto'],
    });

    if (!inventario) {
      // Fetch the producto to ensure we have all its data
      const producto = await this.productoRepo.findOne({
        where: { id: productId },
      });

      if (!producto) {
        throw new NotFoundException(`Producto with ID ${productId} not found`);
      }

      inventario = this.inventarioRepo.create({
        almacen: { id: almacenId },
        producto,
        stock: cantidad,
      });

      const savedInventario = await this.inventarioRepo.save(inventario);

      // Reload to get full relations
      const reloadedInventario = await this.inventarioRepo.findOne({
        where: { id: savedInventario.id },
        relations: ['almacen', 'producto'],
      });

      if (!reloadedInventario) {
        throw new NotFoundException('Failed to reload inventario');
      }

      return reloadedInventario;
    }

    inventario.stock += cantidad;
    const updatedInventario = await this.inventarioRepo.save(inventario);

    // Reload to ensure relations are populated
    const reloadedInventario = await this.inventarioRepo.findOne({
      where: { id: updatedInventario.id },
      relations: ['almacen', 'producto'],
    });

    if (!reloadedInventario) {
      throw new NotFoundException('Failed to reload inventario');
    }

    return reloadedInventario;
  }

}
