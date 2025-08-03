
'use server';
/**
 * @fileOverview A flow to fetch historical price data for a given asset.
 * This simulates fetching data for the last 7 days (168 hourly points).
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { Asset } from '@/lib/types';

const AssetHistoryInputSchema = z.object({
  id: z.number().describe('The CoinMarketCap ID of the asset.'),
});
export type AssetHistoryInput = z.infer<typeof AssetHistoryInputSchema>;

const AssetHistoryPointSchema = z.object({
  timestamp: z.number(),
  price: z.number(),
});
export type AssetHistoryPoint = z.infer<typeof AssetHistoryPointSchema>;

const AssetHistoryOutputSchema = z.array(AssetHistoryPointSchema);
export type AssetHistoryOutput = z.infer<typeof AssetHistoryOutputSchema>;

// This is a mock function. In a real scenario, this would query a pricing API.
const fetchMockHistory = (assetId: number): AssetHistoryOutput => {
  const history: AssetHistoryOutput = [];
  const now = new Date();
  const sevenDaysAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
  
  // Base price simulation based on a hash of the asset ID to make it deterministic
  const basePrice = (assetId % 500) + 10;
  const volatility = 0.2 + (assetId % 10) / 50; // 0.2 to 0.4

  for (let i = 0; i < 168; i++) {
    const timestamp = sevenDaysAgo + i * 60 * 60 * 1000;
    
    // Simulate some price fluctuation
    const priceFluctuation = (Math.sin(i / 20) + (Math.random() - 0.5) * 0.5) * basePrice * volatility;
    const price = basePrice + priceFluctuation;
    
    history.push({
      timestamp: Math.floor(timestamp / 1000), // Unix timestamp in seconds
      price: parseFloat(price.toFixed(4)),
    });
  }

  return history;
};

export async function fetchAssetHistory(input: AssetHistoryInput): Promise<AssetHistoryOutput> {
  // In a real app, you would call a service like CoinMarketCap or CoinGecko here.
  return fetchMockHistory(input.id);
}

export const fetchAssetHistoryFlow = ai.defineFlow(
  {
    name: 'fetchAssetHistoryFlow',
    inputSchema: AssetHistoryInputSchema,
    outputSchema: AssetHistoryOutputSchema,
  },
  async (input) => {
    return fetchAssetHistory(input);
  }
);
