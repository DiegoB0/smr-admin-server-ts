import { Controller } from '@nestjs/common';
import { RequisicionesService } from './requisiciones.service';

@Controller('requisiciones')
export class RequisicionesController {
  constructor(private readonly requisicionesService: RequisicionesService) {}
}
