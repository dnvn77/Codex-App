
import type { Wallet, Transaction } from './types';

// WARNING: This is a mock implementation for demonstration purposes.
// Do not use this in a production environment.
// A real implementation would use a proper HD wallet library like ethers.js or viem,
// and cryptographic libraries for hashing like 'crypto' or 'js-sha3'.

const MOCK_WORDS = [
  'apple', 'banana', 'cherry', 'date', 'elderberry', 'fig', 'grape', 'honeydew',
  'kiwi', 'lemon', 'mango', 'nectarine', 'orange', 'peach', 'quince', 'raspberry',
  'strawberry', 'tangerine', 'ugli', 'vanilla', 'watermelon', 'xigua', 'yam', 'zucchini'
];

function generateRandomString(length: number, chars: string): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Mock hash function to simulate derivation. In reality, use Keccak-256 or similar.
function mockHash(input: string): string {
  // This is NOT a real hash function and is NOT secure. For demonstration only.
  // It's a simple algorithm to create a deterministic, pseudo-random-looking hex string.
  let hash = 0;
  if (input.length === 0) return '0x0000000000000000000000000000000000000000000000000000000000000000';
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  
  let hex = '';
  for(let i=0; i<8; i++){
    // Tweak the hash to get different values for each segment
    const segment = (hash + i*277) * (i+1);
    hex += (segment & 0xFFFFFFF).toString(16).padStart(7,'0');
  }

  return '0x' + hex.substring(0, 64);
}


function deriveKeysFromSeed(seedPhrase: string): Omit<Wallet, 'seedPhrase' | 'balance'> {
    // In a real app, the seed phrase would be used with BIP39 to generate a master seed,
    // then SLIP-10 or BIP32/44 to derive keys.
    const masterKey = mockHash(seedPhrase);
    
    // Derive App Key and Nullifier Key from the Master Key.
    // In Aztec, these derivations are specific cryptographic operations.
    const appKey = mockHash(masterKey + "_app_key");
    const nullifierKey = mockHash(masterKey + "_nullifier_key");

    // The address is derived from the app key.
    const address = '0x' + mockHash(appKey).substring(2, 42);

    return {
        address,
        masterKey,
        appKey,
        nullifierKey,
    };
}


/**
 * Creates a mock wallet with a random seed phrase and derived keys based on Aztec concepts.
 * @returns A mock Wallet object.
 */
export function createWallet(): Wallet {
  const seedPhrase = [...Array(12)].map(() => MOCK_WORDS[Math.floor(Math.random() * MOCK_WORDS.length)]).join(' ');
  const derivedKeys = deriveKeysFromSeed(seedPhrase);

  return {
    seedPhrase,
    balance: 0.50, // Default balance for new wallets
    ...derivedKeys,
  };
}


/**
 * Imports a wallet from a seed phrase.
 * @param seedPhrase The secret phrase.
 * @returns A Wallet object.
 */
export function importWalletFromSeed(seedPhrase: string): Wallet {
    const words = seedPhrase.trim().split(/\s+/);
    if (![12, 15, 18, 24].includes(words.length)) {
        throw new Error(`Invalid seed phrase length. Expected 12, 15, 18, or 24 words, but got ${words.length}.`);
    }
    const derivedKeys = deriveKeysFromSeed(seedPhrase);
    
    // Simulate a "fetched" balance for an imported wallet
    const balance = parseFloat((Math.random() * 2 + 0.1).toFixed(4)); 

    return {
        seedPhrase: words.join(' '),
        balance,
        ...derivedKeys,
    };
}


/**
 * Simulates sending a private transaction.
 * @param fromWallet The sender's wallet.
 * @param to The recipient's address.
 * @param amount The amount of ETH to send.
 * @returns A mock Transaction object.
 */
export function sendTransaction(fromWallet: Wallet, to: string, amount: number): Transaction {
  if (amount <= 0) {
    throw new Error('Amount must be positive.');
  }

  // In a real Aztec transaction, the nullifierKey would be used to generate nullifiers for the notes being spent.
  // The appKey would be used to sign the transaction.

  const txHash = '0x' + generateRandomString(64, '0123456789abcdef');
  const proposedOnL1 = Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 120);

  return {
    txHash,
    from: fromWallet.address,
    to,
    amount,
    proposedOnL1,
  };
}
