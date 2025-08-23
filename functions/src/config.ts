/**
 * @fileoverview Carga y valida las variables de entorno.
 * Centraliza el acceso a la configuración para asegurar que todas las variables
 * requeridas estén presentes al iniciar la aplicación.
 */

import * as dotenv from 'dotenv';
import { z } from 'zod';

// Carga las variables de entorno desde el archivo .env
dotenv.config();

// Definición de la red Monad Testnet
export const monadTestnet = {
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: {
    name: 'Monad',
    symbol: 'MONAD',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Monad Explorer', url: 'https://testnet.monadexplorer.com' },
  },
  testnet: true,
};


// Define un esquema para validar las variables de entorno requeridas
const envSchema = z.object({
  API_KEY_BACKEND: z.string().min(1, 'API_KEY_BACKEND es requerida.'),
  PORTAL_API_KEY: z.string().min(1, 'PORTAL_API_KEY es requerido.'),
  PORTAL_GATEWAY_URL: z.string().url('PORTAL_GATEWAY_URL debe ser una URL válida.'),
  MONAD_RPC_URL: z.string().url('MONAD_RPC_URL debe ser una URL válida.'),
  SUPABASE_URL: z.string().url('SUPABASE_URL debe ser una URL válida.'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY es requerida.'),
});

// Valida las variables de entorno al cargar el módulo
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    'Error de configuración: Variables de entorno inválidas.',
    parsedEnv.error.flatten().fieldErrors,
  );
  throw new Error('Faltan variables de entorno requeridas o son inválidas.');
}

// Exporta la configuración validada y tipada
export const config = parsedEnv.data;
