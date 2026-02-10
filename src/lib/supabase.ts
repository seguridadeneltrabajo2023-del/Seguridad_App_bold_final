import { createClient } from '@supabase/supabase-js';

// En Vite se usa import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificación de seguridad
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('⚠️ Falta configurar las variables de Supabase en el archivo .env. Revisa VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY');
}

/**
 * INSTANCIA ÚNICA DE SUPABASE
 * Se exporta una sola vez para evitar el error de "Multiple GoTrueClient instances"
 * y asegurar que el manejo de la sesión (Auth) sea consistente en toda la App.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});