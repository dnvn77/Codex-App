
/**
 * @fileoverview Rutas de Express para la obtención de precios de tokens.
 */

import { Router } from 'express';

const router = Router();

// Datos simulados consistentes con el frontend para precios y detalles de activos.
const mockPrices: Record<string, { name: string, id: number, price: number, change: number }> = {
    ETH: { name: 'Ethereum', id: 1027, price: 3450.12, change: -1.25 },
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
    STRW: { name: 'Strawberry Token', id: 0, price: 0.05, change: 5.5 },
};

/**
 * @route   GET /prices
 * @desc    Obtiene los precios actuales de una lista predefinida de tokens.
 * @access  Público
 */
router.get('/', (req, res, next) => {
    try {
        const symbols = Object.keys(mockPrices);
        const responseData = symbols.map(symbol => {
            const data = mockPrices[symbol];
            return {
                name: data.name,
                ticker: symbol,
                id: data.id,
                priceUSD: data.price,
                change24h: data.change,
            };
        });

        res.status(200).json(responseData);
    } catch (error) {
        next(error);
    }
});

export default router;
