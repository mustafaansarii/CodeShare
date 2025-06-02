// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';
import config from './config';

// Use config values instead of process.env
const supabaseUrl = config.supabaseUrl;
const supabaseKey = config.supabaseAnonKey;

// Create and export the main Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Create and export the service role client for admin operations
export const supabaseServiceRoleClient = createClient(
  config.supabaseUrl,
  config.supabaseServiceRole
);
