import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { TransferEvent } from '@chain-indexer/shared-interfaces';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('transfers')
  getTransfers(): TransferEvent[] {
    return this.appService.getTransfers();
  }
}
