import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { SwaggerAuthHeaders } from 'src/auth/decorators/auth.decorator';
import { ApiKeyGuard } from 'src/auth/guards/api-key.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/permiso.guard';
import { RequirePermissions } from 'src/auth/decorators/permiso.decorator';
import { CurrentPermissions } from 'src/auth/types/current-permissions';
import { GetUser } from 'src/auth/decorators/user.decorator';
import { User } from 'src/auth/entities/usuario.entity';
import { CreateProductoDto, ParamProductoID, UpdateProductoDto } from './dto/request.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  /* PRODUCTOS */

  @Post('add')
  @HttpCode(HttpStatus.OK)
  @SwaggerAuthHeaders()
  @UseGuards(ApiKeyGuard, JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(CurrentPermissions.CreateProduct)
  addProducto(
    @Body() dto: CreateProductoDto,
    @GetUser() user: User
  ) {
    return this.productosService.createProduct(dto, user)

  }

  @Get('all_productos')
  @SwaggerAuthHeaders()
  @UseGuards(ApiKeyGuard, JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(CurrentPermissions.ListProduct)
  findAll(
    @Query() dto: PaginationDto,
  ) {
    return this.productosService.findAll(dto)

  }

  @Get('find_producto/:id')
  @SwaggerAuthHeaders()
  @UseGuards(ApiKeyGuard, JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(CurrentPermissions.ListProduct)
  findOne(
    @Param() dto: ParamProductoID
  ) {
    return this.productosService.findOne(dto)
  }


  @Delete('delete_producto/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @SwaggerAuthHeaders()
  @UseGuards(ApiKeyGuard, JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(CurrentPermissions.DeleteProduct)
  deleteProducto(
    @Param() dto: ParamProductoID,
    @GetUser() user: User
  ) {
    return this.productosService.deleteProducto(dto, user)
  }

  @Patch('update_producto/:id')
  @SwaggerAuthHeaders()
  @UseGuards(ApiKeyGuard, JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(CurrentPermissions.UpdateProduct)
  updateProducto( 
    @Param() productoId: ParamProductoID,
    @Body() dto: UpdateProductoDto,
    @GetUser() user: User
  ) {
    return this.productosService.updateProducto(productoId, dto, user)
  }
}
