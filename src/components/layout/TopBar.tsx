import { Bell, Menu, User, X, Loader2, Calendar, AlertTriangle, Save, LogOut } from 'lucide-react'; // Eliminado 'Camera'
import { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabase';

export function TopBar() {
  const { sidebarCollapsed, setSidebarCollapsed, addToast } = useApp(); // Eliminado 'currentRole'
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  const [userData, setUserData] = useState({ 
    id: '', name: '', email: '', phone: '', initial: 'U', photo: null as string | null, role: '' 
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
          .filter((a: any) => {
            const s = (a.status || a.state || "").toString().trim().toLowerCase();
            return s === 'planeado';
          })
          .map((a: any) => ({
            id: `wp-${a.id}`,
            title: `Pendiente: ${a.activity || a.description || 'Actividad'}`,
            type: 'warning'
          }));
        combined = [...combined, ...planned];
      }

      if (resIncidents.data) {
        const activeIncs = resIncidents.data
          .filter((i: any) => {
            const s = (i.status || i.state || "").toString().trim().toLowerCase();
            return s.includes('abierto') || s.includes('proceso');
          })
          .map((i: any) => ({
            id: `inc-${i.id}`,
            title: `Caso Activo: #${i.id.toString().substring(0,4)}`,
            type: 'danger'
          }));
        combined = [...combined, ...activeIncs];
      }

      setNotifications(combined);
    } catch (err) {
      console.error("❌ Error en campana:", err);
    } finally {
      isFetching.current = false;
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const channel = supabase.channel('topbar-realtime-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'work_plan' }, () => fetchNotifications())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incident_reports' }, () => fetchNotifications())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchNotifications]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const role = user.user_metadata?.role;
        setUserData({
          id: user.id,
          name: user.user_metadata?.full_name || 'Super Administrador',
          email: user.email || '',
          phone: role === 'superadmin' ? "⭐ MODO SUPERADMIN" : (user.user_metadata?.phone || ''),
          initial: (user.user_metadata?.full_name || user.email || 'U').charAt(0).toUpperCase(),
          photo: user.user_metadata?.avatar_url || null,
          role: role || ''
        });
      }
    });
  }, []);

  const handleUpdate = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowEditModal(false);
      addToast({ type: 'success', message: 'Datos actualizados' });
    }, 800);
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      addToast({ type: 'error', message: 'Error al cerrar sesión' });
    } else {
      window.location.reload();
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 font-body">
      <div className="h-full px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-2 hover:bg-gray-100 rounded-lg lg:hidden">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-3">
            <img src="/img/Triangulos_Mesa de trabajo 1.png" alt="Logo" className="h-10 w-auto" />
            <div className="flex flex-col border-l pl-3 border-gray-100">
              <span className="font-black text-gray-900 leading-none text-base uppercase tracking-tighter">Management App</span>
              <span className="text-[9px] text-blue-600 font-bold uppercase tracking-widest mt-0.5 font-title">OSH System</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 relative transition-transform active:scale-90">
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full border-2 border-white animate-pulse">
                  {notifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
                <div className="absolute top-full right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-20 overflow-hidden">
                  <div className="p-4 border-b bg-gray-50 flex justify-between items-center font-black text-[10px] uppercase text-gray-400 tracking-widest">
                    <span>Notificaciones</span>
                    <span className="text-red-600 font-bold">{notifications.length} Alertas</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto italic text-xs">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-400 uppercase font-bold">Todo al día</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="p-4 border-b last:border-0 flex gap-3 hover:bg-slate-50 transition-colors">
                          {n.type === 'danger' ? <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" /> : <Calendar className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
                          <span className="text-xs font-bold text-gray-700">{n.title}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="relative">
            <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="h-10 w-10 rounded-full bg-slate-100 border-2 border-white shadow-md overflow-hidden flex items-center justify-center hover:scale-105 transition-all">
              {userData.photo ? <img src={userData.photo} className="h-full w-full object-cover" alt="Profile" /> : <div className="h-full w-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm italic uppercase">{userData.initial}</div>}
            </button>
            {showProfileMenu && (
              <div className="absolute top-full right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 z-20 overflow-hidden">
                <div className="p-6 bg-slate-50 flex flex-col items-center text-center">
                  <div className="h-20 w-20 rounded-full bg-blue-600 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden mb-3 text-white text-3xl font-black italic uppercase">
                    {userData.photo ? <img src={userData.photo} className="h-full w-full object-cover" alt="Avatar" /> : userData.initial}
                  </div>
                  <h4 className="font-black text-gray-900 uppercase text-sm leading-tight">{userData.name}</h4>
                  <p className="text-[10px] text-blue-600 font-black uppercase mt-1 tracking-tighter">{userData.phone}</p>
                  
                  <div className="w-full mt-4 space-y-2">
                    <button onClick={() => { setShowEditModal(true); setShowProfileMenu(false); }} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-700 hover:bg-blue-50 rounded-xl transition-colors font-black uppercase text-[10px] shadow-sm">
                      <User className="w-3.5 h-3.5" /> Mi Perfil
                    </button>
                    <button onClick={handleSignOut} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 rounded-xl transition-colors font-black uppercase text-[10px] shadow-sm">
                      <LogOut className="w-3.5 h-3.5" /> Cerrar Sesión
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
              <h3 className="font-black text-gray-900 uppercase text-lg">Configuración</h3>
              <button onClick={() => setShowEditModal(false)} className="hover:bg-gray-200 p-2 rounded-full transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-8">
              <div className="space-y-4 text-left bg-gray-50 p-6 rounded-3xl mb-6 border border-gray-100">
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Nombre</span>
                  <p className="font-bold text-gray-700">{userData.name}</p>
                </div>
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Acceso</span>
                  <p className="font-bold text-blue-600 uppercase tracking-tighter">
                    {userData.role === 'superadmin' ? 'Super Administrador' : 'Usuario Estándar'}
                  </p>
                </div>
              </div>
              <button onClick={handleUpdate} disabled={isSaving} className="w-full py-4 bg-blue-600 text-white font-black uppercase rounded-2xl shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}