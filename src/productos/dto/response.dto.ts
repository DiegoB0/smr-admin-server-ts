import { ApiProperty } from "@nestjs/swagger";
import { PaginatedResponseDto } from "src/common/dto/pagination.dto";

export class GetProductDto {
  id: string;

  name: string;

  description: string;

  unidad: string;

  precio: number;

  imageUrl?: string;

  isActive: boolean;

}

export class PaginatedProductoDto extends PaginatedResponseDto<GetProductDto> {
  @ApiProperty({
    description: 'Array de productos mas la paginacion',
    type: [GetProductDto], 
  })
 declare data: GetProductDto[];

}
