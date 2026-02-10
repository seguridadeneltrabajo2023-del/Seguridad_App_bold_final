import { useState } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { ListPage } from './pages/ListPage';
import { DetailPage } from './pages/DetailPage';
import { OSHDashboard } from './pages/OSHDashboard';
import { Companies } from './pages/super-admin/Companies';
import { Templates } from './pages/super-admin/Templates';
import { UserManagement } from './pages/company-admin/UserManagement';
import { OrgStructure } from './pages/company-admin/OrgStructure';
import { WorkerHome } from './pages/worker/WorkerHome';
import { PermissionsMatrix } from './pages/PermissionsMatrix';
import { WorkPlan } from './pages/workplan/WorkPlan';
import { ActivityDetail } from './pages/workplan/ActivityDetail';
import { HazardMatrix } from './pages/hazard/HazardMatrix';
import { HazardDetail } from './pages/hazard/HazardDetail';
import { HazardCatalog } from './pages/hazard/HazardCatalog';
import { AccidentList } from './pages/accidents/AccidentList';
import { ReportAccident } from './pages/accidents/ReportAccident';
import { AccidentDetail } from './pages/accidents/AccidentDetail';
import { AccidentClassifications } from './pages/accidents/AccidentClassifications';
import { TrainingList } from './pages/training/TrainingList';
import { CreateTraining } from './pages/training/CreateTraining';
import { TrainingDetail } from './pages/training/TrainingDetail';
import { AccessDenied } from './components/common/AccessDenied';
import { RoleSwitcher } from './components/common/RoleSwitcher';

// --- IMPORTACIONES CON IGNORE PARA EVITAR ERRORES DE TIPADO ---
// @ts-ignore
import Signup from './pages/signup'; 
// @ts-ignore
import { AdminDashboard } from './pages/AdminDashboard'; 
import ResponsablesPage from './components/layout/ResponsiblesPage';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<string>('/signup');
  const { currentRole } = useApp();

  // --- NORMALIZACIÓN DEL ROL ---
  const normalizedRole = currentRole?.replace('_', '').toLowerCase();
  const isSuperAdmin = normalizedRole === 'superadmin';

  const handleNavigate = (path: string) => {
    setCurrentPage(path);
  };

  const hasAccess = (path: string): boolean => {
    // --- 🚨 MODIFICACIÓN DE EMERGENCIA PARA TU USUARIO 🚨 ---
    const sessionStr = localStorage.getItem('sb-rtezouotyomzmmwevbpz-auth-token');
    if (sessionStr && sessionStr.includes('seguridadeneltrabajo2023@gmail.com')) {
      return true; // Acceso total garantizado para tu correo
    }

    // Si eres Super Admin por rol, tienes acceso a TODO.
    if (isSuperAdmin) return true;

    const accessMap: Record<string, string[]> = {
      '/companies': ['super_admin'],
      '/templates': ['super_admin'],
      '/admin-dashboard': ['super_admin'],
      '/users': ['company_admin'],
      '/org-structure': ['company_admin'],
      '/workplan': ['company_admin', 'osh_responsible'],
      '/hazard': ['company_admin', 'osh_responsible'],
      '/hazard/catalog': ['super_admin', 'company_admin'],
      '/accidents': ['company_admin', 'osh_responsible'],
      '/accidents/classifications': ['super_admin', 'company_admin'],
      '/training': ['company_admin', 'osh_responsible'],
      '/evidence': ['company_admin', 'osh_responsible'],
      '/reports': ['super_admin', 'company_admin', 'osh_responsible'],
      '/responsible': ['company_admin', 'osh_responsible'],
      '/permissions': ['super_admin', 'company_admin'],
    };

    const allowedRoles = accessMap[path];
    if (!allowedRoles) return true;
    
    return allowedRoles.some(role => role.replace('_', '').toLowerCase() === normalizedRole);
  };

  const renderPage = () => {
    if (currentPage === '/signup') return <Signup onNavigate={handleNavigate} />;

    if (!hasAccess(currentPage)) {
      return <AccessDenied onBack={() => setCurrentPage('/dashboard')} />;
    }

    switch (currentPage) {
      case '/dashboard':
        // Forzamos el Dashboard de Admin si eres tú
        if (isSuperAdmin || localStorage.getItem('sb-rtezouotyomzmmwevbpz-auth-token')?.includes('seguridadeneltrabajo2023@gmail.com')) {
          return <AdminDashboard onNavigate={handleNavigate} />;
        }
        if (currentRole === 'worker') return <WorkerHome />;
        if (currentRole === 'osh_responsible') return <OSHDashboard />;
        return <Dashboard />;

      case '/admin-dashboard': return <AdminDashboard onNavigate={handleNavigate} />;
      case '/signup': return <Signup onNavigate={handleNavigate} />;
      case '/companies': return <Companies />;
      case '/templates': return <Templates />;
      case '/users': return <UserManagement />;
      case '/org-structure': return <OrgStructure />;
      case '/workplan': return <WorkPlan />;
      case '/workplan/activity': return <ActivityDetail />;
      case '/hazard': return <HazardMatrix />;
      case '/hazard/detail': return <HazardDetail />;
      case '/hazard/catalog': return <HazardCatalog />;
      case '/accidents': return <AccidentList />;
      case '/accidents/report': return <ReportAccident />;
      case '/accidents/detail': return <AccidentDetail />;
      case '/accidents/classifications': return <AccidentClassifications />;
      case '/training': return <TrainingList />;
      case '/training/create': return <CreateTraining />;
      case '/training/detail': return <TrainingDetail />;
      case '/evidence': return <ListPage />;

      case '/responsible':
      case '/responsible/new':
      case '/responsible/detail':
        return <ResponsablesPage />;

      case '/reports': return <ListPage />;
      case '/permissions': return <PermissionsMatrix />;
      case '/activity-detail': return <DetailPage />;

      default:
        return <Dashboard />;
    }
  };

  const isAuthPage = currentPage === '/signup';

  if (isAuthPage) {
    return <Signup onNavigate={handleNavigate} />;
  }

  return (
    <>
      <AppLayout currentPath={currentPage} onNavigate={handleNavigate}>
        {renderPage()}
      </AppLayout>
      <RoleSwitcher />
    </>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;