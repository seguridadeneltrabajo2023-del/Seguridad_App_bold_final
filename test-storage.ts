import { supabase } from './src/lib/supabase.ts';
import fs from 'fs';

const uploadTestFile = async () => {
  console.log("📂 Iniciando prueba de subida de archivos...");

  // 1. Iniciamos sesión con el usuario que ya creaste
  // Nota: Usa la contraseña que definiste en el registro (ej: Password123!)
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: "maalvarezv93@gmail.com", // El correo que usaste en el test anterior
    password: "M.43+23",
  });

  if (authError) {
    console.error("❌ Error de login:", authError.message);
    return;
  }

  const userId = authData.user.id;
  const companyId = "0a097818-32f6-4d83-9cc4-4a1189da0182";

  // 2. Simulamos un archivo (un pequeño archivo de texto como evidencia)
  const fileName = `evidencia_${Date.now()}.txt`;
  const fileContent = "Este es un archivo de prueba para el sistema de SST.";
  
  // 3. Subida al bucket 'evidences'
  // La ruta sigue el patrón: {companyId}/{fileName}
  const { data, error } = await supabase.storage
    .from('evidences')
    .upload(`${companyId}/${fileName}`, fileContent, {
      contentType: 'text/plain',
      upsert: true
    });

  if (error) {
    console.error("❌ Error al subir archivo:", error.message);
  } else {
    console.log("✅ ¡Archivo subido con éxito!");
    console.log("Ruta en Storage:", data.path);
  }
};

uploadTestFile();