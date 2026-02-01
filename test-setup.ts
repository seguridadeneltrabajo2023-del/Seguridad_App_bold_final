import { registerOwnerAndCompany } from './src/services/authService.ts';

const runTest = async () => {
  console.log("🚀 Iniciando prueba de registro...");
  
  try {
    // Generamos el email limpio para evitar el error anterior
    const numeroAleatorio = Math.floor(Math.random() * 100000);
    const emailLimpio = `user_${Date.now()}@supabase.test`;
    
    console.log(`📧 Probando con: ${emailLimpio}`);

    const resultado = await registerOwnerAndCompany(
      emailLimpio,
      "Password123!",
      "Juan Perez",
      "Empresa de Prueba SST"
    );

    console.log("✅ ¡Éxito total!");
    console.log("Usuario ID:", resultado?.user?.id);
    console.log("Empresa ID:", resultado?.company?.id);
    
  } catch (err: any) {
    console.error("❌ Error detectado:", err.message || err);
  }
};

runTest();