import { useState, useMemo, useEffect } from 'react';
import { 
  Calendar, Clock, AlertTriangle, CheckCircle2, 
  CircleDashed, Search, Target, Users, Edit3, Trash2, Flag, FileText, Box, Check, Camera 
} from 'lucide-react'; 
import { supabase } from '../../lib/supabase'; 
import { ExecutionModal } from '../../components/workplan/ExecutionModal'; 

// ACTUALIZACIÓN DE INTERFAZ: Ahora acepta filterStatus
interface WorkPlanListProps {
  onEdit: (activity: any) => void;
  onOpenEvidence: (path: string, title: string) => void; 
  filterStatus?: string; // <-- NUEVA PROP
}

export function WorkPlanListKanban({ onEdit = () => {}, onOpenEvidence, filterStatus = 'todos' }: WorkPlanListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [executionModal, setExecutionModal] = useState<{ isOpen: boolean; id: string; title: string }>({
    isOpen: false,
    id: '',
    title: ''
  });

  const fetchActivities = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('work_plan')
      .select('*')
      .order('activity_date', { ascending: true });

    if (error) {
      console.error('Error al cargar lista:', error);
    } else {
      setActivities(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta actividad?')) return;
    try {
      const { error } = await supabase.from('work_plan').delete().eq('id', id);
      if (error) throw error;
      setActivities(activities.filter(act => act.id !== id));
    } catch (error: any) {
      alert('Error al eliminar: ' + error.message);
    }
  };

  const getTrafficLightColor = (dateString: string, status: string) => {
    if (status === 'ejecutado') return 'bg-emerald-500'; 
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activityDate = new Date(dateString);
    activityDate.setHours(0, 0, 0, 0);
    const diffTime = activityDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 3) return 'bg-red-500 animate-pulse';
    if (diffDays >= 4 && diffDays <= 8) return 'bg-yellow-400';
    return 'bg-green-500';
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'ejecutado': 
        return { text: 'text-emerald-700', bg: 'bg-emerald-50', icon: CheckCircle2, label: 'Ejecutado' };
      case 'atrasado': 
        return { text: 'text-red-700', bg: 'bg-red-50', icon: AlertTriangle, label: 'Atrasado' };
      default: 
        return { text: 'text-blue-700', bg: 'bg-blue-50', icon: CircleDashed, label: 'Planeado' };
    }
  };

  // LÓGICA DE FILTRADO COMBINADA (Búsqueda + Clic en Estadísticas)
  const filteredActivities = useMemo(() => {
    return activities.filter(a => {
      const matchesSearch = 
        a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.responsible?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = 
        filterStatus === 'todos' || 
        (a.status || "").toLowerCase() === filterStatus.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, activities, filterStatus]); // <-- Agregado filterStatus a dependencias

  return (
    <div className="w-full bg-white shadow-xl rounded-[3rem] overflow-hidden border border-slate-100">
      <div className="p-6 border-b border-gray-100 bg-slate-50/30 flex justify-between items-center">
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar actividad..."
            className="w-full pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 text-sm font-bold outline-none"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* INDICADOR DE FILTRO (Opcional, ayuda a saber qué se está filtrando) */}
        {filterStatus !== 'todos' && (
          <span className="text-[10px] font-black uppercase px-4 py-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
            Filtrando por: {filterStatus}
          </span>
        )}
      </div>

      <div className="w-full overflow-hidden text-left">
        <table className="w-full table-fixed border-collapse">
          <thead>
            <tr className="bg-slate-50 text-[9px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-200">
              <th className="w-[4%] px-2 py-4"></th>
              <th className="w-[14%] px-4 py-4 text-left">Actividad</th>
              <th className="w-[12%] px-4 py-4 text-left">Objetivo</th>
              <th className="w-[8%] px-4 py-4 text-left">Meta</th>
              <th className="w-[12%] px-4 py-4 text-left">Descripción</th>
              <th className="w-[10%] px-4 py-4 text-left">Responsable</th>
              <th className="w-[10%] px-4 py-4 text-left">Recursos</th>
              <th className="w-[10%] px-4 py-4 text-left">Fecha</th>
              <th className="w-[10%] px-4 py-4 text-center">Estado</th>
              <th className="w-[10%] px-4 py-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={10} className="px-6 py-12 text-center text-slate-400 text-[10px]">Cargando...</td></tr>
            ) : filteredActivities.length === 0 ? (
              <tr><td colSpan={10} className="px-6 py-12 text-center text-slate-400 text-[10px] italic uppercase font-bold">No se encontraron actividades en este estado</td></tr>
            ) : filteredActivities.map((activity) => {
              const config = getStatusConfig(activity.status);
              const lightColor = getTrafficLightColor(activity.activity_date, activity.status);
              const StatusIcon = config.icon;

              return (
                <tr key={activity.id} className="hover:bg-blue-50/10 transition-colors group">
                  <td className="px-2 py-4 text-center">
                    <div className={`w-2 h-2 rounded-full ${lightColor} mx-auto shadow-sm`} />
                  </td>

                  <td className="px-4 py-4 text-xs font-medium text-slate-700 lowercase truncate" title={activity.title}>
                    {activity.title}
                  </td>

                  <td className="px-4 py-4"><div className="flex items-center gap-1.5 overflow-hidden"><Target size={11} className="text-blue-500 shrink-0" /><p className="text-[10px] text-slate-500 truncate">{activity.objective || '---'}</p></div></td>
                  <td className="px-4 py-4"><div className="flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 w-fit overflow-hidden"><Flag size={10} className="text-emerald-600 shrink-0" /><span className="text-[9px] font-bold text-emerald-700 truncate max-w-[50px]">{activity.meta || '0%'}</span></div></td>
                  <td className="px-4 py-4"><div className="flex items-center gap-1.5 text-slate-400 overflow-hidden"><FileText size={11} className="shrink-0" /><p className="text-[10px] truncate">{activity.description || 'n/a'}</p></div></td>
                  <td className="px-4 py-4"><div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 uppercase"><Users size={11} className="shrink-0" /><span className="truncate">{activity.responsible}</span></div></td>
                  <td className="px-4 py-4"><div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase"><Box size={11} className="shrink-0" /><span className="truncate">{activity.resources || '---'}</span></div></td>

                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-0.5 text-[9px] font-black text-slate-700">
                      <div className="flex items-center gap-1"><Calendar size={10} className="text-blue-500" />{activity.activity_date}</div>
                      <div className="flex items-center gap-1 text-slate-400 font-bold"><Clock size={10} />{activity.activity_time}</div>
                    </div>
                  </td>

                  <td className="px-4 py-4 text-center">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border ${
                      activity.status === 'ejecutado' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-blue-50 text-blue-700 border-blue-200' 
                    }`}>
                      <StatusIcon size={10} />
                      <span className="text-[8px] font-black uppercase tracking-wider">
                        {activity.status === 'ejecutado' ? 'Ejecutado' : 'Planeado'}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 transition-all">
                      {activity.status === 'ejecutado' ? (
                        <>
                          <div className="p-1.5 bg-emerald-500 text-white rounded-md shadow-sm">
                            <Check size={12} strokeWidth={4} />
                          </div>

                          <button 
                            onClick={() => onOpenEvidence(activity.evidence_asistencia_url, 'Listado de Asistencia')}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all border border-transparent hover:border-blue-100"
                            title="Ver Asistencia"
                          >
                            <FileText size={13} />
                          </button>

                          <button 
                            onClick={() => onOpenEvidence(activity.evidence_fotos_url, 'Registro Fotográfico')}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-all border border-transparent hover:border-emerald-100"
                            title="Ver Fotos"
                          >
                            <Camera size={13} />
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => setExecutionModal({ isOpen: true, id: activity.id, title: activity.title })}
                          className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-md transition-all border border-transparent hover:border-emerald-100"
                          title="Marcar ejecución"
                        >
                          <CheckCircle2 size={16} />
                        </button>
                      )}

                      <button onClick={() => onEdit(activity)} className="p-1.5 text-blue-600 hover:bg-slate-100 rounded-md transition-all">
                        <Edit3 size={13} />
                      </button>
                      <button onClick={() => handleDelete(activity.id)} className="p-1.5 text-red-500 hover:bg-slate-100 rounded-md transition-all">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ExecutionModal
        isOpen={executionModal.isOpen}
        activityId={executionModal.id}
        activityTitle={executionModal.title}
        onClose={() => setExecutionModal({ ...executionModal, isOpen: false })}
        onSuccess={fetchActivities} 
      />
    </div>
  );
}