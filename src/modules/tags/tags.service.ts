import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TagsEntity } from 'src/modules/tags/tags.entity';
import { DeleteResult, QueryFailedError, Repository } from 'typeorm';
import { PaginateMeta } from '#/common';
import {
  CheckAvailableTagNamesParams,
  CheckAvailableTagNamesResponse,
  CreateTagParams,
  GetTagByIdParams,
  GetTagsOffsetParams,
  GetTagsOffsetResponse,
  GetTagsPaginateParams,
  GetTagsPaginateResponse,
  GetTagsShortOffsetParams,
  GetTagsShortOffsetResponse,
  GetTagsShortPaginateParams,
  GetTagsShortPaginateResponse,
  Tag,
  TagShort,
  UpdateTagParams,
} from '#/catalog';
import { ITag } from 'src/modules/tags/tags.interfaces';
import { Timestamp } from '#/google/protobuf/timestamp';

@Injectable()
export class TagsService {
  private _defaultLimit = 10;

  constructor(
    @InjectRepository(TagsEntity)
    private _tagsRepository: Repository<TagsEntity>,
  ) {}

  private convertEntityToModel(entity: ITag): Tag {
    return {
      id: entity.id,
      name: entity.name,
      createdAt: Timestamp.fromDate(entity.createdAt),
      updatedAt: Timestamp.fromDate(entity.updatedAt),
    };
  }

  private convertEntityShortToModelShort(entity: ITag): TagShort {
    return {
      id: entity.id,
      name: entity.name,
    };
  }

  async getTagsPaginate(
    dto: GetTagsPaginateParams,
  ): Promise<GetTagsPaginateResponse> {
    const page: number = dto.params?.page ?? 1;
    const limit: number = dto.params?.limit ?? this._defaultLimit;
    const skip = (page - 1) * limit;

    const [entities, total] = await this._tagsRepository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'ASC' },
      select: ['id', 'name', 'createdAt', 'updatedAt'],
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

    const list: Tag[] = entities.map((entity) =>
      this.convertEntityToModel(entity),
    );

    return { list, meta };
  }

  async getTagsShortPaginate(
    dto: GetTagsShortPaginateParams,
  ): Promise<GetTagsShortPaginateResponse> {
    const page: number = dto.params?.page ?? 1;
    const limit: number = dto.params?.limit ?? this._defaultLimit;
    const skip = (page - 1) * limit;

    const [entities, total] = await this._tagsRepository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'ASC' },
      select: ['id', 'name'],
    });

    const totalPages: number = Math.ceil(total / limit);
    const meta: PaginateMeta = {
      perPage: limit,
      currentPage: page,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };

    const list: TagShort[] = entities.map((entity) =>
      this.convertEntityShortToModelShort(entity),
    );

    return { list, meta };
  }

  async getTagsOffset(
    dto: GetTagsOffsetParams,
  ): Promise<GetTagsOffsetResponse> {
    const offset = dto.params?.offset ?? 0;
    const limit = dto.params?.limit ?? this._defaultLimit;

    const entities: TagsEntity[] = await this._tagsRepository.find({
      skip: offset,
      take: limit,
      order: { createdAt: 'ASC' },
      select: ['id', 'name', 'createdAt', 'updatedAt'],
    });

    const list: TagShort[] = entities.map((entity) =>
      this.convertEntityToModel(entity),
    );

    return { list };
  }

  async getTagsShortOffset(
    dto: GetTagsShortOffsetParams,
  ): Promise<GetTagsShortOffsetResponse> {
    const offset = dto.params?.offset ?? 0;
    const limit = dto.params?.limit ?? this._defaultLimit;

    const entities: TagsEntity[] = await this._tagsRepository.find({
      skip: offset,
      take: limit,
      order: { createdAt: 'ASC' },
      select: ['id', 'name'],
    });

    const list: TagShort[] = entities.map((entity) =>
      this.convertEntityShortToModelShort(entity),
    );

    return { list };
  }

  async getTagById(dto: GetTagByIdParams): Promise<Tag | null> {
    if (!dto.id) {
      throw new BadRequestException('ID tag is not specified');
    }

    const entity: TagsEntity | null = await this._tagsRepository.findOneBy({
      id: dto.id,
    });

    if (!entity) return null;

    return this.convertEntityToModel(entity);
  }

  async createTag(dto: CreateTagParams): Promise<Tag> {
    if (!dto.data) throw new Error('No data provided');

    const createEntity: Pick<TagsEntity, 'name'> = {
      name: dto.data.name,
    };

    try {
      const entity = await this._tagsRepository.save(createEntity);
      return this.convertEntityToModel(entity);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const pgError = error.driverError;
        if (pgError.code === '23505') {
          throw new ConflictException(
            `Tag named "${dto.data.name}" already exists`,
          );
        }
      }
      throw new InternalServerErrorException(
        'An error occurred when creating a tag',
      );
    }
  }

  async updateTag(dto: UpdateTagParams): Promise<Tag> {
    if (!dto.id || !dto.data || !dto.data.name) {
      throw new BadRequestException('There are no data for updating the tag');
    }

    const existingTag = await this._tagsRepository.findOneBy({ id: dto.id });
    if (!existingTag) {
      throw new NotFoundException(`Tag with ID ${dto.id} was not found`);
    }

    console.log(existingTag, dto);

    try {
      const updatedTag = await this._tagsRepository.save({
        ...existingTag,
        ...dto.data,
      });

      return this.convertEntityToModel(updatedTag);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const pgError = error.driverError;
        if (pgError.code === '23505') {
          throw new ConflictException(
            `Tag named "${dto.data.name}" already exists`,
          );
        }
      }
      throw new InternalServerErrorException(
        'An error has occurred when updating the tag',
      );
    }
  }

  async deleteTag(id: number): Promise<boolean> {
    if (!id) {
      throw new BadRequestException('ID тега не указан');
    }

    try {
      const result: DeleteResult = await this._tagsRepository.delete(id);

      if (result.affected === 0) {
        throw new NotFoundException(`Тег с ID ${id} не найден`);
      }

      return true;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Произошла ошибка при удалении тега',
      );
    }
  }

  async checkAvailableTagNames(
    dto: CheckAvailableTagNamesParams,
  ): Promise<CheckAvailableTagNamesResponse> {
    const results = await Promise.all(
      dto.name.map(async (name) => {
        const existingTag = await this._tagsRepository.findOne({
          where: { name },
        });
        return !existingTag;
      }),
    );

    return { list: results };
  }
}
