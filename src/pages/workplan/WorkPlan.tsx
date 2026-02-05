import { useState } from 'react';
import { Calendar as CalendarIcon, List, Download, Plus } from 'lucide-react';
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

  // NUEVO: Estado para controlar el visor de evidencias
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
      alert("Error al procesar en Supabase: " + error.message);
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

  // NUEVO: Función para abrir el visor desde los hijos
  const handleOpenEvidence = (path: string, title: string) => {
    setEvidenceViewer({
      isOpen: true,
      path,
      title
    });
  };

  return (
    <div className="w-full min-h-screen bg-slate-50/30 flex flex-col items-start text-slate-900">
      
      {/* HEADER */}
      <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 md:p-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-title font-black text-blue-900 uppercase tracking-tighter leading-none">
            Plan de Trabajo SST
          </h1>
          <p className="text-slate-400 text-sm italic font-medium">Gestión de actividades y cumplimiento</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
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

      {/* ÁREA DEL CONTENIDO */}
      <div className="w-full px-6 md:px-8 pb-8">
        <div className="bg-white rounded-[3rem] shadow-xl border border-white overflow-hidden w-full">
           {viewType === 'calendar' ? (
             <WorkPlanCalendar key={`cal-${refreshKey}`} /> 
           ) : (
             <WorkPlanListKanban 
               key={`list-${refreshKey}`} 
               onEdit={(act) => handleEditOpen(act)} 
               onOpenEvidence={handleOpenEvidence} // <-- PASAMOS LA FUNCIÓN AL HIJO
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

      {/* NUEVO: MODAL DEL VISOR (Se renderiza al final) */}
      <EvidenceViewerModal 
        isOpen={evidenceViewer.isOpen}
        onClose={() => setEvidenceViewer(prev => ({ ...prev, isOpen: false }))}
        storagePath={evidenceViewer.path}
        title={evidenceViewer.title}
      />
    </div>
  );
}