
'use server';
/**
 * @fileOverview A flow to fetch a user's transaction history.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { TransactionHistoryItem } from '@/lib/types';

const TransactionHistoryInputSchema = z.object({
  address: z.string().describe('The wallet address to fetch the history for.'),
});
export type TransactionHistoryInput = z.infer<typeof TransactionHistoryInputSchema>;

const TransactionHistoryOutputSchema = z.array(z.object({
    txHash: z.string(),
    timestamp: z.string(),
    address: z.string(),
    amount: z.number().nullable(), // Nullable for private transactions
    ticker: z.string(),
    type: z.enum(['in', 'out']),
    origin: z.enum(['codex', 'other']),
    blockNumber: z.number(),
    status: z.enum(['confirmed', 'pending', 'failed']),
}));
export type TransactionHistoryOutput = z.infer<typeof TransactionHistoryOutputSchema>;


// This is a mock function. In a real scenario, this would query an Aztec network indexer.
const fetchMockHistory = (address: string): TransactionHistoryOutput => {
  const history: TransactionHistoryOutput = [];
  const now = new Date();
  const oneMonthAgo = new Date(now);
  oneMonthAgo.setMonth(now.getMonth() - 1);

  const generateRandomAddress = () => '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
  const assets = ['ETH', 'DAI', 'USDC', 'wBTC'];

  for (let i = 0; i < 25; i++) {
    const randomTimestamp = new Date(oneMonthAgo.getTime() + Math.random() * (now.getTime() - oneMonthAgo.getTime()));
    const type = Math.random() > 0.5 ? 'in' : 'out';
    const origin = Math.random() > 0.3 ? 'codex' : 'other';
    const ticker = assets[Math.floor(Math.random() * assets.length)];
    
    // Simulate ZKP privacy: about 40% of transactions have a hidden amount
    const isPrivate = Math.random() < 0.4;
    
    history.push({
      txHash: `0x${i}` + Array(63 - i.toString().length).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
      timestamp: randomTimestamp.toISOString(),
      address: type === 'out' ? generateRandomAddress() : address,
      amount: isPrivate ? null : parseFloat((Math.random() * (ticker === 'ETH' ? 2 : 1000)).toFixed(4)),
      ticker: ticker,
      type: type,
      origin: origin,
      blockNumber: 18000000 + i * 100,
      status: 'confirmed'
    });
  }

  // Sort by most recent
  return history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};


export async function fetchTransactionHistory(input: TransactionHistoryInput): Promise<TransactionHistoryOutput> {
  // In a real app, you'd call the Aztec indexer here.
  // We're returning a mock response for demonstration.
  return fetchMockHistory(input.address);
}


export const fetchTransactionHistoryFlow = ai.defineFlow(
  {
    name: 'fetchTransactionHistoryFlow',
    inputSchema: TransactionHistoryInputSchema,
    outputSchema: TransactionHistoryOutputSchema,
  },
  async (input) => {
    return fetchTransactionHistory(input);
  }
);
