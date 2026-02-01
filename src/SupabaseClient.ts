import { createClient } from '@supabase/supabase-js';

// 1. Tus credenciales (Ya las validamos en el script anterior)
const supabaseUrl = 'https://rtezouotyomzmmwevbpz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0ZXpvdW90eW9tem1td2V2YnB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MTc2NjAsImV4cCI6MjA4NTQ5MzY2MH0.WtRtWbc8zTJLyQE9NwueodEbzVSuf-n4lduQQeNVyxM';

/**
 * Creamos la instancia del cliente. 
 * Usamos 'export const' para corregir el error 2614 que tenías.
 */
export const supabase = createClient(supabaseUrl, supabaseKey);