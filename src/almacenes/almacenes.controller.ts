import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { User } from 'src/auth/entities/usuario.entity';
import { AlmacenesService } from './almacenes.service';
import { GetUser } from 'src/auth/decorators/user.decorator';
import { RequirePermissions } from 'src/auth/decorators/permiso.decorator';
import { CurrentPermissions } from 'src/auth/types/current-permissions';
import { PermissionsGuard } from 'src/auth/guards/permiso.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiKeyGuard } from 'src/auth/guards/api-key.guard';
import { SwaggerAuthHeaders } from 'src/auth/decorators/auth.decorator';
import { CreateAlmacenDto, ParamAlmacenID, UpdateAlmacenDto } from './dto/request.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('almacenes')
export class AlmacenesController {
  constructor(private readonly almacenesService: AlmacenesService) {}

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
  ) {
    return this.almacenesService.findAll(dto)

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


  // TODO: Controllers to get the stock of products per almacen

}
