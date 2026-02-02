import { useEffect, useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { supabase } from '../../SupabaseClient'; 
import { ResponsibleStats } from '../ResponsibleStats';
import { SSTResponsibleList } from '../SSTResponsibleList';
import { SSTResponsibleForm } from '../SSTResponsibleForm';

export default function ResponsablesPage() {
  const [responsibles, setResponsibles] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingResponsible, setEditingResponsible] = useState<any>(null);

  // CARGA DE DATOS REAL: Sincroniza el estado desde Supabase
  const loadData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sst_responsibles')
        .select('*') 
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log("Sincronización completa. Datos actuales:", data); 
      setResponsibles(data || []);
    } catch (error: any) {
      console.error("Error en la carga de datos:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    loadData(); 
  }, []);

  const handleAddNew = () => {
    setEditingResponsible(null);
    setShowForm(true);
  };

  const handleEdit = (res: any) => {
    setEditingResponsible(res);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingResponsible(null);
  };

  // Filtrado de búsqueda dinámico
  const filteredResponsibles = responsibles.filter((res: any) =>
    `${res.nombres} ${res.apellidos} ${res.numero_id}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-blue-800 tracking-tight uppercase">Gestión SST - Panel de Control</h1>
          <p className="text-slate-500 text-sm font-medium italic">Base de datos sincronizada correctamente</p>
        </div>
        
        <button 
          onClick={handleAddNew}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:bg-blue-700 hover:scale-105 transition-all flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Añadir Responsable
        </button>
      </div>

      <div className="mb-8">
        <ResponsibleStats responsibles={responsibles} />
      </div>

      <div className="bg-white p-4 rounded-t-2xl border border-b-0 flex gap-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o número de identificación..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="px-4 py-2 border border-gray-100 rounded-xl flex items-center gap-2 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors">
          <Filter className="w-4 h-4" />
          Filtros
        </button>
      </div>

      {loading ? (
        <div className="bg-white p-20 rounded-b-2xl border border-t-0 text-center shadow-sm">
          <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4 shadow-inner"></div>
          <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest">Sincronizando con el servidor...</p>
        </div>
      ) : (
        <SSTResponsibleList 
          responsibles={filteredResponsibles} 
          onRefresh={loadData} // Esto permite que la lista también refresque al eliminar
          onEdit={handleEdit}
        />
      )}

      {/* MODAL DEL FORMULARIO CON REFRESCO FORZADO */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-[999] flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl animate-in fade-in zoom-in duration-300">
            <SSTResponsibleForm 
              onClose={handleCloseForm} 
              initialData={editingResponsible} 
              onCreated={async () => {
                // PRIMERO: Volvemos a pedir los datos a Supabase
                await loadData(); 
                // SEGUNDO: Cerramos el modal solo cuando los datos estén listos
                handleCloseForm(); 
              }} 
            />
          </div>
        </div>
      )}
    </div>
  );
}