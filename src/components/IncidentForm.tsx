import { useState } from 'react';
import { supabase } from '../SupabaseClient';
import { useApp } from '../contexts/AppContext'; 

interface IncidentFormProps {
  onIncidentCreated?: () => void;
  onClose?: () => void;
}

export const IncidentForm = ({ onIncidentCreated, onClose }: IncidentFormProps) => {
  // 1. EXTRAEMOS EL CONTEXTO COMPLETO
  const context = useApp(); 
  
  // 2. BUSCAMOS EL ID (Probablemente se llama selectedCompanyId en tu AppContextType)
  // @ts-ignore - Si sigue el error, cambia 'selectedCompanyId' por el nombre que veas en AppContext.tsx
  const currentCompanyId = context.selectedCompanyId; 
  
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verificación de seguridad
    if (!currentCompanyId) {
      alert("Error: No se encontró el ID de la empresa. Asegúrate de que una empresa esté seleccionada.");
      return;
    }
    
    setLoading(true);

    try {
      let imagePath = null;

      // Subida de imagen
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `${currentCompanyId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('evidences')
          .upload(filePath, file);

        if (uploadError) throw uploadError;
        imagePath = filePath;
      }

      // Inserción con el ID correcto
      const { error: insertError } = await supabase
        .from('incident_reports')
        .insert([{
          location,
          description,
          company_id: currentCompanyId, // Aquí usamos el valor extraído del contexto
          image_path: imagePath,
          incident_date: new Date().toISOString()
        }]);

      if (insertError) throw insertError;

      alert("✅ ¡Reporte guardado con éxito!");
      if (onIncidentCreated) onIncidentCreated();
    } catch (error: any) {
      alert("❌ Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-lg max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Registrar Incidente</h3>
        
        <div className="space-y-2">
          <label className="block text-sm font-bold text-gray-700">Ubicación</label>
          <input 
            type="text" 
            required 
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-gray-700">Descripción</label>
          <textarea 
            required 
            rows={3}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-gray-700">Evidencia (Foto)</label>
          <input 
            type="file" 
            accept="image/*"
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700"
            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium">Cancelar</button>
          <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-md font-bold hover:bg-blue-700 disabled:bg-blue-300 transition-all">
            {loading ? 'Guardando...' : 'Enviar Reporte'}
          </button>
        </div>
      </form>
    </div>
  );
};