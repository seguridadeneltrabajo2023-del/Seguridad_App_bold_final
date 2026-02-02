import { useState } from 'react';
import { 
  AlertCircle, 
  CheckCircle, 
  FileText, 
  ExternalLink, 
  Trash2, 
  Edit3, 
  Eye, 
  X, 
  Loader2,
  Clock,
  Download,
  ShieldCheck
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
  url_curso50?: string; // Mapeado a la nueva columna
  url_curso20?: string; // Mapeado a la nueva columna
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

  const getTrafficLightColor = (dateStr: string | undefined) => {
    if (!dateStr) return { text: 'text-gray-400', bg: 'bg-gray-50', border: 'border-gray-200', icon: <X className="w-3.5 h-3.5" /> };
    const hoy = new Date();
    const vto = new Date(dateStr);
    const diffMonths = (vto.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24 * 30.44);

    if (diffMonths <= 1) return { text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', icon: <AlertCircle className="w-3.5 h-3.5" /> };
    if (diffMonths <= 6) return { text: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', icon: <Clock className="w-3.5 h-3.5" /> };
    return { text: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', icon: <CheckCircle className="w-3.5 h-3.5" /> };
  };

  const cargarDocumento = async (path: string | undefined, titulo: string) => {
    if (!path) return;
    setLoadingDoc(true);
    setPreviewTitle(titulo);
    try {
      const { data, error } = await supabase.storage.from('sst_docs').createSignedUrl(path, 60);
      if (error) throw error;
      setPreviewUrl(`${data.signedUrl}#view=FitH`);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoadingDoc(false);
    }
  };

  const descargarDocumentoActual = () => {
    if (!previewUrl) return;
    const link = document.createElement('a');
    link.href = previewUrl.split('#')[0]; 
    link.download = `${previewTitle}_${selectedRes?.numero_id}.pdf`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative font-sans">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Responsable / ID</th>
              <th className="p-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Estado Selección</th>
              <th className="p-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Vencimiento Licencia</th>
              <th className="p-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Vencimiento Curso 50H</th>
              <th className="p-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-right px-8">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {responsibles.map((res) => {
              const isSelected = String(res.es_activo) === 'true';
              const stLicencia = getTrafficLightColor(res.fecha_ven_licencia);
              const stCurso50 = getTrafficLightColor(res.fecha_ven_50h);

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
                    {isSelected ? (
                      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-green-500 text-white text-[10px] font-black border border-green-600 shadow-sm">
                        <CheckCircle className="w-3 h-3" /> ACTIVO
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded border border-gray-100 opacity-60">Inactivo</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px] font-black border ${stLicencia.bg} ${stLicencia.text} ${stLicencia.border}`}>
                      {stLicencia.icon} {res.fecha_ven_licencia}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px] font-black border ${stCurso50.bg} ${stCurso50.text} ${stCurso50.border}`}>
                      {stCurso50.icon} {res.fecha_ven_50h || '---'}
                    </span>
                  </td>
                  <td className="p-4 text-right px-8">
                    <div className="flex justify-end gap-2 items-center">
                      <button onClick={() => setSelectedRes(res)} className="p-2 text-blue-600 bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => onEdit(res)} className="p-2 text-gray-400 hover:text-blue-500 rounded-xl transition-colors"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => eliminarResponsable(res)} className="p-2 text-gray-400 hover:text-red-500 rounded-xl transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedRes && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-white/20">
            <div className="p-5 border-b flex justify-between items-center bg-white shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-200">
                  {selectedRes.nombres[0]}{selectedRes.apellidos[0]}
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-lg leading-none tracking-tight uppercase">Expediente Digital SST</h3>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest leading-none">ID: {selectedRes.numero_id} | {selectedRes.nombres} {selectedRes.apellidos}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {previewUrl && (
                  <button 
                    onClick={descargarDocumentoActual} 
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase transition-all shadow-lg hover:bg-green-700 active:scale-95"
                  >
                    <Download className="w-4 h-4" /> Descargar Original
                  </button>
                )}
                <button 
                  onClick={() => { setSelectedRes(null); setPreviewUrl(null); setPreviewTitle(""); }} 
                  className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
              <div className="w-72 bg-gray-50 border-r p-5 flex flex-col gap-3 shadow-inner overflow-y-auto">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-2">Documentos Disponibles</p>
                {[
                  { label: 'Cédula', path: selectedRes.url_cedula, icon: <FileText size={16}/> },
                  { label: 'Diploma', path: selectedRes.url_diploma, icon: <FileText size={16}/> },
                  { label: 'Licencia SST', path: selectedRes.url_licencia, icon: <ExternalLink size={16}/> },
                  { label: 'Contrato', path: selectedRes.url_contrato, icon: <FileText size={16}/> },
                  { label: 'Designación', path: selectedRes.url_designacion, icon: <ShieldCheck size={16}/> },
                  { label: 'Curso 50H', path: selectedRes.url_curso50, icon: <CheckCircle size={16}/> },
                  { label: 'Curso 20H', path: selectedRes.url_curso20, icon: <AlertCircle size={16}/> },
                  { label: 'Otros', path: selectedRes.url_otros, icon: <FileText size={16}/> },
                ].map((doc, idx) => {
                  const hasFile = !!doc.path;
                  if (!hasFile) return null;

                  return (
                    <button
                      key={idx}
                      onClick={() => cargarDocumento(doc.path, doc.label)}
                      className={`flex items-center justify-between p-4 rounded-2xl text-xs font-bold transition-all border ${
                        previewTitle === doc.label 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-[1.02]' 
                        : 'bg-white text-gray-700 border-gray-100 hover:border-blue-400 hover:bg-blue-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {doc.icon} <span className="truncate">{doc.label}</span>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${previewTitle === doc.label ? 'bg-white' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]'}`} />
                    </button>
                  );
                })}
              </div>

              <div className="flex-1 bg-slate-200 p-6 relative flex items-center justify-center shadow-inner overflow-hidden">
                {loadingDoc ? (
                  <div className="flex flex-col items-center gap-3 bg-white p-10 rounded-3xl shadow-xl">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Generando vista segura...</p>
                  </div>
                ) : previewUrl ? (
                  <div className="w-full h-full bg-white rounded-xl shadow-xl overflow-hidden border border-gray-300">
                    <iframe 
                      src={previewUrl} 
                      className="w-full h-full border-0" 
                      title="Visor"
                    />
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white/50 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                      <Eye size={32} className="text-gray-300" />
                    </div>
                    <p className="font-bold text-sm text-gray-500 italic uppercase tracking-tighter">Selecciona un archivo del panel izquierdo</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};