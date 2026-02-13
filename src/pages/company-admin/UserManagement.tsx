import { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Mail, Search, 
  Loader2, Edit3, Trash2, X
} from 'lucide-react'; 
import { supabase } from '../../lib/supabase'; 
import { StatusChip } from '../../components/common/StatusChip';
import { useApp } from '../../contexts/AppContext';

const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  company_admin: 'Admin Empresa',
  osh_responsible: 'Responsable SST',
  worker: 'Empleado',
};

const roleColors: Record<string, string> = {
  super_admin: 'bg-red-100 text-red-700',
  company_admin: 'bg-blue-100 text-blue-700',
  osh_responsible: 'bg-emerald-100 text-emerald-700',
  worker: 'bg-slate-100 text-slate-700',
};

export function UserManagement() {
  const { addToast } = useApp();
  const [users, setUsers] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const initialForm = {
    full_name: '',
    email: '',
    role: 'worker',
    company_id: '',
    status: 'active',
    job_title: ''
  };
  const [newUser, setNewUser] = useState(initialForm);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, companiesRes] = await Promise.all([
        supabase.from('profiles').select('*, companies(name)').order('full_name'),
        supabase.from('companies').select('id, name').eq('status', 'Activa')
      ]);

      if (usersRes.data) setUsers(usersRes.data);
      if (companiesRes.data) setCompanies(companiesRes.data);
    } catch (error: any) {
      addToast({ type: 'error', message: 'Error al conectar con el servidor' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length,
    admins: users.filter(u => u.role?.includes('admin')).length,
  }), [users]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, users]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const { error } = await supabase.from('profiles').insert([newUser]);
    
    if (!error) {
      addToast({ type: 'success', message: 'Usuario registrado correctamente' });
      fetchData();
      setShowAddModal(false);
      setNewUser(initialForm);
    } else {
      addToast({ type: 'error', message: error.message });
    }
    setIsSaving(false);
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans text-slate-600">
      
      {/* KPI CARDS - ESTILO MATRIZ */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border-2 border-blue-500 text-center relative overflow-hidden">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Total Usuarios</p>
          <p className="text-4xl font-black text-slate-800">{stats.total}</p>
          <div className="w-10 h-1.5 bg-blue-600 mx-auto mt-3 rounded-full"></div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 text-center">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Activos</p>
          <p className="text-4xl font-black text-emerald-500">{stats.active}</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 text-center">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Inactivos</p>
          <p className="text-4xl font-black text-rose-500">{stats.inactive}</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 text-center">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Admins</p>
          <p className="text-4xl font-black text-purple-600">{stats.admins}</p>
        </div>
      </div>

      {/* PANEL DE TABLA */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative">
        <div className="flex justify-between items-center mb-8">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl outline-none text-sm font-medium uppercase tracking-tighter"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-blue-700 transition-all shadow-lg active:scale-95"
          >
            <Plus size={18} /> Nuevo Usuario
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[10px] font-bold uppercase tracking-wider">
            <thead>
              <tr className="text-slate-400 border-b border-slate-50">
                <th className="px-6 py-4 text-left font-black">Usuario</th>
                <th className="px-6 py-4 text-left font-black">Rol</th>
                <th className="px-4 py-4 text-left font-black">Empresa / Cargo</th>
                <th className="px-6 py-4 text-left font-black">Estado</th>
                <th className="px-6 py-4 text-right font-black">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" size={32}/></td></tr>
              ) : filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-black text-xs shadow-inner uppercase">
                        {user.full_name?.split(' ').map((n: any) => n[0]).join('').substring(0, 2)}
                      </div>
                      <div>
                        <div className="text-slate-700 font-black italic">{user.full_name}</div>
                        <div className="text-[9px] text-slate-400 lowercase font-medium flex items-center gap-1">
                          <Mail size={10} /> {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black ${roleColors[user.role] || 'bg-gray-100 text-gray-600'}`}>
                      {roleLabels[user.role] || user.role}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-400">
                    <div className="font-bold text-blue-400">{user.companies?.name || 'Sín Empresa'}</div>
                    <div className="text-[9px] italic uppercase">{user.job_title || 'Colaborador'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusChip status={user.status === 'active' ? 'active' : 'inactive'} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3 text-slate-300 group-hover:text-slate-400 transition-colors">
                      <button className="hover:text-blue-500"><Edit3 size={16} /></button>
                      <button className="hover:text-red-600"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL NUEVO USUARIO */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-3 italic">
                <Plus className="text-blue-600" size={24} /> Registrar Usuario
              </h3>
              <button onClick={() => setShowAddModal(false)}><X size={28} className="text-slate-300 hover:text-red-500" /></button>
            </div>
            <form onSubmit={handleCreateUser} className="grid grid-cols-2 gap-x-6 gap-y-4 text-xs font-bold uppercase">
              <div className="space-y-1">
                <label className="text-slate-400 ml-2">Nombre Completo</label>
                <input required className="w-full p-3.5 bg-slate-50 rounded-2xl outline-none text-slate-600 font-bold" value={newUser.full_name} onChange={e => setNewUser({...newUser, full_name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400 ml-2">Email Corporativo</label>
                <input required type="email" className="w-full p-3.5 bg-slate-50 rounded-2xl outline-none text-slate-600 font-bold" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400 ml-2">Asignar Empresa</label>
                <select required className="w-full p-3.5 bg-slate-50 rounded-2xl outline-none uppercase font-bold text-slate-600" value={newUser.company_id} onChange={e => setNewUser({...newUser, company_id: e.target.value})}>
                  <option value="">Seleccionar...</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-slate-400 ml-2">Cargo / Título</label>
                <input className="w-full p-3.5 bg-slate-50 rounded-2xl outline-none text-slate-600 font-bold" value={newUser.job_title} onChange={e => setNewUser({...newUser, job_title: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400 ml-2">Rol</label>
                <select className="w-full p-3.5 bg-slate-50 rounded-2xl outline-none uppercase font-bold text-slate-600" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                  <option value="worker">Empleado</option>
                  <option value="osh_responsible">Responsable SST</option>
                  <option value="company_admin">Admin Empresa</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-slate-400 ml-2">Estado</label>
                <select className="w-full p-3.5 bg-slate-50 rounded-2xl outline-none uppercase font-bold text-slate-600" value={newUser.status} onChange={e => setNewUser({...newUser, status: e.target.value})}>
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>
              <button disabled={isSaving} className="col-span-2 mt-4 py-5 bg-blue-600 text-white rounded-[2rem] font-black shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 uppercase tracking-widest">
                {isSaving ? <Loader2 className="animate-spin" /> : "Crear Perfil de Usuario"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}