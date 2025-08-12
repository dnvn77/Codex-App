/**
 * @fileoverview Servicio para interactuar con Supabase.
 * Centraliza la inicialización del cliente de Supabase.
 * Documentación de Supabase.js v2: https://supabase.com/docs/reference/javascript/initializing
 */

import { createClient } from '@supabase/supabase-js';
import { config } from '../config';

// Obtiene la URL y la clave anónima desde la configuración centralizada.
const supabaseUrl = config.SUPABASE_URL;
const supabaseAnonKey = config.SUPABASE_ANON_KEY;

// Crea y exporta una única instancia del cliente de Supabase.
// El cliente utiliza la 'anon key', que es segura para usar en el backend
// si las políticas de Row Level Security (RLS) están correctamente configuradas
// en tu tabla 'event_logs' para permitir inserciones anónimas.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Es una buena práctica deshabilitar el almacenamiento automático de la sesión
    // en un entorno de servidor como este.
    persistSession: false,
    autoRefreshToken: false,
  }
});
