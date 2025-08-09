import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, MinLength } from 'class-validator';

export class CreateObraDto {
  @ApiProperty({ example: 'Obra colima' })
  @IsString()
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  name: string;

  @ApiProperty({ example: 'Proyecto mina colima' })
  @IsString()
  @MinLength(5, { message: 'Description must be at least 5 characters long' })
  description: string;

  @ApiProperty({ example: 'Justo Sierra, Colima #103' })
  @IsString()
  location: string;
}

export class UpdateObraDto {


  @ApiProperty({ example: 'Obra colima' })
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  name: string;

  @ApiProperty({ example: 'Proyecto mina colima' })
  @IsOptional()
  @IsString()
  @MinLength(5, { message: 'Description must be at least 5 characters long' })
  description: string;

  @ApiProperty({ example: 'Justo Sierra, Colima #103' })
  @IsOptional()
  @IsString()
  location: string;

  @ApiPropertyOptional({ example: true, description: 'Whether the obra is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
