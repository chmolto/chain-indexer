import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { TransfersService } from './transfers.service';

@Controller('transfers')
export class TransfersController {
  constructor(private readonly transfersService: TransfersService) {}

  @Get()
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10
  ) {
    return this.transfersService.findAll(page, limit);
  }

  @Get(':txHash')
  async findOne(@Param('txHash') txHash: string) {
    const transfer = await this.transfersService.findOneByTxHash(txHash);
    if (!transfer) {
      throw new NotFoundException(
        `Transferencia con hash ${txHash} no encontrada.`
      );
    }
    return transfer;
  }
}
