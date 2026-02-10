import { Bell, Menu, X, Loader2, Calendar, AlertTriangle, Save, LogOut, Camera, Mail, Phone, Lock, Settings, ShieldCheck } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabase';

export function TopBar() {
  const { sidebarCollapsed, setSidebarCollapsed, addToast } = useApp();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  const [passwords, setPasswords] = useState({ current: '', new: '' });

  const [userData, setUserData] = useState({ 
    id: '', 
    name: '', 
    email: '', 
    phone: '', 
    initial: 'U', 
    photo: null as string | null, 
    role: '',
    companyName: ''
  });

  const isFetching = useRef(false);

  const fetchNotifications = useCallback(async () => {
    if (isFetching.current) return;
    isFetching.current = true;
    try {
      const [resWorkPlan, resIncidents] = await Promise.all([
        supabase.from('work_plan').select('*'),
        supabase.from('incident_reports').select('*')
      ]);
      let combined: any[] = [];
      if (resWorkPlan.data) {
        const planned = resWorkPlan.data
          .filter((a: any) => (a.status || "").toLowerCase() === 'planeado')
          .map((a: any) => ({ id: `wp-${a.id}`, title: `Actividad: ${a.activity || 'Pendiente'}`, type: 'warning' }));
        combined = [...combined, ...planned];
      }
      if (resIncidents.data) {
        const activeIncs = resIncidents.data
          .filter((i: any) => {
            const s = (i.status || "").toLowerCase();
            return s.includes('abierto') || s.includes('proceso');
          })
          .map((i: any) => ({ id: `inc-${i.id}`, title: `Incidente Activo #${i.id.toString().substring(0,4)}`, type: 'danger' }));
        combined = [...combined, ...activeIncs];
      }
      setNotifications(combined);
    } catch (err) { console.error(err); } finally { isFetching.current = false; }
  }, []);

  const fetchUserIdentity = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    const { data: company } = await supabase.from('companies').select('name, phone').eq('owner_id', user.id).single();
    
    const displayRole = profile?.role === 'admin_empresa' ? 'Superadministrador' : profile?.role === 'admin_independiente' ? 'Administrador Senior' : 'Usuario Sistema';

    setUserData({
      id: user.id,
      name: profile?.full_name || user.user_metadata?.full_name || 'Usuario',
      email: user.email || '',
      phone: profile?.phone || company?.phone || '',
      initial: (profile?.full_name || user.email || 'U').charAt(0).toUpperCase(),
      photo: user.user_metadata?.avatar_url || null,
      role: displayRole,
      companyName: company?.name || 'SST System'
    });
  }, []);

  useEffect(() => {
    fetchUserIdentity();
    fetchNotifications();
  }, [fetchNotifications, fetchUserIdentity]);

  const handleUpdate = async () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowEditModal(false);
      setPasswords({ current: '', new: '' });
      addToast({ type: 'success', message: 'Configuración actualizada' });
    }, 1200);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/signup';
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
      <div className="h-full px-6 flex items-center justify-between">
        
        {/* IZQUIERDA: LOGO */}
        <div className="flex items-center gap-4">
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-2 hover:bg-gray-100 rounded-lg lg:hidden">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-3">
            <img src="/img/Triangulos_Mesa de trabajo 1.png" alt="Logo" className="h-9 w-auto" />
            <div className="flex flex-col border-l pl-3 border-gray-100">
              <span className="font-black text-slate-800 leading-none text-sm uppercase tracking-tighter">SST Management</span>
              <span className="text-[9px] text-blue-600 font-bold uppercase tracking-widest mt-0.5">OSH Digital</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* NOTIFICACIONES */}
          <div className="relative">
            <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 relative">
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                  {notifications.length}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute top-full right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-20 overflow-hidden">
                <div className="p-4 border-b bg-slate-50 flex justify-between items-center text-[10px] font-black uppercase text-slate-400">
                  <span>Alertas Recientes</span>
                  <span className="text-red-500">{notifications.length}</span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className="p-4 border-b flex gap-3 hover:bg-slate-50 transition-colors">
                      {n.type === 'danger' ? <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" /> : <Calendar className="w-4 h-4 text-amber-500 shrink-0" />}
                      <span className="text-xs font-bold text-slate-600">{n.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* PERFIL (FOTO MÁS GRANDE) */}
          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)} 
              className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-base border-2 border-white shadow-lg overflow-hidden hover:scale-110 transition-all active:scale-95"
            >
              {userData.photo ? <img src={userData.photo} className="h-full w-full object-cover" /> : userData.initial}
            </button>
            {showProfileMenu && (
              <div className="absolute top-full right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 z-20 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="p-5 bg-slate-50 border-b flex flex-col items-center">
                  <div className="h-16 w-16 rounded-full bg-blue-600 mb-3 flex items-center justify-center text-white font-black text-2xl border-2 border-white shadow-lg overflow-hidden">
                    {userData.photo ? <img src={userData.photo} className="h-full w-full object-cover" /> : userData.initial}
                  </div>
                  <span className="text-xs font-black text-slate-900 uppercase tracking-tighter">{userData.name}</span>
                  <span className="text-[9px] text-blue-600 font-bold uppercase mt-1 px-2 py-0.5 bg-blue-50 rounded-full">{userData.role}</span>
                  <span className="text-[8px] text-slate-400 font-black uppercase mt-1 tracking-widest">{userData.companyName}</span>
                </div>
                <div className="p-2">
                  <button onClick={() => { setShowEditModal(true); setShowProfileMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-bold text-xs">
                    <Settings className="w-4 h-4 text-slate-400" /> Ajustes de Cuenta
                  </button>
                  <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-bold text-xs">
                    <LogOut className="w-4 h-4" /> Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL AJUSTES */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50 px-8">
              <div className="flex flex-col">
                <h3 className="font-black text-slate-800 uppercase text-sm tracking-tighter">Mi Cuenta</h3>
                <span className="text-[9px] text-blue-600 font-bold uppercase tracking-widest">{userData.companyName}</span>
              </div>
              <button onClick={() => setShowEditModal(false)} className="hover:bg-slate-200 p-2 rounded-full"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="h-32 w-32 rounded-full bg-slate-100 border-4 border-white shadow-xl flex items-center justify-center text-slate-300 font-black text-5xl overflow-hidden">
                    {userData.photo ? <img src={userData.photo} className="h-full w-full object-cover" /> : userData.initial}
                  </div>
                  <label className="absolute bottom-1 right-1 bg-blue-600 p-3 rounded-full text-white cursor-pointer shadow-lg border-4 border-white hover:bg-blue-700 transition-all">
                    <Camera className="w-5 h-5" />
                    <input type="file" className="hidden" accept="image/*" />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                    <Mail className="w-3 h-3" /> Datos de contacto
                  </h4>
                  <div className="space-y-3">
                    <input type="email" value={userData.email} onChange={(e) => setUserData({...userData, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Email" />
                    <div className="relative">
                      <Phone className="absolute right-3 top-3 w-3 h-3 text-slate-300" />
                      <input type="tel" value={userData.phone} onChange={(e) => setUserData({...userData, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Teléfono" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-red-600 uppercase tracking-widest flex items-center gap-2">
                    <Lock className="w-3 h-3" /> Seguridad
                  </h4>
                  <div className="space-y-3">
                    <input type="password" placeholder="Clave actual" value={passwords.current} onChange={(e) => setPasswords({...passwords, current: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-red-500 outline-none" />
                    <input type="password" placeholder="Nueva clave" value={passwords.new} onChange={(e) => setPasswords({...passwords, new: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-red-500 outline-none" />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Nivel de Acceso</p>
                  <p className="text-[10px] font-black text-slate-700 uppercase">{userData.role}</p>
                </div>
              </div>

              <button onClick={handleUpdate} disabled={isSaving} className="w-full py-4 bg-slate-900 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSaving ? 'Actualizando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}