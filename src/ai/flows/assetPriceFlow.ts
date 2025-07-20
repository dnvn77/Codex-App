
'use server';
/**
 * @fileOverview A flow to fetch asset prices from CoinMarketCap.
 *
 * - fetchAssetPrices - A function that fetches prices for given symbols.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const AssetPriceInputSchema = z.object({
  symbols: z.array(z.string()),
});
export type AssetPriceInput = z.infer<typeof AssetPriceInputSchema>;

const AssetPriceSchema = z.object({
  price: z.number(),
});
const AssetPriceOutputSchema = z.record(z.string(), AssetPriceSchema);
export type AssetPriceOutput = z.infer<typeof AssetPriceOutputSchema>;

// This function is exported and can be called directly from React components.
export async function fetchAssetPrices(input: AssetPriceInput): Promise<AssetPriceOutput> {
  return assetPriceFlow(input);
}

const assetPriceFlow = ai.defineFlow(
  {
    name: 'assetPriceFlow',
    inputSchema: AssetPriceInputSchema,
    outputSchema: AssetPriceOutputSchema,
  },
  async ({ symbols }) => {
    const apiKey = process.env.COINMARKETCAP_API_KEY;
    if (!apiKey) {
      console.error("CoinMarketCap API key is not set in .env file.");
      throw new Error("API Key not available on the server.");
    }
    
    // In a production app, consider using a more robust fetch library or the built-in node fetch.
    const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbols.join(',')}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'X-CMC_PRO_API_KEY': apiKey,
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        const errorBody = await response.text();
        console.error("CoinMarketCap API Error Body:", errorBody);
        throw new Error(`API call failed with status: ${response.status}`);
      }
      
      const data = await response.json();

      if (data.status.error_code !== 0) {
        throw new Error(data.status.error_message);
      }

      const prices: AssetPriceOutput = {};
      for (const symbol in data.data) {
        if (data.data[symbol]) {
          prices[symbol] = {
              price: data.data[symbol].quote.USD.price
          };
        }
      }
      return prices;

    } catch (error) {
      console.error("CoinMarketCap API fetch error in flow:", error);
      // Depending on requirements, you might want to re-throw or return a specific error structure.
      // For now, re-throwing to let the client handle it.
      throw error;
    }
  }
);
