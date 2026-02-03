import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { activityColors } from '../../lib/constants';

export function WorkPlanCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

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

  useEffect(() => {
    fetchActivities();
  }, [currentDate.getMonth(), currentDate.getFullYear()]);

  // --- FUNCIÓN INTELIGENTE DE FESTIVOS (PERPETUA) ---
  const getFestivos = (year: number, month: number) => {
    // 1. Cálculo del Domingo de Pascua (Algoritmo de Butcher-Meuss)
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const n = h + l - 7 * m + 114;
    const mesPascua = Math.floor(n / 31);
    const diaPascua = (n % 31) + 1;
    const domingoPascua = new Date(year, mesPascua - 1, diaPascua);

    // Función auxiliar para mover al siguiente lunes (Ley Emiliani)
    const proximoLunes = (fecha: Date) => {
      const res = new Date(fecha);
      const diaSemana = res.getDay(); // 0 es Domingo, 1 es Lunes
      if (diaSemana === 0) res.setDate(res.getDate() + 1);
      else if (diaSemana !== 1) res.setDate(res.getDate() + (8 - diaSemana));
      return res;
    };

    const agregarDias = (fecha: Date, dias: number) => {
      const res = new Date(fecha);
      res.setDate(res.getDate() + dias);
      return res;
    };

    // 2. Definición de todos los festivos colombianos
    const festivosFechas: Date[] = [
      new Date(year, 0, 1),   // Año Nuevo (No se mueve)
      proximoLunes(new Date(year, 0, 6)),   // Reyes Magos
      proximoLunes(new Date(year, 2, 19)),  // San José
      agregarDias(domingoPascua, -3),       // Jueves Santo
      agregarDias(domingoPascua, -2),       // Viernes Santo
      new Date(year, 4, 1),   // Día del Trabajo (No se mueve)
      proximoLunes(agregarDias(domingoPascua, 39)), // Ascensión del Señor
      proximoLunes(agregarDias(domingoPascua, 60)), // Corpus Christi
      proximoLunes(agregarDias(domingoPascua, 68)), // Sagrado Corazón
      proximoLunes(new Date(year, 5, 29)),  // San Pedro y San Pablo
      new Date(year, 6, 20),  // Independencia (No se mueve)
      new Date(year, 7, 7),   // Batalla de Boyacá (No se mueve)
      proximoLunes(new Date(year, 7, 15)),  // Asunción de la Virgen
      proximoLunes(new Date(year, 9, 12)),  // Día de la Raza
      proximoLunes(new Date(year, 10, 1)),  // Todos los Santos
      proximoLunes(new Date(year, 10, 11)), // Independencia de Cartagena
      new Date(year, 11, 8),  // Inmaculada Concepción (No se mueve)
      new Date(year, 11, 25), // Navidad (No se mueve)
    ];

    return festivosFechas
      .filter(f => f.getMonth() === month && f.getFullYear() === year)
      .map(f => f.getDate().toString());
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
                {Array.from({ length: 30 }, (_, i) => 2024 + i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
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
            
            const actividadesDelDia = activities.filter(act => {
              if (!act.activity_date) return false;
              const fechaAct = new Date(act.activity_date + 'T12:00:00');
              return fechaAct.getDate() === dia && 
                     fechaAct.getMonth() === currentDate.getMonth() && 
                     fechaAct.getFullYear() === currentDate.getFullYear();
            });
            
            return (
              <div key={dia} className={`min-h-[130px] p-3 border-r border-b border-gray-100 transition-all relative ${esFestivo ? 'bg-red-50/40' : 'hover:bg-blue-50/20'}`}>
                <span className={`text-sm font-bold ${esFestivo ? 'text-red-500' : 'text-slate-300'}`}>
                  {dia} {esFestivo && <span className="text-[8px] uppercase block leading-none mt-1">Festivo</span>}
                </span>
                
                {actividadesDelDia.map((act) => {
                  const bgColor = activityColors[act.title as keyof typeof activityColors] || "bg-slate-500";
                  
                  return (
                    <button 
                      key={act.id}
                      onClick={() => setSelectedActivity(act)}
                      className={`mt-2 w-full p-2 ${bgColor} text-white rounded-xl text-[9px] font-black uppercase truncate shadow-lg hover:scale-105 transition-transform text-left`}
                    >
                      {act.title}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

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