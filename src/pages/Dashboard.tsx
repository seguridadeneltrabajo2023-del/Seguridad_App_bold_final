import { useEffect, useState, useCallback } from 'react';
import {
  Filter,
  Plus,
  Upload,
  Bell,
  Calendar,
  Eye,
  Send,
  GraduationCap,
  FileWarning,
  AlertCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { MainContent } from '../components/layout/MainContent';
import { StatusChip } from '../components/common/StatusChip';
import { useApp } from '../contexts/AppContext';
import { supabase } from '../SupabaseClient';

// --- COMPONENTES CONECTADOS ---
import { IncidentDashboard } from '../components/IncidentDashboard';
import { IncidentTable } from '../components/IncidentTable';

// Datos estáticos para las otras secciones
const upcomingActivities = [
  { id: '1', title: 'Monthly Safety Inspection - Building A', date: '2024-01-23', owner: 'John Smith', status: 'pending' as const, site: 'Building A' },
  { id: '2', title: 'Fire Drill Exercise', date: '2024-01-24', owner: 'Sarah Johnson', status: 'pending' as const, site: 'Building B' },
  { id: '3', title: 'PPE Compliance Check', date: '2024-01-25', owner: 'Mike Chen', status: 'overdue' as const, site: 'Building A' },
];

const pendingSignatures = [
  { id: '1', title: 'Fire Safety Training Attendance', requester: 'John Smith', date: '2024-01-20', signaturesNeeded: 12 },
  { id: '2', title: 'Hazard Assessment Sign-off', requester: 'Emma Davis', date: '2024-01-21', signaturesNeeded: 5 },
];

const expiringDocuments = [
  { id: '1', name: 'Forklift Operator License - Mike Chen', expiryDate: '2024-02-05', daysLeft: 15, type: 'license' },
  { id: '2', name: 'First Aid Certification - Sarah Johnson', expiryDate: '2024-02-10', daysLeft: 20, type: 'certification' },
  { id: '3', name: 'Fire Extinguisher Inspection Certificate', expiryDate: '2024-01-30', daysLeft: 9, type: 'inspection' },
];

const complianceData = [
  { week: 'Week 1', value: 82 },
  { week: 'Week 2', value: 85 },
  { week: 'Week 3', value: 83 },
  { week: 'Week 4', value: 87 },
];

const siteData = [
  { site: 'Building A', activities: 45, coverage: 92 },
  { site: 'Building B', activities: 38, coverage: 85 },
  { site: 'Building C', activities: 28, coverage: 78 },
  { site: 'Remote Site', activities: 15, coverage: 65 },
];

export function Dashboard() {
  const { addToast } = useApp();
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState('this-month');
  const [selectedSite, setSelectedSite] = useState('all');

  // --- LÓGICA DEL CEREBRO: ESTADO DE KPIs ---
  const [refreshKey, setRefreshKey] = useState(0);
  const [incidents, setIncidents] = useState<any[]>([]);

  // Función para cargar contadores reales
  const fetchKpiData = useCallback(async () => {
    const { data } = await supabase.from('incident_reports').select('status');
    if (data) setIncidents(data);
  }, []);

  useEffect(() => {
    fetchKpiData();
    
    // Suscripción Realtime para los cuadros superiores
    const channel = supabase
      .channel('kpi-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incident_reports' }, () => {
        fetchKpiData();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchKpiData, refreshKey]);

  // Cálculos dinámicos para los cuadros superiores
  const stats = {
    open: incidents.filter(i => i.status === 'Abierto').length,
    inProgress: incidents.filter(i => i.status === 'En proceso').length,
    closed: incidents.filter(i => i.status === 'Cerrado').length,
  };

  const handleDataChange = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const handleAction = (action: string) => {
    addToast({ type: 'info', message: action });
  };

  return (
    <MainContent
      title="Dashboard"
      subtitle="Executive overview of safety management and compliance"
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-sans"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        
        {/* GRÁFICA MENSUAL */}
        <IncidentDashboard key={`graph-${refreshKey}`} refreshKey={refreshKey} />

        {showFilters && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-sans">Date Range</label>
                <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans">
                  <option value="this-week">This Week</option>
                  <option value="this-month">This Month</option>
                  <option value="last-month">Last Month</option>
                  <option value="this-quarter">This Quarter</option>
                  <option value="this-year">This Year</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-sans">Site</label>
                <select value={selectedSite} onChange={(e) => setSelectedSite(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans">
                  <option value="all">All Sites</option>
                  <option value="building-a">Building A</option>
                  <option value="building-b">Building B</option>
                  <option value="building-c">Building C</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* --- LOS 3 KPIs DEL CEREBRO --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* ABIERTOS */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-left">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <span className="text-[10px] font-black text-red-600 uppercase tracking-widest font-sans">Pendientes</span>
            </div>
            <h3 className="text-sm text-gray-600 mb-2 font-sans">Reportes Abiertos</h3>
            <div className="text-3xl font-bold text-gray-900 font-sans">{stats.open}</div>
          </div>

          {/* EN PROCESO */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-left">
            <div className="flex items-center justify-between mb-4 font-sans">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center font-sans">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest font-sans">Gestión</span>
            </div>
            <h3 className="text-sm text-gray-600 mb-2 font-sans">En Seguimiento</h3>
            <div className="text-3xl font-bold text-gray-900 font-sans">{stats.inProgress}</div>
          </div>

          {/* CERRADOS */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-left">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center font-sans">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest font-sans">Finalizado</span>
            </div>
            <h3 className="text-sm text-gray-600 mb-2 font-sans">Actividades Cerradas</h3>
            <div className="text-3xl font-bold text-gray-900 font-sans">{stats.closed}</div>
          </div>
        </div>

        {/* TABLA DE INCIDENTES */}
        <IncidentTable key={`table-${refreshKey}`} onDataUpdate={handleDataChange} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200"><h2 className="text-lg font-semibold text-gray-900 font-sans">Compliance Trend</h2></div>
            <div className="p-6">
              <div className="h-64 flex items-end justify-between gap-4">
                {complianceData.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="relative w-full bg-gray-100 rounded-t-lg" style={{ height: `${(data.value / 100) * 200}px` }}>
                      <div className="absolute inset-0 bg-blue-500 rounded-t-lg" />
                      <div className="absolute -top-6 left-0 right-0 text-center font-sans"><span className="text-sm font-semibold text-gray-900">{data.value}%</span></div>
                    </div>
                    <span className="text-xs text-gray-600 font-sans">{data.week}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200"><h2 className="text-lg font-semibold text-gray-900 font-sans">Activities by Site</h2></div>
            <div className="p-6">
              <div className="space-y-4">
                {siteData.map((site, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 font-sans">{site.site}</span>
                      <div className="flex items-center gap-3 font-sans"><span className="text-sm text-gray-600">{site.activities} activities</span><span className="text-sm font-semibold text-blue-600">{site.coverage}%</span></div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{ width: `${site.coverage}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 font-sans">Upcoming Activities</h2>
                <button onClick={() => handleAction('Creating new activity')} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors font-sans">
                  <Plus className="w-4 h-4" />New
                </button>
              </div>
              <div className="divide-y divide-gray-200">
                {upcomingActivities.map(activity => (
                  <div key={activity.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-sm font-medium text-gray-900 font-sans">{activity.title}</h3>
                          <StatusChip status={activity.status === 'overdue' ? 'rejected' : 'pending'} label={activity.status} />
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 font-sans">
                          <div className="flex items-center gap-1 font-sans"><Calendar className="w-4 h-4" /><span>{activity.date}</span></div>
                          <span>Owner: {activity.owner}</span><span>Site: {activity.site}</span>
                        </div>
                      </div>
                      <button onClick={() => handleAction(`Viewing ${activity.title}`)} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-sans"><Eye className="w-4 h-4" />View</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200"><h2 className="text-lg font-semibold text-gray-900 font-sans">Pending Signatures</h2></div>
              <div className="divide-y divide-gray-200">
                {pendingSignatures.map(item => (
                  <div key={item.id} className="px-6 py-4">
                    <h3 className="text-sm font-medium text-gray-900 font-sans">{item.title}</h3>
                    <p className="text-xs text-gray-600 mb-3 font-sans">Requested by {item.requester} • {item.date}</p>
                    <div className="flex items-center gap-2 mb-3 font-sans"><Bell className="w-4 h-4 text-orange-500" /><span className="text-sm text-orange-600 font-medium">{item.signaturesNeeded} signatures needed</span></div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleAction(`Opening ${item.title}`)} className="flex-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors font-sans">Open</button>
                      <button onClick={() => handleAction(`Sending reminder for ${item.title}`)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors font-sans"><Send className="w-3 h-3" />Remind</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-red-200">
              <div className="px-6 py-4 border-b border-red-200 bg-red-50">
                <div className="flex items-center gap-2"><FileWarning className="w-5 h-5 text-red-600" /><h2 className="text-lg font-semibold text-red-900 font-sans">Expiring Documents</h2></div>
              </div>
              <div className="divide-y divide-gray-200">
                {expiringDocuments.map(doc => (
                  <div key={doc.id} className="px-6 py-4">
                    <h3 className="text-sm font-medium text-gray-900 font-sans">{doc.name}</h3>
                    <div className="flex items-center justify-between mb-2 font-sans"><span className="text-xs text-gray-600">Expires: {doc.expiryDate}</span><span className={`text-xs font-semibold ${doc.daysLeft <= 10 ? 'text-red-600' : doc.daysLeft <= 20 ? 'text-orange-600' : 'text-yellow-600'}`}>{doc.daysLeft} days left</span></div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5"><div className={`h-1.5 rounded-full ${doc.daysLeft <= 10 ? 'bg-red-600' : doc.daysLeft <= 20 ? 'bg-orange-600' : 'bg-yellow-600'}`} style={{ width: `${Math.max(10, (doc.daysLeft / 30) * 100)}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white text-left font-sans">
          <h3 className="text-lg font-semibold mb-4 font-sans">Acciones Rápidas</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button onClick={() => handleAction('Creating new activity')} className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors font-sans"><Plus className="w-5 h-5" /><span className="text-sm font-medium font-sans">Nueva Actividad</span></button>
            <button onClick={() => handleAction('Creating new training')} className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors font-sans"><GraduationCap className="w-5 h-5" /><span className="text-sm font-medium font-sans">Nueva Capacitación</span></button>
            <button onClick={() => handleAction('Reporting accident')} className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors font-sans"><AlertTriangle className="w-5 h-5" /><span className="text-sm font-medium font-sans">Reportar Alerta</span></button>
            <button onClick={() => handleAction('Uploading evidence')} className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors font-sans"><Upload className="w-5 h-5" /><span className="text-sm font-medium font-sans">Subir Evidencia</span></button>
          </div>
        </div>
      </div>
    </MainContent>
  );
}