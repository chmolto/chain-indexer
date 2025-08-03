import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { EventProcessor } from '../../event.processor';
import { BlockchainService } from './blockchain.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransferEventEntity } from '../../entities/transfer-event.entity';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'event-processing-queue',
    }),
    TypeOrmModule.forFeature([TransferEventEntity]),
  ],
  providers: [BlockchainService, EventProcessor],
  exports: [BlockchainService],
})
export class BlockchainModule {}
