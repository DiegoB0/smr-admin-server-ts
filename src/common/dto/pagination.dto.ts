import {
  IsInt,
  IsOptional,
  Min,
  Max,
  IsString,
  IsIn,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto {
  @ApiProperty({
    description: 'Numero de pagina a obtener',
    type: Number,
    minimum: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({
    description: 'Numero de items por pagina',
    type: Number,
    minimum: 1,
    maximum: 100,
    default: 10,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;

  @ApiProperty({
    description:
      'Campo para buscar por columna en BD',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Acomodar por ascendente o descendente',
    enum: ['ASC', 'DESC'],
    default: 'ASC',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC' = 'ASC';
}

export class PaginationMetaData {
  @ApiProperty({ description: 'The current page number', example: 1 })
  @IsInt()
  currentPage: number;

  @ApiProperty({ description: 'The total number of pages available', example: 5 })
  @IsInt()
  totalPages: number;

  @ApiProperty({ description: 'The total number of items across all pages', example: 45 })
  @IsInt()
  totalItems: number;

  @ApiProperty({ description: 'The number of items per page', example: 10 })
  @IsInt()
  itemsPerPage: number;

  @ApiProperty({ description: 'Indicates if there are more pages after the current one', example: true })
  @IsBoolean()
  hasNextPage: boolean;

  @ApiProperty({ description: 'Indicates if there are pages before the current one', example: false })
  @IsBoolean()
  hasPreviousPage: boolean;
}


export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: 'Array of items for the current page',
    isArray: true, 
  })
  @IsArray()
  @Type(() => Object) 
  data: T[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMetaData,
  })
  @Type(() => PaginationMetaData)
  meta: PaginationMetaData;

  constructor(data: T[], meta: PaginationMetaData) {
    this.data = data;
    this.meta = meta;
  }
}
