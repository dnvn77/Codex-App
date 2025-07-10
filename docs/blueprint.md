# **App Name**: Violet Vault

## Core Features:

- Wallet Connection: Connect to an existing self-custody wallet, or securely generate a new one with seed phrase backup. Seed phrase will be shown only once.
- Transaction Form: Form to enter destination Ethereum address and amount in ETH for private transaction on Sepolia Testnet.
- Private Transactions: Send private transactions on Sepolia Testnet using PXE (Aztec Network).
- Transaction Receipt: Display the transaction hash, destination address, amount, block number (proposedOnL1), and a link to Etherscan Sepolia.
- Block Number Retrieval: Collect the `proposedOnL1` field from the transaction details for block information, using logic from the Aztec protocol repository.
- initData Validation: Validate Telegram initData from the backend using HMAC-SHA256 with the bot token, to ensure secure communication.

## Style Guidelines:

- Primary color: Vibrant purple (#9400D3) to align with the "completely purple / violet" request.
- Background color: Soft lavender (#E6E6FA), a very light, desaturated tint of the primary, appropriate to a light scheme
- Accent color: Lilac (#B57EDC) a slightly lighter and less saturated purple tone than the primary color. This complements the primary, following the analogous scheme.
- Body and headline font: 'Inter', sans-serif.
- Minimalist line icons with rounded edges for a clean and modern "pastel" aesthetic.
- Mobile-first, single-column layout optimized for Telegram WebApp integration, focusing on clarity and ease of use.
- Subtle transitions and loading animations to enhance user experience without being intrusive.