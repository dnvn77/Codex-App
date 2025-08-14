"use client";

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase credentials are not set in the environment variables. Please check your .env file.");
}

// This client is for the FRONTEND, uses the anon key.
// It will have permissions based on RLS policies for 'anon' or 'authenticated' roles.
// We initialize with empty strings as a fallback to prevent the app from crashing during build/SSR
// if the env vars are not yet available. The Supabase client itself will then handle connection errors gracefully.
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
