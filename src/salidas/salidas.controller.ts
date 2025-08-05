import { Controller } from '@nestjs/common';
import { SalidasService } from './salidas.service';

@Controller('salidas')
export class SalidasController {
  constructor(private readonly salidasService: SalidasService) {}
}
