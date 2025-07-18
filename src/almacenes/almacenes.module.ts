import { Module } from '@nestjs/common';
import { AlmacenesService } from './almacenes.service';
import { AlmacenesController } from './almacenes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Almacen } from './entities/almacen.entity';
import { AuthModule } from 'src/auth/auth.module';
import { LogsModule } from 'src/logs/logs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Almacen]),
    AuthModule,
    LogsModule
  ],
  controllers: [AlmacenesController],
  providers: [AlmacenesService],
})
export class AlmacenesModule {}
