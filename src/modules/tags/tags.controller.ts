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
import { TagsService } from 'src/modules/tags/tags.service';
import {
  CheckAvailableTagNamesDto,
  CreateTagDto,
  GetTagsOffsetDto,
  GetTagsPaginateDto,
  GetTagsShortOffsetDto,
  GetTagsShortPaginateDto,
  UpdateTagDto,
} from 'src/modules/tags/tags.dtos';
import { BigintSerializerInterceptor } from 'src/interceptors/bigint-serializer/bigint-serializer.interceptor';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@Controller('tags')
@UseInterceptors(BigintSerializerInterceptor)
export class TagsController {
  constructor(private readonly _tagService: TagsService) {
  }
  
  @Get('/')
  @ApiOperation({ summary: 'Getting tags by pagination' })
  async getTagsPaginate(@Query(ValidationPipe) dto: GetTagsPaginateDto) {
    return this._tagService.getTagsPaginate({
      params: dto,
    });
  }
  
  @Get('/short')
  @ApiOperation({ summary: 'Getting tags short by pagination' })
  @ApiResponse({
    status: 200,
    description: '',
  })
  async getTagsShortPaginate(
    @Query(ValidationPipe) dto: GetTagsShortPaginateDto,
  ) {
    return this._tagService.getTagsShortPaginate({ params: dto });
  }
  
  @Get('/offset')
  @ApiOperation({ summary: 'Getting tags by offset' })
  async getTagsOffset(@Query(ValidationPipe) dto: GetTagsOffsetDto) {
    return this._tagService.getTagsOffset({ params: dto });
  }
  
  @Get('/offset/short')
  @ApiOperation({ summary: 'Getting tags short by offset' })
  async getTagsShortOffset(@Query(ValidationPipe) dto: GetTagsShortOffsetDto) {
    return this._tagService.getTagsShortOffset({ params: dto });
  }
  
  @Get('/:id')
  @ApiOperation({ summary: 'Getting a tag by id' })
  async getTagById(@Param('id', ParseIntPipe) id: number) {
    const tag = await this._tagService.getTagById({ id });
    
    if (!tag) {
      throw new NotFoundException(`Tag with id ${ id } not found`);
    }
    
    return tag;
  }
  
  @Put('/:id')
  @ApiOperation({ summary: 'Update tag by id' })
  async updateTag(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateTagDto,
  ) {
    try {
      const tag = await this._tagService.updateTag({ id, data: dto.data });
      if (!tag) {
        throw new NotFoundException(`Tag with id ${ id } not found`);
      }
      return tag;
    } catch (error) {
      console.log(error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Tag error');
    }
  }
  
  @Delete('/:id')
  @ApiOperation({ summary: 'Remove tag by ID' })
  @ApiParam({ name: 'id', description: 'Tag ID' })
  async deleteTag(@Param('id', ParseIntPipe) id: number) {
    try {
      const result = await this._tagService.deleteTag(id);
      if (result) {
        return { message: `Tag with ID ${ id } successfully removed` };
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred when removing the tag',
      );
    }
  }
  
  @Post('/')
  @ApiOperation({ summary: 'Creating a tag' })
  async createTag(@Body(ValidationPipe) dto: CreateTagDto) {
    try {
      return await this._tagService.createTag(dto);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      }
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException(
        'An error occurred when creating a tag',
      );
    }
  }
  
  @Post('/check-available-names')
  @ApiOperation({ summary: 'Checking for occupied tag names' })
  async checkAvailableTagNames(
    @Body(ValidationPipe) dto: CheckAvailableTagNamesDto,
  ) {
    return await this._tagService.checkAvailableTagNames(dto);
  }
}
