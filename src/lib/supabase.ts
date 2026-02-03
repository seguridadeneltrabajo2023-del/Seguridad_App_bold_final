import { createClient } from '@supabase/supabase-js';

// En Vite (que es lo que usas), no se usa 'process.env'
// Se usa 'import.meta.env'
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Falta configurar las variables de Supabase en el archivo .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);