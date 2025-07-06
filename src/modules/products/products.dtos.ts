import { GetPaginateParamsDto } from 'src/common/dtos/get-paginate-params.dto';
import {
  GetProductsMeta,
  UpdateProductsPrice,
  UpdateProductsStock,
} from '#/catalog/products';
import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { GetOffsetParamsDto } from 'src/common/dtos/get-offset-params.dto';
import { ProductStatus } from 'src/modules/products/products.entity';
import {
  CreateProductParams,
  ToggleAttachProductsToCategoryParams,
  UpdateProductsPricesParams,
  UpdateProductsStocksParams,
} from '#/catalog';

export class GetProductsPaginateDto
  extends GetPaginateParamsDto
  implements GetProductsMeta
{
  @ApiProperty({ enum: ProductStatus, required: false })
  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  query?: string;

  @ApiProperty({ type: [Number], required: false })
  @IsArray()
  @IsNumber({}, { each: true })
  @ArrayMaxSize(100)
  @IsOptional()
  @Type(() => Number)
  categoryIds: number[] = [];

  @ApiProperty({ type: [Number], required: false })
  @IsArray()
  @IsNumber({}, { each: true })
  @ArrayMaxSize(100)
  @IsOptional()
  @Type(() => Number)
  brandIds: number[] = [];

  @ApiProperty({ type: [Number], required: false })
  @IsArray()
  @IsNumber({}, { each: true })
  @ArrayMaxSize(100)
  @IsOptional()
  @Type(() => Number)
  tagIds: number[] = [];
}

export class GetProductsOffsetDto
  extends GetOffsetParamsDto
  implements GetProductsMeta
{
  @ApiProperty({ enum: ProductStatus, required: false })
  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  query?: string;

  @ApiProperty({ type: [Number], required: false })
  @IsArray()
  @IsNumber({}, { each: true })
  @ArrayMaxSize(100)
  @IsOptional()
  @Type(() => Number)
  categoryIds: number[] = [];

  @ApiProperty({ type: [Number], required: false })
  @IsArray()
  @IsNumber({}, { each: true })
  @ArrayMaxSize(100)
  @IsOptional()
  @Type(() => Number)
  brandIds: number[] = [];

  @ApiProperty({ type: [Number], required: false })
  @IsArray()
  @IsNumber({}, { each: true })
  @ArrayMaxSize(100)
  @IsOptional()
  @Type(() => Number)
  tagIds: number[] = [];
}

export class GetProductsByUuidsDto {
  @ApiProperty({ type: [String], description: 'Массив UUID продуктов' })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @Transform(({ value }) =>
    value.map((uuid: string) => Buffer.from(uuid, 'hex')),
  )
  uuid: Uint8Array[];
}

export class GetProductByUuidDto {
  @ApiProperty({ description: 'Product UUID' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9a-f]{32}$/, { message: 'Invalid UUID format' })
  @Transform(({ value }) => Buffer.from(value, 'hex'))
  uuid: string;
}

export class UpsertProductMetaDto {
  @ApiProperty({
    description: 'Название продукта',
    example: 'Смартфон XYZ',
    minLength: 3,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 255)
  name: string;

  @ApiProperty({
    description: 'Slug продукта',
    example: 'smartphone-xyz',
    minLength: 3,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 255)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'Slug должен содержать только строчные буквы, цифры и дефисы, и не может начинаться или заканчиваться дефисом',
  })
  @Transform(({ value }) => value.toLowerCase())
  slug: string;

  @ApiProperty({
    description: 'Описание продукта',
    example: 'Высокопроизводительный смартфон с отличной камерой',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Цена продукта в центах',
    example: 99900,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  price: number;

  @ApiProperty({
    description: 'ID бренда',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  brandId?: number;
}

export class CreateProductDto implements CreateProductParams {
  @ApiProperty({
    description: 'Данные для создания товара',
    type: UpsertProductMetaDto,
  })
  @IsNotEmpty({ message: 'Данные для создания товара не могут быть пустыми' })
  @ValidateNested()
  @Type(() => UpsertProductMetaDto)
  data: UpsertProductMetaDto;
}

export class UpdateProductDto implements CreateProductParams {
  @ApiProperty({
    description: 'Данные для создания товара',
    type: UpsertProductMetaDto,
  })
  @IsNotEmpty({ message: 'Данные для создания товара не могут быть пустыми' })
  @ValidateNested()
  @Type(() => UpsertProductMetaDto)
  data: UpsertProductMetaDto;
}

export class UpdateProductsStatusDto {
  @ApiProperty({
    enum: ProductStatus,
    description: 'Новый статус для продуктов',
    example: ProductStatus.PUBLISHED,
  })
  @IsEnum(ProductStatus)
  @IsNotEmpty()
  status: ProductStatus;

  @ApiProperty({
    type: [String],
    description: 'Массив UUID продуктов для обновления статуса',
    example: [
      '550e8400e29b41d4a716446655440000',
      '550e8400e29b41d4a716446655440001',
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @Transform(({ value }) =>
    value.map((uuid: string) => Buffer.from(uuid.replace(/-/g, ''), 'hex')),
  )
  uuids: Uint8Array[];
}

class UpdateProductStockDto implements UpdateProductsStock {
  @ApiProperty({ description: 'ID склада', example: 1 })
  @IsInt()
  @Min(1)
  warehouseId: number;

  @ApiProperty({ description: 'Количество товара', example: 10 })
  @IsInt()
  @Min(-1)
  count: number;

  @ApiProperty({
    description: 'UUID продукта',
    example: '550e8400e29b41d4a716446655440000',
  })
  @IsNotEmpty()
  @Transform(({ value }) => Buffer.from(value, 'hex'))
  productUuid: Uint8Array;
}

export class UpdateProductsStocksDto implements UpdateProductsStocksParams {
  @ApiProperty({ type: [UpdateProductStockDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateProductStockDto)
  stocks: UpdateProductStockDto[];
}

class UpdateProductPriceDto implements UpdateProductsPrice {
  @ApiProperty({
    description: 'UUID продукта',
    example: '550e8400e29b41d4a716446655440000',
  })
  @IsNotEmpty()
  @Transform(({ value }) => Buffer.from(value, 'hex'))
  productUuid: Uint8Array;

  @ApiProperty({ description: 'Новая цена продукта', example: 1000 })
  @IsInt()
  @Min(0)
  price: number;
}

export class UpdateProductsPricesDto implements UpdateProductsPricesParams {
  @ApiProperty({ type: [UpdateProductPriceDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateProductPriceDto)
  prices: UpdateProductPriceDto[];
}

export class CheckProductAvailableSlugDto {
  @ApiProperty({
    description: 'Slug продукта',
    example: 'smartphone-xyz',
    minLength: 3,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 255)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'Slug должен содержать только строчные буквы, цифры и дефисы, и не может начинаться или заканчиваться дефисом',
  })
  @Transform(({ value }) => value.toLowerCase())
  slug: string;
}

class ToggleAttachProductsToCategoriesDto {
  @ApiProperty({
    type: [String],
    description: 'Массив UUID продуктов',
    example: [
      '550e8400e29b41d4a716446655440000',
      '550e8400e29b41d4a716446655440001',
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsNotEmpty({ each: true })
  @Transform(({ value }) =>
    value.map((uuid: string) => Buffer.from(uuid, 'hex')),
  )
  productUuids: Uint8Array[];

  @ApiProperty({
    description: 'ID категории',
    example: 1,
  })
  @IsInt()
  @Min(1)
  categoryIds: number;
}

export class ToggleAttachProductsToCategoryDto
  implements ToggleAttachProductsToCategoryParams
{
  @ApiProperty({
    type: [ToggleAttachProductsToCategoriesDto],
    description: 'Список продуктов и категорий для прикрепления/открепления',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => ToggleAttachProductsToCategoriesDto)
  list: ToggleAttachProductsToCategoriesDto[];
}
