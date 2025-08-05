import { Module } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';
import { LogsModule } from 'src/logs/logs.module';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producto } from './entities/producto.entity';
import { EntradaItem } from '../entradas/entities/entrada_item.entity';
import { Entrada } from '../entradas/entities/entrada.entity';
import { Salida } from '../salidas/entities/salida.entity';
import { SalidaItem } from '../salidas/entities/salida_item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Producto,
      Entrada,
      EntradaItem,
      Salida,
      SalidaItem
    ]),
    LogsModule,
    AuthModule
  ],
  controllers: [ProductosController],
  providers: [ProductosService],
})
export class ProductosModule {}
