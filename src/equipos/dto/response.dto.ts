import { ApiProperty } from "@nestjs/swagger";
import { PaginatedResponseDto } from "src/common/dto/pagination.dto";

export class GetEquipoDto {
  id: number;

  equipo: string;

  no_economico: string;

  modelo: string

  serie: string;

  isActive: boolean;

}

export class PaginatedEquipoDto extends PaginatedResponseDto<GetEquipoDto> {
  @ApiProperty({
    description: 'Array de productos mas la paginacion',
    type: [GetEquipoDto], 
  })
 declare data: GetEquipoDto[];

}
