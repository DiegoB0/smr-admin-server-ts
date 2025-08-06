import { ApiProperty } from "@nestjs/swagger";
import { PaginatedResponseDto } from "src/common/dto/pagination.dto";
import { Almacen } from "../entities/almacen.entity";
import { Producto } from "src/productos/entities/producto.entity";

export class GetAlmacenDto {
  id: number;

  location: string;

  name: string;

  isActive: boolean;

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

  almacen: Almacen;

  productos: Producto[];

  cantidad: number;

}

export class PaginatedInventarioDto extends PaginatedResponseDto<GetInventarioDto> {
  @ApiProperty({
    description: 'Array del inventario mas la paginacion',
    type: [GetInventarioDto], 
  })
 declare data: GetInventarioDto[];

}
