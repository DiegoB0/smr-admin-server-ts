import { Module } from '@nestjs/common';
import { AlmacenesService } from './almacenes.service';
import { AlmacenesController } from './almacenes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Almacen } from './entities/almacen.entity';
import { AuthModule } from 'src/auth/auth.module';
import { LogsModule } from 'src/logs/logs.module';
import { Inventario } from './entities/inventario.entity';
import { Obra } from 'src/obras/entities/obra.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Almacen, Inventario, Obra]),
    AuthModule,
    LogsModule
  ],
  controllers: [AlmacenesController],
  providers: [AlmacenesService],
  exports: [TypeOrmModule]
})
export class AlmacenesModule {}
