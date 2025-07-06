import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsEntity } from 'src/modules/products/products.entity';
import { BrandsEntity } from 'src/modules/brands/brands.entity';
import { CategoriesEntity } from 'src/modules/categories/categories.entity';
import { TagsEntity } from 'src/modules/tags/tags.entity';
import { StocksEntity } from 'src/modules/stocks/stocks.entity';
import { ProductsService } from 'src/modules/products/products.service';
import { ProductsController } from 'src/modules/products/products.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductsEntity,
      BrandsEntity,
      CategoriesEntity,
      TagsEntity,
      StocksEntity,
    ]),
  ],
  providers: [ProductsService],
  controllers: [ProductsController],
})
export class ProductsModule {}
