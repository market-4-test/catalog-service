import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrandsService } from 'src/modules/brands/brands.service';
import { BrandsController } from 'src/modules/brands/brands.controller';
import { BrandsEntity } from 'src/modules/brands/brands.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BrandsEntity])],
  providers: [BrandsService],
  controllers: [BrandsController],
})
export class BrandsModule {}
