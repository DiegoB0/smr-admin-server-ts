import { ApiProperty } from "@nestjs/swagger";
import { PaginatedResponseDto } from "src/common/dto/pagination.dto";

export class GetUserDto {
  id: string;

  email: string;

  name: string;

  isActive: boolean;

  roles: string[];

}

export class PaginatedUserDto extends PaginatedResponseDto<GetUserDto> {
  @ApiProperty({
    description: 'Array de usuarios mas la paginacion',
    type: [GetUserDto], 
  })
 declare data: GetUserDto[];

}
