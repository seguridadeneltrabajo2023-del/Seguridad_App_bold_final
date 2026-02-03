import { useState, useMemo, useEffect } from 'react';
import { 
  Calendar, Clock, AlertTriangle, CheckCircle2, 
  CircleDashed, Search, Target, Users, Edit3, Trash2 
} from 'lucide-react'; 
import { supabase } from '../../lib/supabase'; 
import { activityColors } from '../../lib/constants';

interface WorkPlanListProps {
  onEdit: (activity: any) => void;
}

// 1. Añadimos un valor por defecto (falsa función) para evitar el error "not a function"
export function WorkPlanListKanban({ onEdit = () => {} }: WorkPlanListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      const { error } = await supabase
        .from('work_plan')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setActivities(activities.filter(act => act.id !== id));
    } catch (error: any) {
      alert('Error al eliminar: ' + error.message);
    }
  };

  const filteredActivities = useMemo(() => {
    return activities.filter(a => 
      a.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.responsible?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, activities]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'ejecutado': return { color: 'bg-green-500', text: 'text-green-700', bg: 'bg-green-50', icon: CheckCircle2, label: 'Ejecutado' };
      case 'atrasado': return { color: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50', icon: AlertTriangle, label: 'Atrasado' };
      default: return { color: 'bg-blue-500', text: 'text-blue-700', bg: 'bg-blue-50', icon: CircleDashed, label: 'Planeado' };
    }
  };

  return (
    <div className="w-full bg-white shadow-xl rounded-3xl overflow-hidden border border-slate-100">
      <div className="p-6 border-b border-gray-100 bg-slate-50/30">
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar actividad o responsable..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 text-sm outline-none shadow-sm transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse min-w-[1300px]">
          <thead>
            <tr className="bg-slate-50 text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-slate-200">
              <th className="px-6 py-4 text-center w-20">Semáforo</th>
              <th className="px-4 py-4 text-left">Actividad</th>
              <th className="px-4 py-4 text-left">
                <div className="flex items-center gap-1"><Target size={12}/> Objetivo</div>
              </th>
              <th className="px-4 py-4 text-left">
                <div className="flex items-center gap-1"><Users size={12}/> Responsables</div>
              </th>
              <th className="px-4 py-4 text-left">
                <div className="flex items-center gap-1"><Clock size={12}/> Fecha y Hora</div>
              </th>
              <th className="px-6 py-4 text-center">Estado</th>
              <th className="px-6 py-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={7} className="px-6 py-10 text-center animate-pulse text-slate-400 font-bold">Cargando actividades...</td></tr>
            ) : filteredActivities.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-10 text-center text-slate-400 uppercase text-xs font-black">No se encontraron resultados</td></tr>
            ) : (
              filteredActivities.map((activity) => {
                const config = getStatusConfig(activity.status);
                const dotColor = activityColors[activity.title as keyof typeof activityColors] || "bg-slate-400";

                return (
                  <tr key={activity.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-6 py-5 text-center">
                      <div className={`w-3.5 h-3.5 rounded-full ${config.color} mx-auto shadow-sm`} />
                    </td>
                    <td className="px-4 py-5 font-bold text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotColor}`} />
                        <span className="text-slate-800">{activity.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-5 text-[12px] text-slate-600 leading-snug">{activity.objective}</td>
                    <td className="px-4 py-5">
                       <span className="text-[10px] font-black bg-slate-100 px-2.5 py-1.5 rounded-lg text-slate-600 uppercase tracking-tighter">
                        {activity.responsible}
                      </span>
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex flex-col text-[11px] font-bold text-slate-700">
                        <span className="flex items-center gap-1.5"><Calendar size={12} className="text-blue-500"/>{activity.activity_date}</span>
                        <span className="flex items-center gap-1.5 text-slate-400 font-medium"><Clock size={12}/>{activity.activity_time}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-xl border ${config.bg} ${config.text} border-current/20 shadow-sm`}>
                        {config.label}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        
                        {/* 2. BOTÓN EDITAR BLINDADO */}
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log("Enviando a editar:", activity);
                            if (onEdit) {
                              onEdit(activity);
                            }
                          }}
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors cursor-pointer"
                          title="Editar actividad"
                        >
                          <Edit3 size={16} />
                        </button>
                        
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(activity.id);
                          }}
                          className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar actividad"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}