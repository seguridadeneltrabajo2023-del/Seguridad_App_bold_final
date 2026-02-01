import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rtezouotyomzmmwevbpz.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0ZXpvdW90eW9tem1td2V2YnB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MTc2NjAsImV4cCI6MjA4NTQ5MzY2MH0.WtRtWbc8zTJLyQE9NwueodEbzVSuf-n4lduQQeNVyxM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function getIncidentReports() {
  console.log('--- 🔍 Consultando incident_reports ---');

  // Traemos todo (*) sin filtros para asegurar que algo salga
  const { data, error } = await supabase
    .from('incident_reports') 
    .select('*');

  if (error) {
    console.error('❌ Error de Supabase:', error.message);
    return;
  }

  if (!data || data.length === 0) {
    console.log('⚠️ La tabla está conectada pero no devolvió filas. Revisa que los datos estén en el esquema "public".');
  } else {
    console.log(`✅ ¡Éxito! Se encontraron ${data.length} registros.`);
    console.table(data);
  }
}

getIncidentReports();