// It's a good practice to keep contract addresses and other constants in a separate file.

// MONAD is the native token, but for ERC20-like interactions on 0x, it's represented as Wrapped MONAD (WMONAD).
// This is a common pattern in DeFi. We'll use a placeholder address for the testnet.
export const MONAD_ADDRESS = '0x4200000000000000000000000000000000000006'; // Example: Wrapped Ether on Optimism

// Addresses for common stablecoins on the Monad testnet.
// These would be the actual contract addresses on a real network.
export const USDC_ADDRESS = '0x0b2c639c533813f4aa9d7837caf62653d097ff85'; // Example: USDC on Optimism
export const USDT_ADDRESS = '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58'; // Example: USDT on Optimism

// Mapping tickers to their contract addresses for easier lookup.
export const TOKEN_ADDRESSES: Record<string, string> = {
    'MON': MONAD_ADDRESS,
    'ETH': '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', // Special address for native ETH
    'USDC': USDC_ADDRESS,
    'USDT': USDT_ADDRESS,
};
