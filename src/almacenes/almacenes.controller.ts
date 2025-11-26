import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { User } from 'src/auth/entities/usuario.entity';
import { AlmacenesService } from './almacenes.service';
import { GetUser } from 'src/auth/decorators/user.decorator';
import { RequirePermissions } from 'src/auth/decorators/permiso.decorator';
import { CurrentPermissions } from 'src/auth/types/current-permissions';
import { PermissionsGuard } from 'src/auth/guards/permiso.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiKeyGuard } from 'src/auth/guards/api-key.guard';
import { SwaggerAuthHeaders } from 'src/auth/decorators/auth.decorator';
import { AddMultipleStockDto, AddStockDto, CreateAlmacenDto, ParamAlmacenID, UpdateAlmacenDto } from './dto/request.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Inventario } from './entities/inventario.entity';
import { ParamProductoID } from 'src/productos/dto/request.dto';
import { InventoryQueryDto } from './dto/response.dto';

@Controller('almacenes')
export class AlmacenesController {
  constructor(private readonly almacenesService: AlmacenesService) { }

  @Post('add')
  @HttpCode(HttpStatus.OK)
  @SwaggerAuthHeaders()
  @UseGuards(ApiKeyGuard, JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(CurrentPermissions.CreateAlmacen)
  addAlmacen(
    @Body() dto: CreateAlmacenDto,
    @GetUser() user: User
  ) {
    return this.almacenesService.createAlmacen(dto, user)

  }

  @Get('all_almacenes')
  @SwaggerAuthHeaders()
  @UseGuards(ApiKeyGuard, JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(CurrentPermissions.ListAlmacen)
  findAll(
    @Query() dto: PaginationDto,
    @GetUser() user: User
  ) {
    return this.almacenesService.findAll(dto, user)

  }

  @Get('find_almacenes')
  @SwaggerAuthHeaders()
  @UseGuards(ApiKeyGuard, JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(CurrentPermissions.ListAlmacen)
  findAlmacenes(
    @Query() dto: PaginationDto,
    @GetUser() user: User
  ) {
    return this.almacenesService.findAlmacenes(dto, user)

  }

  @Get('find_almacen/:id')
  @SwaggerAuthHeaders()
  @UseGuards(ApiKeyGuard, JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(CurrentPermissions.ListAlmacen)
  findOne(
    @Param() dto: ParamAlmacenID
  ) {
    return this.almacenesService.findOne(dto)
  }


  @Delete('delete_almacen/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @SwaggerAuthHeaders()
  @UseGuards(ApiKeyGuard, JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(CurrentPermissions.DeleteAlmacen)
  deleteAlmacen(
    @Param() dto: ParamAlmacenID,
    @GetUser() user: User
  ) {
    return this.almacenesService.deleteAlmacen(dto, user)
  }

  @Patch('update_almacen/:id')
  @SwaggerAuthHeaders()
  @UseGuards(ApiKeyGuard, JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(CurrentPermissions.UpdateAlmacen)
  updateAlmacen(
    @Param() almacenId: ParamAlmacenID,
    @Body() dto: UpdateAlmacenDto,
    @GetUser() user: User
  ) {
    return this.almacenesService.updateAlmacen(almacenId, dto, user)
  }


  @Post('products/add_stock')
  @SwaggerAuthHeaders()
  @UseGuards(ApiKeyGuard, JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(CurrentPermissions.AddStock)
  async addStock(
    @Body() dto: AddStockDto,
    @GetUser() user: User
  ): Promise<Inventario> {
    return this.almacenesService.addStockWithEntrada(dto.almacenId, dto, user)

  }

  @Post('products/add_multiple_stock')
  @SwaggerAuthHeaders()
  @UseGuards(ApiKeyGuard, JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(CurrentPermissions.AddStock)
  async addMultipleStock(
    @Body() dto: AddMultipleStockDto,
    @GetUser() user: User
  ): Promise<Inventario[]> {
    return this.almacenesService.addMultipleStock(
      dto.almacenId,
      dto.stockData,
      user
    );
  }

  @Get('products/get_products')
  @SwaggerAuthHeaders()
  @UseGuards(ApiKeyGuard, JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(CurrentPermissions.ListStock)
  async getProducts(
    @Query() dto: InventoryQueryDto,
  ) {
    const { almacenId, ...pagination } = dto;
    return await this.almacenesService.getProducts(almacenId, pagination)
  }

  @Get('products/find_product')
  @SwaggerAuthHeaders()
  @UseGuards(ApiKeyGuard, JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(CurrentPermissions.ListStock)
  async getProduct(
    @Query('almacenId') almacenId: number,
    @Query('productId') productId: number,
  ) {
    return await this.almacenesService.getProduct(almacenId, productId)
  }


  @Delete('products/remove_stock')
  @SwaggerAuthHeaders()
  @UseGuards(ApiKeyGuard, JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(CurrentPermissions.RemoveStock)
  async removeStock(
    @Query('almacenId', ParseIntPipe) almacenId: number,
    @Query('productId') productId: number,
    @Query('cantidad', ParseIntPipe) cantidad: number,
    @Query('prestadaPara') prestadaPara: string,
    @GetUser() user: User
  ) {
    return this.almacenesService.removeStock(almacenId, productId, cantidad, prestadaPara, user)
  }

  // GET ALL THE ADMIN USERS
  @Get('encargados/all_encargados')
  @SwaggerAuthHeaders()
  @UseGuards(ApiKeyGuard, JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(CurrentPermissions.ListUser)
  async getEncargados(
    @Query('almacenId') almacenId?: string
  ) {
    const id = almacenId ? Number(almacenId) : undefined;
    return this.almacenesService.findAlmacenAdmins(id)
  }

}
