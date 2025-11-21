import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, ValidateNested } from 'class-validator';

export class GetFiltroItemDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  numero: string;

  @ApiProperty({ nullable: true })
  equivalente: string | null;

  @ApiProperty({ nullable: true })
  descripcion: string | null;

  @ApiProperty()
  cantidad: number;

  @ApiProperty()
  unidad: string;
}

export class GetCategoriaFiltroWithItemsDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  nombre: string;

  @ApiProperty({ description: 'Hour requirement level' })
  hrs: number;

  @ApiProperty({ description: 'Requirement name' })
  requirementNombre: string;

  @ApiProperty({ type: [GetFiltroItemDto] })
  items: GetFiltroItemDto[];
}

export class FiltroRequirementGroupDto {
  @ApiProperty({ description: 'Hour requirement level' })
  hrs: number;

  @ApiProperty({ description: 'Requirement name' })
  nombre: string;

  @ApiProperty({ type: [GetFiltroItemDto] })
  items: GetFiltroItemDto[];
}

export class CreateCategoriaFiltroDto {
  @ApiProperty({ description: 'Categoria name' })
  @IsString()
  @IsNotEmpty()
  nombre: string;
}

export class CreatedCategoriaFiltroDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  nombre: string;

  @ApiProperty({ description: 'Auto-created requirements' })
  requirements: {
    hrs: number;
    nombre: string;
  }[];
}

export class CreateFiltroItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  numero: string;

  @ApiProperty({ nullable: true })
  @IsString()
  @IsOptional()
  equivalente?: string;

  @ApiProperty({ nullable: true })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty()
  @IsInt()
  @IsPositive()
  cantidad: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  unidad: string;
}

export class CreateFiltroItemsForRequirementDto {
  @ApiProperty({
    type: [CreateFiltroItemDto],
    description: 'Items to create for this requirement',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFiltroItemDto)
  items: CreateFiltroItemDto[];
}

export class CreatedFiltroItemDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  numero: string;

  @ApiProperty({ nullable: true })
  equivalente: string | null;

  @ApiProperty({ nullable: true })
  descripcion: string | null;

  @ApiProperty()
  cantidad: number;

  @ApiProperty()
  unidad: string;
}

export class UpdateCategoriaFiltroDto {
  @ApiProperty({ description: 'Categoria name' })
  @IsString()
  @IsNotEmpty()
  nombre: string;
}

export class UpdatedCategoriaFiltroDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  nombre: string;
}

export class UpdateFiltroItemDto {
  @ApiProperty({ nullable: true })
  @IsString()
  @IsOptional()
  numero?: string;

  @ApiProperty({ nullable: true })
  @IsString()
  @IsOptional()
  equivalente?: string | null;

  @ApiProperty({ nullable: true })
  @IsString()
  @IsOptional()
  descripcion?: string | null;

  @ApiProperty({ nullable: true })
  @IsInt()
  @IsPositive()
  @IsOptional()
  cantidad?: number;

  @ApiProperty({ nullable: true })
  @IsString()
  @IsOptional()
  unidad?: string;
}

export class UpdatedFiltroItemDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  numero: string;

  @ApiProperty({ nullable: true })
  equivalente: string | null;

  @ApiProperty({ nullable: true })
  descripcion: string | null;

  @ApiProperty()
  cantidad: number;

  @ApiProperty()
  unidad: string;
}
