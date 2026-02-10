import { useEffect, useState, useCallback } from 'react';
import {
  Filter,
  Plus,
  Upload,
  LogOut,
  ShieldCheck,
  Building2,
  User as UserIcon,
  AlertCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  GraduationCap
} from 'lucide-react';
import { MainContent } from '../components/layout/MainContent';
import { useApp } from '../contexts/AppContext';
import { supabase } from '../SupabaseClient';

// --- COMPONENTES CONECTADOS ---
import { IncidentDashboard } from '../components/IncidentDashboard';
import { IncidentTable } from '../components/IncidentTable';

// --- INTERFACES PARA TYPESCRIPT ---
interface UserProfile {
  id: string;
  full_name: string;
  role: string;
  user_type: string;
}

interface CompanyData {
  name: string;
  id_number: string;
  risk_level: string;
  employee_count: string | number;
}

interface Incident {
  status: string;
}

export function Dashboard() {
  const { addToast } = useApp();
  
  // --- ESTADOS CON TIPADO ---
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // --- ESTADOS DE UI Y DATOS ---
  const [showFilters, setShowFilters] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [incidents, setIncidents] = useState<Incident[]>([]);

  // 1. RECUPERAR IDENTIDAD Y ROL
  const fetchUserIdentity = useCallback(async () => {
    try {
      setAuthLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profile) setUserProfile(profile as UserProfile);

      const { data: company } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', user.id)
        .single();
      
      if (company) setCompanyData(company as CompanyData);

    } catch (error) {
      console.error('Error recuperando identidad:', error);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // 2. CARGAR KPIs DE INCIDENTES
  const fetchKpiData = useCallback(async () => {
    const { data } = await supabase.from('incident_reports').select('status');
    if (data) setIncidents(data as Incident[]);
  }, []);

  useEffect(() => {
    fetchUserIdentity();
    fetchKpiData();
    
    const channel = supabase
      .channel('kpi-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incident_reports' }, () => {
        fetchKpiData();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchUserIdentity, fetchKpiData, refreshKey]);

  // Cálculos dinámicos
  const stats = {
    open: incidents.filter(i => i.status === 'Abierto').length,
    inProgress: incidents.filter(i => i.status === 'En proceso').length,
    closed: incidents.filter(i => i.status === 'Cerrado').length,
  };

  const handleDataChange = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/signup';
  };

  const handleAction = (action: string) => {
    addToast({ type: 'info', message: action });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <MainContent
      title={`Bienvenido, ${userProfile?.full_name || 'Usuario'}`}
      subtitle={`${userProfile?.role === 'admin_empresa' ? 'Administrador de Empresa' : 'Administrador Independiente'} | ${companyData?.name || 'SST System'}`}
      actions={
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end mr-4">
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">ID Registro</span>
            <span className="text-sm font-mono font-bold text-gray-700">{companyData?.id_number || 'N/A'}</span>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-sans"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button 
            onClick={handleLogout}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
            title="Cerrar Sesión"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        
        {/* --- HEADER DE CONTEXTO --- */}
        <div className="bg-white rounded-xl border border-blue-100 p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                {userProfile?.role === 'admin_empresa' ? <Building2 /> : <UserIcon />}
              </div>
              <div className="text-left">
                <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight">{companyData?.name}</h4>
                <p className="text-xs text-gray-500 font-medium">NIT/ID: {companyData?.id_number}</p>
              </div>
           </div>
           <div className="flex gap-6">
              <div className="text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Riesgo</p>
                <p className="text-sm font-black text-blue-600">Clase {companyData?.risk_level || 'I'}</p>
              </div>
              <div className="text-center border-l border-gray-100 pl-6">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Trabajadores</p>
                <p className="text-sm font-black text-gray-800">{companyData?.employee_count || '1'}</p>
              </div>
           </div>
        </div>

        {/* GRÁFICA MENSUAL */}
        <IncidentDashboard key={`graph-${refreshKey}`} refreshKey={refreshKey} />

        {/* --- KPIs REALTIME --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-left">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Urgente</span>
            </div>
            <h3 className="text-sm text-gray-600 mb-2 font-medium">Incidentes Abiertos</h3>
            <div className="text-3xl font-black text-gray-900">{stats.open}</div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 text-left">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">En Curso</span>
            </div>
            <h3 className="text-sm text-gray-600 mb-2 font-medium">En Seguimiento</h3>
            <div className="text-3xl font-black text-gray-900">{stats.inProgress}</div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 text-left">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Finalizado</span>
            </div>
            <h3 className="text-sm text-gray-600 mb-2 font-medium">Tareas Cerradas</h3>
            <div className="text-3xl font-black text-gray-900">{stats.closed}</div>
          </div>
        </div>

        <IncidentTable key={`table-${refreshKey}`} onDataUpdate={handleDataChange} />

        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white text-left shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div>
              <h3 className="text-xl font-black mb-1">Gestión de Seguridad</h3>
              <p className="text-slate-400 text-sm font-medium">Accesos rápidos para {userProfile?.role === 'admin_empresa' ? 'gestión corporativa' : 'uso independiente'}</p>
            </div>
            <ShieldCheck className="w-12 h-12 text-blue-500 opacity-50" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <button onClick={() => handleAction('Nueva Actividad')} className="flex items-center gap-3 px-4 py-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 group">
              <Plus className="w-5 h-5 text-blue-400 group-hover:scale-110" />
              <span className="text-sm font-bold">Nueva Actividad</span>
            </button>
            <button onClick={() => handleAction('Capacitación')} className="flex items-center gap-3 px-4 py-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 group">
              <GraduationCap className="w-5 h-5 text-emerald-400 group-hover:scale-110" />
              <span className="text-sm font-bold">Capacitación</span>
            </button>
            <button onClick={() => handleAction('Reportar Alerta')} className="flex items-center gap-3 px-4 py-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 group">
              <AlertTriangle className="w-5 h-5 text-red-400 group-hover:scale-110" />
              <span className="text-sm font-bold">Reportar Alerta</span>
            </button>
            <button onClick={() => handleAction('Subir Evidencia')} className="flex items-center gap-3 px-4 py-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 group">
              <Upload className="w-5 h-5 text-amber-400 group-hover:scale-110" />
              <span className="text-sm font-bold">Subir Evidencia</span>
            </button>
          </div>
        </div>
      </div>
    </MainContent>
  );
}