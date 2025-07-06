import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagsModule } from 'src/modules/tags/tags.module';
import { BrandsModule } from 'src/modules/brands/brands.module';
import { CategoriesModule } from 'src/modules/categories/categories.module';
import { ProductsModule } from 'src/modules/products/products.module';
import { StocksModule } from 'src/modules/stocks/stocks.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres', // Тип базы данных
      host: 'localhost', // или IP-адрес вашего сервера БД
      port: 5432, // Стандартный порт Postgres
      username: 'demo', // Имя пользователя БД
      password: 'demo', // Пароль
      database: 'm4t-catalog', // Название БД
      autoLoadEntities: true,
      synchronize: true, // ВАЖНО: true только для разработки! Автоматически создает/обновляет таблицы.
    }),
    TagsModule,
    BrandsModule,
    CategoriesModule,
    ProductsModule,
    StocksModule,
  ],
})
export class AppModule {}
