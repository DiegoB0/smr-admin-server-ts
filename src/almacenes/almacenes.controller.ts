import { Controller } from '@nestjs/common';
import { AlmacenesService } from './almacenes.service';

@Controller('almacenes')
export class AlmacenesController {
  constructor(private readonly almacenesService: AlmacenesService) {}
}
