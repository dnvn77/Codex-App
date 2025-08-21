
export interface Wallet {
  address: string;
  seedPhrase: string;
  balance: number; // Simulated balance
  masterKey: string;
  appKey: string;
  nullifierKey: string;
}

export interface StoredWallet {
  encryptedSeed: string;
  salt: string;
  iv: string;
  address: string;
  balance: number;
  favoriteTokens?: string[]; // Optional for migration
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
  isFavorite: boolean;
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
