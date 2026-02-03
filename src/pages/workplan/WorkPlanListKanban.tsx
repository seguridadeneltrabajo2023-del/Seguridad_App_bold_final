import { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  CircleDashed, 
  Search, 
  Target, 
  Users, 
  Box 
} from 'lucide-react';

interface Activity {
  id: string;
  title: string;
  description: string;
  objective: string;
  scope: string;
  responsible: string;
  resources: string;
  status: 'planeado' | 'ejecutado' | 'atrasado';
  date: string;
  time: string;
}

const mockActivities: Activity[] = [
  { 
    id: '1', 
    title: 'Inspección de Extintores', 
    description: 'Revisión anual bloque norte',
    objective: 'Garantizar que los equipos de emergencia operen correctamente.',
    scope: 'Pisos 1 al 5 - Sede Principal.',
    responsible: 'Seguridad Física / SST',
    resources: 'Manómetro, bitácora de inspección, precintos.',
    status: 'planeado', 
    date: '2026-02-15', 
    time: '08:00' 
  },
  { 
    id: '2', 
    title: 'Capacitación Alturas', 
    description: 'Reentrenamiento brigada de emergencias',
    objective: 'Certificar al personal en tareas de alto riesgo.',
    scope: 'Personal operativo y brigadistas.',
    responsible: 'Coordinador de Alturas',
    resources: 'Arnés de seguridad, cuerdas, simulador de descenso.',
    status: 'atrasado', 
    date: '2026-01-10', 
    time: '14:00' 
  }
];

export function WorkPlanListKanban() {
  const [searchTerm, setSearchTerm] = useState('');

  // Ordenamos de la fecha más cercana a la más lejana
  const sortedActivities = useMemo(() => {
    return [...mockActivities]
      .filter(a => 
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.responsible.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [searchTerm]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'ejecutado': return { color: 'bg-green-500', text: 'text-green-700', bg: 'bg-green-50', icon: CheckCircle2, label: 'Ejecutado' };
      case 'atrasado': return { color: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50', icon: AlertTriangle, label: 'Atrasado' };
      default: return { color: 'bg-blue-500', text: 'text-blue-700', bg: 'bg-blue-50', icon: CircleDashed, label: 'Planeado' };
    }
  };

  return (
    <div className="w-full bg-white shadow-xl rounded-3xl overflow-hidden border border-slate-100">
      {/* Buscador Superior */}
      <div className="p-6 border-b border-gray-100 bg-slate-50/30">
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por actividad, responsable u objetivo..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 text-sm shadow-sm transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse min-w-[1200px]">
          <thead>
            <tr className="bg-slate-50 text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-slate-200">
              <th className="px-6 py-4 text-center w-20">Semáforo</th>
              <th className="px-4 py-4 text-left">Actividad / Descripción</th>
              <th className="px-4 py-4 text-left"><div className="flex items-center gap-1"><Target size={12}/> Objetivo</div></th>
              <th className="px-4 py-4 text-left">Alcance</th>
              <th className="px-4 py-4 text-left"><div className="flex items-center gap-1"><Users size={12}/> Responsables</div></th>
              <th className="px-4 py-4 text-left"><div className="flex items-center gap-1"><Box size={12}/> Recursos</div></th>
              <th className="px-4 py-4 text-left">Fecha y Hora</th>
              <th className="px-6 py-4 text-center">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedActivities.map((activity) => {
              const config = getStatusConfig(activity.status);
              return (
                <tr key={activity.id} className="hover:bg-blue-50/20 transition-colors group">
                  <td className="px-6 py-5 text-center">
                    <div className={`w-3.5 h-3.5 rounded-full ${config.color} mx-auto shadow-sm ${activity.status === 'atrasado' ? 'animate-pulse' : ''}`} />
                  </td>
                  <td className="px-4 py-5 max-w-[220px]">
                    <div className="font-bold text-slate-800 text-sm leading-tight group-hover:text-blue-600 transition-colors">
                      {activity.title}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 italic line-clamp-1">
                      {activity.description}
                    </div>
                  </td>
                  <td className="px-4 py-5 text-[12px] text-slate-600 leading-snug min-w-[180px]">
                    {activity.objective}
                  </td>
                  <td className="px-4 py-5 text-[12px] text-slate-500 min-w-[150px]">
                    {activity.scope}
                  </td>
                  <td className="px-4 py-5">
                    <span className="text-[10px] font-black bg-slate-100 px-2.5 py-1.5 rounded-lg text-slate-600 uppercase tracking-tighter">
                      {activity.responsible}
                    </span>
                  </td>
                  <td className="px-4 py-5 text-[11px] text-slate-500 italic max-w-[150px] truncate">
                    {activity.resources}
                  </td>
                  <td className="px-4 py-5">
                    <div className="flex flex-col text-[11px] font-bold text-slate-700">
                      <span className="flex items-center gap-1.5"><Calendar size={12} className="text-blue-500"/>{activity.date}</span>
                      <span className="flex items-center gap-1.5 text-slate-400 font-medium"><Clock size={12}/>{activity.time}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-xl border ${config.bg} ${config.text} border-current/20 text-center shadow-sm`}>
                      {config.label}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}