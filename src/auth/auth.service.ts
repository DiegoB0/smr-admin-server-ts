import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiKey } from './entities/api_key.entity';
import {JwtService} from '@nestjs/jwt'
import {LogsService} from 'src/logs/logs.service'
import { Repository } from 'typeorm';
import { User } from './entities/usuario.entity';
import { UsuarioRol } from './entities/usuario_rol.entity';
import { LoginDto, RegisterDto } from './dto/request.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(ApiKey)
    private apiKeyRepo: Repository<ApiKey>,

    @InjectRepository(UsuarioRol)
    private usuarioRolRepo: Repository<UsuarioRol>,

    private jwtService: JwtService,
    private readonly logService: LogsService

  ) { }

  async register(
    dto: RegisterDto,
    user: User,
    image?: Express.Multer.File,
  ): Promise<{ access_token: string }> {
    console.log(image) //  NOTE: Reminder that I should config aws module to store images in s3

    const { email, name, password } = dto;
    const roles: string[] = dto.roles ?? [];
    console.log(roles);

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
      `El usuario ${usuario.email} se registro exitosamente`,
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
      user.usuarioRoles?.map((userRole) => userRole.rol.nombre) || [];

    const permissions =
      user.usuarioRoles?.flatMap(
        (userRole) =>
          userRole.rol.permisos?.map((rp) => rp.permiso.nombre) || [],
      ) || [];

    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      roles,
      permissions,
    };

    console.log(payload);
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async createApiKey(incomingUser: User) {
    const user = await this.userRepo.findOne({
      where: { id: incomingUser.id },
    });

    console.log(user);
    console.log('Heyyy');

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



