import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, MinLength, IsInt } from 'class-validator';

export class CreateEquipoDto {
  @ApiProperty({ example: 'Tractor Komatsu' })
  @IsString()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  equipo: string;

  @ApiProperty({ example: 'TD-27' })
  @IsString()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  no_economico: string;

  @ApiProperty({ example: '275-AX' })
  @IsString()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  modelo: string;

  @ApiProperty({ example: '40207' })
  @IsString()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  serie: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID de la categoria de filtros asignada al equipo',
  })
  @IsOptional()
  @IsInt()
  filtroCategoriaId?: number;

}

export class UpdateEquipoDto {
  @ApiProperty({ example: 'Tractor Komatsu' })
  @IsString()
  @IsOptional()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  equipo?: string;

  @ApiProperty({ example: 'TD-27' })
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  no_economico?: string;

  @ApiProperty({ example: '275-AX' })
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  modelo?: string;

  @ApiProperty({ example: '40207' })
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  serie?: string;

  @ApiPropertyOptional({ example: true, description: 'Whether the obra is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID de la categoria de filtros asignada al equipo',
  })
  @IsOptional()
  @IsInt()
  filtroCategoriaId?: number;
}
