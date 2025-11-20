import { ApiProperty } from '@nestjs/swagger';
import { RequisicionType } from '../types/requisicion-type';
import { PrioridadType } from '../types/prioridad-type';
import { MetodoPago } from '../types/metodo-pago';
import { IsEnum, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRequisicionDto {
  @ApiProperty({ example: 1, description: 'RCP number', required: false })
  rcp?: number;

  @ApiProperty({ example: 'Refacciones para máquina X' })
  titulo: string;

  @ApiProperty({ example: 'Observaciones generales' })
  observaciones: string;

  @ApiProperty({
    enum: PrioridadType,
    example: PrioridadType.ALTA,
  })
  @IsEnum(PrioridadType)
  prioridad: PrioridadType;

  @ApiProperty({ example: 250, description: 'Horas de servicio', required: false })
  hrm: number;

  @ApiProperty({ example: 'Concepto del gasto' })
  concepto: string;

  @ApiProperty({ enum: RequisicionType, example: RequisicionType.REFACCIONES })
  requisicionType: RequisicionType;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsNumber()
  almacenCargoId: number;

  @ApiProperty({ example: 1, required: false })
  @Type(() => Number)
  @IsNumber()
  proveedorId?: number;

  // @ApiProperty({ example: 1, required: false })
  // @Type(() => Number)
  // @IsNumber()
  // equipoId?: number;

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
  items: CreateRefaccionItemDto[] | CreateInsumoItemDto[] | CreateFilterItemDto[];
}

export class CreateRefaccionItemDto {
  @ApiProperty({ example: 'PQ-100' })
  customId: string;

  @ApiProperty({ example: 'Filtro de aire' })
  name: string;

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

  @ApiProperty({ example: 1, required: false })
  equipoId?: number;
}

export class CreateInsumoItemDto {
  @ApiProperty({ example: 10 })
  cantidad: number;

  @ApiProperty({ example: 'litro' })
  unidad: string;

  @ApiProperty({ example: 'Aceite lubricante' })
  descripcion: string;

  @ApiProperty({ example: 25.75 })
  precio_unitario: number;

  @ApiProperty({ example: 'USD' })
  currency: string;

  @ApiProperty({ example: true, required: false })
  is_product?: boolean;
}

export class CreateFilterItemDto {
  @ApiProperty({ example: 'PQ-100' })
  customId: string;

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

  hrs_snapshot: number;

  @ApiProperty({ example: 1, required: false })
  equipoId?: number;
}
