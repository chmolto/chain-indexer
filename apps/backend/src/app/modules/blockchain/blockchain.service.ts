import { TransferEvent } from '@chain-indexer/shared-interfaces';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import {
  Contract,
  ContractEventPayload,
  ethers,
  EventLog,
  JsonRpcProvider,
  WebSocketProvider,
} from 'ethers';
import { Repository } from 'typeorm';
import { LINK_TOKEN_ABI } from '../../contracts/link-abi';
import { TransferEventEntity } from '../../entities/transfer-event.entity';

const LINK_TOKEN_ADDRESS = '0x779877A7B0D9E8603169DdbD7836e478b4624789';
const CONTRACT_CREATION_BLOCK = 8902715;

@Injectable()
export class BlockchainService implements OnModuleInit {
  private readonly logger = new Logger(BlockchainService.name);
  private blockTimestampCache = new Map<number, number>();

  private wsProvider: WebSocketProvider;
  private rpcProvider: JsonRpcProvider;
  private linkContractWs: Contract;
  private linkContractRpc: Contract;

  constructor(
    private configService: ConfigService,
    @InjectQueue('event-processing-queue') private eventQueue: Queue,
    @InjectRepository(TransferEventEntity)
    private readonly transferRepository: Repository<TransferEventEntity>
  ) {
    const wsUrl = this.configService.get<string>('SEPOLIA_WS_URL');
    const rpcUrl = this.configService.get<string>('SEPOLIA_RPC_URL');
    if (!wsUrl || !rpcUrl)
      throw new Error('URLs de proveedor no definidas en .env');

    this.wsProvider = new ethers.WebSocketProvider(wsUrl);
    this.rpcProvider = new ethers.JsonRpcProvider(rpcUrl);
    this.linkContractWs = new ethers.Contract(
      LINK_TOKEN_ADDRESS,
      LINK_TOKEN_ABI,
      this.wsProvider
    );
    this.linkContractRpc = new ethers.Contract(
      LINK_TOKEN_ADDRESS,
      LINK_TOKEN_ABI,
      this.rpcProvider
    );
  }

  async onModuleInit() {
    this.logger.log('Iniciando servicios de blockchain...');
    this.listenToTransfers();
    setTimeout(() => this.startIndexingHistoricalEvents(), 1000);
  }

  private async getBlockTimestamp(
    blockNumber: number
  ): Promise<number | undefined> {
    if (this.blockTimestampCache.has(blockNumber)) {
      return this.blockTimestampCache.get(blockNumber);
    }
    try {
      const block = await this.rpcProvider.getBlock(blockNumber);
      if (block?.timestamp) {
        this.blockTimestampCache.set(blockNumber, block.timestamp);
        return block.timestamp;
      }
    } catch (error) {
      this.logger.warn(
        `No se pudo obtener el timestamp para el bloque ${blockNumber}`,
        error
      );
    }
    return undefined;
  }

  private listenToTransfers() {
    this.linkContractWs.on(
      'Transfer(address,address,uint256)',
      (from, to, value, payload: ContractEventPayload) => {
        const eventLog = payload.log as EventLog;
        this.handleTransferEvent(from, to, value, eventLog);
      }
    );
    this.wsProvider.on('error', (error) =>
      this.logger.error('Error en WebSocket', error.stack)
    );
  }

  private async handleTransferEvent(
    from: string,
    to: string,
    value: bigint,
    event: EventLog
  ) {
    if (!event?.transactionHash) {
      this.logger.warn(`Intento de procesar evento inválido.`);
      return;
    }

    const timestamp = await this.getBlockTimestamp(event.blockNumber);
    const decodedEvent: TransferEvent = {
      fromAddress: from,
      toAddress: to,
      value: value.toString(),
      transactionHash: event.transactionHash,
      blockNumber: event.blockNumber,
      transactionDate: timestamp ? new Date(timestamp * 1000) : undefined,
    };

    await this.eventQueue.add('process-transfer-event', decodedEvent, {
      jobId: event.transactionHash,
      attempts: 5,
      backoff: { type: 'exponential', delay: 5000 },
    });
    this.logger.log(`Evento 'Transfer' [${event.transactionHash}] encolado.`);
  }

  async startIndexingHistoricalEvents() {
    this.logger.log('Iniciando indexación de eventos históricos...');
    const latestBlockEntities = await this.transferRepository.find({
      order: { blockNumber: 'DESC' },
      take: 1,
    });

    const latestBlockEntity = latestBlockEntities[0];
    let fromBlock = latestBlockEntity
      ? latestBlockEntity.blockNumber + 1
      : CONTRACT_CREATION_BLOCK;
    this.logger.log(`Iniciando indexación desde el bloque: ${fromBlock}`);

    const latestBlockOnChain = await this.rpcProvider.getBlockNumber();
    const blockChunk = 100;

    while (fromBlock < latestBlockOnChain) {
      const toBlock = Math.min(fromBlock + blockChunk, latestBlockOnChain);
      try {
        this.logger.log(
          `Buscando eventos desde el bloque ${fromBlock} hasta ${toBlock}`
        );
        const events = await this.linkContractRpc.queryFilter(
          'Transfer(address,address,uint256)',
          fromBlock,
          toBlock
        );
        if (events.length > 0) {
          this.logger.log(`Encontrados ${events.length} eventos en este lote.`);
          for (const event of events) {
            if (event instanceof EventLog) {
              const [from, to, value] = event.args;
              await this.handleTransferEvent(from, to, value, event);
            }
          }
        }
        fromBlock = toBlock + 1;
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        this.logger.error(
          `Error procesando lote ${fromBlock}-${toBlock}. Reintentando en 10s.`,
          error
        );
        await new Promise((resolve) => setTimeout(resolve, 10000));
      }
    }
    this.logger.log(
      'Sincronizado con la blockchain. Escuchando nuevos eventos.'
    );
  }
}
