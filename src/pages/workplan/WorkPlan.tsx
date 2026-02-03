import { useState } from 'react';
import { Calendar as CalendarIcon, List, Download, Plus } from 'lucide-react';
import { WorkPlanCalendar } from './WorkPlanCalendar';
import { WorkPlanListKanban } from './WorkPlanListKanban';
import { ExportModal } from '../../components/workplan/ExportModal';

type ViewType = 'calendar' | 'list';

export function WorkPlan() {
  const [viewType, setViewType] = useState<ViewType>('calendar');
  const [showExportModal, setShowExportModal] = useState(false);

  return (
    /* CAMBIO: Eliminamos mx-auto y max-w-7xl. Agregamos items-start */
    <div className="w-full min-h-screen bg-slate-50/30 flex flex-col items-start">
      
      {/* HEADER: Ocupa el 100% del ancho disponible */}
      <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 md:p-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-title font-black text-blue-900 uppercase tracking-tighter leading-none">
            Calendario del plan de trabajo
          </h1>
          <p className="text-gray-400 font-body italic text-sm">
            Programar y gestionar actividades de SST
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-gray-200/50 p-1.5 rounded-2xl flex gap-1 border border-gray-100 shadow-inner">
            <button
              onClick={() => setViewType('calendar')}
              className={`flex items-center gap-2 px-5 py-2.5 text-[11px] font-action font-black uppercase rounded-xl transition-all ${
                viewType === 'calendar' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-500'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              Calendario
            </button>
            <button
              onClick={() => setViewType('list')}
              className={`flex items-center gap-2 px-5 py-2.5 text-[11px] font-action font-black uppercase rounded-xl transition-all ${
                viewType === 'list' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-500'
              }`}
            >
              <List className="w-4 h-4" />
              Vista de lista
            </button>
          </div>

          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white text-[11px] font-action font-black uppercase rounded-2xl hover:bg-green-700 transition-all shadow-lg"
          >
            <Download className="w-4 h-4" />
            Exportar Programa
          </button>

          <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-[11px] font-action font-black uppercase rounded-2xl hover:bg-blue-700 transition-all shadow-lg">
            <Plus className="w-4 h-4" />
            Nueva Actividad
          </button>
        </div>
      </div>

      {/* ÁREA DEL CALENDARIO: Quitamos mx-auto y max-w para eliminar el espacio amarillo */}
      <div className="w-full px-6 md:px-8 pb-8 animate-in fade-in duration-700">
        <div className="bg-white rounded-[3rem] shadow-xl shadow-slate-200/50 border border-white overflow-hidden w-full">
           {viewType === 'calendar' ? <WorkPlanCalendar /> : <WorkPlanListKanban />}
        </div>
      </div>

      <ExportModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} />
    </div>
  );
}