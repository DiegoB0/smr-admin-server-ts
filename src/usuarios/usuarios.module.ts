import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { LogsModule } from 'src/logs/logs.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
   imports: [
    LogsModule,
    AuthModule
  ],
  controllers: [UsuariosController],
  providers: [UsuariosService],
})
export class UsuariosModule { }
