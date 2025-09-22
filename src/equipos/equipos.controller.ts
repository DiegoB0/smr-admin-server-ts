import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, Query } from '@nestjs/common';
import { EquiposService } from './equipos.service';
import { Equipo } from './entities/equipo.entity';
import { CreateEquipoDto, UpdateEquipoDto } from './dto/request.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PaginatedEquipoDto } from './dto/response.dto';

@Controller('equipos')
export class EquiposController {
  constructor(private readonly equiposService: EquiposService) { }

  @Post('add')
  add(@Body() dto: CreateEquipoDto) {
    return this.equiposService.create(dto);
  }

  @Get('all_equipos')
  getAll(
    @Query() dto: PaginationDto,
  ): Promise<PaginatedEquipoDto> {
    return this.equiposService.findAll(dto);
  }

  @Get('find_equipos/:id')
  getOne(
  @Param('id') id: number
  ) {
    return this.equiposService.getOne(id)

  }

  @Delete('delete_equipo/:id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.equiposService.remove(id);
  }

  @Patch('update_equipo/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEquipoDto ,
  ): Promise<Equipo> {
    return this.equiposService.update(id, dto);
  }
}
