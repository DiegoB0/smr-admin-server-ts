import { Controller } from '@nestjs/common';
import { ObrasService } from './obras.service';

@Controller('obras')
export class ObrasController {
  constructor(private readonly obrasService: ObrasService) {}
}
