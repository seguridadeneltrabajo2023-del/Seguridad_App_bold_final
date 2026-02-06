import { useState, useEffect, useCallback } from 'react';
import { IncidentTable } from '../../components/IncidentTable';
import { IncidentForm } from '../../components/IncidentForm';
import { IncidentDashboard } from '../../components/IncidentDashboard';
import { 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  FileSpreadsheet, 
  FileText,
  FilterX,
  LayoutGrid 
} from 'lucide-react';
import { supabase } from '../../SupabaseClient'; 

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const AccidentList = () => {
  const [showForm, setShowForm] = useState(false);   
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats] = useState({ open: 0, process: 0, closed: 0 });
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  // --- FUNCIÓN MAESTRA DE ACTUALIZACIÓN ---
  const fetchKpiData = useCallback(async () => {
    const { data, error } = await supabase.from('incident_reports').select('status');
    if (data && !error) {
      setStats({
        open: data.filter((i: any) => i.status === 'Abierto').length,
        process: data.filter((i: any) => i.status === 'En proceso').length,
        closed: data.filter((i: any) => i.status === 'Cerrado').length,
      });
    }
  }, []);

  // 1. CARGA INICIAL Y SUSCRIPCIÓN REALTIME
  useEffect(() => {
    fetchKpiData();

    // Escuchar cambios en la base de datos en tiempo real
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'incident_reports' },
        () => {
          fetchKpiData(); // Actualiza cuadros automáticamente
          setRefreshKey(prev => prev + 1); // Refresca tabla y gráfica
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchKpiData]);

  const toggleFilter = (status: string) => {
    setFilterStatus(prev => prev === status ? null : status);
  };

  const getFilteredDataForExport = async () => {
    let query = supabase.from('incident_reports').select('*').order('incident_date', { ascending: false });
    if (filterStatus) query = query.eq('status', filterStatus);
    const { data } = await query;
    return data || [];
  };

  const handleExportExcel = async () => {
    const data = await getFilteredDataForExport();
    if (data.length === 0) return;
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Incidentes");
    XLSX.writeFile(workbook, `Reporte_SST_${filterStatus || 'General'}.xlsx`);
  };

  const handleExportPDF = async () => {
    const data = await getFilteredDataForExport();
    if (data.length === 0) return;
    const doc = new jsPDF();
    autoTable(doc, {
      startY: 30,
      head: [['FECHA', 'TIPO', 'UBICACIÓN', 'ESTADO']],
      body: data.map(i => [new Date(i.incident_date).toLocaleDateString(), i.event_type, i.location, i.status]),
      headStyles: { fillColor: [30, 41, 59] }
    });
    doc.save(`Reporte_SST_${filterStatus || 'General'}.pdf`);
  };

  // MANEJO DE ACTUALIZACIÓN AL AGREGAR
  const handleIncidentCreated = async () => {
    setShowForm(false);
    await fetchKpiData(); 
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gray-50/50 min-h-screen relative font-sans text-left">
      {/* CABECERA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="text-left">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight font-sans">Seguridad y Salud</h1>
          <p className="text-gray-500 font-medium font-sans">Gestión integral de incidentes laborales</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={handleExportExcel} className="flex items-center gap-2 px-5 py-2.5 bg-[#e9fbf3] border border-[#22c55e]/30 text-[#107c41] rounded-full font-bold text-xs uppercase hover:bg-[#d4f5e6] transition-all active:scale-95 shadow-sm font-sans">
            <FileSpreadsheet size={18} /> <span>EXCEL</span>
          </button>
          <button onClick={handleExportPDF} className="flex items-center gap-2 px-5 py-2.5 bg-[#fff1f1] border border-[#ef4444]/30 text-[#c42b1c] rounded-full font-bold text-xs uppercase hover:bg-[#ffe4e4] transition-all active:scale-95 shadow-sm font-sans">
            <FileText size={18} /> <span>PDF</span>
          </button>
        </div>
      </div>

      {/* DASHBOARD GRÁFICO */}
      <IncidentDashboard 
        key={`dash-${refreshKey}-${filterStatus}`} 
        refreshKey={refreshKey} 
        filterByStatus={filterStatus} 
      />

      {/* KPIs INTERACTIVOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* TOTAL */}
        <div onClick={() => setFilterStatus(null)} className={`cursor-pointer bg-white rounded-3xl border p-6 transition-all duration-300 flex items-center gap-4 shadow-sm ${filterStatus === null ? 'border-slate-800 ring-4 ring-slate-100 scale-105' : 'border-slate-100 hover:border-slate-200'}`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${filterStatus === null ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500'}`}><LayoutGrid size={24} /></div>
          <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</p><div className="text-3xl font-black text-slate-800 font-sans">{stats.open + stats.process + stats.closed}</div></div>
        </div>

        {/* PENDIENTES */}
        <div onClick={() => toggleFilter('Abierto')} className={`cursor-pointer bg-white rounded-3xl border p-6 transition-all duration-300 flex items-center gap-4 shadow-sm ${filterStatus === 'Abierto' ? 'border-red-500 ring-4 ring-red-50 scale-105' : 'border-slate-100 hover:border-red-100'}`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${filterStatus === 'Abierto' ? 'bg-red-500 text-white' : 'bg-red-50 text-red-500'}`}><AlertCircle size={24} /></div>
          <div><p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Pendientes</p><div className="text-3xl font-black text-slate-800 font-sans">{stats.open}</div></div>
        </div>

        {/* EN PROCESO */}
        <div onClick={() => toggleFilter('En proceso')} className={`cursor-pointer bg-white rounded-3xl border p-6 transition-all duration-300 flex items-center gap-4 shadow-sm ${filterStatus === 'En proceso' ? 'border-blue-500 ring-4 ring-blue-50 scale-105' : 'border-slate-100 hover:border-blue-100'}`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${filterStatus === 'En proceso' ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-500'}`}><Clock size={24} /></div>
          <div><p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">En Proceso</p><div className="text-3xl font-black text-slate-800 font-sans">{stats.process}</div></div>
        </div>

        {/* FINALIZADOS */}
        <div onClick={() => toggleFilter('Cerrado')} className={`cursor-pointer bg-white rounded-3xl border p-6 transition-all duration-300 flex items-center gap-4 shadow-sm ${filterStatus === 'Cerrado' ? 'border-emerald-500 ring-4 ring-emerald-50 scale-105' : 'border-slate-100 hover:border-emerald-100'}`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${filterStatus === 'Cerrado' ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-500'}`}><CheckCircle2 size={24} /></div>
          <div><p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Finalizados</p><div className="text-3xl font-black text-slate-800 font-sans">{stats.closed}</div></div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative z-10 w-full max-w-2xl transform animate-in zoom-in-95 duration-300 text-left">
            <IncidentForm onClose={() => setShowForm(false)} onIncidentCreated={handleIncidentCreated} />
          </div>
        </div>
      )}

      {/* TABLA PRINCIPAL */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden text-left font-sans">
        <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
          <h3 className="font-bold text-gray-700 font-sans">Historial de Reportes {filterStatus ? `— Filtrado por: ${filterStatus}` : ''}</h3>
          {filterStatus && (
            <button onClick={() => setFilterStatus(null)} className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors uppercase font-sans"><FilterX size={14} /> Quitar Filtro</button>
          )}
        </div>
        <IncidentTable 
          key={`${refreshKey}-${filterStatus}`} 
          filterByStatus={filterStatus}
          onDataUpdate={async () => {
            await fetchKpiData(); 
            setRefreshKey(prev => prev + 1);
          }} 
        />
      </div>
    </div>
  );
};