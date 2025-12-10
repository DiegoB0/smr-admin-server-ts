import { ApiProperty } from '@nestjs/swagger';
import { RequisicionType } from '../types/requisicion-type';
import { PrioridadType } from '../types/prioridad-type';
import { MetodoPago } from '../types/metodo-pago';
import { IsArray, IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ConceptoType } from '../types/concepto-type';

export class CreateRequisicionDto {
  @ApiProperty({ example: 1, description: 'RCP number', required: false })
  @IsOptional()
  @IsNumber()
  rcp?: number;

  @ApiProperty({ example: 'Refacciones para máquina X' })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiProperty({ example: 'Observaciones generales' })
  @IsString()
  @IsOptional()
  observaciones: string;

  @ApiProperty({
    enum: PrioridadType,
    example: PrioridadType.ALTA,
  })
  @IsEnum(PrioridadType)
  prioridad: PrioridadType;

  @ApiProperty({ example: 250, description: 'Horas de servicio', required: false })
  @IsOptional()
  @IsNumber()
  hrs: number;

  @ApiProperty({ enum: ConceptoType, example: ConceptoType.VIATICOS })
  @IsEnum(ConceptoType)
  @IsNotEmpty()
  concepto: ConceptoType;

  @ApiProperty({ enum: RequisicionType, example: RequisicionType.REFACCIONES })
  @IsEnum(RequisicionType)
  @IsNotEmpty()
  requisicionType: RequisicionType;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsNumber()
  almacenCargoId: number;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  almacenDestinoId?: number;

  @ApiProperty({ example: 1, required: false })
  @Type(() => Number)
  @IsNumber()
  proveedorId?: number;

  @ApiProperty({
    enum: MetodoPago,
    example: MetodoPago.SIN_PAGAR,
  })
  metodo_pago: MetodoPago;

  @ApiProperty({ example: 'USD' })
  currency: string;

  @ApiProperty({
    isArray: true,
    oneOf: [
      { $ref: '#/components/schemas/CreateRefaccionItemDto' },
      { $ref: '#/components/schemas/CreateInsumoItemDto' },
      { $ref: '#/components/schemas/CreateFilterItemDto' },
    ],
  })
  @IsArray()
  @Type(() => Object)
  items: CreateRefaccionItemDto[] | CreateInsumoItemDto[] | CreateFilterItemDto[];
}

export class CreateRefaccionItemDto {
  @ApiProperty({ example: 'PQ-100' })
  customId: string;

  @ApiProperty({ example: '123as' })
  no_economico: string;

  @ApiProperty({ example: 'Filtro de aire para motor' })
  descripcion: string;

  @ApiProperty({ example: 'pieza' })
  unidad: string;

  @ApiProperty({ example: 5 })
  cantidad: number;

  @ApiProperty({ example: 150.50 })
  precio: number;

  @ApiProperty({ example: 'USD' })
  currency: string;
}

export class CreateInsumoItemDto {
  @ApiProperty({ example: 10 })
  cantidad: number;

  @ApiProperty({ example: 'litro' })
  unidad: string;

  @ApiProperty({ example: 'Aceite lubricante' })
  descripcion: string;

  @ApiProperty({ example: 25.75 })
  precio: number;

  @ApiProperty({ example: 'USD' })
  currency: string;

  @ApiProperty({ example: true, required: false })
  is_product?: boolean;
}

export class CreateFilterItemDto {
  @ApiProperty({ example: 'PQ-100' })
  customId: string;

  @ApiProperty({ example: '123as' })
  no_economico: string;

  @ApiProperty({ example: 2 })
  cantidad: number;

  @ApiProperty({ example: 'pieza' })
  unidad: string;

  @ApiProperty({ example: 'Filtro hidráulico 250hrs' })
  descripcion: string;

  @ApiProperty({ example: 120.00 })
  precio: number;

  @ApiProperty({ example: 'USD' })
  currency: string;

  @ApiProperty({ example: 250 })
  hrs_snapshot: number;

  @ApiProperty({ example: 1, required: false })
  equipoId?: number;
}

export class UpdateRequisicionItemsDto {
  @ApiProperty({ example: 'consumibles' })
  @IsEnum(RequisicionType)
  requisicionType: RequisicionType;

  @ApiProperty({
    example: [{ id: 1, cantidad: 10, precio: 150.50 }],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateItemDto)
  items: UpdateItemDto[];
}

export class UpdateItemDto {
  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  id?: number;

  @ApiProperty({ example: 10, required: false })
  @IsNumber()
  @IsOptional()
  cantidad?: number;

  @ApiProperty({ example: 150.50, required: false })
  @IsNumber()
  @IsOptional()
  precio?: number;

  @ApiProperty({ example: 'USD', required: false })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ example: 'pieza', required: false })
  @IsString()
  @IsOptional()
  unidad?: string;

  @ApiProperty({ example: 'Some description', required: false })
  @IsString()
  @IsOptional()
  descripcion?: string;

  // For refacciones and filtros only
  @ApiProperty({ example: 'REF-001', required: false })
  @IsString()
  @IsOptional()
  customId?: string;

  @ApiProperty({ example: 'Bomba hidráulica', required: false })
  @IsString()
  @IsOptional()
  no_economico?: string;

  // For filtros only
  @ApiProperty({ example: 1000, required: false })
  @IsNumber()
  @IsOptional()
  hrs_snapshot?: number;

  // For consumibles only
  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  is_product?: boolean;
}

export class PaidItemDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  id: number;

  @ApiProperty({ example: 10 })
  @IsNumber()
  cantidadPagada: number;
}

export class MarkItemsAsPaidDto {
  @ApiProperty({ example: 'consumibles' })
  @IsEnum(RequisicionType)
  requisicionType: RequisicionType;

  @ApiProperty({
    example: [
      { id: 1, cantidadPagada: 10 },
      { id: 2, cantidadPagada: 5 }
    ],
    description: 'Array of items with quantities paid',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaidItemDto)
  items: PaidItemDto[];

  @ApiProperty({ example: 'pago' })
  @IsEnum(MetodoPago)
  metodo_pago: MetodoPago;

  @ApiProperty({ example: 'Se completó la compra' })
  @IsString()
  @IsOptional()
  observaciones?: string;

  @ApiProperty({ example: '2025-12-25' })
  @IsDateString()
  @IsOptional()
  fecha_esperada?: string;
}
