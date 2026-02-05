import { useState, useEffect, useMemo } from 'react';
import { Users, ShieldCheck, AlertTriangle, XCircle, Search, Plus } from 'lucide-react';
import { SSTResponsibleList } from '../SSTResponsibleList'; 
import { SSTResponsibleForm } from '../SSTResponsibleForm'; 
import { supabase } from '../../SupabaseClient'; 

// 1. COMPONENTE STATCARD ACTUALIZADO: Centrado, interactivo y con indicador de activo
const StatCard = ({ label, value, icon, color, onClick, active }: any) => {
  const themes: any = {
    blue: active ? "border-blue-500 ring-4 ring-blue-50" : "border-gray-100 hover:border-blue-200",
    green: active ? "border-green-500 ring-4 ring-green-50" : "border-gray-100 hover:border-green-200",
    orange: active ? "border-orange-500 ring-4 ring-orange-50" : "border-gray-100 hover:border-orange-200",
    red: active ? "border-red-500 ring-4 ring-red-50" : "border-gray-100 hover:border-red-200"
  };

  const iconThemes: any = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
    red: "bg-red-50 text-red-600"
  };

  const indicatorThemes: any = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    orange: "bg-orange-500",
    red: "bg-red-500"
  };

  return (
    <button 
      onClick={onClick}
      className={`bg-white p-6 rounded-[2rem] border-2 flex flex-col items-center justify-center gap-3 shadow-sm transition-all w-full ${themes[color]} ${active ? 'translate-y-[-4px]' : 'hover:translate-y-[-2px]'}`}
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iconThemes[color]}`}>
        {icon}
      </div>
      <div className="text-center">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="text-3xl font-black text-slate-800">{value}</p>
      </div>
      {active && <div className={`w-8 h-1 rounded-full ${indicatorThemes[color]}`} />}
    </button>
  );
};

export default function ResponsiblesPage() {
  const [responsibles, setResponsibles] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRes, setEditingRes] = useState<any>(null);

  // 2. ESTADO PARA EL FILTRO DE ESTADO DE LICENCIA
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

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

  const stats = useMemo(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    return responsibles.reduce((acc, res) => {
      acc.total++;
      if (res.fecha_ven_licencia) {
        const fechaVto = new Date(res.fecha_ven_licencia);
        if (fechaVto >= hoy) {
          acc.vigentes++;
          const diffDias = (fechaVto.getTime() - hoy.getTime()) / (1000 * 3600 * 24);
          if (diffDias <= 30) acc.proximos++;
        } else {
          acc.vencidos++;
        }
      }
      return acc;
    }, { total: 0, vigentes: 0, vencidos: 0, proximos: 0 });
  }, [responsibles]);

  // 3. LÓGICA DE FILTRADO COMBINADA (BUSCADOR + TARJETAS)
  const filteredData = useMemo(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    return responsibles.filter(res => {
      // Filtro de búsqueda
      const fullSearch = `${res.nombres} ${res.apellidos} ${res.numero_id}`.toLowerCase();
      const matchesSearch = fullSearch.includes(searchTerm.toLowerCase());

      // Filtro de estado de licencia
      let matchesStatus = true;
      if (statusFilter === 'vigentes') {
        matchesStatus = res.fecha_ven_licencia && new Date(res.fecha_ven_licencia) >= hoy;
      } else if (statusFilter === 'proximos') {
        if (!res.fecha_ven_licencia) matchesStatus = false;
        else {
          const vto = new Date(res.fecha_ven_licencia);
          const diff = (vto.getTime() - hoy.getTime()) / (1000 * 3600 * 24);
          matchesStatus = vto >= hoy && diff <= 30;
        }
      } else if (statusFilter === 'vencidos') {
        matchesStatus = res.fecha_ven_licencia && new Date(res.fecha_ven_licencia) < hoy;
      }

      return matchesSearch && matchesStatus;
    });
  }, [responsibles, searchTerm, statusFilter]);

  return (
    <div className="p-8 space-y-6 font-body bg-slate-50/50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4 text-left">
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

      {/* 4. TARJETAS DE ESTADÍSTICAS INTERACTIVAS Y CENTRADAS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          label="Total Responsables" 
          value={stats.total} 
          icon={<Users />} 
          color="blue" 
          active={statusFilter === null}
          onClick={() => setStatusFilter(null)}
        />
        <StatCard 
          label="Licencias Vigentes" 
          value={stats.vigentes} 
          icon={<ShieldCheck />} 
          color="green" 
          active={statusFilter === 'vigentes'}
          onClick={() => setStatusFilter(statusFilter === 'vigentes' ? null : 'vigentes')}
        />
        <StatCard 
          label="Próximos a Vencer" 
          value={stats.proximos} 
          icon={<AlertTriangle />} 
          color="orange" 
          active={statusFilter === 'proximos'}
          onClick={() => setStatusFilter(statusFilter === 'proximos' ? null : 'proximos')}
        />
        <StatCard 
          label="Licencias Vencidas" 
          value={stats.vencidos} 
          icon={<XCircle />} 
          color="red" 
          active={statusFilter === 'vencidos'}
          onClick={() => setStatusFilter(statusFilter === 'vencidos' ? null : 'vencidos')}
        />
      </div>

      {/* BUSCADOR Y FILTRO ACTIVO */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex items-center px-6 gap-4">
          <Search className="text-gray-300" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o número de identificación..."
            className="w-full outline-none font-body text-sm bg-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {statusFilter && (
          <button 
            onClick={() => setStatusFilter(null)}
            className="bg-blue-50 text-blue-600 px-6 py-2 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 border border-blue-100"
          >
            Filtro: {statusFilter} <XCircle size={14} />
          </button>
        )}
      </div>

      {/* TABLA */}
      <SSTResponsibleList 
        responsibles={filteredData} 
        onRefresh={fetchResponsibles}
        onEdit={(res) => { setEditingRes(res); setIsFormOpen(true); }}
      />

      {/* MODAL */}
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