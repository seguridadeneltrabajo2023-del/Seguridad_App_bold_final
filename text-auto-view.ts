import { supabase } from './src/lib/supabase.ts';

const getLatestIncidentLink = async () => {
  console.log("🔍 Buscando el último incidente en la base de datos...");

  // 1. Consultar el último reporte creado
  const { data: incident, error: dbError } = await supabase
    .from('incident_reports')
    .select('evidence_url')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (dbError || !incident) {
    console.error("❌ No se encontró ningún incidente:", dbError?.message);
    return;
  }

  const filePath = incident.evidence_url;
  console.log(`📂 Ruta encontrada en DB: ${filePath}`);

  // 2. Generar el link firmado para esa ruta exacta
  const { data, error: storageError } = await supabase.storage
    .from('evidences')
    .createSignedUrl(filePath, 3600);

  if (storageError) {
    console.error("❌ Error en Storage:", storageError.message);
    return;
  }

  console.log("\n✅ ¡URL Generada con éxito!");
  console.log("-----------------------------------------");
  console.log(data.signedUrl);
  console.log("-----------------------------------------");
};

getLatestIncidentLink();