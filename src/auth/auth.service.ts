import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiKey } from './entities/api_key.entity';
import { JwtService } from '@nestjs/jwt'
import { LogsService } from 'src/logs/logs.service'
import { In, Repository } from 'typeorm';
import { User } from './entities/usuario.entity';
import { UsuarioRol } from './entities/usuario_rol.entity';
import { LoginDto, RegisterDto } from './dto/request.dto';
import { Rol } from './entities/rol.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(ApiKey)
    private apiKeyRepo: Repository<ApiKey>,

    @InjectRepository(UsuarioRol)
    private usuarioRolRepo: Repository<UsuarioRol>,

    @InjectRepository(Rol)
    private rolRepo: Repository<Rol>,

    private jwtService: JwtService,
    private readonly logService: LogsService

  ) { }

  async createUser(
    dto: RegisterDto,
  ): Promise<{ access_token: string }> {
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

    // TODO: Create a log for this on the LOGS table
    const payload = { sub: usuario.id, email: usuario.email };



    return {
      access_token: this.jwtService.sign(payload),
    };
  }



  async register(
    dto: RegisterDto,
    user: User,
    image?: Express.Multer.File,
  ): Promise<{ access_token: string }> {
    console.log(image) //  TODO: Reminder that I should config aws module to store images in s3

    const { email, name, password } = dto;
    const roles: string[] = dto.roles ?? [];

    const existingUser = await this.userRepo.findOne({ where: { email } });
    if (existingUser) {
      throw new UnauthorizedException(
        'El correo ya tiene una cuenta registrada',
      );
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Create and save user (exclude roles!)
    const usuario = this.userRepo.create({
      email,
      name,
      password: hash,
    });

    await this.userRepo.save(usuario);

    // Insert roles into pivot table
    if (roles.length > 0) {
      const roleLinks = roles.map((rolId) =>
        this.usuarioRolRepo.create({
          usuario: { id: user.id },
          rol: { id: rolId },
        }),
      );

      await this.usuarioRolRepo.save(roleLinks);
    }

    // Save logs
    await this.logService.createLog(
      user,
      `El usuario ${user.name} creo al usuario ${usuario.name} `,
      'REGISTER_USER',
      JSON.stringify(usuario),
    );

    // JWT
    const payload = { sub: usuario.id, email: usuario.email };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }


  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({
      where: { email: dto.email },
      select: ['id', 'email', 'password', 'name'],
      relations: [
        'usuarioRoles',
        'usuarioRoles.rol',
        'usuarioRoles.rol.permisos',
        'usuarioRoles.rol.permisos.permiso',
      ],
    });

    if (!user || !dto.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Map roles and permissions
    const roles =
      user.usuarioRoles?.map((userRole) => userRole.rol.name) || [];

    const permissions =
      user.usuarioRoles?.flatMap(
        (userRole) =>
          userRole.rol.permisos?.map((rp) => rp.permiso.name) || [],
      ) || [];

    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      roles,
      permissions,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async createApiKey(incomingUser: User) {
    const user = await this.userRepo.findOne({
      where: { id: incomingUser.id },
    });


    if (!user) {
      throw new UnauthorizedException('Unser not found');
    }

    const apiKey = this.apiKeyRepo.create({
      key: uuidv4(),
      revoked: false,
      user,
    });

    const savedApiKey = await this.apiKeyRepo.save(apiKey);

    // Save logs
    await this.logService.createLog(
      user,
      `Se ha generado una nueva apiKey  para el usuario ${user.email}`,
      'REGISTER_USER',
      JSON.stringify(savedApiKey),
    );

    return savedApiKey;
  }

  async deleteApiKey(id: string, user: User) {

    const apiKey = await this.userRepo.findOne({
      where: { id: id },
    });

    if (!apiKey) {
      throw new NotFoundException('Api Key not found')
    }

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Save logs
    await this.logService.createLog(
      user,
      `El usuario ${user.email} ha eliminado la key: ${apiKey}`,
      'DELETE_API_KEY',
      JSON.stringify(apiKey),
    );
  }

  async findByIdWithRolesAndPermissions(userId: string) {
    return await this.userRepo.findOne({
      where: { id: userId },
      relations: [
        'usuarioRoles',
        'usuarioRoles.rol',
        'usuarioRoles.rol.permisos',
        'usuarioRoles.rol.permisos.permiso',
      ],
    });
  }

}
