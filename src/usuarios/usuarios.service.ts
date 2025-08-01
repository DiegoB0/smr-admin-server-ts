import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs'
import { InjectRepository } from '@nestjs/typeorm';
import { LogsService } from 'src/logs/logs.service'
import { User } from 'src/auth/entities/usuario.entity';
import { Brackets, In, Repository } from 'typeorm';
import { UsuarioRol } from 'src/auth/entities/usuario_rol.entity';
import { Rol } from 'src/auth/entities/rol.entity';
import { RegisterDto } from 'src/auth/dto/request.dto';
import { PaginationDto, PaginationMetaData } from 'src/common/dto/pagination.dto';
import { GetUserDto, PaginatedUserDto, RoleDto } from './dto/response.dto';
import { ChangeRolesDto, ParamUserID, UpdateUserDto } from './dto/request.dto';

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
      `El usuario ${user.name} creo al usuario ${usuario.name}`,
      'CREATE_USER',
      JSON.stringify(usuario),
    );

    return usuario;
  }

  async findOne(dto: ParamUserID): Promise<GetUserDto> {
    const { id } = dto
    const user = await this.userRepo.findOne({
      where: { id: id, isActive: true },
      relations: [
        'usuarioRoles',
        'usuarioRoles.rol'
      ]
    })

    if (user === null) throw new NotFoundException('User not found')

    const mappedUser: GetUserDto = {
      id: user.id,
      email: user.email,
      isActive: user.isActive,
      name: user.name,
      roles: user.usuarioRoles
        ? user.usuarioRoles.map((ur) => ur.rol.name)
        : [],
    };

    return mappedUser;
  }

  // Get users and filter by roles, and all that
  async findUsers(pagination: PaginationDto): Promise<PaginatedUserDto> {

    const { page = 1, limit = 10, search, order = 'ASC' } = pagination;

    const skip = (page - 1) * limit;

    const queryBuilder = this.userRepo.createQueryBuilder('user')
      .leftJoinAndSelect('user.usuarioRoles', 'user_rol')
      .leftJoinAndSelect('user_rol.rol', 'rol')
      .where('user.isActive = :active', { active: true });

    if (search) {
      const term = `%${search}%`;
      queryBuilder.andWhere(new Brackets(subquery => {
        subquery
          .where('user.name ILIKE :term', { term })
          .orWhere('user.email ILIKE :term', { term })
          .orWhere('rol.name ILIKE :term', { term });
      }));
    }

    queryBuilder.distinct(true)
      .orderBy('user.name', order)
      .skip(skip)
      .take(limit);

    const [users, totalItems] = await queryBuilder.getManyAndCount()

    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    // Map fields to JSON Data
    const mappedUsers: GetUserDto[] = users.map((user) => ({
      id: user.id,
      email: user.email,
      isActive: user.isActive,
      name: user.name,
      roles: user.usuarioRoles
        ? user.usuarioRoles.map((ur) => ur.rol.name)
        : [],
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

   async findRoles(): Promise<RoleDto[]> {
    const roles = await this.rolRepo.find({
      select: ['id', 'name']
    })

    return roles
  }

  async changeRoles(userId: ParamUserID, dto: ChangeRolesDto, user: User) {
    const { id } = userId
    const { roles } = dto


    const usuario = await this.userRepo.findOne({ where: { id, isActive: true } });

    if (!usuario) throw new NotFoundException('User not found')

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

    await this.logService.createLog(
      user,
      `El usuario ${user.name} cambio los permisos al usuario ${usuario.email}`,
      'UPDATE_USER',
      JSON.stringify(usuario),
    )

    return user
  }

  // Update single user
  async updateUser(userId: ParamUserID, dto: UpdateUserDto, user: User): Promise<User> {
    const { id } = userId;
    const { name, isActive, password, email } = dto;

    const usuario = await this.userRepo.findOne({ where: { id, isActive: true } })

    if (!usuario) throw new NotFoundException('User not found')

    if (name) {
      usuario.name = name
    }

    if (isActive) {
      usuario.isActive = isActive
    }

    // TODO: Handle the image once I have the s3 service running
    if (email !== undefined && email !== usuario.email) {
      const currentEmail = await this.userRepo.findOne({
        where: { email }
      })

      // Check if there's any user with the same email
      if (currentEmail && currentEmail.id !== usuario.id) {
        throw new ConflictException('This email is already registered by another user')
      }

      usuario.email = email;

    }

    if (password !== undefined && password !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);

      usuario.password = password;
    }

    const updatedUser = await this.userRepo.save(usuario)

    await this.logService.createLog(
      user,
      `El usuario ${user.name} actualizo al usuario ${usuario.email}`,
      'UPDATE_USER',
      JSON.stringify(updatedUser),
    )

    return updatedUser;
  }

  // Soft delete? 
  async deleteUser(dto: ParamUserID, user: User) {
    const { id } = dto

    const usuario = await this.userRepo.findOne({ where: { id } });

    if (!usuario) throw new NotFoundException('User not found')

    usuario.isActive = false

    await this.userRepo.save(usuario);

    // Save logs
    await this.logService.createLog(
      user,
      `EL usuario ${user.name} elimino al usuario ${usuario.name}`,
      'DELETE_USER',
      JSON.stringify(usuario),
    );

    return { message: 'User deleted successfully' }

  }

}
