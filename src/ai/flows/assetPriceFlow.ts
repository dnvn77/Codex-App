
'use server';
/**
 * @fileOverview A flow to fetch real-time asset prices from CoinMarketCap.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import type {Asset} from '@/lib/types';

// Use the browser-safe environment variable prefix
const CMC_API_KEY = process.env.NEXT_PUBLIC_COINMARKETCAP_API_KEY;

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

const getIconPath = (ticker: string): string => {
    const basePath = '/icons/';
    const defaultIcon = 'strawberry-logo.svg';
    const tickerMap: { [key: string]: string } = {
        ETH: 'eth.svg',
        USDC: 'usdc.svg',
        USDT: 'usdt.svg',
        WBTC: 'wbtc.svg',
        LINK: 'link.svg',
        UNI: 'uni.svg',
        DAI: 'dai.svg',
        LDO: 'ldo.svg',
        ARB: 'arb.svg',
        OP: 'op.svg',
        AAVE: 'aave.svg',
        MKR: 'mkr.svg',
        SAND: 'sand.svg',
        MANA: 'mana.svg',
        STRW: defaultIcon
    };

    const upperTicker = ticker.toUpperCase();
    const iconFile = tickerMap[upperTicker];

    return `${basePath}${iconFile || defaultIcon}`;
}


export async function fetchAssetPrices(input: AssetPriceInput): Promise<AssetPriceOutput> {
  if (!CMC_API_KEY) {
    console.warn('CoinMarketCap API key not found. Using mock data.');
    // Fallback to mock data if API key is missing
    return input.symbols.map(symbol => ({
        name: symbol,
        ticker: symbol,
        id: Math.floor(Math.random() * 20000),
        balance: 0,
        priceUSD: Math.random() * 1000,
        change24h: (Math.random() - 0.5) * 10,
        icon: getIconPath(symbol)
    }));
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
        // Handle cases where a symbol might not be found (e.g., our mock STRW)
         if (symbol === 'STRW') {
          return {
            name: 'Strawberry Token',
            ticker: 'STRW',
            id: 0,
            balance: 0,
            priceUSD: 0.05,
            change24h: 5.5,
            icon: getIconPath('STRW'),
          };
        }
        return {
          name: symbol,
          ticker: symbol,
          id: 0,
          balance: 0,
          priceUSD: 0,
          change24h: 0,
          icon: getIconPath(symbol), // Default icon
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
        icon: getIconPath(assetData.symbol),
      };
    }).filter(asset => asset !== null) as AssetPriceOutput;

    return results;
  } catch (error) {
    console.error('Failed to fetch from CoinMarketCap:', error);
    throw new Error('Could not fetch asset prices.');
  }
}

// The Genkit flow definition to be used by the frontend
export const fetchAssetPricesFlow = ai.defineFlow(
  {
    name: 'fetchAssetPricesFlow',
    inputSchema: AssetPriceInputSchema,
    outputSchema: AssetPriceOutputSchema,
  },
  async (input) => {
    return fetchAssetPrices(input);
  }
);
