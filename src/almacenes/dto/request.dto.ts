import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, ValidateNested } from "class-validator";

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
