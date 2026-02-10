import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, List, Download, Plus, PieChart, XCircle } from 'lucide-react';
import { WorkPlanCalendar } from './WorkPlanCalendar';
import { WorkPlanListKanban } from './WorkPlanListKanban';
import { ExportModal } from '../../components/workplan/ExportModal';
import { ActivityFormModal } from './ActivityFormModal'; 
import { EvidenceViewerModal } from '../../components/workplan/EvidenceViewerModal';
import { supabase } from '../../lib/supabase';

type ViewType = 'calendar' | 'list';

export function WorkPlan() {
  const [viewType, setViewType] = useState<ViewType>('calendar');
  const [showExportModal, setShowExportModal] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [activityToEdit, setActivityToEdit] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // --- NUEVO: Estado para el filtro activo ('todos' | 'planeado' | 'ejecutado') ---
  const [filterStatus, setFilterStatus] = useState<string>('todos');

  // Estado para estadísticas del gráfico
  const [stats, setStats] = useState({ planeado: 0, ejecutado: 0, total: 0 });

  // Función para calcular cumplimiento
  const fetchStats = async () => {
    const { data } = await supabase.from('work_plan').select('status');
    if (data) {
      const planeado = data.filter(a => (a.status || "").toLowerCase() === 'planeado').length;
      const ejecutado = data.filter(a => (a.status || "").toLowerCase() === 'ejecutado').length;
      setStats({ planeado, ejecutado, total: data.length });
    }
  };

  useEffect(() => {
    fetchStats();
  }, [refreshKey]);

  const [evidenceViewer, setEvidenceViewer] = useState<{
    isOpen: boolean;
    path: string;
    title: string;
  }>({
    isOpen: false,
    path: '',
    title: ''
  });

  const handleSaveActivity = async (data: any) => {
    try {
      const payload = {
        title: data.title,
        objective: data.objective,
        meta: data.meta,
        description: data.description,
        scope: data.scope,
        responsible: data.responsible,
        resources: data.resources,
        activity_date: data.date,
        activity_time: data.time,
        status: data.id ? data.status : 'planeado'
      };

      if (data.id) {
        const { error } = await supabase
          .from('work_plan')
          .update(payload)
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('work_plan')
          .insert([payload]);
        if (error) throw error;
      }

      setRefreshKey(prev => prev + 1);
      handleCloseModal();
    } catch (error: any) {
      alert("Error al procesar: " + error.message);
    }
  };

  const handleEditOpen = (activity: any) => {
    setActivityToEdit(activity);
    setIsActivityModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsActivityModalOpen(false);
    setActivityToEdit(null);
  };

  const handleOpenEvidence = (path: string, title: string) => {
    setEvidenceViewer({ isOpen: true, path, title });
  };

  // --- NUEVO: Función para aplicar filtro y saltar a vista de lista ---
  const handleApplyFilter = (status: string) => {
    setFilterStatus(status);
    if (viewType !== 'list') setViewType('list');
  };

  const porcentajeEjecutado = stats.total > 0 ? Math.round((stats.ejecutado / stats.total) * 100) : 0;

  return (
    <div className="w-full min-h-screen bg-slate-50/30 flex flex-col items-start text-slate-900 font-body">
      
      {/* HEADER */}
      <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 md:p-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-title font-black text-blue-900 uppercase tracking-tighter leading-none">
            Plan de Trabajo SST
          </h1>
          <p className="text-slate-400 text-sm italic font-medium">Gestión de actividades y cumplimiento</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Botón para limpiar filtro si hay uno activo */}
          {filterStatus !== 'todos' && (
            <button 
              onClick={() => setFilterStatus('todos')}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 text-[10px] font-black uppercase rounded-xl border border-red-100 shadow-sm hover:bg-red-100 transition-all"
            >
              <XCircle size={14} /> Quitar Filtro: {filterStatus}
            </button>
          )}

          <div className="bg-gray-200/50 p-1.5 rounded-2xl flex gap-1 border border-gray-100 shadow-inner">
            <button 
              onClick={() => setViewType('calendar')} 
              className={`flex items-center gap-2 px-5 py-2.5 text-[11px] font-black uppercase rounded-xl transition-all ${viewType === 'calendar' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-500 hover:text-slate-700'}`}
            >
              <CalendarIcon size={16} /> Calendario
            </button>
            <button 
              onClick={() => setViewType('list')} 
              className={`flex items-center gap-2 px-5 py-2.5 text-[11px] font-black uppercase rounded-xl transition-all ${viewType === 'list' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-500 hover:text-slate-700'}`}
            >
              <List size={16} /> Vista de lista
            </button>
          </div>

          <button 
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white text-[11px] font-black uppercase rounded-2xl hover:bg-emerald-700 transition-all shadow-lg"
          >
            <Download size={16} /> Exportar
          </button>

          <button 
            onClick={() => {
              setActivityToEdit(null);
              setIsActivityModalOpen(true);
            }} 
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-[11px] font-black uppercase rounded-2xl hover:bg-blue-700 shadow-lg"
          >
            <Plus size={16} /> Nueva Actividad
          </button>
        </div>
      </div>

      {/* ÁREA DE GRÁFICO Y ESTADÍSTICAS (Ahora con Click para filtrar) */}
      <div className="w-full px-6 md:px-8 mb-6">
        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-white flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          <PieChart className="absolute -right-4 -bottom-4 w-32 h-32 text-slate-50 -rotate-12 pointer-events-none" />
          
          <button 
            onClick={() => handleApplyFilter('ejecutado')}
            className="relative w-32 h-32 rounded-full flex items-center justify-center shrink-0 shadow-lg hover:scale-105 transition-all active:scale-95"
            style={{
              background: `conic-gradient(#2563eb ${porcentajeEjecutado}%, #f1f5f9 0%)`
            }}
          >
            <div className="absolute w-24 h-24 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
              <span className="text-2xl font-black text-blue-600 leading-none">{porcentajeEjecutado}%</span>
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1">Logrado</span>
            </div>
          </button>

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full z-10">
            {/* TOTAL */}
            <button 
              onClick={() => handleApplyFilter('todos')}
              className={`p-5 rounded-3xl border flex flex-col justify-center transition-all hover:shadow-md active:scale-95 text-left ${filterStatus === 'todos' ? 'bg-blue-600 border-blue-700 shadow-lg' : 'bg-blue-50/50 border-blue-100'}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-2 h-2 rounded-full ${filterStatus === 'todos' ? 'bg-white' : 'bg-blue-400'}`} />
                <span className={`text-[10px] font-black uppercase tracking-widest ${filterStatus === 'todos' ? 'text-blue-100' : 'text-blue-400'}`}>Total</span>
              </div>
              <span className={`text-3xl font-black ${filterStatus === 'todos' ? 'text-white' : 'text-blue-900'}`}>{stats.total}</span>
            </button>

            {/* EJECUTADAS */}
            <button 
              onClick={() => handleApplyFilter('ejecutado')}
              className={`p-5 rounded-3xl border flex flex-col justify-center transition-all hover:shadow-md active:scale-95 text-left ${filterStatus === 'ejecutado' ? 'bg-emerald-600 border-emerald-700 shadow-lg' : 'bg-emerald-50/50 border-emerald-100'}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-2 h-2 rounded-full ${filterStatus === 'ejecutado' ? 'bg-white' : 'bg-emerald-400'}`} />
                <span className={`text-[10px] font-black uppercase tracking-widest ${filterStatus === 'ejecutado' ? 'text-emerald-100' : 'text-emerald-400'}`}>Ejecutadas</span>
              </div>
              <span className={`text-3xl font-black ${filterStatus === 'ejecutado' ? 'text-white' : 'text-emerald-700'}`}>{stats.ejecutado}</span>
            </button>

            {/* PENDIENTES */}
            <button 
              onClick={() => handleApplyFilter('planeado')}
              className={`p-5 rounded-3xl border flex flex-col justify-center transition-all hover:shadow-md active:scale-95 text-left ${filterStatus === 'planeado' ? 'bg-amber-500 border-amber-600 shadow-lg' : 'bg-amber-50/50 border-amber-100'}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-2 h-2 rounded-full ${filterStatus === 'planeado' ? 'bg-white' : 'bg-amber-300'}`} />
                <span className={`text-[10px] font-black uppercase tracking-widest ${filterStatus === 'planeado' ? 'text-amber-100' : 'text-amber-500'}`}>Pendientes</span>
              </div>
              <span className={`text-3xl font-black ${filterStatus === 'planeado' ? 'text-white' : 'text-amber-700'}`}>{stats.planeado}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ÁREA DEL CONTENIDO */}
      <div className="w-full px-6 md:px-8 pb-8">
        <div className="bg-white rounded-[3rem] shadow-xl border border-white overflow-hidden w-full">
            {viewType === 'calendar' ? (
              <WorkPlanCalendar key={`cal-${refreshKey}`} /> 
            ) : (
              <WorkPlanListKanban 
                key={`list-${refreshKey}-${filterStatus}`} // Key dinámica para forzar renderizado
                onEdit={(act) => handleEditOpen(act)} 
                onOpenEvidence={handleOpenEvidence}
                filterStatus={filterStatus} // <-- PROP PASADA AL HIJO
              />
            )}
        </div>
      </div>

      <ExportModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} />
      <ActivityFormModal 
        isOpen={isActivityModalOpen} 
        onClose={handleCloseModal} 
        onSave={handleSaveActivity} 
        initialData={activityToEdit} 
      />
      <EvidenceViewerModal 
        isOpen={evidenceViewer.isOpen}
        onClose={() => setEvidenceViewer(prev => ({ ...prev, isOpen: false }))}
        storagePath={evidenceViewer.path}
        title={evidenceViewer.title}
      />
    </div>
  );
}