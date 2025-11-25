import { Module } from '@nestjs/common';
import { AlmacenesService } from './almacenes.service';
import { AlmacenesController } from './almacenes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Almacen } from './entities/almacen.entity';
import { AuthModule } from 'src/auth/auth.module';
import { LogsModule } from 'src/logs/logs.module';
import { Inventario } from './entities/inventario.entity';
import { Obra } from 'src/obras/entities/obra.entity';
import { EntradaItem } from 'src/entradas/entities/entrada_item.entity';
import { Producto } from 'src/productos/entities/producto.entity';
import { Entrada } from 'src/entradas/entities/entrada.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Almacen, Inventario, Obra, Entrada, EntradaItem, Producto]),
    AuthModule,
    LogsModule
  ],
  controllers: [AlmacenesController],
  providers: [AlmacenesService],
  exports: [TypeOrmModule]
})
export class AlmacenesModule {}
