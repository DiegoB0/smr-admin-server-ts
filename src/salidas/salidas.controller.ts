import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { SalidasService } from './salidas.service';
import { CreateSalidaDto } from './dto/request.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('salidas')
export class SalidasController {
  constructor(private readonly salidasService: SalidasService) { }

  @Post()
  create(@Body() dto: CreateSalidaDto) {
    return this.salidasService.create(dto);
  }

  @Get('almacen/:almacenId')
  findByAlmacen(
    @Param('almacenId', ParseIntPipe) almacenId: number,
    @Query() pagination: PaginationDto
  ) {
    return this.salidasService.findByAlmacen(almacenId, pagination);
  }
}
