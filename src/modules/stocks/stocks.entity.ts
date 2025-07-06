import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductsEntity } from 'src/modules/products/products.entity';

@Entity('stocks')
export class StocksEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  productUuid: Uint8Array;

  @Column({ type: 'integer' })
  warehouseId: number;

  @Column({ type: 'integer' })
  quantity: number;

  @ManyToOne(() => ProductsEntity)
  @JoinColumn({ name: 'productUuid' })
  product: ProductsEntity;
}
