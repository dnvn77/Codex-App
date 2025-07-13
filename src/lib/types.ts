
export interface Wallet {
  address: string;
  seedPhrase: string;
  // Based on Aztec Protocol concepts.
  // In a real app, these should be handled by a secure vault/signer.
  masterKey: string;     // The root key from which other keys are derived.
  appKey: string;        // Used for signing transactions for a specific app.
  nullifierKey: string;  // Used to derive nullifiers for spending private notes.
}

export interface Transaction {
  txHash: string;
  from: string;
  to: string;
  amount: number;
  proposedOnL1: number;
}
