import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LookupSeeder } from './lookup.seeder';
import { Componente } from 'src/requisiciones/entities/peticion_producto.entity';
import { Fase } from 'src/requisiciones/entities/peticion_producto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Componente, Fase])],
  providers: [LookupSeeder],
})
export class SeedModule {}
