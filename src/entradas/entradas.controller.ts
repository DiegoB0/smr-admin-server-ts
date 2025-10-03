import { Body, Controller, Get, Param, ParseIntPipe, Patch, Query } from '@nestjs/common';
import { EntradasService } from './entradas.service';
import { Entrada } from './entities/entrada.entity';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UpdateCantidadRecibidaDto } from './dto/request.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('entradas')
export class EntradasController {
  constructor(private readonly entradasService: EntradasService) { }

  @Get()
  async findAll(
    @Query() dto: PaginationDto,
  ) {
    return this.entradasService.findAll(dto);
  }

  @Patch(':id/recibir')
  @ApiOperation({ summary: 'Update cantidadRecibida of entrada items' })
  @ApiResponse({ status: 200, description: 'Entrada updated successfully', type: Entrada })
  async recibirItems(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCantidadRecibidaDto,
  ): Promise<Entrada> {
    // Pass the entrada ID + items array to the service
    return this.entradasService.updateCantidadRecibida(id, dto.items);
  }
}
