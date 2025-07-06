import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BrandsEntity } from 'src/modules/brands/brands.entity';
import { CategoriesEntity } from 'src/modules/categories/categories.entity';
import { TagsEntity } from 'src/modules/tags/tags.entity';
import { StocksEntity } from 'src/modules/stocks/stocks.entity';

export enum ProductStatus {
  UNSPECIFIED = 0,
  DRAFT = 1,
  PUBLISHED = 2,
  ARCHIVED = 3,
}

export interface IProduct {
  uuid: Uint8Array;
  status: ProductStatus;
  name: string;
  slug: string;
  description: string;
  price: number;
  brandId?: number;
  brand: BrandsEntity | null;
  categories: CategoriesEntity[];
  tags: TagsEntity[];
  stocks: StocksEntity[];
  createdAt: Date;
  updatedAt: Date;
}

@Entity('products')
export class ProductsEntity {
  @PrimaryGeneratedColumn('uuid')
  uuid: Uint8Array;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.DRAFT,
  })
  status: ProductStatus;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  slug: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'integer' })
  price: number;

  @Column({ type: 'integer', nullable: true })
  brandId?: number;

  @ManyToOne(() => BrandsEntity, { nullable: true })
  @JoinColumn({ name: 'brandId' })
  brand: BrandsEntity | null;

  @ManyToMany(() => CategoriesEntity)
  @JoinTable({
    name: 'product_categories',
    joinColumn: { name: 'productUuid', referencedColumnName: 'uuid' },
    inverseJoinColumn: { name: 'categoryId', referencedColumnName: 'id' },
  })
  categories: CategoriesEntity[];

  @ManyToMany(() => TagsEntity)
  @JoinTable({
    name: 'product_tags',
    joinColumn: { name: 'productUuid', referencedColumnName: 'uuid' },
    inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' },
  })
  tags: TagsEntity[];

  @OneToMany(() => StocksEntity, (stock) => stock.product)
  stocks: StocksEntity[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
