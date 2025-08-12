/**
 * @fileoverview Servicio para interactuar con Supabase.
 * Centraliza la inicialización de los clientes de Supabase (anon y admin).
 * Documentación de Supabase.js v2: https://supabase.com/docs/reference/javascript/initializing
 */

import { createClient } from '@supabase/supabase-js';
import { config } from '../config';

// Obtiene la URL y las claves desde la configuración centralizada.
const supabaseUrl = config.SUPABASE_URL;
const supabaseAnonKey = config.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = config.SUPABASE_SERVICE_ROLE_KEY;

// Cliente de Supabase para operaciones del lado del cliente (anon key).
// Utiliza RLS para la seguridad.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

// Cliente de Supabase para operaciones del lado del servidor (service_role key).
// Este cliente puede saltarse las políticas de RLS. Debe usarse con precaución.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});
