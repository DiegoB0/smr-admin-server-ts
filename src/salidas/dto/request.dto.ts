import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';

export class CreateSalidaItemDto {
  @ApiProperty({
    description: 'ID del producto (string, no UUID)',
    example: 'PROD-00123',
  })
  @IsString()
  @Length(1, 128) 
  productoId: string;

  @ApiProperty({
    description: 'Cantidad a retirar',
    example: 3,
    minimum: 1,
  })
  @IsInt()
  @IsPositive()
  cantidad: number;
}

export class CreateSalidaDto {
  @ApiProperty({
    description: 'ID del almacén de origen (numérico)',
    example: 12,
  })
  @IsInt()
  @IsPositive()
  almacenOrigenId: number;

  @ApiProperty({
    description: 'Persona que recibe los productos de salida',
    example: 'Diego B',
  })
  @IsString()
  recibidaPor: string;

  @ApiPropertyOptional({
    description: 'Equipo asociado (numérico)',
    example: 5,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  equipoId?: number;

  @ApiProperty({
    description: 'Líneas de salida',
    type: [CreateSalidaItemDto],
    example: [
      { productoId: 'PROD-00123', cantidad: 2 },
      { productoId: 'ABC-XYZ-99', cantidad: 1 },
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateSalidaItemDto)
  items: CreateSalidaItemDto[];
}
