import { Module } from '@nestjs/common';
import { FiltrosService } from './filtros.service';
import { FiltrosController } from './filtros.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Equipo } from 'src/equipos/entities/equipo.entity';
import { FiltroRequirement } from './entities/filtro-requirements.entity';
import { FiltroItem } from './entities/filtro-item.entity';
import { CategoriaFiltro } from './entities/filtro-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Equipo, FiltroRequirement, FiltroItem, CategoriaFiltro])],
  controllers: [FiltrosController],
  providers: [FiltrosService],
})
export class FiltrosModule {}
