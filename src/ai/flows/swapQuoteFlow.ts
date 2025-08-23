
'use server';
/**
 * @fileOverview A flow to fetch a swap quote from the 0x API.
 */

import { z } from 'zod';

const SwapQuoteInputSchema = z.object({
  sellToken: z.string().describe('The contract address of the token to sell.'),
  buyToken: z.string().describe('The contract address of the token to buy.'),
  sellAmount: z.string().describe('The amount of the token to sell, in its smallest unit (e.g., wei).'),
  // takerAddress is optional for quotes and can sometimes cause issues if the address is not recognized.
  // We remove it to make the quote request more robust.
  // takerAddress: z.string().describe('The address of the user performing the swap.'),
});
export type SwapQuoteInput = z.infer<typeof SwapQuoteInputSchema>;

// Define a schema that matches the 0x API response structure we care about.
const SwapQuoteOutputSchema = z.object({
    price: z.string(),
    guaranteedPrice: z.string(),
    to: z.string(),
    data: z.string(),
    value: z.string(),
    gas: z.string(),
    estimatedGas: z.string(),
    gasPrice: z.string(),
    protocolFee: z.string(),
    minimumProtocolFee: z.string(),
    buyAmount: z.string(),
    sellAmount: z.string(),
    sources: z.array(z.object({ name: z.string(), proportion: z.string() })),
    buyTokenAddress: z.string(),
    sellTokenAddress: z.string(),
    allowanceTarget: z.string().optional(),
});
export type SwapQuoteOutput = z.infer<typeof SwapQuoteOutputSchema>;

export async function getSwapQuote(input: SwapQuoteInput): Promise<SwapQuoteOutput> {
  const { sellToken, buyToken, sellAmount } = input;
  
  // The 0x API endpoint for the Sepolia testnet.
  const API_ENDPOINT = 'https://sepolia.api.0x.org/swap/v1/quote';
  
  const params = new URLSearchParams({
    sellToken,
    buyToken,
    sellAmount,
  });

  try {
    const response = await fetch(`${API_ENDPOINT}?${params.toString()}`, {
      headers: {
        '0x-api-key': 'ac0d042c-f81f-48f1-8d4e-2fe8707cf932',
      },
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error('0x API Error:', errorBody);
      // Construct a more descriptive error message
      const reason = errorBody.validationErrors?.[0]?.reason || errorBody.reason || response.statusText;
      throw new Error(`0x API Error: ${reason}`);
    }

    const data: SwapQuoteOutput = await response.json();
    return data;

  } catch (error) {
    console.error('Error fetching swap quote:', error);
    // Re-throw the error so it can be caught by the calling function
    throw error;
  }
}
