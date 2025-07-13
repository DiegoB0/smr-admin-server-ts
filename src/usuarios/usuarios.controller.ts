import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { SwaggerAuthHeaders } from 'src/auth/decorators/auth.decorator';
import { ApiKeyGuard } from 'src/auth/guards/api-key.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/permiso.guard';
import { CurrentPermissions } from 'src/auth/types/current-permissions';
import { RequirePermissions } from 'src/auth/decorators/permiso.decorator';
import { User } from 'src/auth/entities/usuario.entity';
import { GetUser } from 'src/auth/decorators/user.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { DeleteDateColumn } from 'typeorm';
import { RegisterDto } from 'src/auth/dto/request.dto';
import { ParamUserID } from './dto/request.dto';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) { }

  @Post('add')
  @SwaggerAuthHeaders()
  @UseGuards(ApiKeyGuard, JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(CurrentPermissions.CreateUser)
  addUser(
    @Body() dto: RegisterDto,
    @GetUser() user: User
  ) {
    return this.usuariosService.createUser(dto, user)
  }

  @Get('all_users')
  @SwaggerAuthHeaders()
  @UseGuards(ApiKeyGuard, JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(CurrentPermissions.ListUser)
  findAllUsers(
    @Query() dto: PaginationDto,
    @GetUser() user: User,
  ) {
    return this.usuariosService.findUsers(dto, user)
  }

  @Get('find_one/:id')
  @SwaggerAuthHeaders()
  @UseGuards(ApiKeyGuard, JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(CurrentPermissions.ListUser)
  findOne(
    @Param() dto: ParamUserID,
    @GetUser() user: User,
  ) {
    return this.usuariosService.findOne(dto, user)
  }

  @Delete('delete_user/:id')
  @SwaggerAuthHeaders()
  @UseGuards(ApiKeyGuard, JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(CurrentPermissions.DeleteUser)
  deleteUser(
    @Param() dto: ParamUserID,
    @GetUser() user: User
  ) {
    return this.usuariosService.deleteUser(dto, user)
  }

  @Patch('update_user/:id')
  @SwaggerAuthHeaders()
  @UseGuards(ApiKeyGuard, JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(CurrentPermissions.UpdateUser)
  updatUser(
    @Param() dto: ParamUserID,
    @GetUser() user: User
  ) {
    return this.usuariosService.updateUser(dto, user)
  }


  @Patch('change_roles/:id')
  @SwaggerAuthHeaders()
  @UseGuards(ApiKeyGuard, JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(CurrentPermissions.UpdateUser)
  updateRoles(
    @Param() id: string,
    @GetUser() user: User
  ) {
    return this.usuariosService.updateUser(id, user)
  }

}
