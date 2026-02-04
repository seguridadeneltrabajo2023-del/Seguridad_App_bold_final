import { useState, useRef } from 'react';
import { Camera, FileCheck, X, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ExecutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityId: string;
  activityTitle: string;
  onSuccess: () => void;
}

export function ExecutionModal({ isOpen, onClose, activityId, activityTitle, onSuccess }: ExecutionModalProps) {
  const [asistencia, setAsistencia] = useState<File | null>(null);
  const [fotos, setFotos] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const fileAsistenciaRef = useRef<HTMLInputElement>(null);
  const fileFotosRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExecute = async () => {
    if (!asistencia || !fotos) {
      alert("Error: Debes cargar la asistencia y las fotos para poder ejecutar la actividad.");
      return;
    }

    setUploading(true);
    try {
      // 1. SUBIR ARCHIVOS AL STORAGE (Bucket: 'evidences')
      // Creamos nombres únicos para evitar sobrescribir archivos
      const timestamp = Date.now();
      const asistenciaPath = `asistencias/${activityId}_${timestamp}_${asistencia.name}`;
      const fotosPath = `fotos/${activityId}_${timestamp}_${fotos.name}`;

      // Subir Asistencia
      const { error: storageErrorAsis } = await supabase.storage
        .from('evidences')
        .upload(asistenciaPath, asistencia);

      if (storageErrorAsis) throw new Error(`Error en Storage (Asistencia): ${storageErrorAsis.message}`);

      // Subir Fotos
      const { error: storageErrorFotos } = await supabase.storage
        .from('evidences')
        .upload(fotosPath, fotos);

      if (storageErrorFotos) throw new Error(`Error en Storage (Fotos): ${storageErrorFotos.message}`);

      // 2. ACTUALIZAR TABLA 'work_plan'
      const { error: tableError } = await supabase
        .from('work_plan')
        .update({ 
          status: 'ejecutado', 
          execution_date: new Date().toISOString().split('T')[0],
          // Guardamos las rutas de los archivos para futura referencia
          evidence_asistencia_url: asistenciaPath,
          evidence_fotos_url: fotosPath
        })
        .eq('id', activityId);

      if (tableError) throw tableError;

      alert("¡Actividad ejecutada y evidencias guardadas con éxito!");
      onSuccess(); 
      handleClose(); 
    } catch (error: any) {
      console.error("Error completo:", error);
      alert(`Fallo en el proceso: ${error.message || "Verifica permisos de Storage y nombres de columnas"}`);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setAsistencia(null);
    setFotos(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[7000] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
        <div className="p-8 text-center">
          <div className="flex justify-between items-start mb-6 text-left">
            <div>
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Evidencias de Ejecución</h2>
              <p className="text-slate-500 text-xs mt-1 truncate w-64">{activityTitle}</p>
            </div>
            <button onClick={handleClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-6 flex gap-3 text-left">
            <AlertCircle className="text-amber-500 shrink-0" size={18} />
            <p className="text-[11px] text-amber-700 leading-tight">
              Los archivos son <b>obligatorios</b>. Se subirán al bucket <b>evidences</b> y el estado cambiará a ejecutado.
            </p>
          </div>

          <div className="space-y-3">
            {/* Input Asistencia */}
            <input 
              type="file" 
              ref={fileAsistenciaRef} 
              className="hidden" 
              accept=".pdf,image/*" 
              onChange={(e) => setAsistencia(e.target.files?.[0] || null)} 
            />
            <button 
              type="button"
              onClick={() => fileAsistenciaRef.current?.click()}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                asistencia ? 'border-emerald-500 bg-emerald-50' : 'border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${asistencia ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 border border-slate-200'}`}>
                <FileCheck size={20} />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Listado de Asistencia</p>
                <p className="text-[10px] text-slate-500 truncate w-40">{asistencia ? asistencia.name : "Subir documento obligatorio"}</p>
              </div>
            </button>

            {/* Input Fotos */}
            <input 
              type="file" 
              ref={fileFotosRef} 
              className="hidden" 
              accept="image/*" 
              onChange={(e) => setFotos(e.target.files?.[0] || null)} 
            />
            <button 
              type="button"
              onClick={() => fileFotosRef.current?.click()}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                fotos ? 'border-emerald-500 bg-emerald-50' : 'border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${fotos ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 border border-slate-200'}`}>
                <Camera size={20} />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Registro Fotográfico</p>
                <p className="text-[10px] text-slate-500 truncate w-40">{fotos ? fotos.name : "Subir fotos obligatorias"}</p>
              </div>
            </button>
          </div>

          <button
            type="button"
            onClick={handleExecute}
            disabled={uploading || !asistencia || !fotos}
            className={`w-full mt-8 py-4 rounded-2xl font-bold uppercase text-[10px] tracking-[0.2em] transition-all shadow-xl ${
              asistencia && fotos 
              ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100' 
              : 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'
            }`}
          >
            {uploading ? "Subiendo evidencias..." : "Confirmar Ejecución ✅"}
          </button>
        </div>
      </div>
    </div>
  );
}