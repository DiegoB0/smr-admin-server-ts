import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ObrasService } from './obras.service';
import { CreateObraDto, UpdateObraDto } from './dto/request.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('obras')
export class ObrasController {
  constructor(private readonly obrasService: ObrasService) { }

  @Post('add')
  create(@Body() dto: CreateObraDto) {
    return this.obrasService.create(dto);
  }

  @Get('all_obras')
  findAll(
    @Query() dto: PaginationDto,
  ) {
    return this.obrasService.findAll(dto);
  }

  @Get('find_obra/:id')
  findOne(@Param('id') id: string) {
    return this.obrasService.findOne(+id);
  }

  @Delete('delete_obra/:id')
  remove(@Param('id') id: string) {
    return this.obrasService.remove(+id);
  }

  @Patch('update_obra/:id')
  update(@Param('id') id: string, @Body() dto: UpdateObraDto) {
    return this.obrasService.update(+id, dto);
  }

}
