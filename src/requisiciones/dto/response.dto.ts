import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsString } from "class-validator";
import { PaginatedResponseDto, PaginationDto } from "src/common/dto/pagination.dto";

export class ReporteQueryDto extends PaginationDto {
  @ApiProperty({
    description: 'ID del usuario',
    type: String,
  })
  @IsString()
  @Type(() => String)
  userId: string;
}


class AlmacenMinimalDto {
  @ApiProperty({ example: 'Almacen Colima' })
  name: string;
}

class UserMinimalDto {
  @ApiProperty({ example: 'diego@almacen.com' })
  email: string;
}

class ProductoMinimalDto {
  @ApiProperty({ example: 'PR-234' })
  id: string;

  @ApiProperty({ example: 'Pieza Random' })
  name: string;
}

class PeticionItemMinimalDto {
  @ApiProperty({ example: 5 })
  id: number;

  @ApiProperty({ example: 10 })
  cantidad: number;

  @ApiProperty({ type: () => ProductoMinimalDto })
  producto: ProductoMinimalDto;
}

export class GetPeticionProductDto {
  @ApiProperty({ example: 3 })
  id: number;

  @ApiProperty({ example: '2025-08-08T05:42:51.930Z' })
  fechaCreacion: Date;

  @ApiProperty({ example: 'PENDIENTE' })
  status: string;

  @ApiProperty({ example: 'Es para el equipo X' })
  observaciones: string;

  @ApiProperty({ example: null, nullable: true })
  fechaRevision: Date | null;

  @ApiProperty({ type: () => AlmacenMinimalDto })
  almacen: AlmacenMinimalDto;

  @ApiProperty({ type: () => UserMinimalDto })
  creadoPor: UserMinimalDto;

  @ApiProperty({ type: () => UserMinimalDto, nullable: true })
  revisadoPor: UserMinimalDto | null;

  @ApiProperty({ type: () => [PeticionItemMinimalDto] })
  items: PeticionItemMinimalDto[];
}

export class PaginatedPeticionProductoDto extends PaginatedResponseDto<GetPeticionProductDto> {
  @ApiProperty({
    description: 'Array de productos a pedir por el operador',
    type: [GetPeticionProductDto], 
  })
 declare data: GetPeticionProductDto[];

}
