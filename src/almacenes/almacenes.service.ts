import { BadRequestException, ConflictException, Injectable, NotFoundException, UploadedFile } from '@nestjs/common';
import { Almacen } from './entities/almacen.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DeepPartial, In, Repository } from 'typeorm';
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
import { AlmacenEncargado } from './entities/almacenEncargados.entity';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class AlmacenesService {
  constructor(
    @InjectRepository(Almacen)
    private almacenRepo: Repository<Almacen>,


    @InjectRepository(AlmacenEncargado)
    private almacenEncargadoRepo: Repository<AlmacenEncargado>,

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

    @InjectQueue('excel-queue') private excelQueue: Queue,

    private readonly logService: LogsService

  ) { }

  async createAlmacen(
    dto: CreateAlmacenDto,
    user: User,
  ): Promise<Almacen> {
    const { name, location, obraId, encargadoIds } = dto;

    const almacen = await this.almacenRepo.findOne({ where: { name } });

    if (almacen)
      throw new ConflictException(
        'An almacen with that name already exists',
      );

    const obra = await this.obraRepo.findOne({ where: { id: obraId } });

    if (!obra) throw new NotFoundException('No se encontro la obra');

    const newAlmacen = this.almacenRepo.create({
      location,
      name,
      isActive: true,
      obra,
    });

    const savedAlmacen = await this.almacenRepo.save(newAlmacen);

    if (encargadoIds && encargadoIds.length > 0) {
      const usuarios = await this.userRepo.find({
        where: { id: In(encargadoIds) },
      });

      if (usuarios.length !== encargadoIds.length) {
        throw new NotFoundException('Uno o más usuarios no encontrados');
      }

      const encargadoRelations = usuarios.map((u) => ({
        almacen: savedAlmacen,
        user: u,
      }));

      await this.almacenEncargadoRepo.save(encargadoRelations);
    }

    // Reload with relations
    const result = await this.almacenRepo.findOne({
      where: { id: savedAlmacen.id },
      relations: ['encargados', 'encargados.user'],
    });

    if (!result) throw new NotFoundException('Error loading almacen');

    const logData = {
      id: result.id,
      name: result.name,
      location: result.location,
      isActive: result.isActive,
      encargadosCount: result.encargados?.length || 0,
    };

    await this.logService.createLog(
      user,
      `El usuario ${user.name} creo el almacen ${result.name}`,
      'CREATE_ALMACEN',
      JSON.stringify(logData),
    );

    return {
      ...result,
      encargados: result.encargados?.map((ae) => ({
        id: ae.id,
        user: {
          id: ae.user.id,
          name: ae.user.name,
        },
      })) || [],
    } as Almacen;
  }


  async findAllAdminAlmacenUsers() {
    return await this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.usuarioRoles', 'usuarioRol')
      .leftJoinAndSelect('usuarioRol.rol', 'rol')
      .where('rol.slug = :slug', { slug: 'admin-almacen' })
      .andWhere('user.isActive = :isActive', { isActive: true })
      .select(['user.id', 'user.name', 'user.email'])
      .getMany();
  }


  async findAlmacenes(
    pagination: PaginationDto,
    user: User,
  ): Promise<PaginatedAlmacenDto> {
    const { page = 1, limit = 10 } = pagination;

    const almacenesEncargado = await this.almacenRepo
      .createQueryBuilder('almacen')
      .leftJoinAndSelect('almacen.encargados', 'encargado')
      .leftJoinAndSelect('encargado.user', 'user')
      .leftJoinAndSelect('almacen.obra', 'obra')
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
        encargados: almacen.encargados?.map((ae) => ({
          id: ae.user.id,
          name: ae.user.name,
        })) || [],
        obraName: almacen.obra?.name || null,
        obraId: almacen.obra?.id || null,
      }),
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
    user: User,
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
      (ur) =>
        ur.rol?.name
          ?.toLowerCase()
          .replace(/\s+/g, '-')
          .trim() === 'admin-almacen',
    );

    const mapAlmacenes = (almacenes: Almacen[]): GetAlmacenDto[] =>
      almacenes.map((almacen) => ({
        id: almacen.id,
        location: almacen.location,
        isActive: almacen.isActive,
        name: almacen.name,
        encargados: almacen.encargados?.map((ae) => ({
          id: ae.user.id,
          name: ae.user.name,
        })) || [],
        obraName: almacen.obra?.name || null,
        obraId: almacen.obra?.id || null,
      }));

    if (isAdminAlmacen) {
      const almacenesEncargado = await this.almacenRepo
        .createQueryBuilder('almacen')
        .leftJoinAndSelect('almacen.encargados', 'encargado')
        .leftJoinAndSelect('encargado.user', 'user')
        .leftJoinAndSelect('almacen.obra', 'obra')
        .where('almacen.isActive = :isActive', { isActive: true })
        .andWhere('user.id = :userId', { userId: user.id })
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

      const mappedAlmacenes = mapAlmacenes(almacenesEncargado);

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
      .leftJoinAndSelect('almacen.encargados', 'encargado')
      .leftJoinAndSelect('encargado.user', 'user')
      .leftJoinAndSelect('almacen.obra', 'obra')
      .where('almacen.isActive = :isActive', { isActive: true });

    if (search) {
      const term = `%${search}%`;
      queryBuilder.andWhere(
        new Brackets((qb2) => {
          qb2
            .where('almacen.name ILIKE :term', { term })
            .orWhere('almacen.location ILIKE :term', { term })
            .orWhere('user.name ILIKE :term', { term });
        }),
      );
    }

    queryBuilder.orderBy('almacen.name', order);

    const [almacenes, totalItems] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(totalItems / limit);
    const mappedAlmacenes = mapAlmacenes(almacenes);

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

  async updateAlmacen(
    almacenId: ParamAlmacenID,
    dto: UpdateAlmacenDto,
    user: User,
  ): Promise<Almacen> {
    const { id } = almacenId;
    const { location, isActive, name, encargadoIds, obraId } = dto;

    const almacen = await this.almacenRepo.findOne({
      where: { id, isActive: true },
    });

    if (!almacen) throw new NotFoundException('Almacen not found');

    if (obraId) {
      const obra = await this.obraRepo.findOne({ where: { id: obraId } });
      if (!obra) throw new NotFoundException('Obra no encontrada');
      almacen.obra = obra;
    }

    if (location !== undefined) almacen.location = location;
    if (isActive !== undefined) almacen.isActive = isActive;
    if (name !== undefined) almacen.name = name;

    // SAVE ALMACEN FIRST
    const savedAlmacen = await this.almacenRepo.save(almacen);

    // THEN handle encargados
    if (encargadoIds && encargadoIds.length > 0) {
      const usuarios = await this.userRepo.find({
        where: { id: In(encargadoIds) },
      });
      if (usuarios.length !== encargadoIds.length) {
        throw new NotFoundException('Uno o más usuarios no encontrados');
      }

      // Delete old relationships
      await this.almacenEncargadoRepo.delete({ almacen: { id: savedAlmacen.id } });

      // Create new relationships
      const encargadoRelations = usuarios.map((u) => ({
        almacen: savedAlmacen,
        user: u,
      }));

      await this.almacenEncargadoRepo.save(encargadoRelations);
    }

    // Reload with relations
    const result = await this.almacenRepo.findOne({
      where: { id: savedAlmacen.id },
      relations: ['encargados', 'encargados.user'],
    });

    if (!result) throw new NotFoundException('Error reloading almacen');

    const logData = {
      id: result.id,
      name: result.name,
      location: result.location,
      isActive: result.isActive,
      encargadosCount: result.encargados?.length || 0,
    };

    await this.logService.createLog(
      user,
      `El usuario ${user.name} actualizo el almacen ${result.name}`,
      'UPDATE_ALMACEN',
      JSON.stringify(logData),
    );

    return {
      ...result,
      encargados: result.encargados?.map((ae) => ({
        id: ae.id,
        user: {
          id: ae.user.id,
          name: ae.user.name,
        },
      })) || [],
    } as Almacen;
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
        customId: dto.customId,
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
        customId: inventario.producto.customId,
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

    const isUnlimited = limit === -1;
    const skip = isUnlimited ? 0 : (page - 1) * limit;
    const takeLimit = isUnlimited ? undefined : limit;

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
      .take(takeLimit)
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

  async queueExcelUpload(almacenId: number, user: User, items: any[]) {
    const job = await this.excelQueue.add(
      'process-excel',
      {
        items,
        almacenId,
        userId: user.id,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      }
    );

    return {
      message: 'Excel import queued for processing',
      status: 'processing',
      jobId: job.id,
      totalItems: items.length,
    };
  }

  async getJobStatus(jobId: string) {
    try {
      const job = await this.excelQueue.getJob(jobId);

      if (!job) {
        throw new NotFoundException('Job not found');
      }

      const state = await job.getState();
      const progress = job.progress();

      return {
        jobId,
        state,
        progress,
        result: job.returnvalue,
      };
    } catch (error) {
      throw new NotFoundException('Job not found or error retrieving status');
    }
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
