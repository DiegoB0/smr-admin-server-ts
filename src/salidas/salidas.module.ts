import { Module } from '@nestjs/common';
import { SalidasService } from './salidas.service';
import { SalidasController } from './salidas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Salida } from './entities/salida.entity';
import { SalidaItem } from './entities/salida_item.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Inventario } from 'src/almacenes/entities/inventario.entity';
import { Producto } from 'src/productos/entities/producto.entity';
import { Almacen } from 'src/almacenes/entities/almacen.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Salida, SalidaItem, Inventario, Producto, Almacen]),
    AuthModule
  ],
  controllers: [SalidasController],
  providers: [SalidasService],
})
export class SalidasModule { }
