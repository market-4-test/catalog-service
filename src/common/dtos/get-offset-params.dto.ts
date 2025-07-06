import { GetOffsetParams } from '#/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetOffsetParamsDto implements GetOffsetParams {
  @ApiProperty({ example: 0, description: 'Offset for get' })
  @IsInt({ message: 'Offset must be an integer' })
  @Min(0, { message: 'Offset must be at least 0' })
  @Type(() => Number)
  offset: number = 0;

  @ApiProperty({ example: 10, description: 'Limit pages for get' })
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Type(() => Number)
  limit: number = 10;
}
