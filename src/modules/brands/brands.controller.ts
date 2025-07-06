import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { BigintSerializerInterceptor } from 'src/interceptors/bigint-serializer/bigint-serializer.interceptor';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { BrandsService } from 'src/modules/brands/brands.service';
import {
  CreateBrandDto,
  GetBrandsOffsetDto,
  GetBrandsPaginateDto,
  GetBrandsShortOffsetDto,
  GetBrandsShortPaginateDto,
  UpdateBrandDto,
} from 'src/modules/brands/brands.dtos';

@Controller('brands')
@UseInterceptors(BigintSerializerInterceptor)
export class BrandsController {
  constructor(private readonly _brandsService: BrandsService) {}

  @Get('/')
  @ApiOperation({ summary: 'Getting brands by pagination' })
  async getBrandsPaginate(@Query(ValidationPipe) dto: GetBrandsPaginateDto) {
    return this._brandsService.getBrandsPaginate({
      params: dto,
    });
  }

  @Get('/short')
  @ApiOperation({ summary: 'Getting brands short by pagination' })
  @ApiResponse({
    status: 200,
    description: 'Пользователь успешно создан.',
  })
  async getBrandsShortPaginate(
    @Query(ValidationPipe) dto: GetBrandsShortPaginateDto,
  ) {
    return this._brandsService.getBrandsShortPaginate({ params: dto });
  }

  @Get('/offset')
  @ApiOperation({ summary: 'Getting brands by offset' })
  async getBrandsOffset(@Query(ValidationPipe) dto: GetBrandsOffsetDto) {
    return this._brandsService.getBrandsOffset({ params: dto });
  }

  @Get('/offset/short')
  @ApiOperation({ summary: 'Getting brands short by offset' })
  async getBrandsShortOffset(
    @Query(ValidationPipe) dto: GetBrandsShortOffsetDto,
  ) {
    return this._brandsService.getBrandsShortOffset({ params: dto });
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Getting a brand by id' })
  async getBrandById(@Param('id', ParseIntPipe) id: number) {
    return this._brandsService.getBrandById({ id });
  }

  @Get('/:id/short')
  @ApiOperation({ summary: 'Getting a brand short by id' })
  async getBrandShortById(@Param('id', ParseIntPipe) id: number) {
    return this._brandsService.getBrandShortById({ id });
  }

  @Post('/')
  @ApiOperation({ summary: 'Creating a brand' })
  async createTag(@Body(ValidationPipe) dto: CreateBrandDto) {
    try {
      return await this._brandsService.createBrand(dto);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      }
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException(
        'Произошла ошибка при создании бренда',
      );
    }
  }

  @Put('/:id')
  @ApiOperation({ summary: 'Updating the brand by id' })
  async updateBrand(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateBrandDto,
  ) {
    try {
      const tag = await this._brandsService.updateBrand({ id, data: dto.data });
      if (!tag) {
        throw new NotFoundException(`Тег с id ${id} не найден`);
      }
      return tag;
    } catch (error) {
      console.log(error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Ошибка при обновлении бренда');
    }
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Remove brand by ID' })
  @ApiParam({ name: 'id', description: 'Brand ID' })
  async deleteTag(@Param('id', ParseIntPipe) id: number) {
    try {
      const result = await this._brandsService.deleteBrand(id);
      if (result) {
        return { message: `Brand with ID ${id} successfully removed` };
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred when removing the brand',
      );
    }
  }
}
