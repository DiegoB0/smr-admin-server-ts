import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { LogsModule } from 'src/logs/logs.module';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/usuario.entity';
import { UsuarioRol } from 'src/auth/entities/usuario_rol.entity';
import { Rol } from 'src/auth/entities/rol.entity';

@Module({
   imports: [
    TypeOrmModule.forFeature([User, UsuarioRol, Rol]),
    LogsModule,
    AuthModule
  ],
  controllers: [UsuariosController],
  providers: [UsuariosService],
})
export class UsuariosModule { }
