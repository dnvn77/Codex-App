import type { Wallet, Transaction } from './types';

// WARNING: This is a mock implementation for demonstration purposes.
// Do not use this in a production environment.
// A real implementation would use a proper HD wallet library like ethers.js or viem.

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

/**
 * Creates a mock wallet with a random seed phrase and address.
 * @returns A mock Wallet object.
 */
export function createWallet(): Wallet {
  const seedPhrase = [...Array(12)].map(() => MOCK_WORDS[Math.floor(Math.random() * MOCK_WORDS.length)]).join(' ');
  const privateKey = '0x' + generateRandomString(64, '0123456789abcdef');
  const address = '0x' + generateRandomString(40, '0123456789abcdef');

  return {
    seedPhrase,
    privateKey,
    address,
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

  const txHash = '0x' + generateRandomString(64, '0123456789abcdef');
  const proposedOnL1 = Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 120); // Mock block number from recent past

  return {
    txHash,
    from: fromWallet.address,
    to,
    amount,
    proposedOnL1,
  };
}
