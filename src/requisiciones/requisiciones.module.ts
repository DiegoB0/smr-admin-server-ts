import { Module } from '@nestjs/common';
import { RequisicionesService } from './requisiciones.service';
import { RequisicionesController } from './requisiciones.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogsModule } from 'src/logs/logs.module';
import { AuthModule } from 'src/auth/auth.module';
import { Requisicion } from './entities/requisicion.entity';
import { AlmacenesModule } from 'src/almacenes/almacenes.module';
import { EquiposModule } from 'src/equipos/equipos.module';
import { ProductosModule } from 'src/productos/productos.module';
import { RequisicionInsumoItem } from './entities/customRequis/requisicion_insumo_items.entity';
import { ProveedoresModule } from 'src/proveedores/proveedores.module';
import { EntradasModule } from 'src/entradas/entradas.module';
import { RequisicionRefaccionItem } from './entities/customRequis/requisicion_refaccion.items.entity';
import { RequisicionFilterItem } from './entities/customRequis/requisicion_filter_items.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Requisicion,
      RequisicionRefaccionItem,
      RequisicionFilterItem,
      RequisicionInsumoItem,
    ]),
    LogsModule,
    EntradasModule,
    AuthModule,
    AlmacenesModule,
    EquiposModule,
    ProveedoresModule,
    ProductosModule
  ],
  controllers: [RequisicionesController],
  providers: [RequisicionesService],
})
export class RequisicionesModule {}
