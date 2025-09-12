import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { RequisicionesService } from './requisiciones.service';
import { GetUser } from 'src/auth/decorators/user.decorator';
import { User } from 'src/auth/entities/usuario.entity';
import { SwaggerAuthHeaders } from 'src/auth/decorators/auth.decorator';
import { ApiKeyGuard } from 'src/auth/guards/api-key.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/permiso.guard';
import { CurrentPermissions } from 'src/auth/types/current-permissions';
import { RequirePermissions } from 'src/auth/decorators/permiso.decorator';
import { CreatePeticionProductoDto, CreateRequisicionDto, CreateServiceRequisicionDto, UpdatePeticionProductoDto } from './dto/request.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ReporteQueryDto } from './dto/response.dto';

@Controller('requisiciones')
export class RequisicionesController {
  constructor(private readonly requisicionesService: RequisicionesService) { }
  /* REPORTES */
  @Post('reportes/add')
  @HttpCode(HttpStatus.OK)
  @SwaggerAuthHeaders()
  @UseGuards(ApiKeyGuard, JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(CurrentPermissions.CreateReport)
  createReport(
    @Body() dto: CreatePeticionProductoDto,
    @GetUser() user: User
  ) {
    return this.requisicionesService.createPeticionProducto(dto, user)

  }

  @Get('reportes/all_reports')
  @SwaggerAuthHeaders()
  @UseGuards(ApiKeyGuard, JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(CurrentPermissions.ListReport)
  findAll(
    @Query() dto: PaginationDto,
  ) {
    return this.requisicionesService.getAllPeticiones(dto)

  }


  @Get('reportes/aproved_reports')
  @SwaggerAuthHeaders()
  @UseGuards(ApiKeyGuard, JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(CurrentPermissions.ListReport)
  findApprovedReports(
    @Query() dto: PaginationDto,
  ) {
    return this.requisicionesService.getAllPeticionesAprobadas(dto)

  }


  @Get('reportes/reports_by_user')
  @SwaggerAuthHeaders()
  @UseGuards(ApiKeyGuard, JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(CurrentPermissions.ListReport)
  findOne(
    @Query() dto: ReporteQueryDto,
  ) {
    return this.requisicionesService.getPeticionesByUser(dto)
  }

  @Patch('reportes/update_report/:id')
  @SwaggerAuthHeaders()
  @UseGuards(ApiKeyGuard, JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(CurrentPermissions.EditReport)
  updateReport(
    @Param('id') id: number,
    @Body() dto: UpdatePeticionProductoDto,
    @GetUser() user: User
  ) {
    return this.requisicionesService.updatePeticionProducto(id, dto, user)
  }

  @Patch('reportes/:id/approve')
  @SwaggerAuthHeaders()
  @UseGuards(ApiKeyGuard, JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(CurrentPermissions.AcceptReport)
  approvePeticion(
    @Param('id') id: number,
    @GetUser() user: User
  ) {
    return this.requisicionesService.approvePeticionProducto(id, user);
  }

  @Patch('reportes/:id/reject')
  @SwaggerAuthHeaders()
  @UseGuards(ApiKeyGuard, JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(CurrentPermissions.AcceptReport)
  rejectPeticion(
    @Param('id') id: number,
    @GetUser() user: User
  ) {
    return this.requisicionesService.rejectPeticionProducto(id, user);
  }

  /* REQUISICIONES */

  // Requisiciones de productos (relacionadas con reportes)
  @Post('create_requisicion')
  @SwaggerAuthHeaders()
  @UseGuards(ApiKeyGuard, JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(CurrentPermissions.CreateRequisicion)
  createRequisicion(
    @Body() dto: CreateRequisicionDto,
    @GetUser() user: User
  ) {
    return this.requisicionesService.createRequisicion(dto, user);
  }


  // Requisiciones de servicios
  @Post('create_service_requisicion')
  @SwaggerAuthHeaders()
  @UseGuards(ApiKeyGuard, JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(CurrentPermissions.CreateRequisicion)
  createServiceRequisicion(
    @Body() dto: CreateServiceRequisicionDto,
    @GetUser() user: User
  ) {
    return this.requisicionesService.createServiceRequisicion(dto, user);
  }

  @Get('all_requisiciones')
  @SwaggerAuthHeaders()
  @UseGuards(ApiKeyGuard, JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(CurrentPermissions.ListRequisicion)
  getAllRequisiciones() {
    return this.requisicionesService.getAllRequisiciones();
  }

  @Patch(':id/approve')
  @SwaggerAuthHeaders()
  @UseGuards(ApiKeyGuard, JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(CurrentPermissions.AcceptRequisicion)
  acceptRequisicion(@Param('id') id: number, @GetUser() user: User) {
    return this.requisicionesService.acceptRequisicion(id, user);
  }

  @Patch(':id/reject')
  @SwaggerAuthHeaders()
  @UseGuards(ApiKeyGuard, JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(CurrentPermissions.AcceptRequisicion)
  rejectRequisicion(@Param('id') id: number, @GetUser() user: User) {
    return this.requisicionesService.rejectRequisicion(id, user);
  }
}
