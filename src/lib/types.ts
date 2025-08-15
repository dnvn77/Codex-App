
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
  ticker: string;
  icon?: string;
  l1SettlementBlock: number;
  wallet?: Wallet; // Include the updated wallet state
}

export interface Asset {
  name: string;
  ticker: string;
  id: number; // CoinMarketCap ID
  balance: number;
  priceUSD: number;
  change24h: number; // Percentage change in 24h
  icon: string;
}

export interface TransactionHistoryItem {
    txHash: string;
    timestamp: string; // ISO 8601 string
    address: string;
    amount: number | null; // Null for private ZKP transactions
    ticker: string;
    type: 'in' | 'out';
    origin: 'strawberry' | 'other'; // Where the tx was initiated
    blockNumber: number;
    status: 'confirmed' | 'pending' | 'failed';
}

export interface Contact {
  name: string;
  address: string;
}
