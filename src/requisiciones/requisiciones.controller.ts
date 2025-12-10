import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { RequisicionesService } from './requisiciones.service';
import { GetUser } from 'src/auth/decorators/user.decorator';
import { User } from 'src/auth/entities/usuario.entity';
import { SwaggerAuthHeaders } from 'src/auth/decorators/auth.decorator';
import { ApiKeyGuard } from 'src/auth/guards/api-key.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/permiso.guard';
import { CurrentPermissions } from 'src/auth/types/current-permissions';
import { RequirePermissions } from 'src/auth/decorators/permiso.decorator';
import { PagarRequisicionDto } from './dto/request.dto';
import { RequisicionType } from './types/requisicion-type';
import { CreateRequisicionDto, MarkItemsAsPaidDto, UpdateRequisicionItemsDto } from './dto/request.v2.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { RequisicionStatus } from './types/requisicion-status';

@Controller('requisiciones')
export class RequisicionesController {
  constructor(private readonly requisicionesService: RequisicionesService) { }

  /* REQUISICIONES */
  @Get('stats')
  @SwaggerAuthHeaders()
  @UseGuards(ApiKeyGuard, JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(CurrentPermissions.ListRequisicion)
  getStats() {
    return this.requisicionesService.getStats();
  }

  @Get('all_requisiciones')
  @SwaggerAuthHeaders()
  @UseGuards(ApiKeyGuard, JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(CurrentPermissions.ListRequisicion)
  getAllRequisiciones(
    @Query() dto: PaginationDto,
    @Query('status') status?: RequisicionStatus,
    @GetUser() user?: User,
  ) {
    return this.requisicionesService.getAllRequisiciones(dto, status, user);
  }


  @Get('aproved_requisiciones')
  @SwaggerAuthHeaders()
  @UseGuards(ApiKeyGuard, JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(CurrentPermissions.ListRequisicion)
  getAprovedRequisiciones(
    @Query() dto: PaginationDto,
    @Query('status') status?: RequisicionStatus
  ) {
    return this.requisicionesService.getRequisicionesAprobadas(dto, status);
  }

  @Post()
  @SwaggerAuthHeaders()
  @UseGuards(ApiKeyGuard, JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(CurrentPermissions.CreateRequisicion)
  create(
    @Body() dto: CreateRequisicionDto,
    @GetUser() user: User
  ) {
    return this.requisicionesService.createRequisicion(dto, user);
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

  @Patch(':id/items/paid')
  @SwaggerAuthHeaders()
  @UseGuards(ApiKeyGuard, JwtAuthGuard, PermissionsGuard)
  markItemsAsPaid(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: MarkItemsAsPaidDto,
    @GetUser() user: User
  ) {
    return this.requisicionesService.markItemsAsPaid(id, dto, user);
  }

  @Patch(':id/items')
  async updateRequisicionItems(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRequisicionItemsDto,
  ) {
    return this.requisicionesService.updateRequisicion(id, dto);
  }
}
