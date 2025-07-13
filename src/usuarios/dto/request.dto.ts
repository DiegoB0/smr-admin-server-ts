import { ApiProperty } from "@nestjs/swagger";

export class ParamUserID {
  @ApiProperty({
    description: 'ID of the user (UUID)'
  })
  id: string

}
