"use client";

import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Replace these placeholder values with your actual Supabase credentials.
// This is a temporary workaround to prevent the application from crashing on startup
// due to issues with environment variable loading in this specific development environment.
const supabaseUrl = 'https://YOUR_SUPABASE_URL.supabase.co';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';


if (!supabaseUrl || supabaseUrl === 'https://YOUR_SUPABASE_URL.supabase.co' || !supabaseAnonKey || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
    console.warn("Supabase credentials are not set. Please replace the placeholder values in src/lib/supabase.ts");
}

// This client is for the FRONTEND, uses the anon key.
// It will have permissions based on RLS policies for 'anon' or 'authenticated' roles.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
