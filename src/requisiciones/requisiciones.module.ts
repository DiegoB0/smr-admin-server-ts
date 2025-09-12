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

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Requisicion,
      RequisicionItem,
      PeticionProducto,
      PeticionProductoItem
    ]),
    LogsModule,
    AuthModule,
    AlmacenesModule
  ],
  controllers: [RequisicionesController],
  providers: [RequisicionesService],
})
export class RequisicionesModule {}
