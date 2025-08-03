import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity({ name: 'transfer_events' })
export class TransferEventEntity {
  @PrimaryColumn()
  transactionHash!: string;

  @Column()
  fromAddress!: string;

  @Column()
  toAddress!: string;

  @Column({ type: 'numeric', precision: 30, scale: 0 })
  value!: string;

  @Column()
  blockNumber!: number;

  @Column({ type: 'timestamp', nullable: true })
  transactionDate!: Date;

  @CreateDateColumn()
  createdAt!: Date;
}
