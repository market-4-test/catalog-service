import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesEntity } from 'src/modules/categories/categories.entity';
import { CategoriesService } from 'src/modules/categories/categories.service';
import { CategoriesController } from 'src/modules/categories/categories.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CategoriesEntity])],
  providers: [CategoriesService],
  controllers: [CategoriesController],
})
export class CategoriesModule {}
