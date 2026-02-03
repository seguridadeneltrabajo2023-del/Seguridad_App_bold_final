import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase'; // Asegura que esta ruta sea la correcta en tu proyecto

export function WorkPlanCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1)); 
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  
  // NUEVO: Estado para las actividades de la base de datos
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  // FUNCIÓN PARA CARGAR DATOS DESDE SUPABASE
  const fetchActivities = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('work_plan')
      .select('*');
    
    if (error) {
      console.error('Error cargando actividades:', error);
    } else {
      setActivities(data || []);
    }
    setLoading(false);
  };

  // Cargar datos al montar el componente o cambiar el mes/año
  useEffect(() => {
    fetchActivities();
  }, [currentDate]);

  const getFestivos = (year: number, month: number) => {
    const festivos: Record<string, string[]> = {
      "2026-0": ["1", "6"], "2026-2": ["23"], "2026-3": ["2", "3"],
      "2026-4": ["1", "25"], "2026-5": ["15"], "2026-6": ["20"],
      "2026-7": ["7", "17"], "2026-9": ["12"], "2026-10": ["2", "16"],
      "2026-11": ["8", "25"],
    };
    return festivos[`${year}-${month}`] || [];
  };

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayIndex = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayIndex }, (_, i) => i);
  
  const festivosMesActual = getFestivos(currentDate.getFullYear(), currentDate.getMonth());

  return (
    <div className="w-full flex flex-col relative bg-white">
      {/* 1. CABECERA CON SELECTORES */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="flex flex-col" translate="no"> 
            <div className="flex items-center gap-2">
              <select 
                value={currentDate.getMonth()} 
                onChange={(e) => setCurrentDate(new Date(currentDate.getFullYear(), parseInt(e.target.value), 1))}
                className="text-2xl font-title font-black text-slate-800 uppercase tracking-tighter bg-transparent outline-none cursor-pointer appearance-none"
              >
                {meses.map((mes, i) => <option key={mes} value={i}>{mes}</option>)}
              </select>
              <select 
                value={currentDate.getFullYear()} 
                onChange={(e) => setCurrentDate(new Date(parseInt(e.target.value), currentDate.getMonth(), 1))}
                className="text-2xl font-title font-black text-blue-600 uppercase tracking-tighter bg-transparent outline-none cursor-pointer appearance-none"
              >
                {[2024, 2025, 2026, 2027].map(year => <option key={year} value={year}>{year}</option>)}
              </select>
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {loading ? 'Cargando datos...' : 'Plan de Trabajo • Colombia'}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl ml-4">
            <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white rounded-xl transition-all shadow-sm"><ChevronLeft size={20}/></button>
            <button onClick={() => setCurrentDate(new Date())} className="px-4 py-1.5 text-[10px] font-black uppercase bg-white shadow-sm rounded-lg">Hoy</button>
            <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white rounded-xl transition-all shadow-sm"><ChevronRight size={20}/></button>
          </div>
        </div>
      </div>

      {/* 2. GRID DEL CALENDARIO */}
      <div className="w-full overflow-hidden">
        <div className="grid grid-cols-7 w-full bg-slate-50/50 border-b border-gray-100" translate="no">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(dia => (
            <div key={dia} className="py-4 text-center border-r border-gray-100 last:border-r-0">
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{dia}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 w-full">
          {emptyDays.map(ed => <div key={`empty-${ed}`} className="min-h-[130px] bg-slate-50/20 border-r border-b border-gray-100" />)}
          
          {days.map(dia => {
            const esFestivo = festivosMesActual.includes(dia.toString());
            
            // LÓGICA DINÁMICA: Filtramos actividades de la DB que coincidan con este día, mes y año
            const actividadesDelDia = activities.filter(act => {
              const fechaAct = new Date(act.activity_date + 'T00:00:00');
              return fechaAct.getDate() === dia && 
                     fechaAct.getMonth() === currentDate.getMonth() && 
                     fechaAct.getFullYear() === currentDate.getFullYear();
            });
            
            return (
              <div key={dia} className={`min-h-[130px] p-3 border-r border-b border-gray-100 transition-all relative ${esFestivo ? 'bg-red-50/40' : 'hover:bg-blue-50/20'}`}>
                <span className={`text-sm font-bold ${esFestivo ? 'text-red-500' : 'text-slate-300'}`}>
                  {dia} {esFestivo && <span className="text-[8px] uppercase block leading-none mt-1">Festivo</span>}
                </span>
                
                {actividadesDelDia.map((act) => (
                  <button 
                    key={act.id}
                    onClick={() => setSelectedActivity(act)}
                    className="mt-2 w-full p-2 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase truncate shadow-lg hover:scale-105 transition-transform text-left"
                  >
                    {act.title}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. MODAL DE DETALLE DINÁMICO */}
      {selectedActivity && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedActivity(null)}>
          <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-white w-96 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                <CalendarIcon size={24}/>
              </div>
              <h3 className="font-title font-black text-slate-800 uppercase leading-none">Detalle de Tarea</h3>
            </div>
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl">
                <p className="text-[10px] font-black text-blue-600 uppercase mb-1">Actividad</p>
                <p className="text-sm font-bold text-slate-700">{selectedActivity.title}</p>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <Clock size={16} className="text-blue-500" />
                <p className="text-xs font-black uppercase">Hora: {selectedActivity.activity_time}</p>
              </div>
              <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-4">
                <p><span className="font-black">OBJETIVO:</span> {selectedActivity.objective}</p>
                <p className="mt-2"><span className="font-black">RESPONSABLE:</span> {selectedActivity.responsible}</p>
              </div>
            </div>
            <button onClick={() => setSelectedActivity(null)} className="mt-8 w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase hover:bg-blue-600 transition-colors">
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}