// 1. Corregimos la ruta: Entramos a 'src', luego a 'lib' y finalmente a 'supabase'
import { supabase } from './src/lib/supabase'; 

async function getIncidentReports() {
  console.log('--- 🔍 Consultando incident_reports ---');
  console.log('--- 📡 Conectando a la instancia única de Supabase ---');

  try {
    // Consultamos la tabla de reportes de incidentes
    const { data, error } = await supabase
      .from('incident_reports') 
      .select('*');

    if (error) {
      console.error('❌ Error de Supabase:', error.message);
      console.error('Detalles:', error.details);
      return;
    }

    if (!data || data.length === 0) {
      console.log('⚠️ Conexión exitosa, pero la tabla "incident_reports" está vacía.');
      console.log('Sugerencia: Verifica que tengas registros en el dashboard de Supabase.');
    } else {
      console.log(`✅ ¡Éxito! Se encontraron ${data.length} registros.`);
      // console.table muestra los datos de forma organizada en una tabla de consola
      console.table(data);
    }
  } catch (err) {
    console.error('❌ Error inesperado al intentar consultar:', err);
  }
}

// Ejecutamos la función
getIncidentReports();