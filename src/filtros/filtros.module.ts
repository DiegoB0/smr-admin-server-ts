import { Module } from '@nestjs/common';
import { FiltrosService } from './filtros.service';
import { FiltrosController } from './filtros.controller';

@Module({
  controllers: [FiltrosController],
  providers: [FiltrosService],
})
export class FiltrosModule {}
