export interface TransferEvent {
  id: string; // Usamos un string como ID único, como el hash de la transacción.
  from: string;
  to: string;
  value: string; // Se usa string para manejar números muy grandes (wei) sin pérdida de precisión.
  blockNumber: number;
  transactionHash: string;
}
