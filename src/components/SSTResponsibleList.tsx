import { useState } from 'react';
import { 
  AlertCircle, 
  CheckCircle, 
  FileText, 
  ExternalLink, 
  X, 
  ShieldCheck, 
  Clock,
  Loader2,
  Edit3,
  Trash2,
  Eye,
  Download
} from 'lucide-react';
import { supabase } from '../SupabaseClient';

interface Responsible {
  id: string;
  nombres: string;
  apellidos: string;
  profesion: string;
  numero_id: string; 
  fecha_ven_licencia: string;
  fecha_ven_50h?: string;
  es_activo: boolean | string; 
  url_cedula?: string;
  url_licencia?: string;
  url_diploma?: string;
  url_curso50?: string;
  url_curso20?: string;
  url_contrato?: string;
  url_designacion?: string;
  url_otros?: string;
}

interface ResponsibleListProps {
  responsibles: Responsible[];
  onRefresh: () => void;
  onEdit: (res: Responsible) => void;
}

export const SSTResponsibleList = ({ responsibles, onRefresh, onEdit }: ResponsibleListProps) => {
  const [selectedRes, setSelectedRes] = useState<Responsible | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState("");
  const [loadingDoc, setLoadingDoc] = useState(false);

  const cargarVistaPrevia = async (path: string, titulo: string) => {
    setLoadingDoc(true);
    setPreviewTitle(titulo);
    try {
      const cleanPath = path.split('/').pop() || path;
      const { data } = supabase.storage.from('sst_docs').getPublicUrl(cleanPath);
      
      const finalUrl = cleanPath.toLowerCase().endsWith('.pdf') 
        ? `${data.publicUrl}#toolbar=0&navpanes=0&view=Fit` 
        : data.publicUrl;
        
      setPreviewUrl(finalUrl);
    } catch (err) {
      console.error("Error al cargar vista previa:", err);
    } finally {
      setLoadingDoc(false);
    }
  };

  const descargarArchivoPC = async () => {
    if (!previewUrl) return;
    try {
      const cleanUrl = previewUrl.split('#')[0];
      // Detectamos la extensión real del archivo
      const extension = cleanUrl.split('.').pop()?.toLowerCase() || 'file';
      
      const response = await fetch(cleanUrl);
      const blob = await response.blob();
      
      if (blob.size < 100) throw new Error("Archivo inválido o error de red");

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      // Asignamos el nombre con la extensión correcta (jpg, png o pdf)
      link.download = `${previewTitle.replace(/\s+/g, '_')}_${selectedRes?.apellidos}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error en descarga:", err);
      // Fallback: descarga directa
      const cleanUrl = previewUrl.split('#')[0];
      const link = document.createElement('a');
      link.href = cleanUrl;
      link.download = previewTitle;
      link.click();
    }
  };

  const eliminarResponsable = async (res: Responsible) => {
    if (window.confirm(`¿Estás seguro de eliminar a ${res.nombres}?`)) {
      try {
        const { error } = await supabase.from('sst_responsibles').delete().eq('id', res.id);
        if (error) throw error;
        onRefresh();
      } catch (err: any) {
        alert("Error: " + err.message);
      }
    }
  };

  const getTrafficLightColor = (dateStr: string | undefined) => {
    if (!dateStr) return { text: 'text-gray-400', bg: 'bg-gray-50', border: 'border-gray-200', icon: <X className="w-3.5 h-3.5" /> };
    const hoy = new Date();
    const vto = new Date(dateStr);
    const diffMonths = (vto.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24 * 30.44);

    if (diffMonths <= 1) return { text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', icon: <AlertCircle className="w-3.5 h-3.5" /> };
    if (diffMonths <= 6) return { text: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', icon: <Clock className="w-3.5 h-3.5" /> };
    return { text: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', icon: <CheckCircle className="w-3.5 h-3.5" /> };
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative font-sans text-left">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-left">Responsable / ID</th>
              <th className="p-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Estado</th>
              <th className="p-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Vencimiento Licencia</th>
              <th className="p-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right px-8">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {responsibles.map((res) => {
              const isSelected = String(res.es_activo) === 'true';
              const stLicencia = getTrafficLightColor(res.fecha_ven_licencia);

              return (
                <tr key={res.id} className={`transition-all duration-300 ${isSelected ? 'bg-green-50/40' : 'hover:bg-slate-50/50'}`}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs border uppercase ${isSelected ? 'bg-green-600 text-white border-green-700' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                        {res.nombres[0]}{res.apellidos[0]}
                      </div>
                      <div>
                        <p className={`text-sm font-bold leading-none mb-1 ${isSelected ? 'text-green-900' : 'text-slate-700'}`}>{res.nombres} {res.apellidos}</p>
                        <p className="text-[10px] text-gray-400 font-bold italic">ID: {res.numero_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black ${isSelected ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                      {isSelected ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px] font-black border ${stLicencia.bg} ${stLicencia.text} ${stLicencia.border}`}>
                      {stLicencia.icon} {res.fecha_ven_licencia}
                    </span>
                  </td>
                  <td className="p-4 text-right px-8 space-x-2">
                    <button onClick={() => setSelectedRes(res)} className="p-2 text-blue-600 bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => onEdit(res)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => eliminarResponsable(res)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedRes && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm text-left">
          <div className="bg-white rounded-[2.5rem] w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-white/20">
            <div className="p-6 border-b flex justify-between items-center bg-white shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {selectedRes.nombres[0]}{selectedRes.apellidos[0]}
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-lg uppercase leading-none">Expediente Digital SST</h3>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest italic">{selectedRes.nombres} {selectedRes.apellidos}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {previewUrl && (
                  <button onClick={descargarArchivoPC} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase transition-all shadow-lg hover:bg-emerald-700 active:scale-95">
                    <Download className="w-4 h-4" /> Guardar en PC
                  </button>
                )}
                <button onClick={() => { setSelectedRes(null); setPreviewUrl(null); setPreviewTitle(""); }} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
              <div className="w-80 bg-gray-50 border-r p-6 flex flex-col gap-3 shadow-inner overflow-y-auto text-left">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-2">Documentos</p>
                {[
                  { label: 'Cédula de Ciudadanía', path: selectedRes.url_cedula, icon: <FileText size={18}/> },
                  { label: 'Diploma Profesional', path: selectedRes.url_diploma, icon: <FileText size={18}/> },
                  { label: 'Licencia SST', path: selectedRes.url_licencia, icon: <ExternalLink size={18}/> },
                  { label: 'Contrato Laboral', path: selectedRes.url_contrato, icon: <FileText size={18}/> },
                  { label: 'Designación SST', path: selectedRes.url_designacion, icon: <ShieldCheck size={18}/> },
                  { label: 'Curso 50 Horas', path: selectedRes.url_curso50, icon: <CheckCircle size={18}/> },
                  { label: 'Reentrenamiento 20H', path: selectedRes.url_curso20, icon: <AlertCircle size={18}/> },
                ].map((doc, idx) => {
                  if (!doc.path) return null;
                  const isActive = previewTitle === doc.label;

                  return (
                    <button
                      key={idx}
                      onClick={() => cargarVistaPrevia(doc.path!, doc.label)}
                      className={`flex items-center justify-between p-4 rounded-2xl text-[11px] font-bold transition-all border uppercase tracking-tight text-left ${
                        isActive 
                        ? 'bg-blue-600 text-white border-blue-700 shadow-md scale-[1.02]' 
                        : 'bg-white text-slate-600 border-slate-100 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 italic">
                        {doc.icon} <span className="truncate">{doc.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex-1 bg-slate-200 p-8 flex items-center justify-center relative overflow-hidden">
                <div className="w-full h-full bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-white flex items-center justify-center relative">
                  {loadingDoc && (
                    <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                      <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                      <p className="text-[10px] font-black text-blue-600 uppercase">Procesando...</p>
                    </div>
                  )}
                  {previewUrl ? (
                    previewUrl.toLowerCase().includes('.pdf') ? (
                       <iframe 
                        src={previewUrl} 
                        className="w-full h-full border-none absolute inset-0" 
                        title="Visor"
                       />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-50 overflow-hidden">
                        <img src={previewUrl} alt="Vista previa" className="max-w-full max-h-full object-contain p-2" />
                      </div>
                    )
                  ) : (
                    <div className="text-center p-12">
                      <FileText size={40} className="text-slate-200 mx-auto mb-4" />
                      <p className="font-black text-[11px] text-slate-400 uppercase tracking-widest">Seleccione un archivo</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};