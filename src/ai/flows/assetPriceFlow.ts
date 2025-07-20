
'use server';
/**
 * @fileOverview A flow to fetch asset prices.
 * This flow is currently using simulated data due to API instability.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import type {Asset} from '@/lib/types';

const AssetPriceInputSchema = z.object({
  symbols: z.array(z.string()).describe('An array of asset ticker symbols, e.g., ["ETH", "BTC"].'),
});
export type AssetPriceInput = z.infer<typeof AssetPriceInputSchema>;

const AssetPriceOutputSchema = z.array(
    z.object({
        name: z.string(),
        ticker: z.string(),
        id: z.number(),
        balance: z.number(),
        priceUSD: z.number(),
        change5m: z.number(),
        icon: z.string(),
    })
);
export type AssetPriceOutput = z.infer<typeof AssetPriceOutputSchema>;

export async function fetchAssetPrices(input: AssetPriceInput): Promise<AssetPriceOutput> {
  // Currently returning stable, simulated data to avoid external API issues.
  // This can be replaced with a live API call in the future.
  const simulatedPrices: Record<string, Omit<Asset, 'balance' | 'ticker'>> = {
    'ETH': { name: 'Ethereum', id: 1027, priceUSD: 3750.23, change5m: -1.2, icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png' },
    'USDC': { name: 'USD Coin', id: 3408, priceUSD: 1.00, change5m: 0.1, icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png' },
    'WBTC': { name: 'Wrapped BTC', id: 3717, priceUSD: 68000.50, change5m: 2.3, icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3717.png' },
    'STRW': { name: 'Strawberry Token', id: 0, priceUSD: 0.002, change5m: 5.5, icon: '/strawberry-logo.svg' }
  };

  const results = input.symbols.map(symbol => {
      const data = simulatedPrices[symbol];
      // Note: Balance is not handled here, it comes from the wallet state on the client.
      return { ...data, ticker: symbol, balance: 0 }; 
  });
  
  return results as AssetPriceOutput;
}

// The Genkit flow definition can be kept for future integration with a live API.
const fetchAssetPricesFlow = ai.defineFlow(
  {
    name: 'fetchAssetPricesFlow',
    inputSchema: AssetPriceInputSchema,
    outputSchema: AssetPriceOutputSchema,
  },
  async (input) => {
    return fetchAssetPrices(input);
  }
);
