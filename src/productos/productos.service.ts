import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Producto } from './entities/producto.entity';
import { Brackets, Repository } from 'typeorm';
import { LogsService } from 'src/logs/logs.service';
import { CreateProductoDto, ParamProductoID, UpdateProductoDto } from './dto/request.dto';
import { User } from 'src/auth/entities/usuario.entity';
import { PaginationDto, PaginationMetaData } from 'src/common/dto/pagination.dto';
import { GetProductDto, PaginatedProductoDto } from './dto/response.dto';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private productRepo: Repository<Producto>,


    private readonly logService: LogsService

  ) { }

  /*
   * PRODUCTS ARE JUST LIKE A BLUEPRINT
   * All these are just a menu. The actual quantity is on inventory
  */
  async createProduct(dto: CreateProductoDto, user: User): Promise<Producto> {
    // TODO: Add all the products to all the almacenes with 0 by default
    const { id, name, description, unidad } = dto

    const producto = await this.productRepo.findOne({ where: { id } })

    if (producto) throw new ConflictException('A product with that id already exists')

    const newProducto = this.productRepo.create({
      id: id,
      name: name,
      isActive: true,
      description: description,
      unidad: unidad,
      imageUrl: ''
    })

    const savedProducto = this.productRepo.save(newProducto)

    await this.logService.createLog(
      user,
      `El usuario ${user.name} creo el producto ${newProducto.name}`,
      'CREATE_PRODUCTO',
      JSON.stringify(savedProducto),
    )

    return savedProducto;
  }

  async findAll(pagination: PaginationDto): Promise<PaginatedProductoDto> {

    const { page = 1, limit = 10, search, order = 'ASC' } = pagination;

    const skip = (page - 1) * limit;

    const queryBuilder = this.productRepo.createQueryBuilder('producto');

    queryBuilder.where({ isActive: true });

    if (search) {
      const term = `%${search}%`;
      queryBuilder.andWhere(new Brackets(qb2 => {
        qb2
          .where('producto.name ILIKE :term', { term })
          .orWhere('producto.id ILIKE :term', { term });
      }));
    }

    queryBuilder.orderBy('producto.name', order);

    const [productos, totalItems] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount()

    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    // Map fields to JSON Data
    const mappedProductos: GetProductDto[] = productos.map((producto) => ({
      id: producto.id,
      name: producto.name,
      description: producto.description,
      unidad: producto.unidad,
      imageUrl: producto.imageUrl,
      isActive: producto.isActive,
    }))

    const meta: PaginationMetaData = {
      currentPage: page,
      totalPages: totalPages,
      totalItems: totalItems,
      itemsPerPage: limit,
      hasNextPage: hasNextPage,
      hasPreviousPage: hasPreviousPage,
    }

    return new PaginatedProductoDto(mappedProductos, meta)
  }

  async findOne(dto: ParamProductoID): Promise<GetProductDto> {
    const { id } = dto

    const producto = await this.productRepo.findOne({ where: { id, isActive: true } })

    if (!producto) throw new NotFoundException('Product not found')

    const mappedProducto: GetProductDto = {
      id: producto.id,
      name: producto.name,
      description: producto.description,
      unidad: producto.unidad,
      imageUrl: producto.imageUrl,
      isActive: producto.isActive,
    };

    return mappedProducto
  }


  async deleteProducto(dto: ParamProductoID, user: User) {
    const { id } = dto

    const producto = await this.productRepo.findOne({ where: { id, isActive: true } })

    if (!producto) throw new NotFoundException('Producto not found')

    producto.isActive = false

    this.productRepo.save(producto)

    await this.logService.createLog(
      user,
      `El usuario ${user.name} elimino el producto ${producto.name}`,
      'DELETE_PRODUCTO',
      JSON.stringify(producto),
    )

    return { message: 'Producto deleted successfully' }

  }

  async updateProducto(almacenId: ParamProductoID, dto: UpdateProductoDto, user: User): Promise<Producto> {

    const { id } = almacenId

    const { isActive, name, description, unidad } = dto

    const producto = await this.productRepo.findOne({ where: { id, isActive: true } })

    if (!producto) throw new NotFoundException('Producto not found')

    if (isActive !== undefined) {
      producto.isActive = isActive;
    }

    if (description !== undefined) {
      producto.description = description;
    }

    if (unidad !== undefined) {
      producto.unidad = unidad;
    }

    if (name !== undefined) {
      producto.name = name;
    }

    this.productRepo.save(producto)

    await this.logService.createLog(
      user,
      `El usuario ${user.name} actualizo el producto ${producto.name}`,
      'UPDATE_ALMACEN',
      JSON.stringify(producto),
    )

    return producto
  }

}
