import { ApiProperty } from "@nestjs/swagger";
import { PaginatedResponseDto, PaginationDto } from "src/common/dto/pagination.dto";
import { Almacen } from "../entities/almacen.entity";
import { Producto } from "src/productos/entities/producto.entity";
import { IsInt } from "class-validator";
import { Type } from "class-transformer";

export class GetAlmacenDto {
  id: number;

  location: string;

  name: string;

  isActive: boolean;

  encargadoName?: string | null;

  encargadoId?: string | null;

  obraName?: string | null;

  obraId?: number | null;

}

export class PaginatedAlmacenDto extends PaginatedResponseDto<GetAlmacenDto> {
  @ApiProperty({
    description: 'Array de almacenes mas la paginacion',
    type: [GetAlmacenDto],
  })
  declare data: GetAlmacenDto[];

}

// Paginate the products
export class GetInventarioDto {

  id: number;

  producto: Producto;

  stock: number;

}

export class PaginatedInventarioDto extends PaginatedResponseDto<GetInventarioDto> {
  @ApiProperty({
    description: 'Array del inventario mas la paginacion',
    type: [GetInventarioDto],
  })
  declare data: GetInventarioDto[];

}

export class InventoryQueryDto extends PaginationDto {
  @ApiProperty({
    description: 'ID del almacen',
    type: Number,
  })
  @IsInt()
  @Type(() => Number)
  almacenId: number;
}
