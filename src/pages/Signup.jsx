import { useState } from 'react';
// IMPORTACIÓN CORREGIDA: Apuntando al nombre real de tu archivo
import { supabase } from '../lib/supabase'; 
import { Building2, Mail, Lock, User, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function Signup({ onNavigate }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    companyName: '',
    nit: ''
  });

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Crear el usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { full_name: formData.fullName }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No se pudo crear el usuario');

      // 2. Crear la empresa en la tabla 'companies'
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .insert([{ 
            name: formData.companyName, 
            nit: formData.nit 
        }])
        .select()
        .single();

      if (companyError) throw companyError;

      // 3. Crear la membresía (Vincular usuario + empresa)
      const { error: membershipError } = await supabase
        .from('company_memberships')
        .insert([{
          user_id: authData.user.id,
          company_id: companyData.id,
          role: 'admin_empresa'
        }]);

      if (membershipError) throw membershipError;

      alert('¡Registro exitoso! Empresa y Administrador creados.');
      
      // REDIRECCIÓN INTERNA: Usando la función de tu App.tsx
      if (onNavigate) {
        onNavigate('/admin-dashboard');
      }

    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      {/* Botón para volver atrás si el Admin quiere cancelar */}
      <button 
        onClick={() => onNavigate?.('/dashboard')}
        className="mb-4 flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> VOLVER AL PANEL
      </button>

      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-indigo-600 p-6 text-white text-center">
          <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tighter">
            Registro SST SaaS
          </h2>
          <p className="text-indigo-100 text-sm">Alta de nueva empresa en la plataforma</p>
        </div>

        <form onSubmit={handleSignup} className="p-8 space-y-4">
          {/* SECCIÓN EMPRESA */}
          <div className="space-y-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Datos de la Organización</p>
            <div className="relative">
              <Building2 className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Nombre de la Empresa" 
                required 
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                onChange={(e) => setFormData({...formData, companyName: e.target.value})} 
              />
            </div>
            <input 
              type="text" 
              placeholder="NIT (Ej: 900.123.456-1)" 
              required 
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              onChange={(e) => setFormData({...formData, nit: e.target.value})} 
            />
          </div>

          <hr className="border-slate-100" />

          {/* SECCIÓN USUARIO */}
          <div className="space-y-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Datos del Administrador</p>
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Nombre Completo" 
                required 
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                onChange={(e) => setFormData({...formData, fullName: e.target.value})} 
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input 
                type="email" 
                placeholder="Correo electrónico" 
                required 
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input 
                type="password" 
                placeholder="Contraseña segura" 
                required 
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold uppercase tracking-tight hover:bg-indigo-700 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Procesando registro...' : 'Registrar Empresa'}
          </button>
        </form>
      </div>
    </div>
  );
}