import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { LogsModule } from 'src/logs/logs.module';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Obra } from 'src/obras/entities/obra.entity';
import { Almacen } from 'src/almacenes/entities/almacen.entity';
import { AlmacenAdminConta } from 'src/almacenes/entities/almacenAdminConta.entity';

@Module({
   imports: [
    TypeOrmModule.forFeature([Obra, Almacen, AlmacenAdminConta]),
    LogsModule,
    AuthModule
  ],
  controllers: [UsuariosController],
  providers: [UsuariosService],
})
export class UsuariosModule { }
