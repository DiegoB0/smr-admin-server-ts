import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateSalidaItemDto {
  @ApiProperty({
    description: 'ID del producto (string, no UUID)',
    example: 'PROD-00123',
  })
  @IsInt()
  productoId: number;

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
  prestadaPara: string;

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
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateSalidaItemDto)
  items: CreateSalidaItemDto[];
}
