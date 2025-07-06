import { GetPaginateParamsDto } from 'src/common/dtos/get-paginate-params.dto';
import { GetOffsetParamsDto } from 'src/common/dtos/get-offset-params.dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  CreateBrandParams,
  GetBrandByIdParams,
  UpsertBrandParams,
} from '#/catalog';

export class GetBrandsPaginateDto extends GetPaginateParamsDto {}

export class GetBrandsShortPaginateDto extends GetPaginateParamsDto {}

export class GetBrandsOffsetDto extends GetOffsetParamsDto {}

export class GetBrandsShortOffsetDto extends GetOffsetParamsDto {}

export class GetBrandByIdDto implements GetBrandByIdParams {
  @ApiProperty({ example: 1, description: 'Page for get' })
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  @Type(() => Number)
  id: number = 1;
}

export class UpsertBrandData implements UpsertBrandParams {
  @ApiProperty({
    description: 'Brand name',
    example: 'Brand name',
    minLength: 3,
    maxLength: 255,
  })
  @Length(3, 255)
  @Type(() => String)
  name: string = '';

  @ApiProperty({
    description: 'Slug',
    example: 'slug',
    minLength: 3,
    maxLength: 255,
  })
  @Length(3, 255)
  @Type(() => String)
  slug: string = '';

  @ApiProperty({
    description: 'Is Active brand',
    example: true,
  })
  @IsBoolean()
  @Type(() => Boolean)
  isActive: boolean = true;
}

export class CreateBrandDto implements CreateBrandParams {
  @ApiProperty({
    description: 'Data for creating a brand',
    type: UpsertBrandData,
  })
  @IsNotEmpty({ message: 'Data for creating a brand cannot be empty' })
  @ValidateNested()
  @Type(() => UpsertBrandData)
  data: UpsertBrandData;
}

export class UpdateBrandDto implements CreateBrandParams {
  @ApiProperty({
    description: 'Data for updating brands',
    type: UpsertBrandData,
  })
  @IsNotEmpty({ message: 'Data for updating the brand cannot be empty' })
  @ValidateNested()
  @Type(() => UpsertBrandData)
  data: UpsertBrandData;
}
