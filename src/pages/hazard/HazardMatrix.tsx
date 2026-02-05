import { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, FileSpreadsheet, FileText } from 'lucide-react';
import { supabase } from '../../SupabaseClient'; 
import { MainContent } from '../../components/layout/MainContent';
import { AddHazardWizard, HazardData } from '../../components/hazard/AddHazardWizard';
import { useApp } from '../../contexts/AppContext';

// Librerías de exportación
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Hazard extends HazardData {
  id: string;
}

export function HazardMatrix() {
  const { addToast } = useApp();
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [editingHazard, setEditingHazard] = useState<Hazard | null>(null);
  const [levelFilter, setLevelFilter] = useState<string | null>(null);

  useEffect(() => { fetchHazards(); }, []);

  const fetchHazards = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('hazards').select('*').order('id', { ascending: false });
      if (error) throw error;
      setHazards(data || []);
    } catch (error: any) {
      addToast({ type: 'error', message: 'Error al conectar con la base de datos.' });
    } finally { setLoading(false); }
  };

  const getGTCData = (nr: number) => {
    if (nr >= 600) return { romano: 'I', color: 'bg-red-50 border-red-200 text-red-700', label: 'No aceptable', action: 'Suspender actividad inmediatamente' };
    if (nr >= 150) return { romano: 'II', color: 'bg-orange-50 border-orange-200 text-orange-700', label: 'No aceptable o aceptable con control específico', action: 'Implementar controles prioritarios' };
    if (nr >= 40) return { romano: 'III', color: 'bg-blue-50 border-blue-200 text-blue-700', label: 'Mejorable', action: 'Mejorar controles existentes' };
    return { romano: 'IV', color: 'bg-emerald-50 border-emerald-200 text-emerald-700', label: 'Controlado', action: 'No aplica intervención' };
  };

  // --- FUNCIONES DE ACCIÓN (Corrigiendo los errores de referencia) ---
  const handleSaveHazard = async (hazardData: HazardData) => {
    try {
      if (editingHazard) {
        const { error } = await supabase.from('hazards').update(hazardData).eq('id', editingHazard.id);
        if (error) throw error;
        addToast({ type: 'success', message: 'Registro actualizado' });
      } else {
        const { error } = await supabase.from('hazards').insert([hazardData]);
        if (error) throw error;
        addToast({ type: 'success', message: 'Peligro guardado correctamente' });
      }
      fetchHazards(); setShowWizard(false); setEditingHazard(null);
    } catch (error: any) { alert(`Fallo al guardar: ${error.message}`); }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Deseas eliminar este registro?')) {
      try {
        const { error } = await supabase.from('hazards').delete().eq('id', id);
        if (error) throw error;
        setHazards(prev => prev.filter(h => h.id !== id));
        addToast({ type: 'info', message: 'Registro borrado' });
      } catch (error: any) { addToast({ type: 'error', message: 'Error al eliminar' }); }
    }
  };

  // --- EXPORTACIONES ---
  const handleExportExcel = () => {
    const dataToExport = hazards.map(h => {
      const np = Number(h.deficiencyLevel) * Number(h.exposureLevel);
      const nr = np * Number(h.consequenceLevel);
      const gtc = getGTCData(nr);
      return {
        'Proceso': h.processArea,
        'Actividad': h.taskActivity,
        'Tipo': h.hazardType,
        'ND': h.deficiencyLevel,
        'NE': h.exposureLevel,
        'NP (Prob)': np,
        'NC': h.consequenceLevel,
        'NR (Riesgo)': nr,
        'Nivel': gtc.romano,
        'Aceptabilidad': gtc.label,
        'Intervención': gtc.action
      };
    });
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Matriz Completa");
    XLSX.writeFile(wb, `Matriz_GTC45_Tecnica_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.text("MATRIZ TÉCNICA GTC 45", 14, 15);
    const tableData = hazards.map(h => {
      const np = Number(h.deficiencyLevel) * Number(h.exposureLevel);
      const nr = np * Number(h.consequenceLevel);
      return [h.processArea, h.hazard, h.deficiencyLevel, h.exposureLevel, np, h.consequenceLevel, nr, getGTCData(nr).romano];
    });
    autoTable(doc, {
      head: [['PROCESO', 'PELIGRO', 'ND', 'NE', 'NP', 'NC', 'NR', 'NIVEL']],
      body: tableData,
      startY: 25,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [30, 41, 59] }
    });
    doc.save("Matriz_SST_Tecnica.pdf");
  };

  const stats = useMemo(() => {
    const s = { total: hazards.length, I: 0, II: 0, III: 0, IV: 0 };
    hazards.forEach(h => {
      const nr = h.riskScore || (Number(h.deficiencyLevel) * Number(h.exposureLevel) * Number(h.consequenceLevel));
      if (nr >= 600) s.I++; else if (nr >= 150) s.II++; else if (nr >= 40) s.III++; else s.IV++;
    });
    return s;
  }, [hazards]);

  const filteredHazards = useMemo(() => {
    return hazards.filter(h => {
      const nr = h.riskScore || (Number(h.deficiencyLevel) * Number(h.exposureLevel) * Number(h.consequenceLevel));
      const currentLevel = getGTCData(nr).romano;
      const matchesSearch = h.processArea?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          h.hazard?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLevel = levelFilter ? currentLevel === levelFilter : true;
      return matchesSearch && matchesLevel;
    });
  }, [hazards, searchQuery, levelFilter]);

  if (loading) return <div className="p-20 text-center animate-pulse font-black text-slate-400">SINCRONIZANDO...</div>;

  return (
    <MainContent
      title="Matriz de Peligros"
      subtitle="Valoración Técnica GTC 45"
      actions={
        <div className="flex gap-3">
          <button onClick={handleExportExcel} className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 border border-emerald-100 flex items-center gap-2 font-bold text-[10px] uppercase">
            <FileSpreadsheet size={16} /> Excel
          </button>
          <button onClick={handleExportPDF} className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 border border-red-100 flex items-center gap-2 font-bold text-[10px] uppercase">
            <FileText size={16} /> PDF
          </button>
          <button onClick={() => { setEditingHazard(null); setShowWizard(true); }} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-lg text-[10px] uppercase tracking-widest transition-all">
            <Plus size={16} className="inline mr-2" /> Nuevo Peligro
          </button>
        </div>
      }
    >
      <div className="w-full space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <StatCard label="Total" value={stats.total} colorClass="text-slate-800" active={levelFilter === null} onClick={() => setLevelFilter(null)} />
          <StatCard label="Nivel I" value={stats.I} colorClass="text-red-600" active={levelFilter === 'I'} onClick={() => setLevelFilter('I')} />
          <StatCard label="Nivel II" value={stats.II} colorClass="text-orange-500" active={levelFilter === 'II'} onClick={() => setLevelFilter('II')} />
          <StatCard label="Nivel III" value={stats.III} colorClass="text-blue-600" active={levelFilter === 'III'} onClick={() => setLevelFilter('III')} />
          <StatCard label="Nivel IV" value={stats.IV} colorClass="text-emerald-600" active={levelFilter === 'IV'} onClick={() => setLevelFilter('IV')} />
        </div>

        <div className="w-full bg-white shadow-xl rounded-[3rem] overflow-hidden border border-slate-100">
          <div className="p-8 border-b border-slate-50">
            <div className="relative max-w-md">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Buscar..." className="w-full pl-12 pr-6 py-3 bg-slate-50 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500" onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-fixed min-w-[1600px]">
              <thead>
                <tr className="bg-slate-50/50 text-[9px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
                  <th className="w-[12%] px-8 py-5 text-left">Proceso / Peligro</th>
                  <th className="w-[8%] px-4 py-5 text-center">Tipo</th>
                  <th className="w-[4%] px-2 py-5 text-center">ND</th>
                  <th className="w-[4%] px-2 py-5 text-center">NE</th>
                  <th className="w-[5%] px-2 py-5 text-center bg-blue-50/30 text-blue-600">NP (Prob)</th>
                  <th className="w-[4%] px-2 py-5 text-center">NC</th>
                  <th className="w-[8%] px-4 py-5 text-center">Riesgo (NR)</th>
                  <th className="w-[12%] px-4 py-5 text-center">Aceptabilidad</th>
                  <th className="w-[18%] px-4 py-5 text-left">Intervención</th>
                  <th className="w-[12%] px-6 py-5 text-left">Controles</th>
                  <th className="w-[8%] px-8 py-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredHazards.map(hazard => {
                  const nd = Number(hazard.deficiencyLevel) || 0;
                  const ne = Number(hazard.exposureLevel) || 0;
                  const nc = Number(hazard.consequenceLevel) || 0;
                  const np = nd * ne;
                  const nr = np * nc;
                  const gtc = getGTCData(nr);

                  return (
                    <tr key={hazard.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <div className="text-[10px] font-black text-slate-700 uppercase">{hazard.processArea}</div>
                        <div className="text-[10px] font-bold text-blue-600 mt-1">{hazard.hazard}</div>
                      </td>
                      <td className="px-4 py-5 text-center">
                        <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-[8px] font-black uppercase">{hazard.hazardType || 'N/A'}</span>
                      </td>
                      <td className="px-2 py-5 text-center text-xs font-bold text-slate-600">{nd}</td>
                      <td className="px-2 py-5 text-center text-xs font-bold text-slate-600">{ne}</td>
                      <td className="px-2 py-5 text-center bg-blue-50/20 font-black text-blue-700 text-xs">{np}</td>
                      <td className="px-2 py-5 text-center text-xs font-bold text-slate-600">{nc}</td>
                      <td className="px-4 py-5 text-center">
                        <div className={`inline-flex flex-col p-2 rounded-xl border font-black min-w-[60px] leading-tight ${gtc.color}`}>
                          <span className="text-sm">{nr}</span>
                          <span className="text-[8px] uppercase tracking-tighter">Nivel {gtc.romano}</span>
                        </div>
                      </td>
                      <td className="px-4 py-5 text-center">
                        <span className={`inline-block px-3 py-2 rounded-xl text-[8px] font-black uppercase border leading-tight ${gtc.color}`}>
                          {gtc.label}
                        </span>
                      </td>
                      <td className="px-4 py-5"><p className="text-[9px] text-slate-600 font-bold leading-snug uppercase italic">{gtc.action}</p></td>
                      <td className="px-6 py-5 text-[8px] text-slate-500 space-y-1">
                        <p className="truncate"><strong>F:</strong> {hazard.controlSource || 'N/A'}</p>
                        <p className="truncate"><strong>M:</strong> {hazard.controlMedium || 'N/A'}</p>
                        <p className="truncate"><strong>T:</strong> {hazard.controlWorker || 'N/A'}</p>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => { setEditingHazard(hazard); setShowWizard(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit size={14}/></button>
                          <button onClick={() => handleDelete(hazard.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={14}/></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <AddHazardWizard isOpen={showWizard} onClose={() => { setShowWizard(false); setEditingHazard(null); }} onSave={handleSaveHazard} initialData={editingHazard} />
    </MainContent>
  );
}

function StatCard({ label, value, colorClass, onClick, active }: any) {
  return (
    <button onClick={onClick} className={`bg-white border-2 rounded-[2rem] p-6 shadow-sm transition-all text-center flex flex-col items-center justify-center w-full ${active ? 'border-blue-500 ring-4 ring-blue-50 translate-y-[-4px]' : 'border-slate-50 hover:border-slate-200 hover:translate-y-[-2px]'}`}>
      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-3xl font-black ${colorClass}`}>{value}</p>
      {active && <div className="mt-2 w-8 h-1 bg-blue-500 rounded-full" />}
    </button>
  );
}