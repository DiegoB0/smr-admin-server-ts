import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { FiltrosService } from './filtros.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('filtros')
export class FiltrosController {
  constructor(private readonly filtrosService: FiltrosService) { }

  @Get('categorias')
  listCategorias(@Query() pagination: PaginationDto) {
    return this.filtrosService.listCategorias(pagination);
  }

  @Get('/:no_economico/hrs/:hrs')
  async getItemsByNoEconomicoAndHrsQB(
    @Param('no_economico') no_economico: string,
    @Param('hrs', ParseIntPipe) hrs: number
  ) {
    return this.filtrosService.getItemsByNoEconomicoAndHrsQB(
      no_economico,
      hrs
    );
  }

}
