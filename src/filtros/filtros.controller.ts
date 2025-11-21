import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { FiltrosService } from './filtros.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreateCategoriaFiltroDto, CreatedCategoriaFiltroDto, CreatedFiltroItemDto, CreateFiltroItemsForRequirementDto, GetCategoriaFiltroWithItemsDto, UpdateCategoriaFiltroDto, UpdatedCategoriaFiltroDto, UpdatedFiltroItemDto, UpdateFiltroItemDto } from './dto/request.dto';

@Controller('filtros')
export class FiltrosController {
  constructor(private readonly filtrosService: FiltrosService) { }

  @Post('categorias')
  async createCategoria(
    @Body() dto: CreateCategoriaFiltroDto
  ): Promise<CreatedCategoriaFiltroDto> {
    return this.filtrosService.createCategoria(dto);
  }

  @Post('categorias/:categoriaId/items/:hrs')
  async createItems(
    @Param('categoriaId', ParseIntPipe) categoriaId: number,
    @Param('hrs', ParseIntPipe) hrs: number,
    @Body() dto: CreateFiltroItemsForRequirementDto
  ): Promise<CreatedFiltroItemDto[]> {
    return this.filtrosService.createItemsForRequirement(
      categoriaId,
      hrs,
      dto
    );
  }

  @Get('categorias')
  listCategorias(@Query() pagination: PaginationDto) {
    return this.filtrosService.listCategorias(pagination);
  }

  @Get('categorias/:categoriaId/items/:hrs')
  async getCategoriaItems(
    @Param('categoriaId', ParseIntPipe) categoriaId: number,
    @Param('hrs', ParseIntPipe) hrs: number
  ): Promise<GetCategoriaFiltroWithItemsDto> {
    return this.filtrosService.getCategoriaWithItems(categoriaId, hrs);
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

  @Delete('categorias/:categoriaId')
  async deleteCategoria(
    @Param('categoriaId', ParseIntPipe) categoriaId: number
  ): Promise<{ message: string }> {
    return this.filtrosService.deleteCategoria(categoriaId);
  }

  @Delete('items/:itemId')
  async deleteFiltroItem(
    @Param('itemId', ParseIntPipe) itemId: number
  ): Promise<{ message: string }> {
    return this.filtrosService.deleteFiltroItem(itemId);
  }

  @Patch('categorias/:categoriaId')
  async updateCategoria(
    @Param('categoriaId', ParseIntPipe) categoriaId: number,
    @Body() dto: UpdateCategoriaFiltroDto
  ): Promise<UpdatedCategoriaFiltroDto> {
    return this.filtrosService.updateCategoria(categoriaId, dto);
  }

  @Patch('items/:itemId')
  async updateFiltroItem(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: UpdateFiltroItemDto
  ): Promise<UpdatedFiltroItemDto> {
    return this.filtrosService.updateFiltroItem(itemId, dto);
  }



}
