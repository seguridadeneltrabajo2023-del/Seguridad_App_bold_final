import { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon } from 'lucide-react';

export function WorkPlanCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1)); 
  const [selectedActivity, setSelectedActivity] = useState<any>(null);

  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  // --- LISTA DE FESTIVOS COLOMBIA 2026 ---
  const getFestivos = (year: number, month: number) => {
    const festivos: Record<string, string[]> = {
      "2026-0": ["1", "6"],           // Enero: Año Nuevo, Reyes
      "2026-2": ["23"],               // Marzo: San José
      "2026-3": ["2", "3"],           // Abril: Jueves y Viernes Santo
      "2026-4": ["1", "25"],          // Mayo: Día del Trabajo, Ascensión
      "2026-5": ["15"],               // Junio: Corpus Christi
      "2026-6": ["20"],               // Julio: Independencia
      "2026-7": ["7", "17"],          // Agosto: Batalla de Boyacá, Asunción
      "2026-9": ["12"],               // Octubre: Día de la Raza
      "2026-10": ["2", "16"],         // Noviembre: Todos los Santos, Indep. Cartagena
      "2026-11": ["8", "25"],         // Diciembre: Inmaculada, Navidad
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

  // Actividades de ejemplo
  const actividades = [
    { id: 1, dia: 15, nombre: "Inspección de Extintores", hora: "09:00 AM" },
    { id: 2, dia: 25, nombre: "Capacitación Primeros Auxilios", hora: "02:30 PM" }
  ];

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
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Plan de Trabajo • Colombia</p>
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
          {emptyDays.map(ed => <div key={`empty-${ed}`} className="min-h-[130px] bg-slate-50/20 border-r border-b border-gray-50" />)}
          
          {days.map(dia => {
            const esFestivo = festivosMesActual.includes(dia.toString());
            const actividad = actividades.find(a => a.dia === dia);
            
            return (
              <div key={dia} className={`min-h-[130px] p-3 border-r border-b border-gray-100 transition-all relative ${esFestivo ? 'bg-red-50/40' : 'hover:bg-blue-50/20'}`}>
                <span className={`text-sm font-bold ${esFestivo ? 'text-red-500' : 'text-slate-300'}`}>
                  {dia} {esFestivo && <span className="text-[8px] uppercase block leading-none mt-1">Festivo</span>}
                </span>
                
                {actividad && (
                  <button 
                    onClick={() => setSelectedActivity(actividad)}
                    className="mt-2 w-full p-2 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase truncate shadow-lg hover:scale-105 transition-transform"
                  >
                    {actividad.nombre}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. MODAL DE DETALLE */}
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
                <p className="text-sm font-bold text-slate-700">{selectedActivity.nombre}</p>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <Clock size={16} className="text-blue-500" />
                <p className="text-xs font-black uppercase font-menu">Hora: {selectedActivity.hora}</p>
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