import { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { supabase } from '../../SupabaseClient'; 
import { MainContent } from '../../components/layout/MainContent';
import { AddHazardWizard, HazardData } from '../../components/hazard/AddHazardWizard';
import { useApp } from '../../contexts/AppContext';

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
      fetchHazards(); 
      setShowWizard(false);
      setEditingHazard(null);
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

  // --- ACTUALIZACIÓN DE LÓGICA GTC 45 (INCLUYE PERSONALIZACIÓN NIVEL IV) ---
  const getGTCData = (nr: number) => {
    if (nr >= 600) return { 
      romano: 'I', 
      color: 'bg-red-50 border-red-200 text-red-700', 
      label: 'No aceptable', 
      action: 'Suspender actividad inmediatamente' 
    };
    if (nr >= 150) return { 
      romano: 'II', 
      color: 'bg-orange-50 border-orange-200 text-orange-700', 
      label: 'No aceptable o aceptable con control específico', 
      action: 'Implementar controles prioritarios' 
    };
    if (nr >= 40) return { 
      romano: 'III', 
      color: 'bg-blue-50 border-blue-200 text-blue-700', 
      label: 'Mejorable', 
      action: 'Mejorar controles existentes' 
    };
    
    // NIVEL IV - PERSONALIZADO SEGÚN TU SOLICITUD
    return { 
      romano: 'IV', 
      color: 'bg-emerald-50 border-emerald-200 text-emerald-700', 
      label: 'Controlado', 
      action: 'No aplica intervención' 
    };
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
    return hazards.filter(h => 
      h.processArea?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.hazard?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.hazardType?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [hazards, searchQuery]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 min-h-[400px]">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="font-black text-slate-400 uppercase tracking-widest animate-pulse">Sincronizando...</p>
    </div>
  );

  return (
    <MainContent
      title="Matriz de Peligros"
      subtitle="Valoración de Riesgos GTC 45"
      actions={
        <button onClick={() => { setEditingHazard(null); setShowWizard(true); }} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-lg text-xs uppercase tracking-widest transition-all">
          <Plus size={16} /> Nuevo Peligro
        </button>
      }
    >
      <div className="w-full space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 w-full text-left">
          <StatCard label="Total" value={stats.total} colorClass="text-slate-800" />
          <StatCard label="Nivel I" value={stats.I} colorClass="text-red-600" />
          <StatCard label="Nivel II" value={stats.II} colorClass="text-orange-500" />
          <StatCard label="Nivel III" value={stats.III} colorClass="text-blue-600" />
          <StatCard label="Nivel IV" value={stats.IV} colorClass="text-emerald-600" />
        </div>

        <div className="w-full bg-white shadow-xl rounded-[3rem] overflow-hidden border border-slate-100">
          <div className="p-8 border-b border-slate-50 flex justify-start">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Buscar por proceso, peligro o tipo..." className="w-full pl-12 pr-6 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500" onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-fixed min-w-[1450px]">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
                  <th className="w-[14%] px-8 py-5 text-left">Proceso / Peligro</th>
                  <th className="w-[10%] px-4 py-5 text-center">Tipo Peligro</th>
                  <th className="w-[7%] px-4 py-5 text-center">Prob (NP)</th>
                  <th className="w-[9%] px-4 py-5 text-center">Riesgo (NR)</th>
                  <th className="w-[16%] px-4 py-5 text-center">Aceptabilidad</th>
                  <th className="w-[20%] px-4 py-5 text-left">Intervención (GTC 45)</th>
                  <th className="w-[14%] px-6 py-5 text-left">Controles</th>
                  <th className="w-[10%] px-8 py-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-left">
                {filteredHazards.map(hazard => {
                  const np = hazard.probabilityLevel || (Number(hazard.deficiencyLevel) * Number(hazard.exposureLevel));
                  const nr = hazard.riskScore || (np * Number(hazard.consequenceLevel));
                  const gtc = getGTCData(nr);

                  return (
                    <tr key={hazard.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <div className="text-[10px] font-black text-slate-700 uppercase leading-tight">{hazard.processArea}</div>
                        <div className="text-[10px] font-bold text-blue-600 mt-1">{hazard.hazard}</div>
                      </td>

                      <td className="px-4 py-5 text-center">
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[9px] font-black uppercase border border-slate-200">
                          {hazard.hazardType || 'N/A'}
                        </span>
                      </td>

                      <td className="px-4 py-5 text-center"><span className="text-sm font-black text-slate-700">{np || 0}</span></td>
                      
                      <td className="px-4 py-5 text-center">
                        <div className={`inline-flex flex-col p-2 rounded-xl border font-black min-w-[65px] leading-tight ${gtc.color}`}>
                          <span className="text-sm">{nr || 0}</span>
                          <span className="text-[9px] uppercase tracking-tighter">Nivel {gtc.romano}</span>
                        </div>
                      </td>

                      <td className="px-4 py-5 text-center">
                        <div className="flex justify-center">
                          <span className={`inline-block max-w-[180px] px-3 py-2 rounded-xl text-[9px] font-black uppercase border leading-tight break-words ${gtc.color}`}>
                            {gtc.label}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-5">
                        <p className="text-[10px] text-slate-600 font-bold leading-snug break-words uppercase italic">
                          {gtc.action}
                        </p>
                      </td>

                      <td className="px-6 py-5 text-left text-[9px] text-slate-600 space-y-1">
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

function StatCard({ label, value, colorClass }: { label: string; value: number; colorClass: string }) {
  return (
    <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm">
      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-3xl font-black ${colorClass}`}>{value}</p>
    </div>
  );
}