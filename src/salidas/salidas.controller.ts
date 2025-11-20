import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { SalidasService } from './salidas.service';
import { CreateSalidaDto } from './dto/request.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { SwaggerAuthHeaders } from 'src/auth/decorators/auth.decorator';
import { ApiKeyGuard } from 'src/auth/guards/api-key.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/permiso.guard';
import { RequirePermissions } from 'src/auth/decorators/permiso.decorator';
import { CurrentPermissions } from 'src/auth/types/current-permissions';
import { GetUser } from 'src/auth/decorators/user.decorator';
import { User } from 'src/auth/entities/usuario.entity';

@Controller('salidas')
export class SalidasController {
  constructor(private readonly salidasService: SalidasService) { }

  // @Post()
  // @SwaggerAuthHeaders()
  // @UseGuards(ApiKeyGuard, JwtAuthGuard, PermissionsGuard)
  // @RequirePermissions(CurrentPermissions.ListAlmacen)
  // create(
  //   @Body() dto: CreateSalidaDto,
  //   @GetUser() user: User
  // ) {
  //   return this.salidasService.create(dto, user);
  // }
  //
  // @Get('almacen/:almacenId')
  // findByAlmacen(
  //   @Param('almacenId', ParseIntPipe) almacenId: number,
  //   @Query() pagination: PaginationDto
  // ) {
  //   return this.salidasService.findByAlmacen(almacenId, pagination);
  // }
}
