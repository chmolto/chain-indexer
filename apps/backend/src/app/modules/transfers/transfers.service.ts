import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransferEventEntity } from '../../entities/transfer-event.entity';

@Injectable()
export class TransfersService {
  constructor(
    @InjectRepository(TransferEventEntity)
    private readonly transferRepository: Repository<TransferEventEntity>
  ) {}

  async findAll(page = 1, limit = 10) {
    const [result, total] = await this.transferRepository.findAndCount({
      order: { blockNumber: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });
    return {
      data: result,
      count: total,
    };
  }

  async findOneByTxHash(txHash: string): Promise<TransferEventEntity> {
    const result = await this.transferRepository.findOneBy({
      transactionHash: txHash,
    });
    if (!result) {
      throw new NotFoundException('Transferencia no encontrada');
    }
    return result;
  }
}
