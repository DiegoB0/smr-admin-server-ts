import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional } from "class-validator";
import { PaginatedResponseDto, PaginationDto } from "src/common/dto/pagination.dto";

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

export class ObraQueryDto extends PaginationDto {
  @IsOptional()
  @IsNumber()
  almacenId?: number;
}
