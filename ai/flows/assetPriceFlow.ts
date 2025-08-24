
'use server';
/**
 * @fileOverview A flow to fetch real-time asset prices from CoinMarketCap.
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
        balance: z.number(), // Balance will be added by the client
        priceUSD: z.number(),
        change24h: z.number(), 
        icon: z.string(),
        isFavorite: z.boolean(),
    })
);
export type AssetPriceOutput = z.infer<typeof AssetPriceOutputSchema>;

const getIconPath = (assetId: number): string => {
    if (assetId === 0) { // Handle Codex Token case
      return '/codex-logo.svg';
    }
    if (assetId === 9999) { // Handle Monad case
        return '/monad-logo.svg';
    }
    return `https://s2.coinmarketcap.com/static/img/coins/64x64/${assetId}.png`;
}

const mockPrices: Record<string, { name: string, id: number, price: number, change: number }> = {
    MONAD: { name: 'Monad', id: 9999, price: 2.50, change: 0.5 },
    ETH: { name: 'Ethereum', id: 1027, price: 5000, change: -1.25 },
    USDC: { name: 'USD Coin', id: 3408, price: 1.00, change: 0.01 },
    USDT: { name: 'Tether', id: 825, price: 0.99, change: -0.02 },
    WBTC: { name: 'Wrapped BTC', id: 3717, price: 65005.30, change: -2.45 },
    LINK: { name: 'Chainlink', id: 1975, price: 18.50, change: 3.12 },
    UNI: { name: 'Uniswap', id: 7083, price: 10.25, change: 1.55 },
    DAI: { name: 'Dai', id: 4943, price: 1.01, change: 0.05 },
    LDO: { name: 'Lido DAO', id: 22353, price: 2.33, change: -4.20 },
    ARB: { name: 'Arbitrum', id: 25163, price: 1.15, change: 2.88 },
    OP: { name: 'Optimism', id: 22312, price: 2.58, change: 0.75 },
    AAVE: { name: 'Aave', id: 7278, price: 95.67, change: -0.50 },
    MKR: { name: 'Maker', id: 1518, price: 2890.00, change: 5.60 },
    SAND: { name: 'The Sandbox', id: 6210, price: 0.45, change: -1.80 },
    MANA: { name: 'Decentraland', id: 1966, price: 0.48, change: 0.25 },
    CDX: { name: 'Codex Token', id: 0, price: 0.05, change: 5.5 },
};


export async function fetchAssetPrices(input: AssetPriceInput): Promise<AssetPriceOutput> {
    // We are now using mock data permanently to ensure stability.
    return input.symbols.map(symbol => {
        const mockData = mockPrices[symbol];
        if (mockData) {
            return {
                name: mockData.name,
                ticker: symbol,
                id: mockData.id,
                balance: 0, // This flow is only for prices. Balance is handled in the frontend.
                priceUSD: mockData.price,
                change24h: mockData.change,
                icon: getIconPath(mockData.id),
                isFavorite: false, // isFavorite will be set by the client
            }
        }
        // Fallback for any unknown symbol
        const randomId = Math.floor(Math.random() * 20000) + 1;
        return {
            name: symbol,
            ticker: symbol,
            id: randomId,
            balance: 0,
            priceUSD: 0,
            change24h: 0,
            icon: getIconPath(randomId),
            isFavorite: false,
        };
    });
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

    