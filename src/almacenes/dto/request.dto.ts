import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class ParamAlmacenID {
  @ApiProperty({
    description: 'ID of the almacen'
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
