import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../SupabaseClient';
import { 
  Edit, Trash2, Eye, Search, Plus, RefreshCw, Clock, 
  CheckCircle2, AlertCircle, X, Calendar, Paperclip, Send, FileText 
} from 'lucide-react';
import { IncidentForm } from './IncidentForm'; 

interface Incident {
  id: string;
  location: string;
  description: string;
  incident_date: string;
  image_path: string | null;
  event_type: string;
  status: 'Abierto' | 'En proceso' | 'Cerrado';
  observations?: string;
}

export const IncidentTable = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
  const [selectedForFollowUp, setSelectedForFollowUp] = useState<Incident | null>(null);

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('incident_reports')
      .select('*')
      .order('incident_date', { ascending: false });

    if (!error) setIncidents(data || []);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este reporte permanentemente?")) {
      const { error } = await supabase
        .from('incident_reports')
        .delete()
        .eq('id', id);

      if (error) {
        alert("Error al eliminar de la base de datos");
      } else {
        setIncidents(prev => prev.filter(inc => inc.id !== id));
      }
    }
  };

  const handleEdit = (incident: Incident) => {
    setEditingIncident(incident);
    setIsFormOpen(true);
  };

  const handleOpenFollowUp = (incident: Incident) => {
    setSelectedForFollowUp(incident);
    setIsFollowUpOpen(true);
  };

  const handleViewPhoto = (path: string) => {
    const { data } = supabase.storage.from('evidences').getPublicUrl(path);
    if (data?.publicUrl) window.open(data.publicUrl, '_blank');
  };

  const filteredData = useMemo(() => {
    return incidents.filter(incident => 
      incident.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.event_type?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [incidents, searchTerm]);

  // NUEVA LÓGICA DE COLORES SOLICITADA
  const getEventTypeStyle = (type: string) => {
    const t = type?.toLowerCase() || '';
    
    // ACCIDENTE DE TRABAJO: Rojo Suave (Como estaba)
    if (t.includes('accidente')) return 'bg-red-50 text-red-500 border-red-100';
    
    // PRESUNTA ENFERMEDAD LABORAL: Gris (Nueva solicitud)
    if (t.includes('enfermedad')) return 'bg-slate-100 text-slate-500 border-slate-200';
    
    // ACTO INSEGURO: Amarillo (Nueva solicitud)
    if (t.includes('acto')) return 'bg-yellow-50 text-yellow-600 border-yellow-200';
    
    // CONDICIÓN INSEGURA: Morado (Como estaba)
    if (t.includes('condición')) return 'bg-purple-50 text-purple-500 border-purple-100';
    
    // INCIDENTE: Naranja Suave
    if (t.includes('incidente')) return 'bg-orange-50 text-orange-500 border-orange-100';
    
    return 'bg-slate-50 text-slate-400 border-slate-100';
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center p-20 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Sincronizando...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 px-4 md:px-8 pb-10">
      {/* HEADER */}
      <div className="flex justify-between items-center px-2">
        <div className="text-left">
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-none">Historial de Reportes</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-[0.2em]">Gestión de incidentes y accidentes</p>
        </div>
        <button 
          onClick={() => { setEditingIncident(null); setIsFormOpen(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-black rounded-2xl text-[11px] uppercase shadow-xl hover:bg-blue-700 transition-all active:scale-95"
        >
          <Plus size={16} /> Nuevo Reporte
        </button>
      </div>

      {/* BUSCADOR */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center px-6 gap-4 mx-2">
        <Search className="text-slate-300" size={18} />
        <input 
          type="text" 
          placeholder="Buscar..." 
          className="w-full outline-none text-xs font-bold bg-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* TABLA */}
      <div className="bg-white shadow-2xl rounded-[3rem] border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="w-32 p-6 text-center text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Fecha</th>
                <th className="w-64 p-6 text-center text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Tipo de Evento</th>
                <th className="p-6 text-left text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Ubicación y Descripción</th>
                <th className="w-40 p-6 text-center text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Estado</th>
                <th className="w-32 p-6 text-center text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Evidencia</th>
                <th className="w-36 p-6 text-center text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.map((incident) => (
                <tr key={incident.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="p-6 text-center">
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl mx-auto w-fit">
                      <Calendar size={14} className="text-slate-400" />
                      <span className="text-[11px] font-bold text-slate-700 whitespace-nowrap">
                        {new Date(incident.incident_date).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  </td>

                  <td className="p-6 text-center">
                    <span className={`px-3 py-1.5 border rounded-full text-[9px] font-black uppercase tracking-wider inline-block w-full text-center ${getEventTypeStyle(incident.event_type)}`}>
                      {incident.event_type || 'ACCIDENTE'}
                    </span>
                  </td>

                  <td className="p-6 text-left overflow-hidden">
                    <div className="flex flex-col min-w-0">
                      <p className="text-[11px] font-bold text-slate-800 uppercase truncate mb-1">{incident.location || 'Sin ubicación'}</p>
                      <p className="text-[10px] text-slate-500 italic line-clamp-2 leading-relaxed">{incident.description}</p>
                    </div>
                  </td>

                  <td className="p-6 text-center">
                    <StatusBadge status={incident.status} />
                  </td>

                  <td className="p-6 text-center">
                    {incident.image_path ? (
                      <button 
                        onClick={() => handleViewPhoto(incident.image_path!)} 
                        className="p-2.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-full hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        title="Ver evidencia"
                      >
                        <Eye size={16} />
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-300 italic">Sin archivos</span>
                    )}
                  </td>

                  <td className="p-6 text-center">
                    <div className="flex justify-center gap-1">
                      <button onClick={() => handleOpenFollowUp(incident)} className="p-2 text-orange-500 hover:bg-orange-50 rounded-xl transition-all" title="Seguimiento"><RefreshCw size={14} /></button>
                      <button onClick={() => handleEdit(incident)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Editar"><Edit size={14} /></button>
                      <button onClick={() => handleDelete(incident.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Eliminar"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALES */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="w-full max-w-2xl relative">
            <IncidentForm 
              key={editingIncident?.id || 'new'}
              onClose={() => { setIsFormOpen(false); setEditingIncident(null); }} 
              incidentToEdit={editingIncident} 
              onIncidentCreated={() => { setIsFormOpen(false); setEditingIncident(null); fetchIncidents(); }} 
            />
          </div>
        </div>
      )}

      {/* MODAL DE SEGUIMIENTO */}
      {isFollowUpOpen && selectedForFollowUp && (
        <FollowUpForm 
          incident={selectedForFollowUp}
          onClose={() => { setIsFollowUpOpen(false); setSelectedForFollowUp(null); }}
          onSaved={() => { setIsFollowUpOpen(false); setSelectedForFollowUp(null); fetchIncidents(); }}
        />
      )}
    </div>
  );
};

// --- COMPONENTE SEGUIMIENTO ---
function FollowUpForm({ incident, onClose, onSaved }: any) {
  const [status, setStatus] = useState(incident.status);
  const [advance, setAdvance] = useState('');
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let image_path = incident.image_path;

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('evidences').upload(fileName, file);
        if (uploadError) throw uploadError;
        image_path = fileName;
      }

      const dateHeader = new Date().toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      const newObservations = `${incident.observations || ''}\n[${dateHeader}]: ${advance}`.trim();

      const { error } = await supabase
        .from('incident_reports')
        .update({ 
          status: status,
          observations: newObservations,
          image_path: image_path
        })
        .eq('id', incident.id);

      if (error) throw error;
      alert("✅ Seguimiento guardado");
      onSaved();
    } catch (err: any) {
      alert("❌ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[110] p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95">
        <div className="p-6 bg-slate-50 border-b flex justify-between items-center text-left">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-blue-600" />
            <h3 className="font-black text-slate-800 uppercase text-sm">Registrar Seguimiento</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-red-50 text-slate-400 rounded-full"><X size={18} /></button>
        </div>
        <form onSubmit={handleSave} className="p-8 space-y-4 text-left">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Nuevo Estado</label>
            <select value={status} onChange={(e: any) => setStatus(e.target.value)} className="w-full p-3 bg-slate-50 border rounded-xl text-xs font-bold outline-none border-blue-100">
              <option value="Abierto">Abierto</option>
              <option value="En proceso">En proceso</option>
              <option value="Cerrado">Ejecutado (Cerrado)</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Explicación del Avance</label>
            <textarea required value={advance} onChange={(e) => setAdvance(e.target.value)} placeholder="¿Qué se ha hecho hasta ahora?" className="w-full p-4 bg-slate-50 border rounded-2xl text-xs font-bold outline-none h-32 focus:border-blue-300 transition-all" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-blue-600 uppercase ml-2">Actualizar Evidencia (PNG, JPG, PDF)</label>
            <div className="relative group">
              <input type="file" accept=".png,.jpg,.jpeg,.pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
              <div className={`w-full p-3 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase transition-all ${file ? 'bg-emerald-50 border-emerald-400 text-emerald-600' : 'bg-blue-50 border-blue-200 text-blue-600'}`}>
                <Paperclip size={14} /> {file ? file.name : 'Subir nuevo archivo'}
              </div>
            </div>
          </div>
          <button disabled={loading} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase shadow-lg hover:bg-blue-700 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50">
            {loading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <><Send size={16} /> Registrar Avance</>}
          </button>
        </form>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: any = {
    'Abierto': { bg: 'bg-red-50', text: 'text-red-500', border: 'border-red-100', label: 'ABIERTO', icon: <AlertCircle size={10} /> },
    'En proceso': { bg: 'bg-blue-50', text: 'text-blue-500', border: 'border-blue-100', label: 'EN PROCESO', icon: <Clock size={10} /> },
    'Cerrado': { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', label: 'EJECUTADO', icon: <CheckCircle2 size={10} /> }
  };
  const c = config[status] || config['Abierto'];
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border font-black text-[9px] tracking-widest ${c.bg} ${c.text} ${c.border}`}>
      {c.icon} {c.label}
    </div>
  );
}