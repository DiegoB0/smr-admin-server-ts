import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class ParamUserID {
  @ApiProperty({
    description: 'ID of the user (UUID)'
  })
  @IsUUID()
  @IsNotEmpty()
  id: string

}

export class CreateUserDto {
  @ApiProperty({ example: 'ola@ola.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '1234' })
  @IsString()
  password: string;

  @ApiProperty({ example: 'bob esponja' })
  @IsString()
  name: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  image?: any;

  @IsArray()
  @Transform(({ value }): string[] => (Array.isArray(value) ? value : [value]))
  @IsUUID('4', { each: true })
  @ApiProperty({ type: [String], example: ['uuid1', 'uuid2'] })
  roles: string[];
}

export class UpdateUserDto {
  @ApiProperty({
    description: 'Flag to see if the user is active'
  })
  @IsOptional()
  isActive?: boolean

  @ApiProperty({ example: 'ola@ola.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '1234' })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({ example: 'bob esponja' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  image?: any;

}

export class ChangeRolesDto {
  @IsArray()
  @Transform(({ value }): string[] => (Array.isArray(value) ? value : [value]))
  @IsUUID('4', { each: true })
  @ApiProperty({ type: [String], example: ['uuid1', 'uuid2'] })
  roles: string[];
}
