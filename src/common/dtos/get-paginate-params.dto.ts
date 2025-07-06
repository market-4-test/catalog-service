import { GetPaginateParams } from '#/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetPaginateParamsDto implements GetPaginateParams {
  @ApiProperty({ example: 1, description: 'Page for get' })
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  @Type(() => Number)
  page: number = 1;

  @ApiProperty({ example: 10, description: 'Limit items for get' })
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Type(() => Number)
  limit: number = 10;
}
