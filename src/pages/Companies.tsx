import { useState, useEffect, useMemo } from 'react';
import { 
  Building2, Search, Plus, Edit3, 
  Trash2, Mail, Phone, Calendar, ShieldCheck, 
  Filter, AlertCircle, Loader2, RefreshCw
} from 'lucide-react';
import { supabase } from '../lib/supabase'; 

export function Companies() {
  const [searchTerm, setSearchTerm] = useState('');
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{id: string, name: string} | null>(null);
  const [confirmText, setConfirmText] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: '', id_type: 'NIT', id_number: '', email: '', phone: '', status: 'Activa', subscription_plan: 'Basic'
  });

  const fetchCompanies = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setCompanies(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchCompanies(); }, []);

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const { error } = await supabase.from('companies').insert([newCompany]);
    
    if (!error) {
      fetchCompanies();
      setShowAddModal(false);
      setNewCompany({ name: '', id_type: 'NIT', id_number: '', email: '', phone: '', status: 'Activa', subscription_plan: 'Basic' });
    } else {
      alert("Error: " + error.message);
    }
    setIsSaving(false);
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Activa' ? 'Inactiva' : 'Activa';
    const { error } = await supabase
      .from('companies')
      .update({ status: nextStatus })
      .eq('id', id);
    
    if (!error) fetchCompanies();
  };

  const filteredCompanies = useMemo(() => {
    return companies.filter(c => 
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id_number?.includes(searchTerm)
    );
  }, [searchTerm, companies]);

  const handleDelete = async () => {
    if (confirmText !== deleteConfirm?.name) return;
    const { error } = await supabase.from('companies').delete().eq('id', deleteConfirm.id);
    if (!error) {
      setCompanies(companies.filter(c => c.id !== deleteConfirm.id));
      setDeleteConfirm(null);
      setConfirmText('');
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'activa': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'inactiva': return 'bg-red-50 text-red-700 border-red-100';
      case 'suspendida': return 'bg-amber-50 text-amber-700 border-amber-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50/30 p-6 md:p-8 font-body">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-title font-black text-blue-900 uppercase tracking-tighter leading-none">
            Empresas
          </h1>
          <p className="text-slate-400 text-sm italic font-medium">Panel de administración centralizada</p>
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-[11px] font-black uppercase rounded-2xl hover:bg-blue-700 shadow-lg transition-all"
        >
          <Plus size={16} /> Nueva Empresa
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white p-4 rounded-[2rem] shadow-xl border border-white mb-6 flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o NIT..."
            className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold text-sm outline-none shadow-inner"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:text-blue-600 transition-colors border border-slate-100">
          <Filter size={20} />
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[3rem] shadow-2xl border border-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
                <th className="px-6 py-5 text-left">Empresa</th>
                <th className="px-6 py-5 text-left">ID / Registro</th>
                <th className="px-6 py-5 text-left">Contacto</th>
                <th className="px-6 py-5 text-center">Estado</th>
                <th className="px-6 py-5 text-center">Plan</th>
                <th className="px-6 py-5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={6} className="py-20 text-center font-black text-slate-300 uppercase italic tracking-widest">Sincronizando...</td></tr>
              ) : filteredCompanies.map((company) => (
                <tr key={company.id} className="hover:bg-blue-50/20 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Building2 size={18} />
                      </div>
                      <span className="text-xs font-black text-slate-700 uppercase">{company.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-slate-500">{company.id_type} {company.id_number}</span>
                      <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold">
                        <Calendar size={10} /> {new Date(company.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-[10px] font-bold text-slate-500 flex flex-col gap-1">
                      <div className="flex items-center gap-1.5"><Mail size={12} className="text-blue-400" /> {company.email}</div>
                      <div className="flex items-center gap-1.5"><Phone size={12} className="text-emerald-400" /> {company.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <button 
                      onClick={() => toggleStatus(company.id, company.status)}
                      className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border transition-transform active:scale-95 ${getStatusStyle(company.status)}`}
                    >
                      {company.status}
                    </button>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="inline-flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter">
                      <ShieldCheck size={11} className="text-blue-400" />
                      {company.subscription_plan}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex justify-center gap-2">
                      <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit3 size={16} /></button>
                      <button onClick={() => setDeleteConfirm({id: company.id, name: company.name})} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL ELIMINAR CON FILTRO DE TEXTO */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 font-body">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-xl font-black uppercase text-red-600 mb-4 flex items-center gap-2"><AlertCircle /> Confirmar Eliminación</h3>
            <p className="text-slate-500 text-sm mb-6">Esta acción es irreversible. Escribe <b>{deleteConfirm.name}</b> para continuar:</p>
            <input 
              type="text" 
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-5 py-4 mb-6 font-black outline-none focus:border-red-500 transition-colors"
              placeholder="Nombre de la empresa..."
              onChange={(e) => setConfirmText(e.target.value)}
            />
            <div className="flex gap-3">
              <button onClick={() => {setDeleteConfirm(null); setConfirmText('');}} className="flex-1 py-4 font-black uppercase text-[10px] bg-slate-100 rounded-2xl">Cancelar</button>
              <button 
                onClick={handleDelete} 
                disabled={confirmText !== deleteConfirm.name} 
                className={`flex-1 py-4 font-black uppercase text-[10px] rounded-2xl text-white shadow-lg transition-all ${confirmText === deleteConfirm.name ? 'bg-red-600 hover:bg-red-700' : 'bg-red-200 cursor-not-allowed'}`}
              >
                Eliminar Empresa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AGREGAR EMPRESA */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 font-body">
          <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-2xl font-black text-blue-900 uppercase mb-6 flex items-center gap-3">
              <Building2 className="text-blue-600" /> Registrar Empresa
            </h3>
            <form onSubmit={handleCreateCompany} className="grid grid-cols-2 gap-5">
              <div className="col-span-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Nombre Comercial</label>
                <input required className="w-full bg-slate-50 p-4 rounded-2xl font-bold mt-1 border border-slate-100 outline-none focus:ring-2 focus:ring-blue-500" onChange={e => setNewCompany({...newCompany, name: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Número NIT/ID</label>
                <input required className="w-full bg-slate-50 p-4 rounded-2xl font-bold mt-1 border border-slate-100" onChange={e => setNewCompany({...newCompany, id_number: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Plan Suscripción</label>
                <select className="w-full bg-slate-50 p-4 rounded-2xl font-bold mt-1 border border-slate-100 outline-none" onChange={e => setNewCompany({...newCompany, subscription_plan: e.target.value})}>
                  <option value="Basic">Basic</option>
                  <option value="Pro">Pro</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Correo de Contacto</label>
                <input type="email" required className="w-full bg-slate-50 p-4 rounded-2xl font-bold mt-1 border border-slate-100" onChange={e => setNewCompany({...newCompany, email: e.target.value})} />
              </div>
              <div className="col-span-2 flex gap-3 mt-6">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 font-black uppercase text-[10px] bg-slate-100 rounded-2xl">Cerrar</button>
                <button type="submit" disabled={isSaving} className="flex-1 py-4 font-black uppercase text-[10px] bg-blue-600 text-white rounded-2xl shadow-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-all">
                  {isSaving ? <Loader2 className="animate-spin" size={14} /> : <RefreshCw size={14} />} 
                  {isSaving ? 'Guardando...' : 'Crear Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}