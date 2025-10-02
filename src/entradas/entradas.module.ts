import { Module } from '@nestjs/common';
import { EntradasService } from './entradas.service';
import { EntradasController } from './entradas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Entrada } from './entities/entrada.entity';
import { EntradaItem } from './entities/entrada_item.entity';
import { AlmacenesModule } from 'src/almacenes/almacenes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Entrada, EntradaItem]),
    AlmacenesModule,
  ],
  controllers: [EntradasController],
  providers: [EntradasService],
  exports: [TypeOrmModule]
})
export class EntradasModule { }
