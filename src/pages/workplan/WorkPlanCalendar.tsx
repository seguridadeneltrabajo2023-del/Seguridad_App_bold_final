import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, Users, FileText, Calendar as CalendarIcon, X } from 'lucide-react';
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

  // --- LÓGICA DE FESTIVOS COLOMBIANOS (MANTENIDA) ---
  const getFestivos = (year: number, month: number) => {
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

    const proximoLunes = (fecha: Date) => {
      const res = new Date(fecha);
      const diaSemana = res.getDay();
      if (diaSemana === 0) res.setDate(res.getDate() + 1);
      else if (diaSemana !== 1) res.setDate(res.getDate() + (8 - diaSemana));
      return res;
    };

    const agregarDias = (fecha: Date, dias: number) => {
      const res = new Date(fecha);
      res.setDate(res.getDate() + dias);
      return res;
    };

    const festivosFechas: Date[] = [
      new Date(year, 0, 1),
      proximoLunes(new Date(year, 0, 6)),
      proximoLunes(new Date(year, 2, 19)),
      agregarDias(domingoPascua, -3),
      agregarDias(domingoPascua, -2),
      new Date(year, 4, 1),
      proximoLunes(agregarDias(domingoPascua, 39)),
      proximoLunes(agregarDias(domingoPascua, 60)),
      proximoLunes(agregarDias(domingoPascua, 68)),
      proximoLunes(new Date(year, 5, 29)),
      new Date(year, 6, 20),
      new Date(year, 7, 7),
      proximoLunes(new Date(year, 7, 15)),
      proximoLunes(new Date(year, 9, 12)),
      proximoLunes(new Date(year, 10, 1)),
      proximoLunes(new Date(year, 10, 11)),
      new Date(year, 11, 8),
      new Date(year, 11, 25),
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
      {/* HEADER DEL CALENDARIO */}
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

      {/* CUADRICULA DEL CALENDARIO */}
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

      {/* MODAL DE DETALLE DE TAREA - AJUSTADO */}
      {selectedActivity && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={() => setSelectedActivity(null)}>
          <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl border border-white w-full max-w-[320px] animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            
            {/* Cabecera del Cuadro */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                  <CalendarIcon size={20}/>
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-tighter leading-none">Detalle</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">SST Plan</p>
                </div>
              </div>
              <button onClick={() => setSelectedActivity(null)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* 1. Actividad */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <p className="text-[9px] font-black text-blue-600 uppercase mb-1 tracking-widest">Actividad</p>
                <p className="text-xs font-bold text-slate-700 lowercase leading-tight">
                  {selectedActivity.title}
                </p>
              </div>

              {/* 2. Hora */}
              <div className="flex items-center gap-3 px-1">
                <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                  <Clock size={14} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Hora Programada</p>
                  <p className="text-xs font-bold text-slate-700">{selectedActivity.activity_time}</p>
                </div>
              </div>

              {/* 3. Descripción */}
              <div className="px-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <FileText size={13} className="text-slate-400" />
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Descripción</p>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed italic bg-slate-50/50 p-2.5 rounded-xl border border-dashed border-slate-200 break-words">
                  {selectedActivity.description || 'Sin descripción adicional registrada.'}
                </p>
              </div>

              {/* 4. Responsable */}
              <div className="flex items-center gap-3 px-1 pt-2 border-t border-slate-100">
                <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 shrink-0">
                  <Users size={14} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Responsable</p>
                  <p className="text-xs font-bold text-slate-700 truncate">
                    {selectedActivity.responsible}
                  </p>
                </div>
              </div>
            </div>

            {/* Botón de acción rápida */}
            <button 
              onClick={() => setSelectedActivity(null)} 
              className="mt-6 w-full py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase hover:bg-blue-600 transition-all shadow-lg shadow-slate-200 active:scale-95"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}