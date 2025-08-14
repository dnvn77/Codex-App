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
      console.error("Supabase credentials are not set in the environment variables. Please check your .env file.");
      // We can return a mock or throw an error, but for the app to not crash,
      // we'll proceed, and Supabase client itself will handle connection errors.
      // However, the createClient function will throw an error if the URL is invalid.
      // So we must ensure they are at least valid strings.
      supabaseClient = createClient('http://localhost:54321', 'test_key');
    } else {
        supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    }
  }
  return supabaseClient;
};

// For convenience, we can still export a default object that lazy-loads the client.
// This is an advanced pattern and might be confusing. For now, we stick to the function export.
// export const supabase = getSupabase();
