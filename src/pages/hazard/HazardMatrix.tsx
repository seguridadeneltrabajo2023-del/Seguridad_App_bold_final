import { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2
} from 'lucide-react';
import { MainContent } from '../../components/layout/MainContent';
import { AddHazardWizard, HazardData } from '../../components/hazard/AddHazardWizard';
import { useApp } from '../../contexts/AppContext';

// Interfaz que extiende los datos de la GTC 45 con un ID
interface Hazard extends HazardData {
  id: string;
}

export function HazardMatrix() {
  const { addToast } = useApp();
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Estados para el Wizard
  const [showWizard, setShowWizard] = useState(false);
  const [editingHazard, setEditingHazard] = useState<Hazard | null>(null);

  // --- ESTADÍSTICAS SEGÚN NIVEL DE RIESGO (GTC 45) ---
  const stats = useMemo(() => {
    return {
      total: hazards.length,
      critical: hazards.filter(h => h.riskLevel.toLowerCase().includes('crítico') || h.riskLevel.toLowerCase() === 'i').length,
      high: hazards.filter(h => h.riskLevel.toLowerCase().includes('alto') || h.riskLevel.toLowerCase() === 'ii').length,
      medium: hazards.filter(h => h.riskLevel.toLowerCase().includes('medio') || h.riskLevel.toLowerCase() === 'iii').length,
      low: hazards.filter(h => h.riskLevel.toLowerCase().includes('bajo') || h.riskLevel.toLowerCase() === 'iv').length,
    };
  }, [hazards]);

  // FILTRADO POR BÚSQUEDA
  const filteredHazards = useMemo(() => {
    return hazards.filter(h => 
      h.processArea.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.hazard.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [hazards, searchQuery]);

  // --- ACCIONES CRUD ---
  const handleSaveHazard = (hazardData: HazardData) => {
    if (editingHazard) {
      setHazards(prev => prev.map(h => h.id === editingHazard.id ? { ...hazardData, id: h.id } : h));
      addToast({ type: 'success', message: 'Registro actualizado' });
    } else {
      const newHazard: Hazard = {
        ...hazardData,
        id: Math.random().toString(36).substr(2, 9)
      };
      setHazards(prev => [...prev, newHazard]);
      addToast({ type: 'success', message: 'Peligro guardado' });
    }
    setEditingHazard(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Deseas eliminar este registro?')) {
      setHazards(prev => prev.filter(h => h.id !== id));
      addToast({ type: 'info', message: 'Registro eliminado' });
    }
  };

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
        {/* ESTADÍSTICAS */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 w-full text-left">
          <StatCard label="Total" value={stats.total} color="slate" />
          <StatCard label="Crítico (I)" value={stats.critical} color="red" />
          <StatCard label="Alto (II)" value={stats.high} color="orange" />
          <StatCard label="Medio (III)" value={stats.medium} color="yellow" />
          <StatCard label="Bajo (IV)" value={stats.low} color="green" />
        </div>

        {/* TABLA */}
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
              <tbody className="divide-y divide-slate-50">
                {filteredHazards.map(hazard => (
                  <tr key={hazard.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5 text-left">
                      <div className="text-xs font-black text-slate-700 uppercase">{hazard.processArea}</div>
                      <div className="text-[10px] text-slate-400 italic">{hazard.taskActivity}</div>
                    </td>
                    <td className="px-6 py-5 text-left">
                      <div className="text-xs font-bold text-slate-700">{hazard.hazard}</div>
                      <div className="text-[10px] text-slate-500 line-clamp-1">{hazard.hazardDescription}</div>
                    </td>
                    <td className="px-4 py-5 text-center">
                      <div className={`inline-flex flex-col p-2 rounded-xl border font-black ${getRiskColor(hazard.riskLevel)}`}>
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
      />
    </MainContent>
  );
}

// COMPONENTES AUXILIARES
function StatCard({ label, value, color }: any) {
  const textColors: any = {
    red: 'text-red-600', orange: 'text-orange-500', yellow: 'text-yellow-600', green: 'text-emerald-600', slate: 'text-slate-800'
  };
  return (
    <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm">
      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-3xl font-black ${textColors[color]}`}>{value}</p>
    </div>
  );
}

function getRiskColor(level: string) {
  const l = level.toLowerCase();
  if (l.includes('crítico') || l === 'i') return 'bg-red-50 border-red-200 text-red-700';
  if (l.includes('alto') || l === 'ii') return 'bg-orange-50 border-orange-200 text-orange-700';
  if (l.includes('medio') || l === 'iii') return 'bg-yellow-50 border-yellow-200 text-yellow-700';
  return 'bg-emerald-50 border-emerald-200 text-emerald-700';
}