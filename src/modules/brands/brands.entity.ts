import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export interface IBrandShort {
  id: number;
  name: string;
  slug: string;
}

export interface IBrand extends IBrandShort {
  isActive: boolean;
  // imageUuid: Uint8Array | undefined;
  createdAt: Date;
  updatedAt: Date;
}

@Entity('brands')
export class BrandsEntity implements IBrand {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'boolean', default: false })
  isActive: boolean;

  // @Column({ type: 'uuid', nullable: true })
  // imageUuid: Uint8Array;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt: Date;
}
