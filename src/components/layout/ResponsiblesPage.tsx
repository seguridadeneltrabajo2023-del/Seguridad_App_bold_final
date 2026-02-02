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

  const loadData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sst_responsibles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResponsibles(data || []);
    } catch (error: any) {
      console.error("Error Supabase:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Función para abrir el formulario (Añadir Nuevo)
  const handleAddNew = () => {
    console.log("Abriendo formulario para nuevo registro...");
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

  const filteredResponsibles = responsibles.filter((res: any) =>
    `${res.nombres} ${res.apellidos} ${res.numero_id}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-blue-800 tracking-tight">GESTIÓN SST - PANEL REAL</h1>
          <p className="text-slate-500 text-sm font-medium">Conectado a la tabla: sst_responsibles</p>
        </div>
        
        {/* BOTÓN CORREGIDO */}
        <button 
          onClick={handleAddNew}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2 text-sm z-10"
        >
          <Plus className="w-4 h-4" />
          Añadir Responsable
        </button>
      </div>

      <div className="mb-8">
        <ResponsibleStats responsibles={responsibles} />
      </div>

      <div className="bg-white p-4 rounded-t-2xl border flex gap-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar en la base de datos real..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="px-4 py-2 border rounded-lg flex items-center gap-2 text-sm font-bold text-gray-600 hover:bg-gray-50">
          <Filter className="w-4 h-4" />
          Filtros
        </button>
      </div>

      {loading ? (
        <div className="bg-white p-20 rounded-b-2xl border text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400 font-bold text-xs uppercase">Sincronizando...</p>
        </div>
      ) : (
        <SSTResponsibleList 
          responsibles={filteredResponsibles} 
          onRefresh={loadData} 
          onEdit={handleEdit}
        />
      )}

      {/* MODAL DEL FORMULARIO - Asegúrate de que este bloque exista */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[999] flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden relative">
            <SSTResponsibleForm 
              onClose={handleCloseForm} 
              initialData={editingResponsible} 
              onCreated={() => {
                loadData();
                handleCloseForm();
              }} 
            />
          </div>
        </div>
      )}
    </div>
  );
}