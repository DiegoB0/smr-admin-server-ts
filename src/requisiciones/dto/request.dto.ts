import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, Length, ValidateNested } from "class-validator";
import { MetodoPago } from "../types/metodo-pago";

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
    description: 'ID del almacen',
    example: 2,
  })
  @IsInt()
  @IsPositive()
  almacenId: number;

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
  peticionId: number;

  @ApiProperty({
    description: 'Método de pago disponible',
    enum: MetodoPago,
    example: MetodoPago.TARJETA,
  })
  @IsEnum(MetodoPago, { message: 'El método de pago no es válido' })
  @IsNotEmpty()
  metodo_pago: MetodoPago;
}
