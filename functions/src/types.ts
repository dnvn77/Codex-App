
/**
 * @fileoverview Define los esquemas de validación de Zod y los tipos de TypeScript.
 * Centraliza las definiciones de datos para mantener la consistencia en toda la aplicación.
 *
 * Documentación de Zod: https://zod.dev/
 */

import { z } from 'zod';

// Expresión regular para validar direcciones de Ethereum.
const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;

// Esquema para validar una dirección de Ethereum.
export const EthAddressSchema = z.string().regex(ethAddressRegex, {
  message: 'La dirección proporcionada no es una dirección de Ethereum válida.',
});

// Esquema para validar un número como string y positivo.
export const PositiveNumberStringSchema = z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: 'El valor debe ser un número positivo.',
});

// --- Esquemas para las Peticiones/Respuestas de los Endpoints ---

// POST /wallet/create
export const CreateWalletRequestSchema = z.object({
  userId: z.string().min(1, 'El campo userId es requerido.'),
  walletAddress: EthAddressSchema,
});
export type CreateWalletRequest = z.infer<typeof CreateWalletRequestSchema>;


// GET /wallet/balance/:address
export const GetBalanceRequestSchema = z.object({
  address: EthAddressSchema,
});
export type GetBalanceRequest = z.infer<typeof GetBalanceRequestSchema>;

// POST /wallet/balance
export const GetBalanceBodySchema = z.object({
  address: EthAddressSchema,
});
export type GetBalanceBodyRequest = z.infer<typeof GetBalanceBodySchema>;


// POST /tx/send
export const SendTransactionRequestSchema = z.object({
  fromUserId: z.string().min(1, 'El campo fromUserId es requerido.'),
  to: EthAddressSchema,
  amountEth: PositiveNumberStringSchema,
});
export type SendTransactionRequest = z.infer<typeof SendTransactionRequestSchema>;

// POST /tx/log
export const LogTransactionRequestSchema = z.object({
    from_address: EthAddressSchema,
    to_address: EthAddressSchema,
    tx_hash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash.'),
    network: z.string().min(1),
    amount: z.number().positive(),
    status: z.enum(['sent', 'confirmed', 'failed']),
});
export type LogTransactionRequest = z.infer<typeof LogTransactionRequestSchema>;


// POST /zk/verify
export const VerifyProofRequestSchema = z.object({
  proof: z.object({}).nonstrict(), // Placeholder, ajustar según la estructura real de la prueba
  publicSignals: z.array(z.any()), // Placeholder, ajustar según los signals reales
});
export type VerifyProofRequest = z.infer<typeof VerifyProofRequestSchema>;


// GET /prices
export const PriceResponseSchema = z.array(
    z.object({
        name: z.string(),
        ticker: z.string(),
        id: z.number(),
        priceUSD: z.number(),
        change24h: z.number(),
    })
);
export type PriceResponse = z.infer<typeof PriceResponseSchema>;
