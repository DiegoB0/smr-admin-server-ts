import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiKey } from './entities/api_key.entity';
import { Repository } from 'typeorm';
import { User } from './entities/usuario.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(ApiKey)
    private apiKeyRepo: Repository<ApiKey>,
  ) {}



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



