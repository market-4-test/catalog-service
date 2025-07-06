import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StocksEntity } from 'src/modules/stocks/stocks.entity';

@Injectable()
export class StocksService {
  private _defaultLimit = 10;

  constructor(
    @InjectRepository(StocksEntity)
    private _stocksRepository: Repository<StocksEntity>,
  ) {}
}
