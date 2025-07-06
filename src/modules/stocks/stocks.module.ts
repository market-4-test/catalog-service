import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StocksEntity } from 'src/modules/stocks/stocks.entity';
import { ProductsEntity } from 'src/modules/products/products.entity';
import { StocksService } from 'src/modules/stocks/stocks.service';

@Module({
  imports: [TypeOrmModule.forFeature([StocksEntity, ProductsEntity])],
  providers: [StocksService],
})
export class StocksModule {}
