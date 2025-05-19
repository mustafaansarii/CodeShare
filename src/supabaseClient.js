// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';
import config from './config';

// Create and export the main Supabase client
export const supabase = createClient(
  config.supabaseUrl,
  config.supabaseKey
);

// Create and export the service role client for admin operations
export const supabaseServiceRoleClient = createClient(
  config.supabaseUrl,
  config.supabaseServiceRole
);
