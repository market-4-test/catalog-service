import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  Put,
  Query,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { BigintSerializerInterceptor } from 'src/interceptors/bigint-serializer/bigint-serializer.interceptor';
import { ProductsService } from 'src/modules/products/products.service';
import { ApiOperation, ApiParam } from '@nestjs/swagger';
import {
  CheckProductAvailableSlugDto,
  CreateProductDto,
  GetProductsByUuidsDto,
  GetProductsOffsetDto,
  GetProductsPaginateDto,
  ToggleAttachProductsToCategoryDto,
  UpdateProductDto,
  UpdateProductsPricesDto,
  UpdateProductsStatusDto,
} from 'src/modules/products/products.dtos';
import { ProductStatus } from 'src/modules/products/products.entity';

@Controller('products')
@UseInterceptors(BigintSerializerInterceptor)
export class ProductsController {
  constructor(private readonly _productsService: ProductsService) {}

  @Get('/')
  @ApiOperation({ summary: 'Getting products by pagination' })
  async getCategoriesPaginate(
    @Query(ValidationPipe) dto: GetProductsPaginateDto,
  ) {
    return this._productsService.getProductsPaginate({
      meta: dto,
      params: dto,
    });
  }

  @Get('/short')
  @ApiOperation({ summary: 'Getting products short by pagination' })
  async getCategoriesShortPaginate(
    @Query(ValidationPipe) dto: GetProductsPaginateDto,
  ) {
    return this._productsService.getProductsShortPaginate({
      meta: dto,
      params: dto,
    });
  }

  @Get('/offset')
  @ApiOperation({ summary: 'Getting products by offset' })
  async getCategoriesOffset(@Query(ValidationPipe) dto: GetProductsOffsetDto) {
    return this._productsService.getProductsOffset({
      params: dto,
      meta: dto,
    });
  }

  @Get('/offset/short')
  @ApiOperation({ summary: 'Getting products short by offset' })
  async getCategoriesShortOffset(
    @Query(ValidationPipe) dto: GetProductsOffsetDto,
  ) {
    return this._productsService.getProductsShortOffset({
      params: dto,
      meta: dto,
    });
  }

  @Get('/:uuid')
  @ApiOperation({ summary: 'Getting product by UUID' })
  @ApiParam({
    name: 'uuid',
    description: 'Product UUID (32 characters hex string)',
  })
  async getProductByUuid(@Param('uuid', ValidationPipe) uuid: string) {
    const uuidUint8Array = new Uint8Array(
      Buffer.from(uuid.replace(/-/g, ''), 'hex'),
    );

    if (uuidUint8Array.length != 16) {
      throw new BadRequestException('Invalid UUID format');
    }

    return this._productsService.getProductByUuid({ uuid: uuidUint8Array });
  }

  @Put('/:uuid')
  @ApiOperation({ summary: 'Updating a product by UUID' })
  @ApiParam({
    name: 'uuid',
    description: 'Product UUID (32 characters hex string)',
  })
  async updateProduct(
    @Param('uuid', ValidationPipe) uuid: string,
    @Body(ValidationPipe) dto: UpdateProductDto,
  ) {
    const uuidUint8Array = new Uint8Array(
      Buffer.from(uuid.replace(/-/g, ''), 'hex'),
    );

    if (uuidUint8Array.length != 16) {
      throw new BadRequestException('Invalid UUID format');
    }

    return this._productsService.updateProduct({
      uuid: uuidUint8Array,
      data: dto.data,
    });
  }

  @Delete('/:uuid')
  @ApiOperation({ summary: 'Deleting the product by UUID' })
  @ApiParam({
    name: 'uuid',
    description: 'Product UUID (32 characters hex string)',
  })
  async deleteProduct(@Param('uuid', ValidationPipe) uuid: string) {
    const uuidUint8Array = new Uint8Array(
      Buffer.from(uuid.replace(/-/g, ''), 'hex'),
    );

    if (uuidUint8Array.length != 16) {
      throw new BadRequestException('Invalid UUID format');
    }

    return this._productsService.updateProductsStatus({
      status: ProductStatus.ARCHIVED,
      uuids: [uuidUint8Array],
    });
  }

  @Post('/')
  @ApiOperation({ summary: 'Creating a product' })
  async createProduct(@Body(ValidationPipe) dto: CreateProductDto) {
    try {
      return await this._productsService.createProduct(dto);
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

  @Get('/by/uuids')
  @ApiOperation({ summary: 'Getting products by UUID' })
  async getCategoriesByUuids(
    @Query(ValidationPipe) dto: GetProductsByUuidsDto,
  ) {
    return this._productsService.getProductsByUuids(dto);
  }

  @Post('/batch/status')
  @ApiOperation({ summary: 'Mass status updates for products' })
  async updateProductsStatus(
    @Body(ValidationPipe) dto: UpdateProductsStatusDto,
  ) {
    try {
      return await this._productsService.updateProductsStatus(dto);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      }
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException(
        'Произошла ошибка при обновлении статуса товаров',
      );
    }
  }

  // @Post('/batch/stocks')
  // async updateProductsStocks(
  //   @Body(ValidationPipe) dto: UpdateProductsStocksDto,
  // ) {
  //   try {
  //     return await this._productsService.updateProductsStocks(dto);
  //   } catch (error) {
  //     if (error instanceof ConflictException) {
  //       throw new ConflictException(error.message);
  //     }
  //     if (error instanceof BadRequestException) {
  //       throw new BadRequestException(error.message);
  //     }
  //     throw new InternalServerErrorException(
  //       'Произошла ошибка при обновлении стоков товаров',
  //     );
  //   }
  // }

  @Post('/batch/prices')
  @ApiOperation({ summary: 'Mass price updates for products' })
  async updateProductsPrices(@Body() dto: UpdateProductsPricesDto) {
    return this._productsService.updateProductsPrices(dto);
  }

  @Post('/batch/category')
  @ApiOperation({ summary: 'Mass attachment of a category to products' })
  async attachProductsCategory(@Body() dto: ToggleAttachProductsToCategoryDto) {
    return this._productsService.attachProductsToCategory(dto);
  }

  @Delete('/batch/category')
  @ApiOperation({ summary: 'Mass detachment of a category to products' })
  async detachProductsCategory(@Body() dto: ToggleAttachProductsToCategoryDto) {
    return this._productsService.detachProductsToCategory(dto);
  }

  @Post('/check-available-slug')
  @ApiOperation({ summary: 'Check the availability of slug for the product' })
  async checkProductAvailableSlug(@Body() dto: CheckProductAvailableSlugDto) {
    try {
      const isAvailable =
        await this._productsService.checkProductAvailableSlug(dto);
      return { status: isAvailable };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException(
        'Произошла ошибка при проверке доступности slug',
      );
    }
  }
}
