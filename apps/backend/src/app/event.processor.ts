import { TransferEvent } from '@chain-indexer/shared-interfaces';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bullmq';
import { Repository } from 'typeorm';
import { TransferEventEntity } from './entities/transfer-event.entity';

@Processor('event-processing-queue')
export class EventProcessor extends WorkerHost {
  private readonly logger = new Logger(EventProcessor.name);

  constructor(
    @InjectRepository(TransferEventEntity)
    private readonly transferRepository: Repository<TransferEventEntity>
  ) {
    super();
  }

  async process(job: Job<TransferEvent>): Promise<any> {
    this.logger.log(
      `Procesando trabajo para el hash ${job.data.transactionHash}`
    );

    const newEvent = this.transferRepository.create({
      ...job.data,
    });

    try {
      await this.transferRepository.save(newEvent);
      this.logger.log(`Evento ${job.data.transactionHash} guardado en la BD.`);
    } catch (error) {
      this.logger.error(
        `Error guardando evento ${job.data.transactionHash}`,
        error
      );
      throw error;
    }
  }
}
