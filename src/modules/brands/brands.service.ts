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
  Brand,
  BrandShort,
  CreateBrandParams,
  GetBrandByIdParams,
  GetBrandsOffsetResponse,
  GetBrandsPaginateParams,
  GetBrandsPaginateResponse,
  GetBrandsShortOffsetResponse,
  GetBrandsShortPaginateResponse,
  GetOffsetBrandsParams,
  UpdateBrandParams,
} from '#/catalog';
import { Timestamp } from '#/google/protobuf/timestamp';
import { BrandsEntity, IBrand } from 'src/modules/brands/brands.entity';
import { PaginateMeta } from '#/common';

@Injectable()
export class BrandsService {
  private _defaultLimit = 10;
  
  constructor(
    @InjectRepository(BrandsEntity)
    private _brandsRepository: Repository<BrandsEntity>,
  ) {
  }
  
  private convertEntityToModel(entity: IBrand): Brand {
    return {
      id: entity.id,
      name: entity.name,
      slug: entity.slug,
      isActive: entity.isActive,
      // imageUuid: entity.imageUuid,
      createdAt: Timestamp.fromDate(entity.createdAt),
      updatedAt: Timestamp.fromDate(entity.updatedAt),
    };
  }
  
  private convertEntityShortToModelShort(entity: IBrand): BrandShort {
    return {
      id: entity.id,
      name: entity.name,
      slug: entity.slug,
    };
  }
  
  async getBrandsPaginate(
    dto: GetBrandsPaginateParams,
  ): Promise<GetBrandsPaginateResponse> {
    const page: number = dto.params?.page ?? 1;
    const limit: number = dto.params?.limit ?? this._defaultLimit;
    const skip = (page - 1) * limit;
    
    const [entities, total] = await this._brandsRepository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'ASC' },
      select: [
        'id',
        'name',
        'slug',
        'isActive',
        // 'imageUuid',
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
    
    const list: Brand[] = entities.map((entity) =>
      this.convertEntityToModel(entity),
    );
    
    return { list, meta };
  }
  
  async getBrandsShortPaginate(
    dto: GetBrandsPaginateParams,
  ): Promise<GetBrandsShortPaginateResponse> {
    const page: number = dto.params?.page ?? 1;
    const limit: number = dto.params?.limit ?? this._defaultLimit;
    const skip: number = (page - 1) * limit;
    
    const [entities, total] = await this._brandsRepository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'ASC' },
      select: ['id', 'name', 'slug'],
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
    
    const list: BrandShort[] = entities.map((entity) =>
      this.convertEntityShortToModelShort(entity),
    );
    
    return { list, meta };
  }
  
  async getBrandsOffset(
    dto: GetOffsetBrandsParams,
  ): Promise<GetBrandsOffsetResponse> {
    const offset = dto.params?.offset ?? 0;
    const limit = dto.params?.limit ?? this._defaultLimit;
    
    const entities: BrandsEntity[] = await this._brandsRepository.find({
      skip: offset,
      take: limit,
      order: { createdAt: 'ASC' },
      select: [
        'id',
        'name',
        'slug',
        'isActive',
        // 'imageUuid',
        'createdAt',
        'updatedAt',
      ],
    });
    
    const list: Brand[] = entities.map((entity) =>
      this.convertEntityToModel(entity),
    );
    
    return { list };
  }
  
  async getBrandsShortOffset(
    dto: GetOffsetBrandsParams,
  ): Promise<GetBrandsShortOffsetResponse> {
    const offset: number = dto.params?.offset ?? 0;
    const limit: number = dto.params?.limit ?? this._defaultLimit;
    
    const entities: BrandsEntity[] = await this._brandsRepository.find({
      skip: offset,
      take: limit,
      order: { createdAt: 'ASC' },
      select: ['id', 'name', 'slug'],
    });
    
    const list: BrandShort[] = entities.map((entity) =>
      this.convertEntityShortToModelShort(entity),
    );
    
    return { list };
  }
  
  async getBrandById(dto: GetBrandByIdParams): Promise<Brand | null> {
    if (!dto.id) {
      throw new BadRequestException('ID brand is not specified');
    }
    
    const entity: BrandsEntity | null = await this._brandsRepository.findOne({
      where: {
        id: dto.id,
      },
      select: [
        'id',
        'name',
        'slug',
        'isActive',
        // 'imageUuid',
        'createdAt',
        'updatedAt',
      ],
    });
    
    if (!entity) {
      throw new NotFoundException(`Brand with ID ${ dto.id } was not found`);
    }
    
    return this.convertEntityToModel(entity);
  }
  
  async getBrandShortById(dto: GetBrandByIdParams): Promise<BrandShort | null> {
    if (!dto.id) {
      throw new BadRequestException('ID brand is not specified');
    }
    
    const entity: BrandsEntity | null = await this._brandsRepository.findOne({
      where: {
        id: dto.id,
      },
      select: ['id', 'name', 'slug'],
    });
    
    if (!entity) {
      throw new NotFoundException(`Brand with ID ${ dto.id } was not found`);
    }
    
    return this.convertEntityShortToModelShort(entity);
  }
  
  async createBrand(dto: CreateBrandParams): Promise<Brand> {
    if (!dto.data) throw new Error('No data provided');
    
    try {
      const entity = await this._brandsRepository.save(dto.data);
      return this.convertEntityToModel(entity);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const pgError = error.driverError;
        if (pgError.code === '23505') {
          throw new ConflictException(
            `A brand named "${ dto.data.name }" already exists`,
          );
        }
      }
      throw new InternalServerErrorException(
        'An error occurred when creating a brand',
      );
    }
  }
  
  async updateBrand(dto: UpdateBrandParams): Promise<Brand> {
    if (!dto.id || !dto.data || !dto.data.name) {
      throw new BadRequestException('There is no data for updating the brand');
    }
    
    const existingBrand = await this._brandsRepository.findOneBy({
      id: dto.id,
    });
    if (!existingBrand) {
      throw new NotFoundException(`Brand with ID ${ dto.id } was not found`);
    }
    
    try {
      const updatedBrand = await this._brandsRepository.save({
        ...existingBrand,
        ...dto,
      });
      
      return this.convertEntityToModel(updatedBrand);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const pgError = error.driverError;
        if (pgError.code === '23505') {
          throw new ConflictException(
            `A brand named "${ dto.data.name }" already exists`,
          );
        }
      }
      throw new InternalServerErrorException(
        'There was an error when updating the brand',
      );
    }
  }
  
  async deleteBrand(id: number): Promise<boolean> {
    if (!id) {
      throw new BadRequestException('ID brand is not specified');
    }
    
    try {
      const result: DeleteResult = await this._brandsRepository.delete(id);
      
      if (result.affected === 0) {
        throw new NotFoundException(`Brand with ID {id} was not found`);
      }
      
      return true;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error has occurred when removing the brand',
      );
    }
  }
}
