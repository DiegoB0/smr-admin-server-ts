import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt'
import { LogsService } from 'src/logs/logs.service'
import { User } from 'src/auth/entities/usuario.entity';
import { In, Repository } from 'typeorm';
import { UsuarioRol } from 'src/auth/entities/usuario_rol.entity';
import { Rol } from 'src/auth/entities/rol.entity';
import { RegisterDto } from 'src/auth/dto/request.dto';
import { PaginationDto, PaginationMetaData } from 'src/common/dto/pagination.dto';
import { GetUserDto, PaginatedUserDto } from './dto/response.dto';
import { ParamUserID } from './dto/request.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(UsuarioRol)
    private usuarioRolRepo: Repository<UsuarioRol>,

    @InjectRepository(Rol)
    private rolRepo: Repository<Rol>,

    private readonly logService: LogsService

  ) { }

  async findOne(dto: ParamUserID, user: User): Promise<User> {
    const { id } = dto
    const existingUser = await this.userRepo.findOne({ where: { id: id } })

    if (existingUser === null) throw new NotFoundException('User not found')

    return existingUser
  }

  // Get users and filter by roles, and all that
  async findUsers(pagination: PaginationDto, user: User): Promise<PaginatedUserDto> {
    console.log('--- Debugging Pagination ---');
    console.log('Raw pagination DTO object received:', pagination);
    console.log('Type of pagination.page:', typeof pagination.page, 'Value:', pagination.page);
    console.log('Type of pagination.limit:', typeof pagination.limit, 'Value:', pagination.limit);

    const { page = 1, limit = 10, sortBy, order = 'ASC' } = pagination;

    const skip = (page - 1) * limit;

    const queryBuilder = this.userRepo.createQueryBuilder('user');

    if (sortBy) {
      queryBuilder.orderBy(`user.${sortBy}`, order)
    }

    const [users, totalItems] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount()

    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    // Map entities to DTO
    const mappedUsers: GetUserDto[] = users.map((user) => ({
      id: user.id,
      email: user.email,
      isActive: user.isActive,
      name: user.name,
    }))

    const meta: PaginationMetaData = {
      currentPage: page,
      totalPages: totalPages,
      totalItems: totalItems,
      itemsPerPage: limit,
      hasNextPage: hasNextPage,
      hasPreviousPage: hasPreviousPage,
    }

    return new PaginatedUserDto(mappedUsers, meta)
  }

  async changeRoles({ }, user: User): Promise<User> {


    await this.logService.createLog(
      user,
      `El usuario ${user.email} fue actualizado exitosamente`,
      'UPDATE_USER',
      JSON.stringify(user),
    )

    return user
  }

  // Update single user
  async updateUser({ }, user: User): Promise<User> {

    await this.logService.createLog(
      user,
      `El usuario ${user.email} fue actualizado exitosamente`,
      'UPDATE_USER',
      JSON.stringify(user),
    )

    return user;
  }

  // Soft delete? 
  async deleteUser(dto: ParamUserID, user: User) {
    const { id } = dto


    // Save logs
    await this.logService.createLog(
      user,
      `El usuario ${user.email} fue eliminado exitosamente`,
      'DELETE_USER',
      JSON.stringify(user),
    );

  }

  async createUser(
    dto: RegisterDto,
    user: User
  ): Promise<User> {
    const { email, name, password, roles } = dto;

    const existingUser = await this.userRepo.findOne({ where: { email } });
    if (existingUser) {
      throw new UnauthorizedException(
        'El correo ya tiene una cuenta registrada',
      );
    }

    const hash = await bcrypt.hash(password, 10);

    const usuario = this.userRepo.create({
      email,
      name,
      password: hash,
    });
    await this.userRepo.save(usuario);

    if (roles && roles.length > 0) {
      const foundRoles = await this.rolRepo.findBy({ id: In(roles) });

      if (foundRoles.length !== roles.length) {
        const foundRoleIds = new Set(foundRoles.map(r => r.id));
        const missingRoleIds = roles.filter(id => !foundRoleIds.has(id));
        throw new BadRequestException(
          `One or more provided roles do not exist: ${missingRoleIds.join(', ')}`,
        );
      }

      const roleLinks = foundRoles.map((rol) =>
        this.usuarioRolRepo.create({
          usuario: { id: usuario.id },
          rol: { id: rol.id },
        }),
      );

      await this.usuarioRolRepo.save(roleLinks);
    } else {
      // TODO: Handle default roles
    }

    // Registrar el log
    await this.logService.createLog(
      user,
      `El usuario ${user.email} se creo exitosamente`,
      'CREATE_USER',
      JSON.stringify(user),
    );

    return usuario;
  }


}
