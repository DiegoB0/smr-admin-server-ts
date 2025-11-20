import { Controller } from '@nestjs/common';
import { FiltrosService } from './filtros.service';

@Controller('filtros')
export class FiltrosController {
  constructor(private readonly filtrosService: FiltrosService) {}
}
