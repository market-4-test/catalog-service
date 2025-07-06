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
import { CategoriesService } from 'src/modules/categories/categories.service';
import {
  CreateCategoryDto,
  GetCategoriesOffsetDto,
  GetCategoriesPaginateDto,
  GetCategoriesShortOffsetDto,
  GetCategoriesShortPaginateDto,
  UpdateCategoryDto,
} from 'src/modules/categories/categories.dtos';

@Controller('categories')
@UseInterceptors(BigintSerializerInterceptor)
export class CategoriesController {
  constructor(private readonly _categoriesService: CategoriesService) {}

  @Get('/')
  @ApiOperation({ summary: 'Getting categories by pagination' })
  async getCategoriesPaginate(
    @Query(ValidationPipe) dto: GetCategoriesPaginateDto,
  ) {
    return this._categoriesService.getCategoriesPaginate({
      params: dto,
    });
  }

  @Get('/short')
  @ApiOperation({ summary: 'Getting categories short by pagination' })
  @ApiResponse({
    status: 200,
    description: 'Пользователь успешно создан.',
  })
  async getCategoriesShortPaginate(
    @Query(ValidationPipe) dto: GetCategoriesShortPaginateDto,
  ) {
    return this._categoriesService.getCategoriesShortPaginate({ params: dto });
  }

  @Get('/offset')
  @ApiOperation({ summary: 'Getting categories by offset' })
  async getCategoriesOffset(
    @Query(ValidationPipe) dto: GetCategoriesOffsetDto,
  ) {
    return this._categoriesService.getCategoriesOffset({ params: dto });
  }

  @Get('/offset/short')
  @ApiOperation({ summary: 'Getting categories short by offset' })
  async getCategoriesShortOffset(
    @Query(ValidationPipe) dto: GetCategoriesShortOffsetDto,
  ) {
    return this._categoriesService.getCategoriesShortOffset({ params: dto });
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Getting a category by id' })
  async getCategoryById(@Param('id', ParseIntPipe) id: number) {
    return this._categoriesService.getCategoryById({ id });
  }

  @Get('/:id/short')
  @ApiOperation({ summary: 'Getting a category short by id' })
  async getCategoryShortById(@Param('id', ParseIntPipe) id: number) {
    return this._categoriesService.getCategoryShortById({ id });
  }

  @Post('/')
  @ApiOperation({ summary: 'Creating a category' })
  async createCategory(@Body(ValidationPipe) dto: CreateCategoryDto) {
    try {
      return await this._categoriesService.createCategory(dto);
    } catch (error) {
      console.log(error);
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
  @ApiOperation({ summary: 'Updating a category by id' })
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateCategoryDto,
  ) {
    try {
      const category = await this._categoriesService.updateCategory({
        id,
        data: dto.data,
      });
      if (!category) {
        throw new NotFoundException(`Категория с id ${id} не найден`);
      }
      return category;
    } catch (error) {
      console.log(error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Ошибка при обновлении бренда');
    }
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Remove category by ID' })
  @ApiParam({ name: 'id', description: 'Brand ID' })
  async deleteTag(@Param('id', ParseIntPipe) id: number) {
    try {
      const result = await this._categoriesService.deleteCategory(id);
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
        'An error occurred when removing the category',
      );
    }
  }

  // @Put('/:id/image')
  // async updateCategoryImage(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Body(ValidationPipe) dto: UpdateCategoryImageDto,
  // ) {
  //   try {
  //     const category = await this._categoriesService.setImageToCategory({
  //       id,
  //       imageUuid: dto.imageUuid,
  //     });
  //     if (!category) {
  //       throw new NotFoundException(`Категория с id ${id} не найден`);
  //     }
  //     return category;
  //   } catch (error) {
  //     if (error instanceof NotFoundException) {
  //       throw error;
  //     }
  //     throw new BadRequestException('Ошибка при обновлении бренда');
  //   }
  // }
}
