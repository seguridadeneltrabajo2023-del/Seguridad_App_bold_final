import { useState, useEffect, useMemo } from 'react';
import { 
  Building2, Search, Plus, Edit3, 
  Trash2, Mail, Phone, Calendar, ShieldCheck, 
  Filter, AlertCircle, Loader2, RefreshCw, X,
  MapPin, Globe, CreditCard, Power
} from 'lucide-react';
import { supabase } from '../lib/supabase'; 

export function Companies() {
  const [searchTerm, setSearchTerm] = useState('');
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{id: string, name: string} | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const initialForm = {
    name: '', id_number: '', email: '', phone: '', 
    address: '', city: '', state: 'Activa', subscription_plan: 'Basic'
  };

  const [newCompany, setNewCompany] = useState(initialForm);

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

  // LÓGICA DE ESTADÍSTICAS EN TIEMPO REAL (SEPARADAS)
  const stats = useMemo(() => {
    return {
      total: companies.length,
      active: companies.filter(c => c.status?.toLowerCase() === 'activa').length,
      inactive: companies.filter(c => c.status?.toLowerCase() === 'inactiva').length,
      premium: companies.filter(c => c.subscription_plan === 'Premium').length,
      standard: companies.filter(c => c.subscription_plan === 'Standard').length,
      basic: companies.filter(c => c.subscription_plan === 'Basic').length,
    };
  }, [companies]);

  const handleEditClick = (company: any) => {
    setEditingCompany({ 
      ...company, 
      state: company.status || 'Activa' 
    });
    setShowEditModal(true);
  };

  const handleUpdateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany?.id) return;
    setIsSaving(true);

    const { error } = await supabase
      .from('companies')
      .update({
        name: editingCompany.name,
        id_number: editingCompany.id_number,
        email: editingCompany.email,
        phone: editingCompany.phone,
        address: editingCompany.address,
        city: editingCompany.city,
        status: editingCompany.state,
        subscription_plan: editingCompany.subscription_plan
      })
      .eq('id', editingCompany.id);

    if (!error) {
      await fetchCompanies();
      setShowEditModal(false);
      setEditingCompany(null);
    } else {
      alert("Error al actualizar: " + error.message);
    }
    setIsSaving(false);
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const { error } = await supabase.from('companies').insert([{
      name: newCompany.name,
      id_number: newCompany.id_number,
      email: newCompany.email,
      phone: newCompany.phone,
      address: newCompany.address,
      city: newCompany.city,
      status: newCompany.state,
      subscription_plan: newCompany.subscription_plan
    }]);

    if (!error) {
      await fetchCompanies();
      setShowAddModal(false);
      setNewCompany(initialForm);
    } else {
      alert("Error al guardar: " + error.message);
    }
    setIsSaving(false);
  };

  const filteredCompanies = useMemo(() => {
    return companies.filter(c => (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, companies]);

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans text-slate-600">
      
      {/* SECCIÓN DE ESTADÍSTICAS - ESTILO MATRIZ (6 COLUMNAS) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border-2 border-blue-500 text-center relative overflow-hidden transition-all">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Total</p>
          <p className="text-3xl font-black text-slate-800">{stats.total}</p>
          <div className="w-8 h-1 bg-blue-600 mx-auto mt-2 rounded-full"></div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 text-center">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Activas</p>
          <p className="text-3xl font-black text-emerald-500">{stats.active}</p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 text-center">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Inactivas</p>
          <p className="text-3xl font-black text-rose-500">{stats.inactive}</p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 text-center">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Premium</p>
          <p className="text-3xl font-black text-purple-600">{stats.premium}</p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 text-center">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Standard</p>
          <p className="text-3xl font-black text-blue-400">{stats.standard}</p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 text-center">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Basic</p>
          <p className="text-3xl font-black text-slate-500">{stats.basic}</p>
        </div>
      </div>

      {/* PANEL PRINCIPAL */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm mb-6 border border-slate-100 relative">
        <div className="flex justify-between items-center mb-8">
          <div className="relative w-full max-w-md flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                type="text"
                placeholder="Buscar razón social..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl outline-none text-sm font-medium uppercase tracking-tight"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-blue-500 transition-colors shadow-sm">
              <Filter size={20} />
            </button>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white p-3 rounded-2xl hover:bg-blue-700 transition-all shadow-lg active:scale-95 flex items-center gap-2 px-6"
          >
            <Plus size={20} />
            <span className="text-[11px] font-black uppercase tracking-widest text-white">Nueva Empresa</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[10px] font-bold uppercase tracking-wider">
            <thead>
              <tr className="text-slate-400 border-b border-slate-50">
                <th className="px-4 py-4 text-left font-black">Razón Social</th>
                <th className="px-4 py-4 text-left font-black">NIT / ID</th>
                <th className="px-4 py-4 text-left font-black">Estado</th>
                <th className="px-4 py-4 text-left font-black">Contacto</th>
                <th className="px-4 py-4 text-left font-black">Registro</th>
                <th className="px-4 py-4 text-left font-black">Plan</th>
                <th className="px-4 py-4 text-center font-black">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={7} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" size={32}/></td></tr>
              ) : filteredCompanies.map((company) => (
                <tr key={company.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-4 py-5 text-slate-700 font-black italic tracking-tight">{company.name}</td>
                  <td className="px-4 py-5 text-slate-400 font-medium italic uppercase tracking-tighter">{company.id_number}</td>
                  <td className="px-4 py-5">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-black uppercase ${
                      company.status === 'Activa' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                    }`}>
                      <Power size={12} /> {company.status}
                    </div>
                  </td>
                  <td className="px-4 py-5 text-slate-400 lowercase font-medium">
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-1 font-medium italic"><Mail size={12} className="text-blue-300"/> {company.email}</span>
                      <span className="flex items-center gap-1 uppercase text-[8px] tracking-widest"><Phone size={12} className="text-emerald-300"/> {company.phone}</span>
                    </div>
                  </td>
                  <td className="px-4 py-5 text-slate-400 font-bold uppercase tracking-tighter">
                    <div className="flex items-center gap-1 text-blue-400">
                      <Calendar size={12}/> {new Date(company.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-4 py-5">
                    <div className="inline-flex items-center gap-1.5 border border-emerald-200 text-emerald-500 px-3 py-1 rounded-full text-[9px] font-black uppercase">
                      <ShieldCheck size={11} /> {company.subscription_plan}
                    </div>
                  </td>
                  <td className="px-4 py-5 text-center">
                    <div className="flex justify-center gap-4 text-slate-300 group-hover:text-slate-400 transition-colors">
                      <button onClick={() => handleEditClick(company)} className="hover:text-yellow-500 transition-colors"><Edit3 size={18} /></button>
                      <button onClick={() => setDeleteConfirm({id: company.id, name: company.name})} className="hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL NUEVA EMPRESA */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-3 italic">
                <Building2 className="text-blue-600" size={24} /> Registrar Empresa
              </h3>
              <button onClick={() => setShowAddModal(false)}><X size={28} className="text-slate-300 hover:text-red-500" /></button>
            </div>
            <form onSubmit={handleCreateCompany} className="grid grid-cols-2 gap-x-6 gap-y-4 text-xs font-bold uppercase">
              <div className="space-y-1">
                <label className="text-slate-400 ml-2">Razón Social</label>
                <input required className="w-full p-3.5 bg-slate-50 rounded-2xl outline-none text-slate-600 font-bold" value={newCompany.name} onChange={e => setNewCompany({...newCompany, name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400 ml-2">NIT / ID</label>
                <input required className="w-full p-3.5 bg-slate-50 rounded-2xl outline-none text-slate-600 font-bold" value={newCompany.id_number} onChange={e => setNewCompany({...newCompany, id_number: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400 ml-2">Correo</label>
                <input type="email" required className="w-full p-3.5 bg-slate-50 rounded-2xl outline-none text-slate-600 font-bold" value={newCompany.email} onChange={e => setNewCompany({...newCompany, email: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400 ml-2">Teléfono</label>
                <input required className="w-full p-3.5 bg-slate-50 rounded-2xl outline-none text-slate-600 font-bold" value={newCompany.phone} onChange={e => setNewCompany({...newCompany, phone: e.target.value})} />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-slate-400 ml-2 flex items-center gap-1"><MapPin size={12}/> Dirección</label>
                <input required className="w-full p-3.5 bg-slate-50 rounded-2xl outline-none text-slate-600 font-bold" value={newCompany.address} onChange={e => setNewCompany({...newCompany, address: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400 ml-2">Ciudad</label>
                <input required className="w-full p-3.5 bg-slate-50 rounded-2xl outline-none text-slate-600 font-bold" value={newCompany.city} onChange={e => setNewCompany({...newCompany, city: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400 ml-2">Estado (Vigencia)</label>
                <select className="w-full p-3.5 bg-slate-50 rounded-2xl outline-none uppercase font-bold text-slate-600" value={newCompany.state} onChange={e => setNewCompany({...newCompany, state: e.target.value})}>
                  <option value="Activa">Activa</option>
                  <option value="Inactiva">Inactiva</option>
                </select>
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-slate-400 ml-2 flex items-center gap-1"><CreditCard size={12}/> Plan</label>
                <select className="w-full p-3.5 bg-slate-50 rounded-2xl outline-none uppercase font-bold text-slate-600" value={newCompany.subscription_plan} onChange={e => setNewCompany({...newCompany, subscription_plan: e.target.value})}>
                  <option value="Basic">Basic</option>
                  <option value="Standard">Standard</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>
              <button disabled={isSaving} className="col-span-2 mt-4 py-5 bg-blue-600 text-white rounded-[2rem] font-black shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                {isSaving ? <Loader2 className="animate-spin" /> : "Guardar Registro"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ACTUALIZAR REGISTRO */}
      {showEditModal && editingCompany && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 relative overflow-hidden border-t-8 border-blue-600">
            <div className="flex justify-between items-center mb-8 font-black uppercase tracking-tighter italic">
              <span className="flex items-center gap-2 text-blue-600 text-xl"><Edit3 size={24}/> Actualizar Registro</span>
              <button onClick={() => setShowEditModal(false)}><X size={28} className="text-slate-300 hover:text-red-500" /></button>
            </div>
            <form onSubmit={handleUpdateCompany} className="grid grid-cols-2 gap-x-6 gap-y-4 text-xs font-bold uppercase">
              <div className="space-y-1 col-span-2">
                <label className="text-slate-400 ml-2">Razón Social</label>
                <input required className="w-full p-3.5 bg-slate-50 rounded-2xl outline-none text-slate-600 font-bold" value={editingCompany.name} onChange={e => setEditingCompany({...editingCompany, name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400 ml-2">NIT / ID</label>
                <input required className="w-full p-3.5 bg-slate-50 rounded-2xl outline-none text-slate-600 font-bold" value={editingCompany.id_number} onChange={e => setEditingCompany({...editingCompany, id_number: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400 ml-2">Estado</label>
                <select className="w-full p-3.5 bg-slate-50 rounded-2xl outline-none uppercase font-bold text-slate-600" value={editingCompany.state} onChange={e => setEditingCompany({...editingCompany, state: e.target.value})}>
                  <option value="Activa">Activa</option>
                  <option value="Inactiva">Inactiva</option>
                </select>
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-slate-400 ml-2 flex items-center gap-1"><CreditCard size={12}/> Plan</label>
                <select className="w-full p-3.5 bg-slate-50 rounded-2xl outline-none uppercase font-bold text-slate-600" value={editingCompany.subscription_plan} onChange={e => setEditingCompany({...editingCompany, subscription_plan: e.target.value})}>
                  <option value="Basic">Basic</option>
                  <option value="Standard">Standard</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>
              <button disabled={isSaving} className="col-span-2 py-5 bg-blue-600 text-white rounded-[2rem] font-black shadow-xl hover:bg-blue-700 transition-all mt-4 tracking-[0.2em]">
                {isSaving ? <RefreshCw className="animate-spin mx-auto" size={20} /> : "Actualizar Registro"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[1000] flex items-center justify-center p-4 text-center">
          <div className="bg-white p-12 rounded-[3.5rem] max-w-md w-full shadow-2xl border-t-8 border-red-500">
            <AlertCircle size={60} className="mx-auto text-red-500 mb-6" />
            <h3 className="text-2xl font-black text-slate-800 uppercase mb-4 tracking-tighter italic">Eliminar Empresa</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase mb-8 leading-relaxed">Escribe <span className="text-red-500">"{deleteConfirm.name}"</span> para borrar.</p>
            <input 
              className="w-full p-5 bg-slate-50 border-2 rounded-2xl mb-8 text-center font-black outline-none focus:border-red-500 transition-all uppercase" 
              value={confirmText} 
              onChange={(e) => setConfirmText(e.target.value)} 
            />
            <div className="flex gap-4">
              <button onClick={() => { setDeleteConfirm(null); setConfirmText(''); }} className="flex-1 py-5 font-black uppercase text-[10px] text-slate-400">Cancelar</button>
              <button 
                onClick={async () => {
                  await supabase.from('companies').delete().eq('id', deleteConfirm.id);
                  fetchCompanies();
                  setDeleteConfirm(null);
                  setConfirmText('');
                }}
                disabled={confirmText !== deleteConfirm.name}
                className={`flex-1 py-5 rounded-3xl font-black text-white uppercase text-[10px] transition-all ${confirmText === deleteConfirm.name ? 'bg-red-600 shadow-xl' : 'bg-red-200'}`}
              >Eliminar</button>
            </div>
          </div>
        </div>
      )}

      <div className="hidden"><Globe /></div>
    </div>
  );
}