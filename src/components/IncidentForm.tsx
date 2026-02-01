import { useState } from 'react';
import { supabase } from '../SupabaseClient';
import { useApp } from '../contexts/AppContext'; 

interface IncidentFormProps {
  onIncidentCreated?: () => void;
  onClose?: () => void;
}

export const IncidentForm = ({ onIncidentCreated, onClose }: IncidentFormProps) => {
  const context = useApp() as any;
  
  const currentCompanyId = 
    context.currentCompany?.id || 
    context.selectedCompany?.id || 
    context.currentCompanyId || 
    context.selectedCompanyId || 
    context.activeCompanyId;

  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentCompanyId) {
      alert("Error: No se detecta empresa vinculada.");
      return;
    }
    
    setLoading(true);

    try {
      let imagePath = null;

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

      const { error: insertError } = await supabase
        .from('incident_reports')
        .insert([{
          location,
          description,
          company_id: currentCompanyId,
          image_path: imagePath,
          incident_date: new Date().toISOString()
        }]);

      if (insertError) throw insertError;

      alert("✅ Reporte guardado exitosamente");
      if (onIncidentCreated) onIncidentCreated();
      if (onClose) onClose();

    } catch (error: any) {
      alert("❌ Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Ajustamos sombras y bordes para que resalte como ventana emergente
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full overflow-hidden animate-in zoom-in-95 duration-200">
      {/* Cabecera del Modal con botón X */}
      <div className="flex justify-between items-center bg-gray-50 px-6 py-4 border-b">
        <div>
          <h3 className="text-xl font-bold text-gray-800">📝 Nuevo Reporte</h3>
          <p className="text-xs text-gray-500">Completa los detalles del incidente</p>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-2 rounded-full transition-colors"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">¿Dónde ocurrió?</label>
            <input 
              type="text" 
              required 
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ej. Bodega Norte, Pasillo 3"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Descripción del Incidente</label>
            <textarea 
              required 
              rows={4}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe lo sucedido detalladamente..."
            />
          </div>

          <div className="bg-blue-50/50 p-4 rounded-xl border-2 border-dashed border-blue-100">
            <label className="block text-sm font-bold text-blue-800 mb-2">Evidencia Fotográfica</label>
            <input 
              type="file" 
              accept="image/*"
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-all cursor-pointer"
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
            />
          </div>
        </div>

        {/* Footer del formulario */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
             {currentCompanyId ? (
                <div className="flex items-center gap-1.5 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold uppercase">Empresa Vinculada</span>
                </div>
             ) : (
                <span className="text-[10px] font-bold text-red-500 uppercase">Sin Empresa</span>
             )}
          </div>
          
          <div className="flex gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-5 py-2.5 text-gray-500 font-semibold hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cerrar
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:bg-blue-300 shadow-lg shadow-blue-100 transition-all active:scale-95 flex items-center gap-2"
            >
              {loading ? 'Guardando...' : 'Registrar Reporte'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};