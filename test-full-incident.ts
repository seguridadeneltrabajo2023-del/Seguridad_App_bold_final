import { supabase } from './src/lib/supabase.ts';

const createFullIncident = async () => {
  console.log("🛠️ Iniciando reporte completo de incidente...");

  const companyId = "0a097818-32f6-4d83-9cc4-4a1189da0182";
  const userId = "59bd7031-62d9-4d27-96b1-f26662595d80";

  // 1. Subir la evidencia (Imagen/PDF simulado)
  const fileName = `evidencia_accidente_${Date.now()}.txt`;
  const { data: storageData, error: storageError } = await supabase.storage
    .from('evidences')
    .upload(`${companyId}/${fileName}`, "Contenido de la evidencia del accidente.");

  if (storageError) {
    console.error("❌ Error subiendo evidencia:", storageError.message);
    return;
  }

  console.log("✅ Evidencia guardada en Storage.");

  // 2. Crear el registro en la base de datos vinculando la URL
  const { data: incidentData, error: incidentError } = await supabase
    .from('incident_reports')
    .insert([
      {
        company_id: companyId,
        created_by: userId,
        description: "Caída de mismo nivel por piso húmedo sin señalización.",
        location: "Pasillo principal - Planta 1",
        incident_date: new Date().toISOString(),
        evidence_url: storageData.path // Guardamos la ruta que nos dio el Storage
      }
    ])
    .select();

  if (incidentError) {
    console.error("❌ Error creando el reporte:", incidentError.message);
  } else {
    console.log("🎉 ¡Reporte de incidente creado con éxito!");
    console.table(incidentData);
  }
};

createFullIncident();