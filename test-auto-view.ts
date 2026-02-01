import { supabase } from './src/lib/supabase.ts';

async function run() {
  console.log("🔍 Buscando el último reporte de SST...");
  const { data: incident, error: dbError } = await supabase
    .from('incident_reports')
    .select('evidence_url')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (dbError || !incident) {
    return console.error("❌ Error en base de datos:", dbError?.message);
  }

  const { data, error: storageError } = await supabase.storage
    .from('evidences')
    .createSignedUrl(incident.evidence_url, 3600);

  if (storageError) {
    return console.error("❌ Error en Storage:", storageError.message);
  }

  console.log("\n✅ URL GENERADA (Copia y pega en tu navegador):\n");
  console.log(data?.signedUrl);
}
run();