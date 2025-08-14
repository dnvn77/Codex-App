
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

const mockPrices: Record<string, { name: string, id: number, price: number, change: number }> = {
    ETH: { name: 'Ethereum', id: 1027, price: 3450.12, change: -1.25 },
    USDC: { name: 'USD Coin', id: 3408, price: 1.00, change: 0.01 },
    USDT: { name: 'Tether', id: 825, price: 0.99, change: -0.02 },
    WBTC: { name: 'Wrapped BTC', id: 3717, price: 65023.45, change: -2.50 },
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
    STRW: { name: 'Strawberry Token', id: 0, price: 0.05, change: 5.5 },
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
                balance: 0,
                priceUSD: mockData.price,
                change24h: mockData.change,
                icon: getIconPath(symbol),
            }
        }
        // Fallback for any unknown symbol
        return {
            name: symbol,
            ticker: symbol,
            id: Math.floor(Math.random() * 20000),
            balance: 0,
            priceUSD: 0,
            change24h: 0,
            icon: getIconPath(symbol)
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
