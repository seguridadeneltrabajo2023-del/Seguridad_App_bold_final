import { useEffect, useState } from 'react';
import { MainContent } from '../components/layout/MainContent';
import { Building2, Users, ShieldCheck, Plus } from 'lucide-react';

// Importación corregida según el nombre real de tu archivo
import { supabase } from '../lib/supabase'; 

interface AdminDashboardProps {
  onNavigate?: (path: string) => void;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [stats, setStats] = useState({ companies: 0, users: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getStats() {
      try {
        // Contar empresas registradas
        const { count: compCount } = await supabase
          .from('companies')
          .select('*', { count: 'exact', head: true });
        
        // Contar perfiles de usuario
        const { count: userCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        setStats({ 
          companies: compCount || 0, 
          users: userCount || 0 
        });
      } catch (err) {
        console.error("Error cargando estadísticas de administración:", err);
      } finally {
        setLoading(false);
      }
    }
    getStats();
  }, []);

  return (
    <MainContent
      title="Panel de Control Global"
      subtitle="Administración de la plataforma SaaS SST"
      breadcrumbs={[{ label: 'Inicio', path: '/dashboard' }, { label: 'Admin Dashboard' }]}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card Empresas */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-100 p-3 rounded-lg text-indigo-600">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Empresas</p>
              <p className="text-2xl font-bold text-slate-900">{loading ? '...' : stats.companies}</p>
            </div>
          </div>
        </div>

        {/* Card Usuarios */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-100 p-3 rounded-lg text-emerald-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Usuarios Totales</p>
              <p className="text-2xl font-bold text-slate-900">{loading ? '...' : stats.users}</p>
            </div>
          </div>
        </div>

        {/* Card Acceso Rápido - BOTÓN HACIA SIGNUP */}
        <div className="bg-indigo-600 p-6 rounded-xl shadow-lg text-white group cursor-default">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold">Nueva Empresa</p>
              <p className="text-xs text-indigo-100">Registrar cliente manualmente</p>
            </div>
            <button 
              onClick={() => onNavigate?.('/signup')}
              className="bg-white/20 hover:bg-white/40 p-2 rounded-full transition-all active:scale-90"
              title="Ir a Registro"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
        <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
          <ShieldCheck className="w-10 h-10 text-indigo-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-700">Módulo de Super Administrador</h3>
        <p className="text-slate-500 max-w-sm mx-auto text-sm">
          Como Super Admin de la plataforma, tienes acceso a la base de datos global. Puedes monitorear el crecimiento de las empresas registradas y gestionar sus configuraciones.
        </p>
      </div>
    </MainContent>
  );
}