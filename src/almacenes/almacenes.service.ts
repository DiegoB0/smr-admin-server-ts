import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Almacen } from './entities/almacen.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { LogsService } from 'src/logs/logs.service';
import { User } from 'src/auth/entities/usuario.entity';
import { CreateAlmacenDto, ParamAlmacenID, UpdateAlmacenDto } from './dto/request.dto';
import { GetAlmacenDto, GetInventarioDto, PaginatedAlmacenDto, PaginatedInventarioDto } from './dto/response.dto';
import { PaginationDto, PaginationMetaData } from 'src/common/dto/pagination.dto';
import { Inventario } from './entities/inventario.entity';
import { StockInput } from './types/inventory-stock';

@Injectable()
export class AlmacenesService {
  constructor(
    @InjectRepository(Almacen)
    private almacenRepo: Repository<Almacen>,


    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Inventario)
    private inventarioRepo: Repository<Inventario>,

    private readonly logService: LogsService

  ) { }

  async createAlmacen(dto: CreateAlmacenDto, user: User): Promise<Almacen> {
    const { name, location } = dto

    const almacen = await this.almacenRepo.findOne({ where: { name } })

    if (almacen) throw new ConflictException('An almacen with that name already exists')

    const newAlmacen = this.almacenRepo.create({
      location: location,
      name: name,
      isActive: true
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


  async findAlmacenAdmins(): Promise<User[]> {
    return this.userRepo
      .createQueryBuilder('user')
      .leftJoin('user.usuarioRoles', 'usuarioRoles')
      .leftJoin('usuarioRoles.rol', 'rol')
      .leftJoin('user.almacenesEncargados', 'almacen')
      .where('rol.slug = :slug', { slug: 'admin-almacen' })
      .andWhere('almacen.id IS NULL')
      .getMany();
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

    const { location, isActive, name } = dto

    const almacen = await this.almacenRepo.findOne({ where: { id, isActive: true } })

    if (!almacen) throw new NotFoundException('Almacen not found')

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
  async addStock(almacenId: number, productId: string, cantidad: number = 1) {
    let inventario = await this.inventarioRepo.findOne({
      where: {
        almacen: { id: almacenId },
        producto: { id: productId }
      },
      relations: ['almacen', 'producto']
    })

    if (!inventario) {
      inventario = this.inventarioRepo.create({
        almacen: { id: almacenId },
        producto: { id: productId },
        stock: cantidad
      })
    } else {
      inventario.stock += cantidad;
    }

    return this.inventarioRepo.save(inventario);

  }

  async addMultipleStock(stockData: StockInput[]) {
    const updatedInventory: Inventario[] = [];

    for (const { almacenId, productId, cantidad } of stockData) {
      const inventario = await this.addStock(almacenId, productId, cantidad);
      updatedInventory.push(inventario);
    }

    return updatedInventory;

  }

  async removeStock(almacenId: number, productId: string, cantidad: number) {
    let inventario = await this.inventarioRepo.findOne({
      where: {
        almacen: { id: almacenId },
        producto: { id: productId }
      },
      relations: ['almacen', 'producto']
    })

    if (!inventario) throw new NotFoundException('No inventory found');

    if (inventario.stock < cantidad) throw new BadRequestException('No hay suficiente stock disponible')

    inventario.stock -= cantidad;

    return this.inventarioRepo.save(inventario);
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
            .orWhere('producto.id ILIKE :term', { term });
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

  async getProduct(almacenId: number, productId: string) {
    const inventario = await this.inventarioRepo.findOne({
      where: {
        almacen: { id: almacenId },
        producto: { id: productId }
      },
      relations: ['producto']
    })

    return inventario;
  }

}
