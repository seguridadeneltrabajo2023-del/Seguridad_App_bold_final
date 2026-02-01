import { supabase } from './src/lib/supabase.ts';
import fs from 'fs';

async function uploadRealImage() {
  // 1. CONFIGURACIÓN
  const imagePath = 'C:/Users/maalv/Desktop/1.jpg';
  const companyId = '0a097818-32f6-4d83-9cc4-4a1189da0182';
  const fileName = `evidencia_real_${Date.now()}.jpg`;
  
  // ⚠️ REEMPLAZA ESTO CON TU ID DE USUARIO REAL
  const myUserId = 'a758eab7-d6a0-426a-ab09-58fd14d993a4'; 

  console.log("🚀 Iniciando reporte de SST con imagen real...");

  // 2. VALIDAR IMAGEN LOCAL
  if (!fs.existsSync(imagePath)) {
    return console.error("❌ Error: No se encontró la imagen '1.jpg' en el escritorio.");
  }

  const fileBuffer = fs.readFileSync(imagePath);

  // 3. SUBIR AL STORAGE
  const { data: storageData, error: storageError } = await supabase.storage
    .from('evidences')
    .upload(`${companyId}/${fileName}`, fileBuffer, {
      contentType: 'image/jpeg',
      upsert: true
    });

  if (storageError) {
    return console.error("❌ Error en Storage:", storageError.message);
  }

  console.log("✅ Imagen guardada correctamente en el Storage.");

  // 4. CREAR REGISTRO EN BASE DE DATOS
  // Añadimos 'incident_date' para cumplir con la restricción NOT NULL
  const { error: dbError } = await supabase
    .from('incident_reports')
    .insert([{
      company_id: companyId,
      description: 'Inspección de seguridad: Se detectó riesgo de caída en zona de carga.',
      evidence_url: storageData.path,
      created_by: myUserId,
      location: 'Bodega Principal - Pasillo 4',
      incident_date: new Date().toISOString() // <--- FECHA ACTUAL EN FORMATO CORRECTO
    }]);

  if (dbError) {
    return console.error("❌ Error al crear registro en DB:", dbError.message);
  }

  console.log("✅ Registro de incidente creado en la base de datos.");

  // 5. GENERAR LINK DE VISUALIZACIÓN
  const { data: linkData, error: linkError } = await supabase.storage
    .from('evidences')
    .createSignedUrl(storageData.path, 3600);

  if (linkError) {
    return console.error("❌ Error al generar link:", linkError.message);
  }

  console.log("\n--- REPORTE FINALIZADO CON ÉXITO ---");
  console.log("🔗 COPIA ESTE LINK PARA VER LA FOTO EN TU NAVEGADOR:");
  console.log(linkData?.signedUrl);
  console.log("---------------------------------------\n");
}

uploadRealImage();