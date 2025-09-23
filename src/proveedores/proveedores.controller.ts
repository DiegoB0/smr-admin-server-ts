import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProveedoresService } from './proveedores.service';
import { CreateProveedorDto, UpdateProveedorDto } from './dto/request.dto';

@Controller('proveedores')
export class ProveedoresController {
  constructor(
    private readonly proveedoresService: ProveedoresService
  ) {}

  @Post('add')
  create(@Body() createProveedoreDto: CreateProveedorDto) {
    return this.proveedoresService.create(createProveedoreDto);
  }

  @Get('all_proveedores')
  findAll() {
    return this.proveedoresService.findAll();
  }

  @Delete('delete_proveedor:id')
  remove(@Param('id') id: string) {
    return this.proveedoresService.remove(+id);
  }

  @Patch('update_proveedor:id')
  update(@Param('id') id: string, @Body() updateProveedoreDto: UpdateProveedorDto) {
    return this.proveedoresService.update(+id, updateProveedoreDto);
  }

}
