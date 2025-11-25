import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponseDto } from 'src/common/dto/pagination.dto';

/* ======= Minimal DTOs ======= */

export class ProductoMinimalDto {
  @ApiProperty({ example: 1 })
  id: string;

  @ApiProperty({ example: 'Cemento gris' })
  name: string;
}

export class EntradaItemMinimalDto {
  @ApiProperty({ example: 10 })
  id: number;

  @ApiProperty({ example: 50 })
  cantidadRecibida: number;


  @ApiProperty({ example: 50 })
  cantidadEsperada: number;

  @ApiProperty({ type: () => ProductoMinimalDto })
  producto: ProductoMinimalDto;
}

export class AlmacenMinimalDto {
  @ApiProperty({ example: 2 })
  id: number;

  @ApiProperty({ example: 'Almacén Central' })
  name: string;
}

export class UserMinimalDto {
  @ApiProperty({ example: 'asfdasfd' })
  id: string;

  @ApiProperty({ example: 'Carlos Alberto' })
  name: string;
}

export class RequisicionMinimalDto {
  @ApiProperty({ example: 4 })
  id: number;

  @ApiProperty({ example: 123 })
  rcp: number;
}

/* ======= Main Entrada DTO ======= */

export class GetEntradaDto {
  @ApiProperty({ example: 15 })
  id: number;

  @ApiProperty({ example: '2025-08-08T05:42:51.930Z' })
  fechaCreacion: Date;

  @ApiProperty({ type: () => AlmacenMinimalDto })
  almacenDestino: AlmacenMinimalDto;

  @ApiProperty({ type: () => UserMinimalDto })
  recibidoPor: UserMinimalDto;

  @ApiProperty({ type: () => RequisicionMinimalDto })
  requisicion: RequisicionMinimalDto | null;

  @ApiProperty({ type: () => [EntradaItemDto] })
  items: EntradaItemDto[];
}

export class EntradaItemDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  cantidadEsperada: number;

  @ApiProperty({ nullable: true })
  cantidadRecibida: number | null;

  @ApiProperty({ nullable: true })
  descripcion: string;

  @ApiProperty({ nullable: true })
  unidad: string;

  @ApiProperty({ nullable: true })
  refaccionItem: any;

  @ApiProperty({ nullable: true })
  insumoItem: any;

  @ApiProperty({ nullable: true })
  filtroItem: any;
}

/* ======= Paginated DTO ======= */

export class PaginatedEntradaDto extends PaginatedResponseDto<GetEntradaDto> {
  @ApiProperty({
    description: 'Array de entradas registradas en el sistema',
    type: [GetEntradaDto],
  })
  declare data: GetEntradaDto[];
}
