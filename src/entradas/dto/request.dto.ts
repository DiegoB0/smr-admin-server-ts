import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, Min } from 'class-validator';

class EntradaItemUpdateDto {
  @ApiProperty({ example: 1, description: 'ID of the entrada item' })
  @IsInt()
  itemId: number;

  @ApiProperty({ example: 5, description: 'Cantidad recibida for this item, must be <= cantidadEsperada' })
  @IsInt()
  @Min(0)
  cantidadRecibida: number;
}

export class UpdateCantidadRecibidaDto {
  @ApiProperty({
    description: 'List of items to update with received quantities',
    type: [EntradaItemUpdateDto],
    example: [
      { itemId: 1, cantidadRecibida: 3 },
      { itemId: 2, cantidadRecibida: 5 },
    ],
  })
  @IsArray()
  items: EntradaItemUpdateDto[];
}
