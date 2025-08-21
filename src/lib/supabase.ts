"use client";

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// To prevent crashes during Server-Side Rendering (SSR) where environment variables might not be available,
// we avoid creating the client at the top level. Instead, we export a function that initializes the client
// on-demand, ensuring this happens only on the client-side.

let supabaseClient: SupabaseClient | null = null;

export const getSupabase = () => {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Supabase credentials are not set in the environment variables. Please check your .env file. Analytics will be disabled.");
      // Return the existing client (which will be null) to prevent a crash.
      // The logEvent function will handle the null case gracefully.
      return supabaseClient;
    } else {
        supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    }
  }
  return supabaseClient;
};
