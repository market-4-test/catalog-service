import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, QueryFailedError, Repository } from 'typeorm';
import {
  Category,
  CategoryShort,
  CheckAvailableSlugParams,
  CreateCategoryParams,
  GetCategoriesOffsetParams,
  GetCategoriesOffsetResponse,
  GetCategoriesPaginateParams,
  GetCategoriesPaginateResponse,
  GetCategoriesShortOffsetResponse,
  GetCategoriesShortPaginateResponse,
  GetCategoryByIdParams,
  StatusCategory,
  UpdateCategoryParams,
  UpdateOrderSortToCategoriesParams,
  UpdateOrderSortToCategoriesResponse,
} from '#/catalog';
import { Timestamp } from '#/google/protobuf/timestamp';
import {
  CategoriesEntity,
  ICategory,
  ICategoryShort,
} from 'src/modules/categories/categories.entity';
import { PaginateMeta } from '#/common';

@Injectable()
export class CategoriesService {
  private _defaultLimit = 10;

  constructor(
    @InjectRepository(CategoriesEntity)
    private _categoriesRepository: Repository<CategoriesEntity>,
  ) {}

  private convertEntityToModel(entity: ICategory): Category {
    return {
      id: entity.id,
      parentId: entity.parentId,
      name: entity.name,
      slug: entity.slug,
      isActive: entity.isActive,
      // imageUuid: entity.imageUuid,
      orderSort: entity.orderSort,
      createdAt: Timestamp.fromDate(entity.createdAt),
      updatedAt: Timestamp.fromDate(entity.updatedAt),
    };
  }

  private convertEntityShortToModelShort(
    entity: ICategoryShort,
  ): CategoryShort {
    return {
      id: entity.id,
      name: entity.name,
      slug: entity.slug,
      // imageUuid: entity.imageUuid,
    };
  }

  async getCategoriesPaginate(
    dto: GetCategoriesPaginateParams,
  ): Promise<GetCategoriesPaginateResponse> {
    const page: number = dto.params?.page ?? 1;
    const limit: number = dto.params?.limit ?? this._defaultLimit;
    const skip = (page - 1) * limit;

    const [entities, total] = await this._categoriesRepository.findAndCount({
      skip,
      take: limit,
      order: { orderSort: 'ASC', createdAt: 'ASC' },
      select: [
        'id',
        'parentId',
        'name',
        'slug',
        'isActive',
        'createdAt',
        'updatedAt',
      ],
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

    const list: Category[] = entities.map((entity) =>
      this.convertEntityToModel(entity),
    );

    return { list, meta };
  }

  async getCategoriesShortPaginate(
    dto: GetCategoriesPaginateParams,
  ): Promise<GetCategoriesShortPaginateResponse> {
    const page: number = dto.params?.page ?? 1;
    const limit: number = dto.params?.limit ?? this._defaultLimit;
    const skip = (page - 1) * limit;

    const [entities, total] = await this._categoriesRepository.findAndCount({
      skip,
      take: limit,
      order: { orderSort: 'ASC', createdAt: 'ASC' },
      select: ['id', 'name', 'slug'],
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

    const list: CategoryShort[] = entities.map((entity) =>
      this.convertEntityShortToModelShort(entity),
    );

    return { list, meta };
  }

  async getCategoriesOffset(
    dto: GetCategoriesOffsetParams,
  ): Promise<GetCategoriesOffsetResponse> {
    const offset = dto.params?.offset ?? 0;
    const limit = dto.params?.limit ?? this._defaultLimit;

    const entities: CategoriesEntity[] = await this._categoriesRepository.find({
      skip: offset,
      take: limit,
      order: { createdAt: 'ASC' },
      select: [
        'id',
        'parentId',
        'name',
        'slug',
        'isActive',
        'orderSort',
        'createdAt',
        'updatedAt',
      ],
    });

    const list: Category[] = entities.map((entity) =>
      this.convertEntityToModel(entity),
    );

    return { list };
  }

  async getCategoriesShortOffset(
    dto: GetCategoriesOffsetParams,
  ): Promise<GetCategoriesShortOffsetResponse> {
    const offset = dto.params?.offset ?? 0;
    const limit = dto.params?.limit ?? this._defaultLimit;

    const entities: CategoriesEntity[] = await this._categoriesRepository.find({
      skip: offset,
      take: limit,
      order: { createdAt: 'ASC' },
      select: ['id', 'name', 'slug'],
    });

    const list: CategoryShort[] = entities.map((entity) =>
      this.convertEntityShortToModelShort(entity),
    );

    return { list };
  }

  async getCategoryById(dto: GetCategoryByIdParams): Promise<Category | null> {
    if (!dto.id) {
      throw new BadRequestException('ID тега не указан');
    }

    const entity: CategoriesEntity | null =
      await this._categoriesRepository.findOne({
        where: {
          id: dto.id,
        },
        select: [
          'id',
          'parentId',
          'name',
          'slug',
          'isActive',
          'orderSort',
          'createdAt',
          'updatedAt',
        ],
      });

    if (!entity) {
      throw new NotFoundException(`Категория с id ${dto.id} не найден`);
    }

    return this.convertEntityToModel(entity);
  }

  async getCategoryShortById(
    dto: GetCategoryByIdParams,
  ): Promise<CategoryShort | null> {
    if (!dto.id) {
      throw new BadRequestException('ID тега не указан');
    }

    const entity: CategoriesEntity | null =
      await this._categoriesRepository.findOne({
        where: {
          id: dto.id,
        },
        select: ['id', 'name', 'slug'],
      });

    if (!entity) {
      throw new NotFoundException(`Категория с id ${dto.id} не найден`);
    }

    return this.convertEntityShortToModelShort(entity);
  }

  async createCategory(dto: CreateCategoryParams): Promise<Category> {
    if (!dto.data) throw new Error('No data provided');

    try {
      // Проверяем, существует ли родительская категория, если указан parentId
      if (dto.data.parentId) {
        const parentCategory = await this._categoriesRepository.findOne({
          where: { id: dto.data.parentId },
        });
        if (!parentCategory) {
          throw new BadRequestException(
            `Родительская категория с id ${dto.data.parentId} не найдена`,
          );
        }
      }

      const entity = await this._categoriesRepository.save(dto.data);
      return this.convertEntityToModel(entity);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error instanceof QueryFailedError) {
        const pgError = error.driverError;
        if (pgError.code === '23505') {
          throw new ConflictException(
            `Категория с именем "${dto.data.name}" уже существует`,
          );
        }
        if (pgError.code === '23503') {
          throw new BadRequestException(
            `Родительская категория с id ${dto.data.parentId} не найдена`,
          );
        }
      }
      console.error('Ошибка при создании категории:', error);
      throw new InternalServerErrorException(
        'Произошла ошибка при создании категории',
      );
    }
  }

  async updateCategory(dto: UpdateCategoryParams): Promise<Category> {
    if (!dto.id || !dto.data || !dto.data.name) {
      throw new BadRequestException('Отсутствуют данные для обновления тега');
    }

    const existing = await this._categoriesRepository.findOneBy({
      id: dto.id,
    });
    if (!existing) {
      throw new NotFoundException(`Category с id ${dto.id} не найден`);
    }

    try {
      const updated = await this._categoriesRepository.save({
        ...existing,
        ...dto,
      });

      return this.convertEntityToModel(updated);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const pgError = error.driverError;
        if (pgError.code === '23505') {
          throw new ConflictException(
            `Категория с именем "${dto.data.name}" уже существует`,
          );
        }
      }
      throw new InternalServerErrorException(
        'Произошла ошибка при обновлении тега',
      );
    }
  }

  async deleteCategory(id: number): Promise<boolean> {
    if (!id) {
      throw new BadRequestException('ID бренда не указан');
    }

    try {
      const result: DeleteResult = await this._categoriesRepository.delete(id);

      if (result.affected === 0) {
        throw new NotFoundException(`Category с ID ${id} не найден`);
      }

      return true;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Произошла ошибка при удалении бренда',
      );
    }
  }

  // async setImageToCategory(dto: SetImageToCategoryParams): Promise<boolean> {
  //   if (!dto.id || !dto.imageUuid) {
  //     throw new BadRequestException(
  //       'Отсутствует ID категории или UUID изображения',
  //     );
  //   }
  //
  //   try {
  //     const category = await this._categoriesRepository.findOne({
  //       where: { id: dto.id },
  //     });
  //
  //     if (!category) {
  //       throw new NotFoundException(`Категория с id ${dto.id} не найдена`);
  //     }
  //
  //     category.imageUuid = dto.imageUuid;
  //     await this._categoriesRepository.save(category);
  //
  //     return true;
  //   } catch (error) {
  //     if (error instanceof NotFoundException) {
  //       throw error;
  //     }
  //     throw new InternalServerErrorException(
  //       'Произошла ошибка при обновлении изображения категории',
  //     );
  //   }
  // }

  async updateOrderSortToCategories(
    dto: UpdateOrderSortToCategoriesParams,
  ): Promise<UpdateOrderSortToCategoriesResponse> {
    if (!dto.list || dto.list.length === 0) {
      throw new BadRequestException('Список категорий для обновления пуст');
    }

    const result: StatusCategory[] = [];

    for (const item of dto.list) {
      try {
        const category = await this._categoriesRepository.findOne({
          where: { id: item.id },
        });

        if (!category) {
          result.push({ id: item.id, status: false });
          continue;
        }

        category.orderSort = item.orderSort;
        await this._categoriesRepository.save(category);
        result.push({ id: item.id, status: true });
      } catch (error) {
        console.error(
          `Ошибка при обновлении категории с id ${item.id}:`,
          error,
        );
        result.push({ id: item.id, status: false });
      }
    }

    return { list: result };
  }

  async checkAvailableSlug(dto: CheckAvailableSlugParams): Promise<boolean> {
    if (!dto.slug) {
      throw new BadRequestException('Slug не указан');
    }

    try {
      const existingCategory = await this._categoriesRepository.findOne({
        where: { slug: dto.slug },
      });

      return !existingCategory;
    } catch (error) {
      console.error('Ошибка при проверке доступности slug:', error);
      throw new InternalServerErrorException(
        'Произошла ошибка при проверке доступности slug',
      );
    }
  }
}
