import { Bell, Menu, User, Camera, Plus, Mail, Phone, Lock, Save, X, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabase';

export function TopBar() {
  const { currentRole, sidebarCollapsed, setSidebarCollapsed, addToast } = useApp();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [companyName, setCompanyName] = useState('Cargando...');
  const [userData, setUserData] = useState({ 
    id: '',
    name: '', 
    email: '', 
    phone: '', 
    initial: 'U', 
    photo: null as string | null 
  });

  const roleLabels: Record<string, string> = {
    super_admin: 'Super Administrador',
    company_admin: 'Admin Empresa',
    osh_responsible: 'Responsable SST',
    worker: 'Colaborador'
  };

  useEffect(() => {
    async function getUserData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const name = user.user_metadata?.full_name || 'Usuario';
        // Buscamos la URL de la foto guardada en los metadatos del usuario
        const photoUrl = user.user_metadata?.avatar_url || null;

        setUserData(prev => ({ 
          ...prev, 
          id: user.id,
          name, 
          email: user.email || '', 
          phone: user.user_metadata?.phone || '',
          initial: name.charAt(0).toUpperCase(),
          photo: photoUrl
        }));

        const { data } = await supabase
          .from('companies')
          .select('name')
          .eq('owner_id', user.id)
          .maybeSingle();

        setCompanyName(data?.name || 'Independiente');
      }
    }
    getUserData();
  }, []);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${userData.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // 1. Subir al Bucket de Supabase
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 3. Actualizar metadatos del usuario en Auth
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) throw updateError;

      setUserData(prev => ({ ...prev, photo: publicUrl }));
      addToast({ type: 'success', message: 'Foto de perfil actualizada' });
      
    } catch (error: any) {
      addToast({ type: 'error', message: 'Error al subir: ' + error.message });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
      <div className="h-full px-4 flex items-center justify-between">
        
        {/* LADO IZQUIERDO */}
        <div className="flex items-center gap-4">
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-2 hover:bg-gray-100 rounded-lg lg:hidden">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-3">
            <img src="/img/Triangulos_Mesa de trabajo 1.png" alt="Logo" className="h-10 w-auto" />
            <div className="flex flex-col border-l pl-3 border-gray-100">
              <span className="font-black text-gray-900 leading-none text-base tracking-tight uppercase">Management App</span>
              <span className="text-[9px] text-blue-600 font-bold uppercase tracking-widest mt-0.5">OSH System</span>
            </div>
          </div>
        </div>

        {/* LADO DERECHO */}
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md text-xs font-bold uppercase transition-all active:scale-95">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nueva Actividad</span>
          </button>

          <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500 relative transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          {/* PERFIL (TAMAÑO AUMENTADO) */}
          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="h-12 w-12 rounded-full bg-slate-100 border-2 border-white shadow-lg overflow-hidden flex items-center justify-center hover:scale-105 transition-all"
            >
              {isUploading ? (
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              ) : userData.photo ? (
                <img src={userData.photo} alt="Perfil" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg italic">
                  {userData.initial}
                </div>
              )}
            </button>

            {showProfileMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowProfileMenu(false)} />
                <div className="absolute top-full right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 z-20 overflow-hidden animate-in fade-in zoom-in-95">
                  <div className="p-8 bg-slate-50 flex flex-col items-center text-center">
                    <div className="relative mb-4">
                      {/* Avatar en menú (TAMAÑO XL) */}
                      <div className="h-28 w-28 rounded-full bg-blue-600 border-4 border-white shadow-2xl overflow-hidden flex items-center justify-center">
                        {userData.photo ? (
                          <img src={userData.photo} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-white text-5xl font-black italic">{userData.initial}</span>
                        )}
                      </div>
                      <label className="absolute bottom-0 right-0 p-2.5 bg-blue-600 text-white rounded-full shadow-lg cursor-pointer hover:bg-blue-700 border-2 border-white transition-transform hover:scale-110">
                        <Camera className="w-5 h-5" />
                        <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} disabled={isUploading} />
                      </label>
                    </div>
                    <h4 className="font-black text-gray-900 uppercase text-base leading-tight">{companyName}</h4>
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] mt-1">{roleLabels[currentRole] || currentRole}</span>
                  </div>

                  <div className="p-4">
                    <button 
                      onClick={() => { setShowEditModal(true); setShowProfileMenu(false); }}
                      className="w-full flex items-center gap-4 px-4 py-4 text-gray-700 hover:bg-blue-50 rounded-2xl transition-colors group"
                    >
                      <User className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                      <span className="font-black uppercase tracking-widest text-[10px]">Editar Perfil</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* MODAL DE EDICIÓN (CAMPOS ESPECÍFICOS) */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-black text-gray-900 uppercase tracking-tighter text-xl">Configuración</h3>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-10 space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] ml-1">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="email" defaultValue={userData.email} className="w-full pl-12 pr-4 py-4 bg-gray-100 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-600 outline-none" />
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] ml-1">Teléfono Móvil</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="tel" defaultValue={userData.phone} className="w-full pl-12 pr-4 py-4 bg-gray-100 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-600 outline-none" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] ml-1">Nueva Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="password" placeholder="••••••••••••" className="w-full pl-12 pr-4 py-4 bg-gray-100 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-600 outline-none" />
                </div>
              </div>
            </div>

            <div className="p-8 bg-gray-50 flex gap-4">
              <button onClick={() => setShowEditModal(false)} className="flex-1 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors">Descartar</button>
              <button className="flex-1 py-4 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200 flex items-center justify-center gap-2 transition-transform active:scale-95">
                <Save className="w-4 h-4" /> Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}