import { Module } from '@nestjs/common';
import { EntradasService } from './entradas.service';
import { EntradasController } from './entradas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Entrada } from './entities/entrada.entity';
import { EntradaItem } from './entities/entrada_item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Entrada, EntradaItem])],
  controllers: [EntradasController],
  providers: [EntradasService],
  exports: [TypeOrmModule]
})
export class EntradasModule {}
