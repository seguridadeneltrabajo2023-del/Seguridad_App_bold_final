import { useState, useEffect, useMemo } from 'react';
import { 
  Building2, Search, Plus, Edit3, 
  Trash2, Mail, Phone, Calendar, ShieldCheck, 
  Loader2, Save, X
} from 'lucide-react';
import { supabase } from '../../lib/supabase'; 

export function Companies() {
  const [searchTerm, setSearchTerm] = useState('');
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{id: string, name: string} | null>(null);
  const [confirmText, setConfirmText] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: '', 
    id_type: 'NIT', 
    id_number: '', 
    email: '', 
    phone: '', 
    status: 'Activa', 
    subscription_plan: 'Basic'
  });

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCompanies(data || []);
    } catch (err: any) {
      console.error("Error cargando empresas:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCompanies(); }, []);

  // FUNCIÓN DE GUARDADO CORREGIDA CON TUS NUEVAS COLUMNAS
  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Enviamos los nombres de propiedades que coinciden con las columnas de tu DB
      const { error } = await supabase.from('companies').insert([{
        name: newCompany.name,
        id_number: newCompany.id_number,
        id_type: newCompany.id_type,
        email: newCompany.email,
        phone: newCompany.phone,
        status: newCompany.status,
        subscription_plan: newCompany.subscription_plan
      }]);

      if (error) throw error;

      await fetchCompanies(); // Recargar la lista inmediatamente
      setShowAddModal(false); // Cerrar el modal
      
      // Limpiar el formulario
      setNewCompany({ 
        name: '', id_type: 'NIT', id_number: '', 
        email: '', phone: '', status: 'Activa', 
        subscription_plan: 'Basic' 
      });

      alert("Empresa registrada exitosamente.");

    } catch (err: any) {
      alert("Error al guardar en Supabase: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusStyles = (status: string) => {
    const s = status?.toLowerCase() || 'activa';
    if (s === 'activa' || s === 'active') return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (s === 'inactiva' || s === 'inactive') return 'bg-red-50 text-red-600 border-red-100';
    if (s === 'suspendida') return 'bg-amber-50 text-amber-600 border-amber-100';
    return 'bg-slate-50 text-slate-600 border-slate-100';
  };

  const filteredCompanies = useMemo(() => {
    return companies.filter(c => 
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id_number?.includes(searchTerm)
    );
  }, [searchTerm, companies]);

  return (
    <div className="w-full min-h-screen bg-slate-50/30 p-6 md:p-8 font-body">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10 text-left">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg">
              <Building2 className="text-white" size={24} />
            </div>
            <h1 className="text-4xl font-title font-black text-blue-900 uppercase tracking-tighter">
              Empresas
            </h1>
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Administración Global</p>
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white text-[11px] font-black uppercase rounded-[2rem] hover:bg-blue-700 shadow-xl transition-all"
        >
          <Plus size={18} /> Nueva Empresa
        </button>
      </div>

      {/* BUSCADOR */}
      <div className="bg-white p-5 rounded-[2.5rem] shadow-xl border border-white mb-8">
        <div className="relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o identificación..."
            className="w-full pl-14 pr-8 py-5 bg-slate-50 border-none rounded-[1.8rem] focus:ring-2 focus:ring-blue-500 font-bold text-sm outline-none"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-[3rem] shadow-2xl border border-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50/80 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
                <th className="px-6 py-7">Empresa</th>
                <th className="px-6 py-7">Tipo ID</th>
                <th className="px-6 py-7">Número ID</th>
                <th className="px-6 py-7">Celular</th>
                <th className="px-6 py-7">Correo</th>
                <th className="px-6 py-7">Registro</th>
                <th className="px-6 py-7 text-center">Plan</th>
                <th className="px-6 py-7 text-center">Estado</th>
                <th className="px-6 py-7 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && companies.length === 0 ? (
                <tr><td colSpan={9} className="py-24 text-center font-black text-slate-300 uppercase italic animate-pulse">Cargando base de datos...</td></tr>
              ) : filteredCompanies.length === 0 ? (
                <tr><td colSpan={9} className="py-24 text-center text-slate-400 font-bold">No se encontraron empresas registradas.</td></tr>
              ) : filteredCompanies.map((company) => (
                <tr key={company.id} className="hover:bg-blue-50/30 transition-all">
                  <td className="px-6 py-6 text-sm font-black text-slate-800 uppercase leading-none">{company.name}</td>
                  <td className="px-6 py-6 text-[10px] font-bold text-blue-500 uppercase">{company.id_type || 'NIT'}</td>
                  <td className="px-6 py-6 text-[11px] font-bold text-slate-600 uppercase tracking-tighter">{company.id_number}</td>
                  <td className="px-6 py-6 text-[11px] font-bold text-slate-600">
                    <div className="flex items-center gap-2"><Phone size={12} className="text-emerald-400" /> {company.phone || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-6 text-[11px] font-bold text-slate-600 lowercase">
                    <div className="flex items-center gap-2"><Mail size={12} className="text-blue-400" /> {company.email || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-6 text-[10px] font-black text-slate-400">
                    <div className="flex items-center gap-2">
                      <Calendar size={12} className="text-slate-300" /> 
                      {new Date(company.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <div className="inline-flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-xl">
                      <ShieldCheck size={12} className="text-blue-400" />
                      <span className="text-[9px] font-black uppercase">{company.subscription_plan || 'Basic'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <span className={`px-4 py-2 rounded-2xl text-[9px] font-black uppercase border-2 ${getStatusStyles(company.status)}`}>
                      {company.status || 'Activa'}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <div className="flex justify-center gap-2">
                      <button className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-md rounded-xl transition-all"><Edit3 size={16} /></button>
                      <button onClick={() => setDeleteConfirm({id: company.id, name: company.name})} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-white hover:shadow-md rounded-xl transition-all"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL ELIMINAR */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl text-center">
            <h3 className="text-2xl font-black text-red-600 uppercase mb-4 tracking-tighter">Confirmar Eliminación</h3>
            <p className="text-slate-500 text-sm mb-6 font-medium">Escribe <strong>{deleteConfirm.name}</strong> para confirmar:</p>
            <input 
              type="text" 
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-5 py-4 text-center font-black uppercase outline-none focus:border-red-500 mb-8 shadow-inner"
              onChange={(e) => setConfirmText(e.target.value)}
            />
            <div className="flex gap-4">
              <button onClick={() => {setDeleteConfirm(null); setConfirmText('');}} className="flex-1 py-4 font-black uppercase text-[10px] bg-slate-100 rounded-2xl">Cancelar</button>
              <button 
                onClick={async () => {
                  if (confirmText !== deleteConfirm.name) return;
                  await supabase.from('companies').delete().eq('id', deleteConfirm.id);
                  fetchCompanies();
                  setDeleteConfirm(null);
                  setConfirmText('');
                }}
                disabled={confirmText !== deleteConfirm.name}
                className={`flex-1 py-4 font-black uppercase text-[10px] rounded-2xl text-white shadow-xl transition-all ${confirmText === deleteConfirm.name ? 'bg-red-600' : 'bg-red-200 cursor-not-allowed'}`}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AGREGAR */}
      {showAddModal && (
        <div className="fixed inset-0 bg-blue-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 font-body">
          <div className="bg-white w-full max-w-2xl rounded-[3.5rem] p-12 shadow-2xl animate-in slide-in-from-bottom-8">
            <div className="flex justify-between items-center mb-10 text-left">
              <h3 className="text-3xl font-black text-blue-900 uppercase tracking-tighter">Nueva Empresa</h3>
              <button onClick={() => setShowAddModal(false)} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-red-500 transition-colors"><X/></button>
            </div>
            <form onSubmit={handleCreateCompany} className="grid grid-cols-2 gap-6 text-left">
              <div className="col-span-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-3 mb-1 block">Empresa / Razón Social</label>
                <input required className="w-full bg-slate-50 p-5 rounded-2xl font-black text-slate-700 uppercase outline-none border border-transparent focus:border-blue-500" onChange={e => setNewCompany({...newCompany, name: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-3 mb-1 block">Tipo de ID</label>
                <select className="w-full bg-slate-50 p-5 rounded-2xl font-black text-slate-700 outline-none cursor-pointer" onChange={e => setNewCompany({...newCompany, id_type: e.target.value})}>
                  <option value="NIT">NIT</option>
                  <option value="CÉDULA">CÉDULA</option>
                  <option value="ID">EXTRANJERO</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-3 mb-1 block">Número ID</label>
                <input required className="w-full bg-slate-50 p-5 rounded-2xl font-black text-slate-700 outline-none" onChange={e => setNewCompany({...newCompany, id_number: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-3 mb-1 block">Celular Contacto</label>
                <input required className="w-full bg-slate-50 p-5 rounded-2xl font-black text-slate-700 outline-none" onChange={e => setNewCompany({...newCompany, phone: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-3 mb-1 block">Correo Electrónico</label>
                <input type="email" required className="w-full bg-slate-50 p-5 rounded-2xl font-black text-slate-700 outline-none" onChange={e => setNewCompany({...newCompany, email: e.target.value})} />
              </div>
              <div className="col-span-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-3 mb-1 block">Plan</label>
                <select className="w-full bg-slate-50 p-5 rounded-2xl font-black text-slate-700 outline-none" onChange={e => setNewCompany({...newCompany, subscription_plan: e.target.value})}>
                  <option value="Basic">Basic</option>
                  <option value="Pro">Pro</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>
              <div className="col-span-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-3 mb-1 block">Estado Inicial</label>
                <select className="w-full bg-slate-50 p-5 rounded-2xl font-black text-slate-700 outline-none" onChange={e => setNewCompany({...newCompany, status: e.target.value})}>
                  <option value="Activa">Activa</option>
                  <option value="Inactiva">Inactiva</option>
                  <option value="Suspendida">Suspendida</option>
                </select>
              </div>
              <div className="col-span-2 pt-4">
                <button type="submit" disabled={isSaving} className="w-full py-5 bg-blue-600 text-white font-black uppercase text-xs tracking-widest rounded-[1.8rem] shadow-xl shadow-blue-100 flex items-center justify-center gap-3 hover:bg-blue-700 transition-all">
                  {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Guardar Empresa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}