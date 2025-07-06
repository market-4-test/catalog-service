import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

export interface ICategoryShort {
  id: number;
  name: string;
  slug: string;
  // imageUuid?: Uint8Array;
}

export interface ICategory extends ICategoryShort {
  parentId?: number;
  isActive: boolean;
  orderSort: number;
  createdAt: Date;
  updatedAt: Date;
}

@Entity('categories')
@Unique(['slug'])
@Check('"parent_id" != "id"')
export class CategoriesEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true })
  @ManyToOne(() => CategoriesEntity, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parentId?: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'boolean', default: false })
  isActive: boolean;

  @Column({ type: 'int', default: 500 })
  orderSort: number;

  // @Column({ type: 'uuid', nullable: true })
  // imageUuid?: Uint8Array;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
