import { supabase } from './src/lib/supabase.ts';

const viewEvidence = async () => {
  // REEMPLAZA esta ruta por la que copiaste de tu columna 'evidence_url'
  const filePath = '0a097818-32f6-4d83-9cc4-4a1189da0182/evidencia_1738437340084.txt'; 

  console.log(`🔍 Generando acceso para: ${filePath}...`);

  const { data, error } = await supabase.storage
    .from('evidences')
    .createSignedUrl(filePath, 3600); // El enlace durará 1 hora

  if (error) {
    console.error("❌ Error:", error.message);
    return;
  }

  console.log("\n✅ ¡URL Generada con éxito!");
  console.log("-----------------------------------------");
  console.log(data.signedUrl);
  console.log("-----------------------------------------");
  console.log("\n💡 Copia el enlace de arriba y pégalo en tu navegador para ver el archivo.");
};

viewEvidence();