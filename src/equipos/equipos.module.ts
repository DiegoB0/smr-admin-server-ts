import { Module } from '@nestjs/common';
import { EquiposService } from './equipos.service';
import { EquiposController } from './equipos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Equipo } from './entities/equipo.entity';
import { AuthModule } from 'src/auth/auth.module';
import { LogsModule } from 'src/logs/logs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Equipo
    ]),
    LogsModule,
    AuthModule
  ],
  controllers: [EquiposController],
  providers: [EquiposService],
  exports: [TypeOrmModule]
})
export class EquiposModule { }
