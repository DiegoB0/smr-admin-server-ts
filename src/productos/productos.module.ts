import { Module } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';
import { LogsModule } from 'src/logs/logs.module';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producto } from './entities/producto.entity';
import { Inventario } from 'src/almacenes/entities/inventario.entity';
import { Almacen } from 'src/almacenes/entities/almacen.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Producto,
      Almacen,
      Inventario
    ]),
    LogsModule,
    AuthModule
  ],
  controllers: [ProductosController],
  providers: [ProductosService],
  exports: [TypeOrmModule]
})
export class ProductosModule {}
