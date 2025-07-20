

export interface Wallet {
  address: string;
  seedPhrase: string;
  balance: number; // Simulated balance
  // Based on Aztec Protocol concepts.
  // In a real app, these should be handled by a secure vault/signer.
  masterKey: string;     // The root key from which other keys are derived.
  appKey: string;        // Used for signing transactions for a specific app.
  nullifierKey: string;  // Used to derive nullifiers for spending private notes.
}

export interface StoredWallet {
  // Base64 encoded encrypted seed phrase
  encryptedSeed: string;
  // Base64 encoded salt used for key derivation
  salt: string;
  // Base64 encoded initialization vector
  iv: string;
  address: string;
  balance: number;
}

export interface Transaction {
  txHash: string;
  from: string;
  to: string;
  amount: number;
  proposedOnL1: number;
}

export interface Asset {
  name: string;
  ticker: string;
  balance: number;
  priceUSD: number;
  change5m: number; // Percentage change
  icon: string;
}
