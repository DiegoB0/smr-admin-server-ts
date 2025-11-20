import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LookupSeeder } from './lookup.seeder';

@Module({
  imports: [TypeOrmModule.forFeature([/*Componente, Fase */])],
  providers: [LookupSeeder],
})
export class SeedModule {}
