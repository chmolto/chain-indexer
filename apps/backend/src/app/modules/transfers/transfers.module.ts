import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransferEventEntity } from '../../entities/transfer-event.entity';
import { TransfersController } from './transfers.controller';
import { TransfersService } from './transfers.service';

@Module({
  imports: [TypeOrmModule.forFeature([TransferEventEntity])],
  controllers: [TransfersController],
  providers: [TransfersService],
})
export class TransfersModule {}
