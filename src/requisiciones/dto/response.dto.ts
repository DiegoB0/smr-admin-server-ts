import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsString } from "class-validator";
import { on } from "events";
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

class EquipoMinimal {
  equipo: string;
  serie: string;
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


export class RequisicionItemMinimalDto {
  @ApiProperty({ example: 24 })
  id: number;

  @ApiProperty({ example: 10 })
  cantidadSolicitada: number;

  @ApiProperty({ type: () => ProductoMinimalDto })
  producto: ProductoMinimalDto;
}


export class GetRequisicionDto {
  @ApiProperty({ example: 8 })
  id: number;

  @ApiProperty({ example: '2025-09-22T08:48:34.464Z' })
  fechaSolicitud: Date;

  @ApiProperty({ example: 123 })
  rcp: number;

  @ApiProperty({ example: 'asdf' })
  titulo: string;

  @ApiProperty({ example: 'baja' })
  prioridad: string;

  @ApiProperty({ example: 123 })
  hrm: number;

  @ApiProperty({ example: 'asdf' })
  concepto: string;

  @ApiProperty({ example: 'pendiente' })
  status: string;

  @ApiProperty({ example: 'none' })
  aprovalType: string;

  @ApiProperty({ example: 'product' })
  requisicionType: string;

  @ApiProperty({ example: 1000 })
  cantidad_dinero: number;

  @ApiProperty({ example: 'efectivo' })
  metodo_pago: string;

  @ApiProperty({ type: () => AlmacenMinimalDto })
  almacenDestino: AlmacenMinimalDto;

  @ApiProperty({ type: () => AlmacenMinimalDto })
  almacenCargo: AlmacenMinimalDto;

  @ApiProperty({ type: () => UserMinimalDto })
  pedidoPor: UserMinimalDto;

  @ApiProperty({ type: () => UserMinimalDto, nullable: true })
  revisadoPor: UserMinimalDto | {} | null;

  @ApiProperty({ type: () => EquipoMinimal, nullable: true })
  equipo: EquipoMinimal | {};

  @ApiProperty({ example: null, nullable: true })
  fechaRevision: Date | null;

  @ApiProperty({ type: () => [RequisicionItemMinimalDto] })
  items: RequisicionItemMinimalDto[];
}

export class PaginatedRequisicionDto extends PaginatedResponseDto<GetRequisicionDto> {
  @ApiProperty({
    description: 'Array de requisiciones',
    type: [GetRequisicionDto], 
  })
 declare data: GetRequisicionDto[];

}
