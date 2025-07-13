import { Controller, Get, Patch, Post } from '@nestjs/common';
import { AlmacenesService } from './almacenes.service';

@Controller('almacenes')
export class AlmacenesController {
  constructor(private readonly almacenesService: AlmacenesService) {}

  @Get()
  findAll() {

  }

  @Get()
  findOne() {

  }

  @Post()
  addAlmacen() {

  }

  @Patch()
  updateAlmacen() {

  }
}
