import { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';

// Asegúrate de que esta ruta apunte a tu archivo de configuración de Supabase
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

  // --- 1. CARGAR DATOS (SINCRO CON SUPABASE) ---
  useEffect(() => {
    fetchHazards();
  }, []);

  const fetchHazards = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('hazards') 
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      setHazards(data || []);
    } catch (error: any) {
      console.error("Error detallado:", error);
      addToast({ 
        type: 'error', 
        message: 'Error de conexión. Verifica que la tabla "hazards" exista en Supabase.' 
      });
    } finally {
      setLoading(false);
    }
  };

  // --- 2. GUARDAR / ACTUALIZAR ---
  const handleSaveHazard = async (hazardData: HazardData) => {
    try {
      if (editingHazard) {
        const { error } = await supabase
          .from('hazards')
          .update(hazardData)
          .eq('id', editingHazard.id);

        if (error) throw error;
        addToast({ type: 'success', message: 'Registro actualizado en la nube' });
      } else {
        const { error } = await supabase
          .from('hazards')
          .insert([hazardData]);

        if (error) throw error;
        addToast({ type: 'success', message: 'Peligro guardado permanentemente' });
      }
      
      fetchHazards(); 
      setShowWizard(false);
      setEditingHazard(null);
    } catch (error: any) {
      alert(`Fallo al guardar: ${error.message}`);
    }
  };

  // --- 3. ELIMINAR ---
  const handleDelete = async (id: string) => {
    if (window.confirm('¿Deseas eliminar este registro permanentemente?')) {
      try {
        const { error } = await supabase
          .from('hazards')
          .delete()
          .eq('id', id);

        if (error) throw error;
        setHazards(prev => prev.filter(h => h.id !== id));
        addToast({ type: 'info', message: 'Registro borrado de la base de datos' });
      } catch (error: any) {
        addToast({ type: 'error', message: 'Error al eliminar' });
      }
    }
  };

  const stats = useMemo(() => {
    return {
      total: hazards.length,
      critical: hazards.filter(h => h.riskLevel?.toLowerCase().includes('crítico') || h.riskLevel?.toLowerCase() === 'i').length,
      high: hazards.filter(h => h.riskLevel?.toLowerCase().includes('alto') || h.riskLevel?.toLowerCase() === 'ii').length,
      medium: hazards.filter(h => h.riskLevel?.toLowerCase().includes('medio') || h.riskLevel?.toLowerCase() === 'iii').length,
      low: hazards.filter(h => h.riskLevel?.toLowerCase().includes('bajo') || h.riskLevel?.toLowerCase() === 'iv').length,
    };
  }, [hazards]);

  const filteredHazards = useMemo(() => {
    return hazards.filter(h => 
      h.processArea?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.hazard?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [hazards, searchQuery]);

  if (loading) return (
    <div className="p-20 text-center font-black text-slate-400 uppercase tracking-widest animate-pulse">
      Sincronizando con Supabase...
    </div>
  );

  return (
    <MainContent
      title="Matriz de Peligros"
      subtitle="Valoración de Riesgos GTC 45"
      actions={
        <button
          onClick={() => { setEditingHazard(null); setShowWizard(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-lg text-xs uppercase tracking-widest transition-all"
        >
          <Plus size={16} /> Nuevo Peligro
        </button>
      }
    >
      <div className="w-full space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 w-full text-left">
          <StatCard label="Total" value={stats.total} color="slate" />
          <StatCard label="Crítico (I)" value={stats.critical} color="red" />
          <StatCard label="Alto (II)" value={stats.high} color="orange" />
          <StatCard label="Medio (III)" value={stats.medium} color="yellow" />
          <StatCard label="Bajo (IV)" value={stats.low} color="green" />
        </div>

        <div className="w-full bg-white shadow-xl rounded-[3rem] overflow-hidden border border-slate-100">
          <div className="p-8 border-b border-slate-50 flex justify-start">
            <div className="relative max-w-md w-full text-left">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar por proceso o peligro..." 
                className="w-full pl-12 pr-6 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
                  <th className="w-[20%] px-8 py-5 text-left">Proceso / Actividad</th>
                  <th className="w-[25%] px-6 py-5 text-left">Peligro</th>
                  <th className="w-[10%] px-4 py-5 text-center">Nivel Riesgo</th>
                  <th className="w-[30%] px-6 py-5 text-left">Controles Existentes</th>
                  <th className="w-[15%] px-8 py-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-left">
                {filteredHazards.map(hazard => (
                  <tr key={hazard.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="text-xs font-black text-slate-700 uppercase leading-tight">{hazard.processArea}</div>
                      <div className="text-[10px] text-slate-400 italic mt-1">{hazard.taskActivity}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-xs font-bold text-slate-700">{hazard.hazard}</div>
                      <div className="text-[10px] text-slate-500 line-clamp-1">{hazard.hazardDescription}</div>
                    </td>
                    <td className="px-4 py-5 text-center">
                      <div className={`inline-flex flex-col p-2 rounded-xl border font-black min-w-[50px] ${getRiskColor(hazard.riskLevel)}`}>
                        <span className="text-xs">{hazard.riskScore}</span>
                        <span className="text-[7px] uppercase tracking-tighter">{hazard.riskLevel}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-left">
                      <div className="text-[9px] text-slate-600 space-y-1">
                        <p className="truncate"><strong>F:</strong> {hazard.controlSource || 'N/A'}</p>
                        <p className="truncate"><strong>M:</strong> {hazard.controlMedium || 'N/A'}</p>
                        <p className="truncate"><strong>T:</strong> {hazard.controlWorker || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => { setEditingHazard(hazard); setShowWizard(true); }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        >
                          <Edit size={14}/>
                        </button>
                        <button 
                          onClick={() => handleDelete(hazard.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AddHazardWizard 
        isOpen={showWizard} 
        onClose={() => { setShowWizard(false); setEditingHazard(null); }} 
        onSave={handleSaveHazard}
        initialData={editingHazard}
      />
    </MainContent>
  );
}

// --- FUNCIONES Y COMPONENTES AUXILIARES (AGREGADOS PARA CORREGIR LOS ERRORES) ---

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const textColors: Record<string, string> = {
    red: 'text-red-600', 
    orange: 'text-orange-500', 
    yellow: 'text-yellow-600', 
    green: 'text-emerald-600', 
    slate: 'text-slate-800'
  };
  
  return (
    <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm">
      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-3xl font-black ${textColors[color] || textColors.slate}`}>{value}</p>
    </div>
  );
}

function getRiskColor(level: string | undefined) {
  const l = level?.toLowerCase() || '';
  if (l.includes('crítico') || l === 'i') return 'bg-red-50 border-red-200 text-red-700';
  if (l.includes('alto') || l === 'ii') return 'bg-orange-50 border-orange-200 text-orange-700';
  if (l.includes('medio') || l === 'iii') return 'bg-yellow-50 border-yellow-200 text-yellow-700';
  return 'bg-emerald-50 border-emerald-200 text-emerald-700';
}