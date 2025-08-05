import { Controller } from '@nestjs/common';
import { EntradasService } from './entradas.service';

@Controller('entradas')
export class EntradasController {
  constructor(private readonly entradasService: EntradasService) {}
}
