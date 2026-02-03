import { useState, useEffect, useMemo } from 'react';
import { Users, ShieldCheck, AlertTriangle, XCircle, Search, Plus } from 'lucide-react';
import { SSTResponsibleList } from '../SSTResponsibleList'; 
import { SSTResponsibleForm } from '../SSTResponsibleForm'; 
import { supabase } from '../../SupabaseClient'; 

// Componente para las tarjetas blancas de arriba
const StatCard = ({ label, value, icon, color }: any) => {
  const themes: any = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
    red: "bg-red-50 text-red-600"
  };
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 flex items-center gap-5 shadow-sm transition-transform hover:scale-[1.02]">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${themes[color]}`}>{icon}</div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-menu">{label}</p>
        <p className="text-3xl font-title font-black text-slate-800">{value}</p>
      </div>
    </div>
  );
};

export default function ResponsiblesPage() {
  const [responsibles, setResponsibles] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRes, setEditingRes] = useState<any>(null);

  // Carga inicial de datos
  const fetchResponsibles = async () => {
    try {
      const { data, error } = await supabase
        .from('sst_responsibles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setResponsibles(data || []);
    } catch (err: any) {
      console.error("Error cargando responsables:", err.message);
    }
  };

  useEffect(() => {
    fetchResponsibles();
  }, []);

  // Lógica de Estadísticas basada en la FECHA ACTUAL
  const stats = useMemo(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Solo comparar fechas sin horas

    return responsibles.reduce((acc, res) => {
      acc.total++;
      if (res.fecha_ven_licencia) {
        const fechaVto = new Date(res.fecha_ven_licencia);
        
        // REGLA: Mayor o igual a hoy = VIGENTE
        if (fechaVto >= hoy) {
          acc.vigentes++;
          // Alerta naranja si vence en los próximos 30 días
          const diffDias = (fechaVto.getTime() - hoy.getTime()) / (1000 * 3600 * 24);
          if (diffDias <= 30) acc.proximos++;
        } else {
          // Si es menor a hoy = VENCIDA
          acc.vencidos++;
        }
      }
      return acc;
    }, { total: 0, vigentes: 0, vencidos: 0, proximos: 0 });
  }, [responsibles]);

  // Filtrado para el buscador (por nombre, apellido o ID)
  const filteredData = responsibles.filter(res => {
    const fullSearch = `${res.nombres} ${res.apellidos} ${res.numero_id}`.toLowerCase();
    return fullSearch.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="p-8 space-y-6 font-body bg-slate-50/50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-title font-black text-blue-900 uppercase">GESTIÓN SST - PANEL DE CONTROL</h1>
          <p className="text-gray-400 text-xs font-medium italic">Base de datos sincronizada correctamente</p>
        </div>
        <button 
          onClick={() => { setEditingRes(null); setIsFormOpen(true); }}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-action font-black text-xs uppercase shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          <Plus size={18} /> Añadir Responsable
        </button>
      </div>

      {/* TARJETAS DE ESTADÍSTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Total Responsables" value={stats.total} icon={<Users />} color="blue" />
        <StatCard label="Licencias Vigentes" value={stats.vigentes} icon={<ShieldCheck />} color="green" />
        <StatCard label="Próximos a Vencer" value={stats.proximos} icon={<AlertTriangle />} color="orange" />
        <StatCard label="Licencias Vencidas" value={stats.vencidos} icon={<XCircle />} color="red" />
      </div>

      {/* BUSCADOR */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex items-center px-6 gap-4">
        <Search className="text-gray-300" size={20} />
        <input 
          type="text" 
          placeholder="Buscar por nombre o número de identificación..."
          className="w-full outline-none font-body text-sm bg-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* TABLA: Le pasamos los datos filtrados */}
      <SSTResponsibleList 
        responsibles={filteredData} 
        onRefresh={fetchResponsibles}
        onEdit={(res) => { setEditingRes(res); setIsFormOpen(true); }}
      />

      {/* MODAL DEL FORMULARIO */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <SSTResponsibleForm 
            initialData={editingRes}
            onClose={() => setIsFormOpen(false)}
            onCreated={fetchResponsibles}
          />
        </div>
      )}
    </div>
  );
}