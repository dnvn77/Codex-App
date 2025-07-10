export interface Wallet {
  address: string;
  privateKey: string; // Note: In a real app, this should be handled by a secure vault/signer.
  seedPhrase: string;
}

export interface Transaction {
  txHash: string;
  from: string;
  to: string;
  amount: number;
  proposedOnL1: number;
}
