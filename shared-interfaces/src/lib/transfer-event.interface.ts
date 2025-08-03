export interface TransferEvent {
  transactionHash: string;
  fromAddress: string;
  toAddress: string;
  value: string;
  blockNumber: number;
  transactionDate?: Date;
}
