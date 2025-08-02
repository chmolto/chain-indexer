import { Injectable } from '@nestjs/common';
import { TransferEvent } from '@chain-indexer/shared-interfaces';

@Injectable()
export class AppService {
  getTransfers(): TransferEvent[] {
    return [
      {
        id: '0x1a2b3c4d5e6f...',
        from: '0xDeA4299bDD3a510445b2034945b4D3C4B3D4E5F6',
        to: '0xAbC8765deF1234bCDa123eF4567890a123bCDE45',
        value: '1500000000000000000', // 1.5 Tokens (con 18 decimales)
        blockNumber: 15234567,
        transactionHash: '0x1a2b3c4d5e6f...',
      },
      {
        id: '0x7g8h9i0j1k2l...',
        from: '0xAbC8765deF1234bCDa123eF4567890a123bCDE45',
        to: '0xCdE1234aBc5678dEfa987bC654dE321fEdCbA210',
        value: '500000000000000000', // 0.5 Tokens
        blockNumber: 15234599,
        transactionHash: '0x7g8h9i0j1k2l...',
      },
    ];
  }
}
