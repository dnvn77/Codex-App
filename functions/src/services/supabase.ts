/**
 * @fileoverview Servicio para interactuar con Supabase.
 * Centraliza la inicialización del cliente de Supabase para el backend.
 */

import { createClient } from '@supabase/supabase-js';
import { config } from '../config';

const supabaseUrl = config.SUPABASE_URL;
const serviceRoleKey = config.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Supabase URL and/or Service Role Key are missing from config.');
}

// Crea un cliente de Supabase para usar en el backend (Firebase Functions).
// Este cliente utiliza la `service_role` key, que puede bypass RLS.
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});
