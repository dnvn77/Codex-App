
// It's a good practice to keep contract addresses and other constants in a separate file.

// For Sepolia testnet, the native token is ETH. 0x uses a special address for it.
export const ETH_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

// Addresses for common stablecoins on the Sepolia testnet.
export const USDC_ADDRESS = '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8'; // Official USDC on Sepolia
export const USDT_ADDRESS = '0xaA8E23Fb4C704949F65CfF5455F753548f06fF46'; // Common USDT on Sepolia

// Mapping tickers to their contract addresses for easier lookup.
// For the cardless withdrawal feature on Sepolia.
export const TOKEN_ADDRESSES: Record<string, string> = {
    // Map MONAD (UI token) to Sepolia's native ETH address for the swap
    'MONAD': ETH_ADDRESS,
    'ETH': ETH_ADDRESS,
    'USDC': USDC_ADDRESS,
    'USDT': USDT_ADDRESS,
};
