
'use server';
/**
 * @fileOverview A flow to fetch real-time asset prices from CoinMarketCap.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import type {Asset} from '@/lib/types';

// Hide the API key by using environment variables
const CMC_API_KEY = process.env.COINMARKETCAP_API_KEY;

const AssetPriceInputSchema = z.object({
  symbols: z.array(z.string()).describe('An array of asset ticker symbols, e.g., ["ETH", "BTC"].'),
});
export type AssetPriceInput = z.infer<typeof AssetPriceInputSchema>;

const AssetPriceOutputSchema = z.array(
    z.object({
        name: z.string(),
        ticker: z.string(),
        id: z.number(),
        balance: z.number(), // Balance will be added by the client
        priceUSD: z.number(),
        change24h: z.number(), // CMC provides 24h change, not 5m
        icon: z.string(),
    })
);
export type AssetPriceOutput = z.infer<typeof AssetPriceOutputSchema>;

export async function fetchAssetPrices(input: AssetPriceInput): Promise<AssetPriceOutput> {
  if (!CMC_API_KEY) {
    console.error('CoinMarketCap API key is not configured.');
    throw new Error('Server configuration error: Missing API key.');
  }

  const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${input.symbols.join(',')}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'X-CMC_PRO_API_KEY': CMC_API_KEY,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error('CoinMarketCap API Error:', errorBody);
      throw new Error(`API request failed with status ${response.status}: ${errorBody.status.error_message}`);
    }

    const data = await response.json();

    const results: AssetPriceOutput = input.symbols.map(symbol => {
      const assetData = data.data[symbol];
      if (!assetData) {
        // Handle cases where a symbol might not be found
        return {
          name: symbol,
          ticker: symbol,
          id: 0,
          balance: 0,
          priceUSD: 0,
          change24h: 0,
          icon: '/strawberry-logo.svg', // Default icon
        };
      }
      
      const quote = assetData.quote.USD;
      
      return {
        name: assetData.name,
        ticker: assetData.symbol,
        id: assetData.id,
        balance: 0, // Client will add this
        priceUSD: quote.price,
        change24h: quote.percent_change_24h,
        icon: `https://s2.coinmarketcap.com/static/img/coins/64x64/${assetData.id}.png`,
      };
    });

    return results;
  } catch (error) {
    console.error('Failed to fetch from CoinMarketCap:', error);
    throw new Error('Could not fetch asset prices.');
  }
}

// The Genkit flow definition to be used by the frontend
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
