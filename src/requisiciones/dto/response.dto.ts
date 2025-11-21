import { ApiProperty } from "@nestjs/swagger";
import { PaginatedResponseDto } from "src/common/dto/pagination.dto";

class AlmacenMinimalDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Almacen Colima' })
  name: string;
}

class UserMinimalDto {
  @ApiProperty({ example: 'diego@almacen.com' })
  email: string;

  @ApiProperty({ example: 'Diego' })
  name: string;
}

// Define each type of requisicion items
export class RequisicionRefaccionItemDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: "Shi-432" })
  customId: string;

  @ApiProperty({ example: 10 })
  cantidad: number;

  @ApiProperty({ example: 'Descripción del producto' })
  descripcion: string;

  @ApiProperty({ example: 'piezas' })
  unidad: string;

  @ApiProperty({ example: 100 })
  precio: number;

  @ApiProperty({ example: 'MXN' })
  currency: string;
}


export class RequisicionInsumoItemDto {
  @ApiProperty({ example: 24 })
  id: number;

  @ApiProperty({ example: 10 })
  cantidad: number;

  @ApiProperty({ example: 'Descripción del insumo' })
  descripcion: string;

  @ApiProperty({ example: 'litros' })
  unidad: string;

  @ApiProperty({ example: 50 })
  precio: number;

  @ApiProperty({ example: 'MXN' })
  currency: string;
}

export class RequisicionFilterItemDto {
  @ApiProperty({ example: 24 })
  id: number;

  @ApiProperty({ example: "Shi-432" })
  customId: string;

  @ApiProperty({ example: 5 })
  cantidad: number;

  @ApiProperty({ example: 'Filtro de aire' })
  descripcion: string;

  @ApiProperty({ example: 'unidades' })
  unidad: string;

  @ApiProperty({ example: 75 })
  precio: number;

  @ApiProperty({ example: 'MXN' })
  currency: string;

  @ApiProperty({
    example: {
      equipo: 'Motor',
      serie: 'SN789012',
      no_economico: 'ECO002',
    },
    nullable: true,
  })
  equipo?: { equipo: string; serie: string; no_economico: string } | null;
}

// Whole requisicion example
export class GetRequisicionDto {
  @ApiProperty({ example: 8 })
  id: number;

  @ApiProperty({ example: '2025-09-22T08:48:34.464Z' })
  fechaSolicitud: Date;

  @ApiProperty({ example: 123 })
  rcp: number;

  @ApiProperty({ example: 'Requisición de repuestos' })
  titulo: string;

  @ApiProperty({ example: 'baja' })
  prioridad: string;

  @ApiProperty({ example: 123 })
  hrs: number;

  @ApiProperty({ example: 'Mantenimiento preventivo' })
  concepto: string;

  @ApiProperty({ example: 'pendiente' })
  status: string;

  @ApiProperty({ example: 'none' })
  aprovalType: string;

  @ApiProperty({ example: 'REFACCIONES' })
  requisicionType: string;

  @ApiProperty({ example: 1000 })
  cantidadEstimada: number;

  @ApiProperty({ example: 1000 })
  cantidadActual: number;

  @ApiProperty({ example: 'efectivo' })
  metodo_pago: string;

  @ApiProperty({ type: () => AlmacenMinimalDto })
  almacenDestino: AlmacenMinimalDto;

  @ApiProperty({ type: () => AlmacenMinimalDto })
  almacenCargo: AlmacenMinimalDto;

  @ApiProperty({ type: () => UserMinimalDto })
  pedidoPor: UserMinimalDto;

  @ApiProperty({ type: () => UserMinimalDto, nullable: true })
  revisadoPor: UserMinimalDto | null;

  @ApiProperty({ example: null, nullable: true })
  fechaRevision: Date | null;

  @ApiProperty({ type: () => [RequisicionRefaccionItemDto] })
  refacciones: RequisicionRefaccionItemDto[];

  @ApiProperty({ type: () => [RequisicionInsumoItemDto] })
  insumos: RequisicionInsumoItemDto[];

  @ApiProperty({ type: () => [RequisicionFilterItemDto] })
  filtros: RequisicionFilterItemDto[];
}

export class PaginatedRequisicionDto extends PaginatedResponseDto<GetRequisicionDto> {
  @ApiProperty({
    description: 'Array de requisiciones',
    type: [GetRequisicionDto], 
  })
 declare data: GetRequisicionDto[];

}


// WARN: -- Legacy

// export class ReporteQueryDto extends PaginationDto {
//   @ApiProperty({
//     description: 'ID del usuario',
//     type: String,
//   })
//   @IsString()
//   @Type(() => String)
//   userId: string;
// }
//
//
//
// class PeticionItemMinimalDto {
//   @ApiProperty({ example: 5 })
//   id: number;
//
//   @ApiProperty({ example: 10 })
//   cantidad: number;
//
//   @ApiProperty({ type: () => ProductoMinimalDto })
//   producto: ProductoMinimalDto;
// }
//
// export class GetPeticionProductDto {
//   @ApiProperty({ example: 3 })
//   id: number;
//
//   @ApiProperty({ example: '2025-08-08T05:42:51.930Z' })
//   fechaCreacion: Date;
//
//   @ApiProperty({ example: 'PENDIENTE' })
//   status: string;
//
//   @ApiProperty({ example: 'Es para el equipo X' })
//   observaciones: string;
//
//   @ApiProperty({ example: null, nullable: true })
//   fechaRevision: Date | null;
//
//   @ApiProperty({ type: () => AlmacenMinimalDto })
//   almacen: AlmacenMinimalDto;
//
//   @ApiProperty({ type: () => UserMinimalDto })
//   creadoPor: UserMinimalDto;
//
//   @ApiProperty({ type: () => UserMinimalDto, nullable: true })
//   revisadoPor: UserMinimalDto | null;
//
//
//   @ApiProperty({ type: () => [PeticionItemMinimalDto] })
//   items: PeticionItemMinimalDto[];
// }
//
// export class PaginatedPeticionProductoDto extends PaginatedResponseDto<GetPeticionProductDto> {
//   @ApiProperty({
//     description: 'Array de productos a pedir por el operador',
//     type: [GetPeticionProductDto], 
//   })
//  declare data: GetPeticionProductDto[];
//
// }
//
//
//
//
// export class RequisicionServiceItemMinimalDto {
//   @ApiProperty({ example: 24 })
//   id: number;
//
//   @ApiProperty({ example: 10 })
//   cantidad: number;
//
//   @ApiProperty({ example: 'litros' })
//   unidad: string;
//
//   @ApiProperty({ example: 'descripcion' })
//   descripcion: string;
//
//   @ApiProperty({ example: 10 })
//   precio_unitario: number;
//
// }


// Pagination dto
