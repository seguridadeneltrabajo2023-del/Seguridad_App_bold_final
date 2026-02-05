import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../SupabaseClient';
import { 
  Edit, Trash2, Eye, Search, Plus, RefreshCw, Clock, 
  CheckCircle2, AlertCircle, X
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

  const handleViewPhoto = (path: string) => {
    const { data } = supabase.storage
      .from('evidences')
      .getPublicUrl(path);

    if (data?.publicUrl) {
      window.open(data.publicUrl, '_blank');
    }
  };

  const filteredData = useMemo(() => {
    return incidents.filter(incident => 
      incident.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.event_type?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [incidents, searchTerm]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center p-20 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
          Sincronizando reportes...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 px-4 md:px-8 pb-10">
      {/* HEADER */}
      <div className="flex justify-between items-center px-2">
        <div className="text-left">
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-none">
            Historial de Reportes
          </h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-[0.2em]">
            Gestión de incidentes y accidentes
          </p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
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
          placeholder="Buscar por descripción, ubicación o tipo..." 
          className="w-full outline-none text-xs font-bold bg-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* TABLA PRINCIPAL - table-fixed es la clave para que no se anche el contenedor */}
      <div className="bg-white shadow-2xl rounded-[3rem] border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="w-28 p-6 text-center text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Fecha</th>
                <th className="w-64 p-6 text-center text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Tipo de Evento</th>
                <th className="p-6 text-left text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Ubicación y Descripción</th>
                <th className="w-40 p-6 text-center text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Estado</th>
                <th className="w-32 p-6 text-center text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Evidencia</th>
                <th className="w-36 p-6 text-center text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-slate-400 italic text-sm">
                    No se encontraron registros.
                  </td>
                </tr>
              ) : (
                filteredData.map((incident) => (
                  <tr key={incident.id} className="hover:bg-slate-50/30 transition-colors">
                    {/* FECHA */}
                    <td className="p-6 text-center">
                      <span className="text-[11px] font-bold text-slate-700 whitespace-nowrap">
                        {new Date(incident.incident_date).toLocaleDateString('es-ES')}
                      </span>
                    </td>

                    {/* TIPO DE EVENTO - Texto completo con ajuste de línea si es necesario */}
                    <td className="p-6 text-center">
                      <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-wider leading-tight inline-block w-full">
                        {incident.event_type || 'ACCIDENTE'}
                      </span>
                    </td>

                    {/* UBICACIÓN Y DESCRIPCIÓN - El contenedor flexible con rotura de palabras */}
                    <td className="p-6 text-left overflow-hidden">
                      <div className="flex flex-col min-w-0">
                        <p className="text-[11px] font-bold text-slate-800 uppercase truncate mb-1">
                          {incident.location || 'Sin ubicación'}
                        </p>
                        {/* line-clamp-2 limita a 2 líneas y break-all rompe textos largos sin espacios */}
                        <p className="text-[10px] text-slate-500 italic line-clamp-2 break-all leading-relaxed">
                          {incident.description}
                        </p>
                      </div>
                    </td>

                    {/* ESTADO */}
                    <td className="p-6 text-center">
                      <StatusBadge status={incident.status} />
                    </td>

                    {/* EVIDENCIA */}
                    <td className="p-6 text-center">
                      {incident.image_path ? (
                        <button 
                          onClick={() => handleViewPhoto(incident.image_path!)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-black bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 transition-all shadow-sm"
                        >
                          <Eye size={12} /> VER FOTO
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-300 italic">Sin archivos</span>
                      )}
                    </td>

                    {/* ACCIONES */}
                    <td className="p-6 text-center">
                      <div className="flex justify-center gap-1">
                        <button className="p-2 text-orange-500 hover:bg-orange-50 rounded-xl transition-all" title="Seguimiento">
                          <RefreshCw size={14} />
                        </button>
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Editar">
                          <Edit size={14} />
                        </button>
                        <button className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Eliminar">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DEL FORMULARIO */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="animate-in zoom-in-95 duration-200 w-full max-w-2xl relative">
            <button 
              onClick={() => setIsFormOpen(false)}
              className="absolute -top-3 -right-3 bg-white p-2 rounded-full shadow-xl text-slate-400 hover:text-red-500 hover:scale-110 transition-all z-[110] border border-slate-100"
              title="Cerrar"
            >
              <X size={20} />
            </button>
            <IncidentForm 
              onClose={() => setIsFormOpen(false)} 
              onIncidentCreated={() => {
                setIsFormOpen(false);
                fetchIncidents();
              }} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

// COMPONENTE PARA EL ESTADO
function StatusBadge({ status }: { status: string }) {
  const config: any = {
    'Abierto': { bg: 'bg-red-50', text: 'text-red-500', border: 'border-red-100', label: 'ABIERTO', icon: <AlertCircle size={10} /> },
    'En proceso': { bg: 'bg-blue-50', text: 'text-blue-500', border: 'border-blue-100', label: 'PLANEADO', icon: <Clock size={10} /> },
    'Cerrado': { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', label: 'EJECUTADO', icon: <CheckCircle2 size={10} /> }
  };
  const c = config[status] || config['Abierto'];
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border font-black text-[9px] tracking-widest ${c.bg} ${c.text} ${c.border}`}>
      {c.icon} {c.label}
    </div>
  );
}