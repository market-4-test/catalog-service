import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, QueryFailedError, Repository } from 'typeorm';
import { ProductsEntity, ProductStatus } from './products.entity';
import {
  CheckProductAvailableSlugParams,
  CommonToggleAttachProductsResponse,
  CommonToggleAttachProductStatus,
  CreateProductParams,
  GetProductByUuidParams,
  GetProductsByUuidsParams,
  GetProductsOffsetParams,
  GetProductsPaginateParams,
  Product,
  ProductShort,
  ToggleAttachProductsToCategoryParams,
  UpdateProductMetaParams,
  UpdateProductsPricesParams,
  UpdateProductsPricesResponse,
  UpdateProductsPriceStatus,
  UpdateProductsStatusParams,
  UpdateProductsStatusResponse,
  UpdateProductsStocksParams,
  UpdateProductsStocksResponse,
  UpdateProductsStockStatus,
} from '#/catalog';
import { PaginateMeta } from '#/common';
import { StocksEntity } from 'src/modules/stocks/stocks.entity';
import { CategoriesEntity } from 'src/modules/categories/categories.entity';

@Injectable()
export class ProductsService {
  private _defaultLimit = 10;

  constructor(
    @InjectRepository(ProductsEntity)
    private _productsRepository: Repository<ProductsEntity>,
    @InjectRepository(StocksEntity)
    private _stocksRepository: Repository<StocksEntity>,
    @InjectRepository(CategoriesEntity)
    private _categoriesRepository: Repository<CategoriesEntity>,
  ) {}

  private convertEntityToModel(entity: ProductsEntity): Product {
    return {
      meta: {
        uuid: entity.uuid,
        name: entity.name,
        slug: entity.slug,
        description: entity.description,
        price: entity.price,
        brandId: entity.brandId,
      },
      // stocks: entity.stocks.map((stock) => ({
      //   count: stock.quantity,
      //   warehouseId: stock.warehouseId,
      // })),
      // images: [],
    };
  }

  private convertEntityShortToModelShort(entity: ProductsEntity): ProductShort {
    return {
      meta: {
        uuid: entity.uuid,
        name: entity.name,
        slug: entity.slug,
        description: entity.description,
        price: entity.price,
        brandId: entity.brandId,
      },
      // image: new Uint8Array(),
    };
  }

  private async getPaginate(dto: GetProductsPaginateParams): Promise<{
    entities: ProductsEntity[];
    meta: PaginateMeta;
  }> {
    if (!dto.params) {
      throw new BadRequestException('Invalid paginate parameters');
    }

    const page: number = dto.params.page ?? 1;
    const limit: number = dto.params.limit ?? this._defaultLimit;
    const skip = (page - 1) * limit;
    const query: string | undefined = dto?.meta?.query;
    const status: ProductStatus | undefined = dto?.meta?.status;
    const categoryIds: number[] = dto?.meta?.categoryIds ?? [];
    const brandsIds: number[] = dto?.meta?.categoryIds ?? [];
    const tagIds: number[] = dto?.meta?.categoryIds ?? [];

    const [entities, total] = await this._productsRepository.findAndCount({
      skip,
      take: limit,
      order: { updatedAt: 'ASC' },
      relations: ['brand', 'categories', 'tags'],
      where: {
        ...(query && {
          name: ILike(`%${query}%`),
        }),
        ...(status !== undefined && { status }),
        ...(brandsIds.length > 0 && { brand: { id: In(brandsIds) } }),
        ...(categoryIds.length > 0 && { categories: { id: In(categoryIds) } }),
        ...(tagIds.length > 0 && { tags: { id: In(tagIds) } }),
      },
    });

    const totalPages = Math.ceil(total / limit);
    const meta: PaginateMeta = {
      perPage: limit,
      currentPage: page,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };

    return {
      entities,
      meta,
    };
  }

  private async getOffset(
    dto: GetProductsOffsetParams,
  ): Promise<ProductsEntity[]> {
    if (!dto.params) {
      throw new BadRequestException('Invalid paginate parameters');
    }

    const offset = dto.params?.offset ?? 0;
    const limit = dto.params?.limit ?? this._defaultLimit;
    const query: string | undefined = dto?.meta?.query;
    const status: ProductStatus | undefined = dto?.meta?.status;
    const categoryIds: number[] = dto?.meta?.categoryIds ?? [];
    const brandsIds: number[] = dto?.meta?.categoryIds ?? [];
    const tagIds: number[] = dto?.meta?.categoryIds ?? [];

    const entities = await this._productsRepository.find({
      skip: offset,
      take: limit,
      order: { updatedAt: 'ASC' },
      relations: ['brand', 'categories', 'tags'],
      where: {
        ...(query && {
          name: ILike(`%${query}%`),
        }),
        ...(status !== undefined && { status }),
        ...(brandsIds.length > 0 && { brand: { id: In(brandsIds) } }),
        ...(categoryIds.length > 0 && { categories: { id: In(categoryIds) } }),
        ...(tagIds.length > 0 && { tags: { id: In(tagIds) } }),
      },
    });

    return entities;
  }

  async getProductsPaginate(dto: GetProductsPaginateParams) {
    const { entities, meta } = await this.getPaginate(dto);

    const list: Product[] = entities.map((entity) =>
      this.convertEntityToModel(entity),
    );

    return { list, meta };
  }

  async getProductsShortPaginate(dto: GetProductsPaginateParams) {
    const { entities, meta } = await this.getPaginate(dto);

    const list: ProductShort[] = entities.map((entity) =>
      this.convertEntityShortToModelShort(entity),
    );

    return { list, meta };
  }

  async getProductsOffset(dto: GetProductsOffsetParams) {
    const entities = await this.getOffset(dto);

    const list: Product[] = entities.map((entity) =>
      this.convertEntityToModel(entity),
    );

    return { list };
  }

  async getProductsShortOffset(dto: GetProductsOffsetParams) {
    const entities = await this.getOffset(dto);

    const list: ProductShort[] = entities.map((entity) =>
      this.convertEntityShortToModelShort(entity),
    );

    return { list };
  }

  async getProductsByUuids(dto: GetProductsByUuidsParams) {
    const entities = await this._productsRepository.find({
      order: { updatedAt: 'ASC' },
      relations: ['brand', 'categories', 'tags'],
      where: {
        uuid: In(dto.uuid),
      },
    });

    const list: Product[] = entities.map((entity) =>
      this.convertEntityToModel(entity),
    );

    return { list };
  }

  async getProductByUuid(dto: GetProductByUuidParams) {
    const entity = await this._productsRepository.findOne({
      order: { updatedAt: 'ASC' },
      relations: ['brand', 'categories', 'tags'],
      where: {
        uuid: dto.uuid,
      },
    });

    if (!entity) {
      throw new NotFoundException('Product by uuid not found');
    }

    return this.convertEntityToModel(entity);
  }

  async createProduct(dto: CreateProductParams): Promise<Product> {
    if (!dto.data) throw new Error('No data provided');

    try {
      const entity = await this._productsRepository.save(dto.data);
      return this.convertEntityToModel(entity);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const pgError = error.driverError;
        if (pgError.code === '23505') {
          throw new ConflictException(
            `Бренд с именем "${dto.data.name}" уже существует`,
          );
        }
      }
      throw new InternalServerErrorException(
        'Произошла ошибка при создании бренда',
      );
    }
  }

  async updateProduct(dto: UpdateProductMetaParams): Promise<Product> {
    if (!dto.uuid || !dto.data || !dto.data.name) {
      throw new BadRequestException('Отсутствуют данные для обновления тега');
    }

    const existing = await this._productsRepository.findOneBy({
      uuid: dto.uuid,
    });
    if (!existing) {
      throw new NotFoundException(`Тег с не найден`);
    }

    try {
      const updated = await this._productsRepository.save({
        ...existing,
        ...dto,
      });

      return this.convertEntityToModel(updated);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const pgError = error.driverError;
        if (pgError.code === '23505') {
          throw new ConflictException(
            `Бренд с именем "${dto.data.name}" уже существует`,
          );
        }
      }
      throw new InternalServerErrorException(
        'Произошла ошибка при обновлении тега',
      );
    }
  }

  async updateProductsStatus(
    params: UpdateProductsStatusParams,
  ): Promise<UpdateProductsStatusResponse> {
    if (!params.uuids || params.uuids.length === 0) {
      throw new BadRequestException(
        'Не предоставлены UUID продуктов для обновления',
      );
    }

    if (params.status === ProductStatus.UNSPECIFIED) {
      throw new BadRequestException('Некорректный статус продукта');
    }

    const result = await this._productsRepository.update(
      { uuid: In(params.uuids) },
      { status: params.status },
    );

    if (result.affected === 0) {
      throw new NotFoundException('Не найдены продукты с указанными UUID');
    }

    const updatedProducts = await this._productsRepository.find({
      where: { uuid: In(params.uuids) },
      select: ['uuid', 'status'],
    });

    return {
      statuses: {
        uuids: Buffer.concat(updatedProducts.map((product) => product.uuid)),
        status: updatedProducts.every(
          (product) => product.status === params.status,
        ),
      },
    };
  }

  async updateProductsStocks(
    params: UpdateProductsStocksParams,
  ): Promise<UpdateProductsStocksResponse> {
    if (!params.stocks || params.stocks.length === 0) {
      throw new BadRequestException(
        'Не предоставлены данные для обновления складских запасов',
      );
    }

    const statuses: UpdateProductsStockStatus[] = [];

    for (const stock of params.stocks) {
      try {
        const product = await this._productsRepository.findOne({
          where: { uuid: stock.productUuid },
        });

        if (!product) {
          statuses.push({
            warehouseId: stock.warehouseId,
            productUuid: stock.productUuid,
            status: false,
          });
          continue;
        }

        if (stock.count === -1) {
          // Удаление записи о складском запасе
          await this._stocksRepository.delete({
            productUuid: stock.productUuid,
            warehouseId: stock.warehouseId,
          });
        } else {
          // Обновление или создание записи о складском запасе
          await this._stocksRepository.save({
            productUuid: stock.productUuid,
            warehouseId: stock.warehouseId,
            quantity: stock.count,
          });
        }

        statuses.push({
          warehouseId: stock.warehouseId,
          productUuid: stock.productUuid,
          status: true,
        });
      } catch (error) {
        console.error('Ошибка при обновлении складского запаса:', error);
        statuses.push({
          warehouseId: stock.warehouseId,
          productUuid: stock.productUuid,
          status: false,
        });
      }
    }

    return { statuses };
  }

  async updateProductsPrices(
    params: UpdateProductsPricesParams,
  ): Promise<UpdateProductsPricesResponse> {
    if (!params.prices || params.prices.length === 0) {
      throw new BadRequestException(
        'Не предоставлены данные для обновления цен продуктов',
      );
    }

    const statuses: UpdateProductsPriceStatus[] = [];

    for (const priceUpdate of params.prices) {
      try {
        const result = await this._productsRepository.update(
          { uuid: priceUpdate.productUuid },
          { price: priceUpdate.price },
        );

        if (result.affected === 0) {
          statuses.push({
            productUuid: priceUpdate.productUuid,
            status: false,
          });
        } else {
          statuses.push({
            productUuid: priceUpdate.productUuid,
            status: true,
          });
        }
      } catch (error) {
        console.error('Ошибка при обновлении цены продукта:', error);
        statuses.push({
          productUuid: priceUpdate.productUuid,
          status: false,
        });
      }
    }

    return { statuses };
  }

  async checkProductAvailableSlug(
    params: CheckProductAvailableSlugParams,
  ): Promise<boolean> {
    if (!params.slug) {
      throw new BadRequestException('Slug не указан');
    }

    try {
      const existingProduct = await this._productsRepository.findOne({
        where: { slug: params.slug },
      });

      return !existingProduct;
    } catch (error) {
      console.error('Ошибка при проверке доступности slug:', error);
      throw new InternalServerErrorException(
        'Произошла ошибка при проверке доступности slug',
      );
    }
  }

  async attachProductsToCategory(
    params: ToggleAttachProductsToCategoryParams,
  ): Promise<CommonToggleAttachProductsResponse> {
    if (!params.list || params.list.length === 0) {
      throw new BadRequestException(
        'Не предоставлены данные для прикрепления продуктов к категориям',
      );
    }

    const statuses: CommonToggleAttachProductStatus[] = [];

    for (const item of params.list) {
      const { productUuids, categoryIds } = item;

      try {
        const category = await this._categoriesRepository.findOne({
          where: { id: categoryIds },
        });

        if (!category) {
          throw new NotFoundException(
            `Категория с ID ${categoryIds} не найдена`,
          );
        }

        for (const productUuid of productUuids) {
          const product = await this._productsRepository.findOne({
            where: { uuid: productUuid },
            relations: ['categories'],
          });

          if (!product) {
            statuses.push({ productUuid, status: false });
            continue;
          }

          const categoryExists = product.categories.some(
            (cat) => cat.id === categoryIds,
          );

          if (categoryExists) {
            // Если категория уже прикреплена, удаляем ее
            product.categories = product.categories.filter(
              (cat) => cat.id !== categoryIds,
            );
          } else {
            // Если категории нет, добавляем ее
            product.categories.push(category);
          }

          await this._productsRepository.save(product);
          statuses.push({ productUuid, status: true });
        }
      } catch (error) {
        console.error('Ошибка при прикреплении продуктов к категории:', error);
        productUuids.forEach((uuid) =>
          statuses.push({ productUuid: uuid, status: false }),
        );
      }
    }

    return { statuses };
  }

  async detachProductsToCategory(
    params: ToggleAttachProductsToCategoryParams,
  ): Promise<CommonToggleAttachProductsResponse> {
    if (!params.list || params.list.length === 0) {
      throw new BadRequestException(
        'Не предоставлены данные для открепления продуктов от категорий',
      );
    }

    const statuses: CommonToggleAttachProductStatus[] = [];

    for (const item of params.list) {
      const { productUuids, categoryIds } = item;

      try {
        const category = await this._categoriesRepository.findOne({
          where: { id: categoryIds },
        });

        if (!category) {
          throw new NotFoundException(
            `Категория с ID ${categoryIds} не найдена`,
          );
        }

        for (const productUuid of productUuids) {
          const product = await this._productsRepository.findOne({
            where: { uuid: productUuid },
            relations: ['categories'],
          });

          if (!product) {
            statuses.push({ productUuid, status: false });
            continue;
          }

          product.categories = product.categories.filter(
            (cat) => cat.id !== categoryIds,
          );

          await this._productsRepository.save(product);
          statuses.push({ productUuid, status: true });
        }
      } catch (error) {
        console.error('Ошибка при откреплении продуктов от категории:', error);
        productUuids.forEach((uuid) =>
          statuses.push({ productUuid: uuid, status: false }),
        );
      }
    }

    return { statuses };
  }
}
