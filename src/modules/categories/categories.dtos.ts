import { GetPaginateParamsDto } from 'src/common/dtos/get-paginate-params.dto';
import { GetOffsetParamsDto } from 'src/common/dtos/get-offset-params.dto';
import {
  CreateCategoryParams,
  GetCategoryByIdParams,
  SetImageToCategoryParams,
  UpsertCategoryParams,
} from '#/catalog';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Length,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class GetCategoriesPaginateDto extends GetPaginateParamsDto {}

export class GetCategoriesShortPaginateDto extends GetPaginateParamsDto {}

export class GetCategoriesOffsetDto extends GetOffsetParamsDto {}

export class GetCategoriesShortOffsetDto extends GetOffsetParamsDto {}

export class GetCategoryByIdDto implements GetCategoryByIdParams {
  @ApiProperty({ example: 1, description: 'Page for get' })
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  @Type(() => Number)
  id: number = 1;
}

export class UpsertCategoryData implements UpsertCategoryParams {
  @ApiProperty({
    description: 'Название категории',
    example: 'Новый тег',
    minLength: 3,
    maxLength: 255,
  })
  @Length(3, 255)
  @Type(() => String)
  name: string = 'Tag name';

  @ApiProperty({
    description: 'Slug категории',
    example: 'Slug тег',
    minLength: 3,
    maxLength: 255,
  })
  @Length(3, 255)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'Slug должен содержать только строчные буквы, цифры и дефисы, и не может начинаться или заканчиваться дефисом',
  })
  @Transform(({ value }) => (value ? value?.toLowerCase?.() : undefined))
  @Type(() => String)
  slug: string = 'Tag name';

  @ApiProperty({
    description: 'Is Active категории',
    example: true,
  })
  @IsBoolean()
  @Type(() => Boolean)
  isActive: boolean = true;

  @ApiProperty({ example: null, description: 'Page for get', required: false })
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  @IsOptional()
  @Type(() => Number)
  parentId: number | undefined = undefined;
}

export class CreateCategoryDto implements CreateCategoryParams {
  @ApiProperty({
    description: 'Данные для создания категории',
    type: UpsertCategoryData,
  })
  @IsNotEmpty({
    message: 'Данные для создания категории не могут быть пустыми',
  })
  @ValidateNested()
  @Type(() => UpsertCategoryData)
  data: UpsertCategoryData;
}

export class UpdateCategoryDto implements CreateCategoryParams {
  @ApiProperty({
    description: 'Данные для обновления категории',
    type: UpsertCategoryData,
  })
  @IsNotEmpty({
    message: 'Данные для обновления категории не могут быть пустыми',
  })
  @ValidateNested()
  @Type(() => UpsertCategoryData)
  data: UpsertCategoryData;
}

export class UpdateCategoryImageDto
  implements Omit<SetImageToCategoryParams, 'id'>
{
  @ApiProperty({
    description: 'Массив байтов изображения категории',
    type: 'array',
    items: {
      type: 'integer',
      minimum: 0,
      maximum: 255,
    },
    minItems: 16,
    maxItems: 16,
    example: [
      0x55, 0x0e, 0x8a, 0x00, 0x2b, 0x10, 0x40, 0x0c, 0x9a, 0x66, 0x11, 0x00,
      0x00, 0x80, 0x5f, 0x4e,
    ],
  })
  @IsNotEmpty({
    message: 'Массив байтов изображения категории не может быть пустым',
  })
  @ValidateNested()
  @Type(() => Uint8Array)
  imageUuid: Uint8Array;
}
