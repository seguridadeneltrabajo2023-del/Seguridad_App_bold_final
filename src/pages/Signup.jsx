import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Building2, Mail, Lock, ShieldCheck, ArrowRight, Phone, CheckCircle2, Users, AlertTriangle } from 'lucide-react';

import logoSST from '../assets/logo-sst.png';

export default function Signup({ onNavigate }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: 'Muy débil', color: 'bg-slate-300', width: '5%' });
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    userType: 'empresa', 
    idType: 'NIT', 
    businessName: '', 
    phone: '',
    employeeCount: '', 
    riskLevel: ''      
  });

  const checks = {
    length: formData.password.length >= 8,
    upper: (formData.password.match(/[A-Z]/g) || []).length >= 2,
    nums: (formData.password.match(/[0-9]/g) || []).length >= 3,
    special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
  };

  useEffect(() => {
    if (isLogin) return;
    let score = 0;
    if (checks.length) score++;
    if (checks.upper) score++;
    if (checks.nums) score++;
    if (checks.special) score++;

    const levels = [
      { label: 'Insegura', color: 'bg-red-500', width: '25%' },
      { label: 'Débil', color: 'bg-orange-500', width: '50%' },
      { label: 'Media', color: 'bg-yellow-500', width: '75%' },
      { label: 'Segura ✨', color: 'bg-emerald-500', width: '100%' }
    ];
    
    setPasswordStrength(levels[score - 1] || { label: 'Muy débil', color: 'bg-slate-300', width: '5%' });
  }, [formData.password, isLogin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        onNavigate('/dashboard');
        
      } else {
        const assignedRole = formData.userType === 'empresa' ? 'admin_empresa' : 'admin_independiente';

        // 1. REGISTRO EN AUTH
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: { 
            data: { 
              full_name: formData.businessName, 
              user_type: formData.userType,
              role: assignedRole
            } 
          }
        });

        if (authError) throw authError;
        const userId = authData?.user?.id;
        if (!userId) throw new Error("No se pudo obtener el ID de usuario");

        // 2. INSERTAR PERFIL (Ignora si ya existe)
        const { error: profileError } = await supabase.from('profiles').insert([{
          id: userId,
          email: formData.email,
          full_name: formData.businessName,
          role: assignedRole,
          user_type: formData.userType
        }]);

        if (profileError && profileError.code !== '23505') {
          throw new Error("Error en perfil: " + profileError.message);
        }

        // 3. INSERTAR EMPRESA (Con todos los campos originales)
        const uniqueId = `SST-${Math.floor(Math.random() * 1000000)}-${Date.now()}`;
        const { error: companyError } = await supabase.from('companies').insert([{
          name: formData.businessName || 'Empresa Nueva',
          id_number: uniqueId,
          id_type: formData.idType,
          email: formData.email,
          phone: formData.phone || "000",
          employee_count: formData.userType === 'empresa' ? formData.employeeCount : '1', // Restaurado
          risk_level: formData.riskLevel || 'I',
          owner_id: userId,
          status: 'Activa'
        }]);

        if (companyError) throw new Error("Error en tabla empresas: " + companyError.message);

        alert('¡Registro completado con éxito! Por favor revisa tu correo.');
        setIsLogin(true);
      }
    } catch (error) {
      alert("Atención: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden">
        <div className="pt-10 pb-6 flex flex-col items-center">
          <img src={logoSST} alt="Logo" className="h-20 mb-4 object-contain" />
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
            {isLogin ? 'Bienvenido' : 'Crear Cuenta'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-10 space-y-4 text-left">
          {!isLogin && (
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl mb-2">
              <button type="button" onClick={() => setFormData({...formData, userType: 'empresa'})}
                className={`py-2 text-[10px] font-black rounded-xl transition-all ${formData.userType === 'empresa' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>
                EMPRESA
              </button>
              <button type="button" onClick={() => setFormData({...formData, userType: 'independiente'})}
                className={`py-2 text-[10px] font-black rounded-xl transition-all ${formData.userType === 'independiente' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>
                INDEPENDIENTE
              </button>
            </div>
          )}

          <div className="space-y-3">
            {!isLogin && (
              <>
                <div className="flex gap-2 text-left">
                  <select className="w-1/3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                    onChange={(e) => setFormData({...formData, idType: e.target.value})}>
                    <option value="NIT">NIT</option>
                    <option value="Cédula">Cédula</option>
                  </select>
                  <input type="text" placeholder={formData.userType === 'empresa' ? "Razón Social" : "Nombre Completo"} required 
                    className="w-2/3 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                    onChange={(e) => setFormData({...formData, businessName: e.target.value})} />
                </div>

                {/* CAMPO RESTAURADO: CANTIDAD DE TRABAJADORES */}
                {formData.userType === 'empresa' && (
                  <div className="relative text-left">
                    <Users className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                    <select 
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none appearance-none"
                      value={formData.employeeCount}
                      onChange={(e) => setFormData({...formData, employeeCount: e.target.value})}
                    >
                      <option value="" disabled>Cantidad de trabajadores</option>
                      <option value="menos de 10 trabajadores">menos de 10 trabajadores</option>
                      <option value="entre 11 y 50">entre 11 y 50</option>
                      <option value="50 o más">50 o más</option>
                    </select>
                  </div>
                )}

                <div className="relative text-left">
                  <AlertTriangle className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                  <select 
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none appearance-none"
                    value={formData.riskLevel}
                    onChange={(e) => setFormData({...formData, riskLevel: e.target.value})}
                  >
                    <option value="" disabled>Nivel de riesgo actividad</option>
                    <option value="I">I (Mínimo)</option>
                    <option value="II">II (Bajo)</option>
                    <option value="III">III (Medio)</option>
                    <option value="IV">IV (Alto)</option>
                    <option value="V">V (Máximo)</option>
                  </select>
                </div>

                <div className="relative text-left">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input type="tel" placeholder="Celular" required className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                    onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                </div>
              </>
            )}

            <input type="email" placeholder="Correo" required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
              onChange={(e) => setFormData({...formData, email: e.target.value})} />
            
            <input type="password" placeholder="Contraseña" required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
              onChange={(e) => setFormData({...formData, password: e.target.value})} />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 active:scale-95 transition-all shadow-lg mt-4">
            {loading ? 'Procesando...' : isLogin ? 'Entrar' : 'Registrar'}
          </button>

          <button type="button" onClick={() => setIsLogin(!isLogin)} className="w-full text-slate-400 text-[10px] font-black uppercase text-center hover:text-indigo-600 transition-colors py-2">
            {isLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}