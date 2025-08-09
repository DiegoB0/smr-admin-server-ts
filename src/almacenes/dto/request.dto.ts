import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID, ValidateNested } from "class-validator";

export class ParamAlmacenID {
  @ApiProperty({
    description: 'ID del almacen'
  })
  @IsNumber()
  @IsNotEmpty()
  id: number
}

export class CreateAlmacenDto {
  @ApiProperty({ example: 'Almacen penasquito' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Justo sierra #107, col. J. Guadalupe Rodriguez' })
  @IsString()
  location: string;

  @ApiPropertyOptional({ example: 1, description: 'ID de la obra a la que pertenece este almacén' })
  @IsOptional()
  @IsNumber()
  obraId?: number;

  @ApiPropertyOptional({ example: 'b3f8c2a4-5d6e-4f3a-9a2b-1c2d3e4f5a6b', description: 'UUID del usuario encargado' })
  @IsOptional()
  @IsUUID()
  encargadoId?: string;
}

export class UpdateAlmacenDto {
  @ApiProperty({ example: 'Almacen penasquito' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Justo sierra #107, col. J. Guadalupe Rodriguez' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 1, description: 'ID de la obra a la que pertenece este almacén' })
  @IsOptional()
  @IsNumber()
  obraId?: number;

  @ApiPropertyOptional({ example: '890bc38a-a7db-4e68-a276-c12cf019bde4', description: 'UUID del usuario encargado' })
  @IsOptional()
  @IsUUID()
  encargadoId?: string;
}

export class AddStockDto {
  @ApiProperty({
    example: 1,
    description: 'ID del almacén donde se va a agregar stock',
  })
  @IsInt()
  almacenId: number;

  @ApiProperty({
    example: 'prod-001',
    description: 'ID del producto al que se le va a agregar stock',
  })
  @IsString()
  productId: string;

  @ApiProperty({
    example: 10,
    description: 'Cantidad de stock a agregar',
  })
  @IsInt()
  @IsPositive()
  cantidad: number;
}

export class AddMultipleStockDto {
  @ApiProperty({
    type: [AddStockDto],
    description: 'Arreglo de objetos para agregar stock a múltiples productos',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddStockDto)
  stockData: AddStockDto[];
}
