import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../SupabaseClient';
import { 
  Edit, Trash2, Eye, Search, Plus, RefreshCw, Clock, 
  CheckCircle2, AlertCircle, X, Calendar, Paperclip, Send, FileText,
  FileIcon, ChevronRight, ExternalLink, User
} from 'lucide-react';
import { IncidentForm } from './IncidentForm'; 

interface Incident {
  id: string;
  location: string;
  description: string;
  incident_date: string;
  image_path: string | string[] | null; 
  event_type: string;
  status: 'Abierto' | 'En proceso' | 'Cerrado';
  observations?: string;
}

export const IncidentTable = ({ onDataUpdate }: { onDataUpdate?: () => void }) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false); 
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
  const [selectedForFollowUp, setSelectedForFollowUp] = useState<Incident | null>(null);
  const [selectedForGallery, setSelectedForGallery] = useState<Incident | null>(null);

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('incident_reports')
      .select('*')
      .order('incident_date', { ascending: false });

    if (!error) {
      setIncidents(data || []);
      if (onDataUpdate) onDataUpdate();
    }
    setLoading(false);
  };

  const extractTrackingInfo = (obs: string | undefined) => {
    if (!obs) return { resp: '---', limit: '---' };
    const respMatch = obs.match(/\[ASIGNACIÓN\]: Responsable: (.*?)(?= \| |$)/g);
    const limitMatch = obs.match(/Fecha Límite: (.*?)(?=\s|$)/g);
    const lastResp = respMatch ? respMatch[respMatch.length - 1].replace('[ASIGNACIÓN]: Responsable: ', '') : '---';
    const lastLimit = limitMatch ? limitMatch[limitMatch.length - 1].replace('Fecha Límite: ', '') : '---';
    return { resp: lastResp, limit: lastLimit };
  };

  // --- 3. MODIFICACIÓN: EL BORRADO OPTIMISTA ---
  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Estás seguro de eliminar este reporte?")) return;

    // ELIMINACIÓN OPTIMISTA: Quitamos el registro del estado local ANTES de la DB
    const backupIncidents = [...incidents];
    setIncidents(prev => prev.filter(incident => incident.id !== id));

    const { error } = await supabase.from('incident_reports').delete().eq('id', id);

    if (error) {
      // Si hay error en la base de datos, restauramos la lista original
      setIncidents(backupIncidents);
      alert("Error al eliminar en el servidor. El registro ha sido restaurado.");
    } else if (onDataUpdate) {
      // Si todo salió bien, notificamos al dashboard para actualizar gráficas
      onDataUpdate();
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingIncident(null);
  };

  const filteredData = useMemo(() => {
    return incidents.filter(incident => 
      incident.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.event_type?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [incidents, searchTerm]);

  const getEventTypeStyle = (type: string) => {
    const t = type?.toLowerCase() || '';
    if (t.includes('accidente')) return 'bg-red-50 text-red-500 border-red-100';
    if (t.includes('enfermedad')) return 'bg-slate-100 text-slate-500 border-slate-200';
    if (t.includes('acto')) return 'bg-yellow-50 text-yellow-600 border-yellow-200';
    if (t.includes('condición')) return 'bg-purple-50 text-purple-500 border-purple-100';
    if (t.includes('incidente')) return 'bg-orange-50 text-orange-500 border-orange-100';
    return 'bg-slate-50 text-slate-400 border-slate-100';
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center p-20 space-y-4 font-sans text-left">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center font-sans">Sincronizando expediente...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 px-4 md:px-8 pb-10 font-sans text-left">
      <div className="flex justify-between items-center px-2">
        <div className="text-left">
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-none font-sans">Historial de Reportes</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-[0.2em] font-sans">Gestión de incidentes y accidentes</p>
        </div>
        <button 
          onClick={() => { setEditingIncident(null); setIsFormOpen(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-black rounded-2xl text-[11px] uppercase shadow-xl hover:bg-blue-700 transition-all active:scale-95 font-sans"
        >
          <Plus size={16} /> Nuevo Reporte
        </button>
      </div>

      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center px-6 gap-4 mx-2">
        <Search className="text-slate-300" size={18} />
        <input type="text" placeholder="Buscar..." className="w-full outline-none text-xs font-bold bg-transparent font-sans" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <div className="bg-white shadow-2xl rounded-[3rem] border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="w-32 p-6 text-center text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] font-sans">Fecha</th>
                <th className="w-48 p-6 text-center text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] font-sans">Tipo</th>
                <th className="p-6 text-center text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] font-sans">Descripción</th>
                <th className="w-40 p-6 text-center text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] font-sans">Responsable</th>
                <th className="w-32 p-6 text-center text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] font-sans">F. Límite</th>
                <th className="w-32 p-6 text-center text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] font-sans">Estado</th>
                <th className="w-24 p-6 text-center text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] font-sans">Evid.</th>
                <th className="w-36 p-6 text-center text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] font-sans">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.map((incident) => {
                const tracking = extractTrackingInfo(incident.observations);
                return (
                  <tr key={incident.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="p-6 text-center">
                      <div className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl mx-auto w-fit">
                        <Calendar size={14} className="text-slate-400" />
                        <span className="text-[11px] font-bold text-slate-700 whitespace-nowrap font-sans">
                          {new Date(incident.incident_date).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <span className={`px-3 py-1.5 border rounded-full text-[9px] font-black uppercase inline-block w-full text-center font-sans ${getEventTypeStyle(incident.event_type)}`}>
                        {incident.event_type || 'ACCIDENTE'}
                      </span>
                    </td>
                    <td className="p-6 text-left overflow-hidden">
                      <div className="flex flex-col min-w-0">
                        <p className="text-[11px] font-bold text-slate-800 uppercase truncate mb-1 text-left font-sans">{incident.location || 'Sin ubicación'}</p>
                        <p className="text-[10px] text-slate-500 italic line-clamp-1 leading-relaxed text-left font-sans">{incident.description}</p>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-50 py-1 px-2 rounded-lg border border-slate-100 truncate font-sans">
                        <User size={12} className="text-blue-500 shrink-0"/>
                        <span className="truncate uppercase font-sans">{tracking.resp}</span>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <span className="text-[10px] font-black text-orange-600 font-sans">
                        {tracking.limit}
                      </span>
                    </td>
                    <td className="p-6 text-center"><StatusBadge status={incident.status} /></td>
                    <td className="p-6 text-center">
                      {incident.image_path ? (
                        <button onClick={() => { setSelectedForGallery(incident); setIsGalleryOpen(true); }} className="p-2.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-full hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-90 font-sans">
                          <Eye size={16} />
                        </button>
                      ) : <span className="text-[10px] text-slate-300 italic font-sans">No</span>}
                    </td>
                    <td className="p-6 text-center">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => { setSelectedForFollowUp(incident); setIsFollowUpOpen(true); }} className="p-2 text-orange-500 hover:bg-orange-50 rounded-xl transition-all" title="Seguimiento"><RefreshCw size={14} /></button>
                        <button onClick={() => { setEditingIncident(incident); setIsFormOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Editar"><Edit size={14} /></button>
                        <button onClick={() => handleDelete(incident.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Eliminar"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 text-left font-sans">
          <div className="w-full max-w-2xl relative">
            <IncidentForm 
              key={editingIncident?.id || 'new'}
              onClose={handleCloseForm} 
              incidentToEdit={editingIncident} 
              onIncidentCreated={async () => { 
                handleCloseForm(); 
                await fetchIncidents(); 
              }} 
            />
          </div>
        </div>
      )}

      {isFollowUpOpen && selectedForFollowUp && (
        <FollowUpForm 
          incident={selectedForFollowUp} 
          onClose={() => { 
            setIsFollowUpOpen(false); 
            setSelectedForFollowUp(null); 
          }} 
          onSaved={async () => {
            setIsFollowUpOpen(false);
            setSelectedForFollowUp(null);
            await fetchIncidents();
          }} 
        />
      )}

      {isGalleryOpen && selectedForGallery && (
        <EvidenceGallery incident={selectedForGallery} onClose={() => { setIsGalleryOpen(false); setSelectedForGallery(null); }} />
      )}
    </div>
  );
};

function EvidenceGallery({ incident, onClose }: { incident: Incident, onClose: () => void }) {
  const filesArray = useMemo(() => {
    if (!incident.image_path) return [];
    if (Array.isArray(incident.image_path)) return incident.image_path;
    try {
      const parsed = JSON.parse(incident.image_path);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) { return [incident.image_path]; }
    return [incident.image_path];
  }, [incident.image_path]);

  const [selectedFile, setSelectedFile] = useState<string>(filesArray[0] || '');
  const [publicUrl, setPublicUrl] = useState<string | null>(null);

  useEffect(() => {
    if (selectedFile) {
      const { data } = supabase.storage.from('evidences').getPublicUrl(selectedFile);
      setPublicUrl(data?.publicUrl || null);
    }
  }, [selectedFile]);

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center z-[200] p-4 md:p-10 text-left font-sans">
      <div className="bg-white w-full h-full max-w-6xl rounded-[3rem] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95">
        <div className="p-6 border-b flex justify-between items-center bg-slate-50 text-left font-sans">
          <div><h3 className="text-sm font-black text-slate-800 uppercase tracking-tight font-sans">Expediente de Evidencias</h3><p className="text-[10px] text-slate-400 font-bold uppercase font-sans">{incident.event_type} - {incident.location}</p></div>
          <button onClick={onClose} className="p-3 bg-white border shadow-sm hover:bg-red-50 text-slate-400 rounded-2xl transition-all font-sans"><X size={20} /></button>
        </div>
        <div className="flex flex-1 overflow-hidden font-sans">
          <div className="w-72 bg-slate-50 border-r flex flex-col text-left">
            <div className="p-4 border-b bg-white font-black text-[10px] text-slate-400 uppercase tracking-widest font-sans">Archivos ({filesArray.length})</div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filesArray.map((path, index) => (
                <button key={index} onClick={() => setSelectedFile(path)} className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left font-sans ${selectedFile === path ? 'bg-blue-600 text-white shadow-lg' : 'bg-white hover:bg-slate-100 text-slate-600'}`}>
                  <FileIcon size={14} /><div className="flex-1 min-w-0 font-sans"><p className="text-[10px] font-black truncate uppercase text-left font-sans">Evidencia {index + 1}</p><p className="text-[9px] opacity-60 truncate text-left font-sans">{path.split('.').pop()?.toUpperCase()}</p></div><ChevronRight size={14} className={selectedFile === path ? 'opacity-100' : 'opacity-20'} />
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 bg-slate-200/30 relative flex flex-col items-center justify-center p-8 font-sans">
            {publicUrl ? (
              <>
                <div className="absolute top-4 right-4 z-10 font-sans text-left"><a href={publicUrl} target="_blank" rel="noreferrer" className="p-3 bg-white/90 backdrop-blur rounded-xl shadow-xl hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2 font-black text-[10px] uppercase font-sans"><ExternalLink size={16} /> Original</a></div>
                {selectedFile.toLowerCase().endsWith('.pdf') ? <iframe src={publicUrl} className="w-full h-full rounded-2xl shadow-2xl bg-white font-sans" title="PDF" /> : <img src={publicUrl} className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border-4 border-white font-sans" alt="Evidencia" />}
              </>
            ) : <div className="text-slate-400 italic text-sm font-sans text-left">Selecciona un archivo</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function FollowUpForm({ incident, onClose, onSaved }: any) {
  const [status, setStatus] = useState(incident.status);
  const [advance, setAdvance] = useState('');
  const [responsible, setResponsible] = useState(''); 
  const [deadline, setDeadline] = useState('');       
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let currentPaths = Array.isArray(incident.image_path) ? [...incident.image_path] : incident.image_path ? [incident.image_path] : [];
      if (file) {
        const fileName = `${Math.random()}.${file.name.split('.').pop()}`;
        const { error: uploadError } = await supabase.storage.from('evidences').upload(fileName, file);
        if (uploadError) throw uploadError;
        currentPaths.push(fileName);
      }
      const dateHeader = new Date().toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      const trackingInfo = status === 'En proceso' ? `\n[ASIGNACIÓN]: Responsable: ${responsible} | Fecha Límite: ${deadline}` : '';
      const newObservations = `${incident.observations || ''}\n[${dateHeader}]: ${advance}${trackingInfo}`.trim();

      const { error } = await supabase.from('incident_reports').update({ status, observations: newObservations, image_path: currentPaths }).eq('id', incident.id);
      if (error) throw error;
      alert("✅ Seguimiento guardado");
      onSaved();
    } catch (err: any) { alert("❌ Error: " + err.message); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[110] p-4 text-left font-sans">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 text-left font-sans">
        <div className="p-6 bg-slate-50 border-b flex justify-between items-center font-sans">
          <div className="flex items-center gap-2"><FileText size={18} className="text-blue-600 font-sans" /><h3 className="font-black text-slate-800 uppercase text-sm font-sans">Registrar Seguimiento</h3></div>
          <button onClick={onClose} className="p-2 hover:bg-red-50 text-slate-400 rounded-full transition-colors font-sans"><X size={18} /></button>
        </div>
        <form onSubmit={handleSave} className="p-8 space-y-4 max-h-[80vh] overflow-y-auto font-sans text-left">
          <div className="space-y-1 font-sans">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest font-sans">Nuevo Estado</label>
            <select value={status} onChange={(e: any) => setStatus(e.target.value)} className="w-full p-3 bg-slate-50 border rounded-xl text-xs font-bold outline-none border-blue-100 font-sans">
              <option value="Abierto">Abierto</option>
              <option value="En proceso">En proceso</option>
              <option value="Cerrado">Ejecutado (Cerrado)</option>
            </select>
          </div>
          {status === 'En proceso' && (
            <div className="space-y-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 animate-in slide-in-from-top-2 font-sans text-left">
              <div className="space-y-1"><label className="text-[9px] font-black text-blue-600 uppercase ml-2 font-sans">Responsable Asignado</label><input required type="text" value={responsible} onChange={(e) => setResponsible(e.target.value)} placeholder="Nombre o Departamento" className="w-full p-3 bg-white border rounded-xl text-xs font-bold font-sans outline-none border-blue-100" /></div>
              <div className="space-y-1"><label className="text-[9px] font-black text-blue-600 uppercase ml-2 font-sans">Fecha Límite de Cierre</label><input required type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-full p-3 bg-white border rounded-xl text-xs font-bold font-sans outline-none border-blue-100" /></div>
            </div>
          )}
          <div className="space-y-1 font-sans"><label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest font-sans">Observaciones</label><textarea required value={advance} onChange={(e) => setAdvance(e.target.value)} placeholder="¿Qué se ha hecho?" className="w-full p-4 bg-slate-50 border rounded-2xl text-xs font-bold outline-none h-32 focus:border-blue-300 transition-all font-sans" /></div>
          <div className="space-y-1 font-sans"><label className="text-[10px] font-black text-blue-600 uppercase ml-2 tracking-widest text-left font-sans">Nueva Evidencia</label><div className="relative group text-left font-sans"><input type="file" accept=".png,.jpg,.jpeg,.pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer z-10 font-sans" /><div className={`w-full p-3 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase transition-all font-sans ${file ? 'bg-emerald-50 border-emerald-400 text-emerald-600' : 'bg-blue-50 border-blue-200 text-blue-600 font-sans'}`}><Paperclip size={14} /> {file ? file.name : 'Subir archivo'}</div></div></div>
          <button disabled={loading} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase shadow-lg hover:bg-blue-700 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 text-center font-sans">{loading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white font-sans"></div> : <><Send size={16} /> Registrar Avance</>}</button>
        </form>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: any = {
    'Abierto': { bg: 'bg-red-50', text: 'text-red-500', border: 'border-red-100', label: 'ABIERTO', icon: <AlertCircle size={10} /> },
    'En proceso': { bg: 'bg-blue-50', text: 'text-blue-500', border: 'border-blue-100', label: 'PROCESO', icon: <Clock size={10} /> },
    'Cerrado': { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', label: 'EJECUTADO', icon: <CheckCircle2 size={10} /> }
  };
  const c = config[status] || config['Abierto'];
  return <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border font-black text-[9px] tracking-widest font-sans ${c.bg} ${c.text} ${c.border}`}>{c.icon} {c.label}</div>;
}