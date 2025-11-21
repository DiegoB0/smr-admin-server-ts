import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponseDto } from 'src/common/dto/pagination.dto';

export class GetCategoriaFiltroDto {
  id: number;
  nombre: string;
}

export class PaginatedCategoriaFiltroDto extends PaginatedResponseDto<GetCategoriaFiltroDto> {
  @ApiProperty({
    description: 'Categorias de filtro con paginación',
    type: [GetCategoriaFiltroDto],
  })
  declare data: GetCategoriaFiltroDto[];
}
