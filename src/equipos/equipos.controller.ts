import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import { EquiposService } from './equipos.service';
import { Equipo } from './entities/equipo.entity';
import { CreateEquipoDto, UpdateEquipoDto } from './dto/request.dto';

@Controller('equipos')
export class EquiposController {
  constructor(private readonly equiposService: EquiposService) { }

  @Get()
  getAll(): Promise<Equipo[]> {
    return this.equiposService.findAll();
  }

  @Post()
  add(@Body() dto: CreateEquipoDto) {
    return this.equiposService.create(dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.equiposService.remove(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEquipoDto ,
  ): Promise<Equipo> {
    return this.equiposService.update(id, dto);
  }
}
