import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors, Request, NotFoundException } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { User } from 'src/auth/entities/usuario.entity';
import { AlmacenesService } from './almacenes.service';
import { GetUser } from 'src/auth/decorators/user.decorator';
import { RequirePermissions } from 'src/auth/decorators/permiso.decorator';
import { CurrentPermissions } from 'src/auth/types/current-permissions';
import { PermissionsGuard } from 'src/auth/guards/permiso.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiKeyGuard } from 'src/auth/guards/api-key.guard';
import { SwaggerAuthHeaders } from 'src/auth/decorators/auth.decorator';
import { AddMultipleStockDto, AddStockDto, CreateAlmacenDto, ParamAlmacenID, UpdateAlmacenDto } from './dto/request.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Inventario } from './entities/inventario.entity';
import { InventoryQueryDto } from './dto/response.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Controller('almacenes')
export class AlmacenesController {
  constructor(private readonly almacenesService: AlmacenesService) { }

  @Post('add')
  @HttpCode(HttpStatus.OK)
  @SwaggerAuthHeaders()
  @UseGuards(ApiKeyGuard, JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(CurrentPermissions.CreateAlmacen)
  addAlmacen(
    @Body() dto: CreateAlmacenDto,
    @GetUser() user: User
  ) {
    return this.almacenesService.createAlmacen(dto, user)

  }

  @Get('all_almacenes')
  @SwaggerAuthHeaders()
  @UseGuards(ApiKeyGuard, JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(CurrentPermissions.ListAlmacen)
  findAll(
    @Query() dto: PaginationDto,
    @GetUser() user: User
  ) {
    return this.almacenesService.findAll(dto, user)

  }

  @Get('find_almacenes')
  @SwaggerAuthHeaders()
  @UseGuards(ApiKeyGuard, JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(CurrentPermissions.ListAlmacen)
  findAlmacenes(
    @Query() dto: PaginationDto,
    @GetUser() user: User
  ) {
    return this.almacenesService.findAlmacenes(dto, user)

  }

  @Get('find_almacen/:id')
  @SwaggerAuthHeaders()
  @UseGuards(ApiKeyGuard, JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(CurrentPermissions.ListAlmacen)
  findOne(
    @Param() dto: ParamAlmacenID
  ) {
    return this.almacenesService.findOne(dto)
  }


  @Delete('delete_almacen/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @SwaggerAuthHeaders()
  @UseGuards(ApiKeyGuard, JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(CurrentPermissions.DeleteAlmacen)
  deleteAlmacen(
    @Param() dto: ParamAlmacenID,
    @GetUser() user: User
  ) {
    return this.almacenesService.deleteAlmacen(dto, user)
  }

  @Patch('update_almacen/:id')
  @SwaggerAuthHeaders()
  @UseGuards(ApiKeyGuard, JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(CurrentPermissions.UpdateAlmacen)
  updateAlmacen(
    @Param() almacenId: ParamAlmacenID,
    @Body() dto: UpdateAlmacenDto,
    @GetUser() user: User
  ) {
    return this.almacenesService.updateAlmacen(almacenId, dto, user)
  }


  @Post('products/add_stock')
  @SwaggerAuthHeaders()
  @UseGuards(ApiKeyGuard, JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(CurrentPermissions.AddStock)
  async addStock(
    @Body() dto: AddStockDto,
    @GetUser() user: User
  ): Promise<Inventario> {
    return this.almacenesService.addStockWithEntrada(dto.almacenId, dto, user)

  }

  @Post('products/add_multiple_stock')
  @SwaggerAuthHeaders()
  @UseGuards(ApiKeyGuard, JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(CurrentPermissions.AddStock)
  async addMultipleStock(
    @Body() dto: AddMultipleStockDto,
    @GetUser() user: User
  ): Promise<Inventario[]> {
    return this.almacenesService.addMultipleStock(
      dto.almacenId,
      dto.stockData,
      user
    );
  }

  @Get('products/get_products')
  @SwaggerAuthHeaders()
  @UseGuards(ApiKeyGuard, JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(CurrentPermissions.ListStock)
  async getProducts(
    @Query() dto: InventoryQueryDto,
  ) {
    const { almacenId, ...pagination } = dto;
    return await this.almacenesService.getProducts(almacenId, pagination)
  }

  @Get('products/find_product')
  @SwaggerAuthHeaders()
  @UseGuards(ApiKeyGuard, JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(CurrentPermissions.ListStock)
  async getProduct(
    @Query('almacenId') almacenId: number,
    @Query('productId') productId: number,
  ) {
    return await this.almacenesService.getProduct(almacenId, productId)
  }


  @Delete('products/remove_stock')
  @SwaggerAuthHeaders()
  @UseGuards(ApiKeyGuard, JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(CurrentPermissions.RemoveStock)
  async removeStock(
    @Query('almacenId', ParseIntPipe) almacenId: number,
    @Query('productId') productId: number,
    @Query('cantidad', ParseIntPipe) cantidad: number,
    @Query('prestadaPara') prestadaPara: string,
    @GetUser() user: User
  ) {
    return this.almacenesService.removeStock(almacenId, productId, cantidad, prestadaPara, user)
  }

  // GET ALL THE ADMIN USERS
  @Get('encargados/all_encargados')
  @SwaggerAuthHeaders()
  @UseGuards(ApiKeyGuard, JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(CurrentPermissions.ListUser)
  async getEncargados() {
    return this.almacenesService.findAllAdminAlmacenUsers();
  }

  @Post('products/upload-excel')
  @SwaggerAuthHeaders()
  @UseGuards(ApiKeyGuard, JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(CurrentPermissions.AddStock)
  @UseInterceptors(FileInterceptor('file'))
  async uploadExcel(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { almacenId: number },
    @GetUser() user: User,
  ) {
    const getCellValue = (cell: any) => {
      if (cell.formula) {
        return cell.result;
      }
      return cell.value;
    };

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer);
    const worksheet = workbook.worksheets[0];

    let headerRow: number | null = null;
    let codigoCol: number | null = null;
    let articuloCol: number | null = null;
    let unidadCol: number | null = null;
    let stockCol: number | null = null;

    for (let i = 1; i <= Math.min(20, worksheet.rowCount); i++) {
      const row = worksheet.getRow(i);
      codigoCol = null;
      articuloCol = null;
      unidadCol = null;
      stockCol = null;

      row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
        const header = String(cell.value || '').trim().toUpperCase();

        if (header.includes('CÓDIGO') || header.includes('CODIGO')) {
          codigoCol = colNumber;
        } else if (header.includes('ARTICULO') || header.includes('ÁRTICULO')) {
          articuloCol = colNumber;
        } else if (header.includes('UNIDAD')) {
          unidadCol = colNumber;
        } else if (header.includes('STOCK')) {
          stockCol = colNumber;
        }
      });

      if (codigoCol && articuloCol && stockCol) {
        headerRow = i;
        break;
      }
    }

    if (!headerRow || !codigoCol || !articuloCol || !stockCol) {
      throw new BadRequestException(
        `Excel validation failed. Found - Codigo: ${codigoCol}, Articulo: ${articuloCol}, Unidad: ${unidadCol}, Stock: ${stockCol}`
      );
    }

    // Extract all data
    const items: any[] = [];
    for (let i = headerRow + 1; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i);

      const codigo = String(getCellValue(row.getCell(codigoCol)) || '').trim();
      const articulo = String(getCellValue(row.getCell(articuloCol)) || '').trim();
      const unidad = unidadCol
        ? String(getCellValue(row.getCell(unidadCol)) || 'unidad').trim()
        : 'unidad';
      const cantidad = Number(getCellValue(row.getCell(stockCol)));

      if (!articulo || isNaN(cantidad) || cantidad <= 0) {
        continue;
      }

      items.push({
        codigo,
        articulo,
        unidad,
        cantidad,
        rowIndex: i,
      });
    }

    return this.almacenesService.queueExcelUpload(body.almacenId, user, items);
  }

  @Get('jobs/:jobId')
  @SwaggerAuthHeaders()
  @UseGuards(ApiKeyGuard, JwtAuthGuard, PermissionsGuard)
  async getJobStatus(@Param('jobId') jobId: string) {
    return this.almacenesService.getJobStatus(jobId);
  }
}
