
'use server';
/**
 * @fileOverview A flow to handle currency conversions.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { ConversionResult } from '@/lib/types';

// Mock exchange rates - in a real app, this would come from a live API
const MOCK_RATES: Record<string, number> = {
  'EUR': 0.93,   // Euro
  'JPY': 157.5,  // Japanese Yen
  'GBP': 0.79,   // British Pound
  'CAD': 1.37,   // Canadian Dollar
  'AUD': 1.51,   // Australian Dollar
  'CHF': 0.91,   // Swiss Franc
  'CNY': 7.25,   // Chinese Yuan
  'INR': 83.5,   // Indian Rupee
  'BRL': 5.45,   // Brazilian Real
  'RUB': 88.2,   // Russian Ruble
  'MXN': 18.4,   // Mexican Peso
  'IDR': 16400,  // Indonesian Rupiah
};

const CurrencyConversionInputSchema = z.object({
  values: z.array(z.number()).describe('An array of numerical values to convert.'),
  targetCurrency: z.string().length(3).describe('The 3-letter currency code to convert to (e.g., "EUR").'),
});
export type CurrencyConversionInput = z.infer<typeof CurrencyConversionInputSchema>;

const CurrencyConversionOutputSchema = z.object({
    exchangeRate: z.number(),
    convertedValues: z.array(z.number()),
    currencySymbol: z.string(),
});
export type CurrencyConversionOutput = z.infer<typeof CurrencyConversionOutputSchema>;

const CURRENCY_SYMBOLS: Record<string, string> = {
    'USD': '$',
    'EUR': '€',
    'JPY': '¥',
    'GBP': '£',
    'INR': '₹',
    'RUB': '₽',
    'BRL': 'R$',
    'MXN': '$',
    'IDR': 'Rp',
};


export async function convertCurrency(input: CurrencyConversionInput): Promise<CurrencyConversionOutput> {
  const { values, targetCurrency } = input;
  const rate = MOCK_RATES[targetCurrency.toUpperCase()] || 1; // Default to 1 if currency not found

  const convertedValues = values.map(value => value * rate);
  
  const currencySymbol = CURRENCY_SYMBOLS[targetCurrency.toUpperCase()] || targetCurrency;

  return {
    exchangeRate: rate,
    convertedValues,
    currencySymbol,
  };
}

// The Genkit flow definition
export const convertCurrencyFlow = ai.defineFlow(
  {
    name: 'convertCurrencyFlow',
    inputSchema: CurrencyConversionInputSchema,
    outputSchema: CurrencyConversionOutputSchema,
  },
  async (input) => {
    return convertCurrency(input);
  }
);
