import { Module } from '@nestjs/common';
import { RequisicionesService } from './requisiciones.service';
import { RequisicionesController } from './requisiciones.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogsModule } from 'src/logs/logs.module';
import { AuthModule } from 'src/auth/auth.module';
import { RequisicionItem } from './entities/requisicion_item.entity';
import { Requisicion } from './entities/requisicion.entity';
import { PeticionProducto } from './entities/peticion_producto.entity';
import { PeticionProductoItem } from './entities/peticion_producto_item.entity';
import { AlmacenesModule } from 'src/almacenes/almacenes.module';
import { EquiposModule } from 'src/equipos/equipos.module';
import { ProductosModule } from 'src/productos/productos.module';
import { RequisicionServiceItem } from './entities/requisicion_service_item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Requisicion,
      RequisicionItem,
      PeticionProducto,
      PeticionProductoItem,
      RequisicionServiceItem,
    ]),
    LogsModule,
    AuthModule,
    AlmacenesModule,
    EquiposModule,
    ProductosModule
  ],
  controllers: [RequisicionesController],
  providers: [RequisicionesService],
})
export class RequisicionesModule {}
