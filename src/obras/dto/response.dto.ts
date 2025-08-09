import { ApiProperty } from "@nestjs/swagger";
import { PaginatedResponseDto } from "src/common/dto/pagination.dto";

export class GetObraDto {
  id: number;

  name: string;

  description: string;

  location: string;

  isActive: boolean;

}

export class PaginatedObraDto extends PaginatedResponseDto<GetObraDto> {
  @ApiProperty({
    description: 'Array de obras mas la paginacion',
    type: [GetObraDto], 
  })
 declare data: GetObraDto[];

}
