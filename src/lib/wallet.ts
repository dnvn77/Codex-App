
"use client";

import type { Wallet, Transaction, StoredWallet } from './types';
import { commonPasswords } from './commonPasswords';

// WARNING: This is a mock implementation for demonstration purposes.
// Do not use this in a production environment.
// A real implementation would use a proper HD wallet library like ethers.js or viem,
// and cryptographic libraries for hashing like 'crypto' or 'js-sha3'.

const MOCK_WORDS = [
  'apple', 'banana', 'cherry', 'date', 'elderberry', 'fig', 'grape', 'honeydew',
  'kiwi', 'lemon', 'mango', 'nectarine', 'orange', 'peach', 'quince', 'raspberry',
  'strawberry', 'tangerine', 'ugli', 'vanilla', 'watermelon', 'xigua', 'yam', 'zucchini'
];

const STORAGE_KEY = 'strawberry_wallet';

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
  if (input.length === 0) return '0000000000000000000000000000000000000000000000000000000000000000';
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  
  let hex = '';
  for(let i=0; i<8; i++){
    // Tweak the hash to get different values for each segment
    const segment = (hash + i*277) * (i+1);
    hex += Math.abs(segment & 0xFFFFFFF).toString(16).padStart(7,'0');
  }

  return hex.substring(0, 64);
}


function deriveKeysFromSeed(seedPhrase: string): Omit<Wallet, 'seedPhrase' | 'balance'> {
    // In a real app, the seed phrase would be used with BIP39 to generate a master seed,
    // then SLIP-10 or BIP32/44 to derive keys.
    const masterKey = '0x' + mockHash(seedPhrase);
    
    // Derive App Key and Nullifier Key from the Master Key.
    // In Aztec, these derivations are specific cryptographic operations.
    const appKey = '0x' + mockHash(masterKey + "_app_key");
    const nullifierKey = '0x' + mockHash(masterKey + "_nullifier_key");

    // The address is derived from the app key.
    const address = '0x' + mockHash(appKey).substring(0, 40);

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
    const words = seedPhrase.trim().toLowerCase().split(/\s+/);
    if (![12, 15, 18, 24].includes(words.length)) {
        throw new Error(`Invalid seed phrase length. Expected 12, 15, 18, or 24 words, but got ${words.length}.`);
    }

    // A simple check if all words seem plausible (from our mock list). In reality, this would be a checksum validation.
    // This is a basic simulation of an invalid phrase.
    if (words.some(word => !MOCK_WORDS.includes(word.toLowerCase()))) {
       throw new Error("Invalid seed phrase. Please check your words and try again.");
    }

    const derivedKeys = deriveKeysFromSeed(words.join(' '));
    
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
  if (fromWallet.balance < amount) {
    throw new Error('Insufficient balance for this transaction.');
  }
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


/**
 * Simulates resolving an ENS name to an Ethereum address.
 * @param ensName The ENS name to resolve (e.g., 'vitalik.eth').
 * @returns A Promise that resolves to the address string or null if not found.
 */
export async function resolveEnsName(ensName: string): Promise<string | null> {
  const mockEnsRegistry: { [key: string]: string } = {
    'vitalik.eth': '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    'ens.eth': '0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72',
    'firefly.eth': '0x8A4b2162248231575C4b125AD31F7539a8528d29',
    'wallet.eth': '0x577433D224934B26f97b1161d0b57134377F928F',
    'lesmo.eth': '0x4349F4Cf93a6282928A4a8352652E5C3138b725a'
  };

  return new Promise(resolve => {
    // Simulate network delay
    setTimeout(() => {
      const address = mockEnsRegistry[ensName.toLowerCase()];
      resolve(address || null);
    }, 1000);
  });
}


// --- Wallet Storage and Encryption ---
// Using Web Crypto API for strong encryption.

// Helper to convert ArrayBuffer to Base64 string
function bufferToBase64(buffer: ArrayBuffer): string {
    return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(buffer))));
}

// Helper to convert Base64 string to Uint8Array
function base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function deriveKey(secret: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  // Using a higher iteration count for increased security against brute-force attacks.
  const iterations = 300000;

  return window.crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

async function encrypt(data: string, secret: string): Promise<Omit<StoredWallet, 'address' | 'balance'>> {
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(secret, salt);
    const encodedData = new TextEncoder().encode(data);
    
    const encrypted = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encodedData
    );

    return {
        encryptedSeed: bufferToBase64(encrypted),
        salt: bufferToBase64(salt),
        iv: bufferToBase64(iv),
    };
}

async function decrypt(stored: StoredWallet, secret: string): Promise<string> {
    const salt = base64ToUint8Array(stored.salt);
    const iv = base64ToUint8Array(stored.iv);
    const encryptedData = base64ToUint8Array(stored.encryptedSeed);
    
    const key = await deriveKey(secret, salt);

    const decrypted = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encryptedData
    );

    return new TextDecoder().decode(decrypted);
}

export async function storeWallet(wallet: Wallet, password: string): Promise<void> {
    const encryptedData = await encrypt(wallet.seedPhrase, password);
    const storedWallet: StoredWallet = {
        ...encryptedData,
        address: wallet.address,
        balance: wallet.balance
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedWallet));
}

export function getStoredWallet(): StoredWallet | null {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
}

export function updateStoredWalletBalance(newBalance: number): void {
  const stored = getStoredWallet();
  if (!stored) return;

  const updatedWallet: StoredWallet = {
    ...stored,
    balance: newBalance
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedWallet));
}

export async function unlockWallet(password: string): Promise<Wallet | null> {
    const stored = getStoredWallet();
    if (!stored) return null;

    try {
        const seedPhrase = await decrypt(stored, password);
        const derivedKeys = deriveKeysFromSeed(seedPhrase);
        
        // Ensure the derived address matches the stored one as a sanity check.
        if(derivedKeys.address !== stored.address) {
            throw new Error("Address mismatch after decryption. This indicates a serious issue.");
        }

        return {
            ...derivedKeys,
            seedPhrase,
            balance: stored.balance,
        };
    } catch (e) {
        console.error("Decryption failed (likely wrong password):", e);
        return null;
    }
}

export function clearStoredWallet(): void {
    localStorage.removeItem(STORAGE_KEY);
}

export function validatePassword(password: string): {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
    common: boolean;
} {
    return {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[\W_]/.test(password), // Matches any non-word character
        common: !commonPasswords.has(password.toLowerCase()),
    };
}
