
"use client";

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('CRITICAL: Supabase URL and/or Anon Key are missing from .env file for the client.');
  // No lanzar error aquí para no romper el build, pero sí loguear.
} else {
  // Este log nos ayuda a confirmar que las variables se cargan del lado del cliente.
  console.log('Supabase client initialized on the browser.');
}

// Este cliente es para el FRONTEND, usa la anon key.
// Solo tendrá los permisos que RLS le otorgue al rol 'anon' o 'authenticated'.
export const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
