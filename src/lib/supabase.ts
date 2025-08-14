"use client";

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// This client is for the FRONTEND, uses the anon key.
// It will have permissions based on RLS policies for 'anon' or 'authenticated' roles.
export const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
