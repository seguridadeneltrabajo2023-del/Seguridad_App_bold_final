import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Building2, Mail, Lock, ShieldCheck, ArrowRight, Phone, CheckCircle2, Users, AlertTriangle } from 'lucide-react';

import logoSST from '../assets/logo-sst.png';

export default function AuthPage({ onNavigate }) {
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
    employeeCount: '', // Cambiado a vacío para que no predetermine
    riskLevel: ''      // Cambiado a vacío para que no predetermine
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
    
    // Validación manual de que seleccionaron las opciones
    if (!isLogin) {
        if (formData.userType === 'empresa' && !formData.employeeCount) {
            alert("Por favor selecciona la cantidad de trabajadores");
            return;
        }
        if (!formData.riskLevel) {
            alert("Por favor selecciona el nivel de riesgo");
            return;
        }
    }

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
        if (passwordStrength.width !== '100%') {
          throw new Error('La contraseña debe cumplir todos los requisitos de seguridad.');
        }

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: { 
            data: { 
              full_name: formData.businessName, 
              user_type: formData.userType,
              employee_count: formData.employeeCount,
              risk_level: formData.riskLevel
            } 
          }
        });

        if (authError) throw authError;

        const { error: companyError } = await supabase.from('companies').insert([{
          name: formData.businessName,
          nit: formData.idType + ": " + formData.businessName,
          phone: formData.phone,
          employee_count: formData.userType === 'empresa' ? formData.employeeCount : '1',
          risk_level: formData.riskLevel,
          owner_id: authData.user.id
        }]);

        if (companyError) throw companyError;
        alert('Cuenta registrada. Por favor verifica tu correo.');
        setIsLogin(true);
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden transition-all duration-500">
        
        <div className="pt-10 pb-6 flex flex-col items-center bg-white">
          <div className="flex items-center justify-center w-full px-8 h-24 mb-4">
            <img 
              src={logoSST} 
              alt="Logo Sistema SST" 
              className="max-h-full w-auto object-contain"
              onError={(e) => { e.target.style.display = 'none'; }} 
            />
          </div>
          <div className="h-1.5 w-10 bg-indigo-600 rounded-full mb-4"></div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter text-center">
            {isLogin ? 'Bienvenido' : 'Crear Cuenta'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-10 space-y-4">
          {!isLogin && (
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl mb-4">
              <button type="button" onClick={() => setFormData({...formData, userType: 'empresa', employeeCount: ''})}
                className={`py-2 text-[10px] font-black rounded-xl transition-all ${formData.userType === 'empresa' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>
                EMPRESA
              </button>
              <button type="button" onClick={() => setFormData({...formData, userType: 'independiente', employeeCount: '1'})}
                className={`py-2 text-[10px] font-black rounded-xl transition-all ${formData.userType === 'independiente' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>
                INDEPENDIENTE
              </button>
            </div>
          )}

          <div className="space-y-3">
            {!isLogin && (
              <>
                <div className="flex gap-2">
                  <select 
                    className="w-1/3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                    onChange={(e) => setFormData({...formData, idType: e.target.value})}
                  >
                    <option value="NIT">NIT</option>
                    <option value="Cédula">Cédula</option>
                  </select>
                  <input type="text" placeholder={formData.userType === 'empresa' ? "Razón Social" : "Nombre Completo"} required className="w-2/3 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    onChange={(e) => setFormData({...formData, businessName: e.target.value})} />
                </div>

                {/* Cantidad de empleados (Solo Empresa) */}
                {formData.userType === 'empresa' && (
                  <div className="relative">
                    <Users className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                    <select 
                      required
                      className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 appearance-none ${!formData.employeeCount ? 'text-slate-400' : 'text-slate-900'}`}
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

                {/* Nivel de Riesgo (Ambos) */}
                <div className="relative">
                  <AlertTriangle className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                  <select 
                    required
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 appearance-none ${!formData.riskLevel ? 'text-slate-400' : 'text-slate-900'}`}
                    value={formData.riskLevel}
                    onChange={(e) => setFormData({...formData, riskLevel: e.target.value})}
                  >
                    <option value="" disabled>Nivel de riesgo actividad económica</option>
                    <option value="I">I (Riesgo Mínimo)</option>
                    <option value="II">II (Riesgo Bajo)</option>
                    <option value="III">III (Riesgo Medio)</option>
                    <option value="IV">IV (Riesgo Alto)</option>
                    <option value="V">V (Riesgo Máximo)</option>
                  </select>
                </div>

                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input type="tel" placeholder="Celular de contacto" required className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                </div>
              </>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input type="email" placeholder="Correo electrónico" required className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input type="password" placeholder="Contraseña" required className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                onChange={(e) => setFormData({...formData, password: e.target.value})} />
            </div>

            {!isLogin && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <span>Seguridad: {passwordStrength.label}</span>
                  <span className={passwordStrength.width === '100%' ? 'text-emerald-500' : ''}>
                    {passwordStrength.width === '100%' ? '¡LISTO!' : 'REQUERIDO'}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-500 ${passwordStrength.color}`} style={{ width: passwordStrength.width }}></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Badge label="8+ Caract." active={checks.length} />
                  <Badge label="2+ Mayúsc." active={checks.upper} />
                  <Badge label="3+ Números" active={checks.nums} />
                  <Badge label="1 Especial" active={checks.special} />
                </div>
              </div>
            )}
          </div>

          <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 mt-2">
            {loading ? 'Cargando...' : isLogin ? 'Entrar' : 'Registrar'}
            <ArrowRight className="w-4 h-4" />
          </button>

          <button type="button" onClick={() => setIsLogin(!isLogin)} className="w-full text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-indigo-600 transition-colors text-center">
            {isLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Badge({ label, active }) {
  return (
    <div className={`flex items-center gap-1 text-[8px] font-bold uppercase tracking-tighter ${active ? 'text-emerald-600' : 'text-slate-400'}`}>
      <CheckCircle2 className={`w-3 h-3 ${active ? 'fill-emerald-100' : 'opacity-20'}`} />
      {label}
    </div>
  );
}