import { Module } from '@nestjs/common';
import { RequisicionesService } from './requisiciones.service';
import { RequisicionesController } from './requisiciones.controller';

@Module({
  controllers: [RequisicionesController],
  providers: [RequisicionesService],
})
export class RequisicionesModule {}
