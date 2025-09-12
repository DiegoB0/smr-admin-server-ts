import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Length, ValidateNested } from "class-validator";
import { MetodoPago } from "../types/metodo-pago";
import { PrioridadType } from "../types/prioridad-type";
import { RequisicionType } from "../types/requisicion-type";

export class ParamReporteDto {
  @ApiProperty({
    description: 'ID del reporte'
  })
  @IsString()
  @IsNotEmpty()
  id: string
}

class PeticionProductoItemDto {
  @ApiProperty({
    description: 'ID del producto',
    example: 'PR-234'
  })
  @IsString()
  @IsNotEmpty()
  productoId: string;

  @ApiProperty({
    description: 'Cantidad del producto',
    example: 10
  })
  @IsInt()
  @IsPositive()
  cantidad: number;
}

export class CreatePeticionProductoDto {
  @ApiProperty({
    description: 'Descripcion del uso que se le dara al producto',
    example: 'Es para el equipo X'
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 255)
  observaciones: string;

  @ApiProperty({
    description: 'ID del equipo',
    example: 2,
  })
  @IsInt()
  @IsPositive()
  equipoId: number;

  @ApiProperty({
    description: 'Lista de productos solicitados',
    type: () => PeticionProductoItemDto,
    isArray: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PeticionProductoItemDto)
  items: PeticionProductoItemDto[];
}

class UpdatePeticionProductoItemDto {
  @ApiProperty({
    description: 'ID del producto',
    example: 'PR-234'
  })
  @IsString()
  @IsOptional()
  productoId?: string;

  @ApiProperty({
    description: 'Cantidad del producto',
    example: 10
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
  cantidad?: number;
}

export class UpdatePeticionProductoDto {
  @ApiProperty({
    description: 'Descripcion del uso que se le dara al producto',
    example: 'Es para el equipo X'
  })
  @IsString()
  @IsOptional()
  @Length(3, 255)
  observaciones?: string;

  @ApiProperty({
    description: 'ID del equipo',
    example: 2,
  })
  @IsInt()
  @IsPositive()
  equipoId: number;

  @ApiProperty({
    description: 'Lista de productos solicitados',
    type: () => UpdatePeticionProductoItemDto,
    isArray: true,
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdatePeticionProductoItemDto)
  items?: UpdatePeticionProductoItemDto[];
}

export class CreateRequisicionDto {
  @ApiProperty({
    description: 'ID de la peticion',
    example: 2,
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
  peticionId?: number;

  @ApiProperty({
    description: 'ID del almacen de cargo',
    example: 2,
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
  almacenCargoId?: number;

  @ApiProperty({
    description: 'Horas de servicio',
    example: 100,
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
  hrm?: number;

  @ApiProperty({
    description: 'Concepto de la requisicion',
    example: "Viaticos",
  })
  @IsString()
  concepto: string;

  @ApiProperty({
    description: 'Prioridad de la requisicion',
    enum: PrioridadType,
    example: PrioridadType.ALTA,
  })
  @IsEnum(PrioridadType, { message: 'La prioridad no es valida' })
  @IsNotEmpty()
  prioridad: PrioridadType;

  @ApiProperty({
    description: 'Método de pago disponible',
    enum: MetodoPago,
    example: MetodoPago.TARJETA,
  })
  @IsEnum(MetodoPago, { message: 'El método de pago no es válido' })
  @IsNotEmpty()
  metodo_pago: MetodoPago;


  @ApiProperty({
    description: 'Método de pago disponible',
    enum: RequisicionType,
    example: RequisicionType.PRODUCT,
  })
  @IsEnum(RequisicionType, { message: 'Tipo de la requisicion' })
  @IsNotEmpty()
  requisicionType: RequisicionType;
}


export class CreateServiceRequisicionDto {
  @ApiProperty({
    description: 'ID del almacen de cargo',
    example: 5,
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
  almacenCargoId?: number;

  @ApiProperty({
    description: 'ID del almacen de cargo',
    example: 2,
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
  almacenDestinoId?: number;

  @ApiProperty({
    description: 'Cantidad de dinero',
    example: '100.00',
    type: Number,
  })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Must be a valid number' })
  @IsPositive()
  @IsOptional()
  cantidad_dinero?: number;

  @ApiProperty({
    description: 'Descripcion de la requisicion',
    example: "Detergente en polvo",
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Concepto de la requisicion',
    example: "Consumibles",
  })
  @IsString()
  concepto: string;

  @ApiProperty({
    description: 'Prioridad de la requisicion',
    enum: PrioridadType,
    example: PrioridadType.ALTA,
  })
  @IsEnum(PrioridadType, { message: 'La prioridad no es valida' })
  @IsNotEmpty()
  prioridad: PrioridadType;

  @ApiProperty({
    description: 'Método de pago disponible',
    enum: MetodoPago,
    example: MetodoPago.TARJETA,
  })
  @IsEnum(MetodoPago, { message: 'El método de pago no es válido' })
  @IsNotEmpty()
  metodo_pago: MetodoPago;


  @ApiProperty({
    description: 'Método de pago disponible',
    enum: RequisicionType,
    example: RequisicionType.SERVICE,
  })
  @IsEnum(RequisicionType, { message: 'Tipo de la requisicion' })
  @IsNotEmpty()
  requisicionType: RequisicionType;
}
