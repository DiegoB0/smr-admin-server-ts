import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
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

  // Get users and filter by roles, and all that
  async findUsers() {

  }

  // Update single user
  async updateUser() {

  }

  // Soft delete? 
  async deleteUser() {

  }

  async createUser(
    dto: RegisterDto,
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

    return usuario;
  }


}
