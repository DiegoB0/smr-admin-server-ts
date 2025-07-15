import { ApiProperty } from "@nestjs/swagger";
import { PaginatedResponseDto } from "src/common/dto/pagination.dto";

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
