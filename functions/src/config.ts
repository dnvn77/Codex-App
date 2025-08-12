/**
 * @fileoverview Carga y valida las variables de entorno.
 * Centraliza el acceso a la configuración para asegurar que todas las variables
 * requeridas estén presentes al iniciar la aplicación.
 *
 * Documentación de dotenv: https://github.com/motdotla/dotenv
 */

import * as dotenv from 'dotenv';
import { z } from 'zod';

// Carga las variables de entorno desde el archivo .env
dotenv.config();

// Define un esquema para validar las variables de entorno requeridas
const envSchema = z.object({
  API_KEY_BACKEND: z.string().min(1, 'API_KEY_BACKEND es requerida.'),
  ZERODEV_PROJECT_ID: z.string().uuid('ZERODEV_PROJECT_ID debe ser un UUID válido.'),
  SCROLL_SEPOLIA_RPC: z.string().url('SCROLL_SEPOLIA_RPC debe ser una URL válida.'),
  
  // Variables de Supabase
  SUPABASE_URL: z.string().url('SUPABASE_URL es requerida y debe ser una URL válida.'),
  SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY es requerida.'),
  DATABASE_URL: z.string().url('DATABASE_URL es requerida y debe ser una URL válida.'),
  
  // ZK_VERIFIER_ADDRESS es opcional
  ZK_VERIFIER_ADDRESS: z.string().optional(),
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
