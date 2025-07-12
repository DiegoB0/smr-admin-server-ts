import { IsArray, IsEmail, IsString, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'ola@ola.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '1234' })
  @IsString()
  password: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'ola@ola.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '1234' })
  @IsString()
  password: string;

  @ApiProperty({ example: 'bob esponja' })
  @IsString()
  name: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @Transform(({ value }): string[] => (Array.isArray(value) ? value : [value]))
  @ApiProperty({ type: [String], example: ['uuid1', 'uuid2'] })
  roles: string[];
}

export class RegisterWithImageDto {
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
  image?: any;

  @IsArray()
  @Transform(({ value }): string[] => (Array.isArray(value) ? value : [value]))
  @IsUUID('4', { each: true })
  @ApiProperty({ type: [String], example: ['uuid1', 'uuid2'] })
  roles: string[];
}
