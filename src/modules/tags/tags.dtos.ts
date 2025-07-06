import { GetPaginateParamsDto } from 'src/common/dtos/get-paginate-params.dto';
import { GetOffsetParamsDto } from 'src/common/dtos/get-offset-params.dto';
import { CheckAvailableTagNamesParams, CreateTagParams, GetTagByIdParams } from '#/catalog';
import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UpsertTagParams } from '#/catalog/tags';

export class GetTagsPaginateDto extends GetPaginateParamsDto {
}

export class GetTagsShortPaginateDto extends GetPaginateParamsDto {
}

export class GetTagsOffsetDto extends GetOffsetParamsDto {
}

export class GetTagsShortOffsetDto extends GetOffsetParamsDto {
}

export class GetTagByIdDto implements GetTagByIdParams {
  @ApiProperty({ example: 1, description: 'Page for get' })
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  @Type(() => Number)
  id: number = 1;
}

export class UpsertTagData implements UpsertTagParams {
  @ApiProperty({
    description: 'Tag name',
    example: 'New Tag',
    minLength: 3,
    maxLength: 100,
  })
  @Length(3, 255)
  @Type(() => String)
  name: string = 'Tag name';
}

export class CreateTagDto implements CreateTagParams {
  @ApiProperty({
    description: 'Data for creating a tag',
    type: UpsertTagData,
  })
  @IsNotEmpty({ message: 'Data for creating a tag cannot be empty' })
  @ValidateNested()
  @Type(() => UpsertTagData)
  data: UpsertTagData;
}

export class UpdateTagDto implements CreateTagParams {
  @ApiProperty({
    description: 'Data for updating tags',
    type: UpsertTagData,
  })
  @IsNotEmpty({ message: 'Data for updating the tag cannot be empty' })
  @ValidateNested()
  @Type(() => UpsertTagData)
  data: UpsertTagData;
}

export class CheckAvailableTagNamesDto implements CheckAvailableTagNamesParams {
  @ApiProperty({
    description: 'Array of tags for checking',
    example: ['Tag 1', 'tag 2', 'tag 3'],
    type: [String],
  })
  @IsArray({ message: 'Must be an array' })
  @ArrayMinSize(1, {
    message: 'The array must contain at least one name',
  })
  @ArrayMaxSize(100, {
    message: 'The array cannot contain more than 100 names',
  })
  @IsString({ each: true, message: 'Each element should be a string' })
  public name: string[];
}
