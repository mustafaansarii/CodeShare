import { supabase } from '../supabaseClient';

export const isUserLoggedIn = () => {
  const token = localStorage.getItem('sb-krgblphvrhpvmneqipqe-auth-token');
  return !!token;
}; 