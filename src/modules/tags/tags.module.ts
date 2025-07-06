import { Module } from '@nestjs/common';
import { TagsService } from 'src/modules/tags/tags.service';
import { TagsController } from 'src/modules/tags/tags.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagsEntity } from 'src/modules/tags/tags.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TagsEntity])],
  providers: [TagsService],
  controllers: [TagsController],
})
export class TagsModule {}
