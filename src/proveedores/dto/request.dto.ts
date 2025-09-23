import { ApiProperty } from "@nestjs/swagger"
import { IsBoolean, IsOptional, IsString } from "class-validator"

export class CreateProveedorDto {
  @ApiProperty({ example: 'Refri Car' })
  @IsString()
  name: string
}

export class UpdateProveedorDto {
  @ApiProperty({ example: 'Almacen central' })
  @IsOptional()
  @IsString()
  name: string

  @ApiProperty({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
