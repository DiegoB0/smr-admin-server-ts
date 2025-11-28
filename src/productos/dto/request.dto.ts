import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class ParamProductoID {
  @ApiProperty({
    description: 'ID del producto'
  })
  @IsNumber()
  @IsNotEmpty()
  id: number
}

export class CreateProductoDto {
  @ApiProperty({ example: 'PR-234' })
  @IsString()
  @IsOptional()
  customId: string;

  @ApiProperty({ example: 'Pieza Random' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Pieza random para tractor modelo X' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'Pieza' })
  @IsString()
  unidad: string;

  @ApiProperty({ example: 'URL de la foto de la pieza' })
  @IsOptional()
  @IsString()
  imageUrl: string;
}

export class UpdateProductoDto {
  @ApiProperty({ example: 'Pieza Random' })
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Pieza random para tractor modelo X' })
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty({ example: 'REF-100' })
  @IsOptional()
  @IsString()
  customId: string;

  @ApiProperty({ example: 'Pieza' })
  @IsOptional()
  @IsString()
  unidad: string;

  @ApiProperty({ example: 'URL de la foto de la pieza' })
  @IsOptional()
  @IsString()
  imageUrl: string;

  @ApiProperty({ example: 10.00 })
  @IsOptional()
  @IsNumber()
  precio: number;

  @ApiProperty({ example: false })
  @IsOptional()
  @IsBoolean()
  isActive: boolean;
}
