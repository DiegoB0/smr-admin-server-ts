import { ApiProperty } from "@nestjs/swagger";
import { PaginatedResponseDto } from "src/common/dto/pagination.dto";

export class GetSalidaItemDto {
  @ApiProperty() id: number;
  @ApiProperty() cantidadRetirada: number;
  @ApiProperty({ type: () => Object })
  producto: { id: string; name: string };
}

export class GetSalidaDto {
  @ApiProperty() id: number;
  @ApiProperty() fecha: Date;
  @ApiProperty({ type: () => Object })
  almacenOrigen: { id: number; name: string };
  @ApiProperty({ type: () => Object, nullable: true })
  recibidaPor?: { id: string; name: string } | null;
  @ApiProperty({ type: () => Object, nullable: true })
  authoriza?: { id: string; name: string } | null;
  @ApiProperty({ type: [GetSalidaItemDto] })
  items: GetSalidaItemDto[];
}

export class PaginatedSalidaDto extends PaginatedResponseDto<GetSalidaDto> {
  @ApiProperty({
    description: 'Array de salidas con paginación',
    type: [GetSalidaDto],
  })
  declare data: GetSalidaDto[];
}
