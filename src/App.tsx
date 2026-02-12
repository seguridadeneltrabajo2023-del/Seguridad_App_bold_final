import { useState } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { ListPage } from './pages/ListPage';
import { OSHDashboard } from './pages/OSHDashboard';

// --- 🛡️ CAMBIO CRÍTICO DE RUTA AQUÍ 🛡️ ---
// Cambiamos './pages/super-admin/Companies' por './pages/Companies'
// para que use el archivo que tienes abierto y estás editando.
import { Companies } from './pages/Companies'; 

import { UserManagement } from './pages/company-admin/UserManagement';
import { WorkerHome } from './pages/worker/WorkerHome';
import { PermissionsMatrix } from './pages/PermissionsMatrix';
import { WorkPlan } from './pages/workplan/WorkPlan';
import { HazardMatrix } from './pages/hazard/HazardMatrix';
import { AccidentList } from './pages/accidents/AccidentList';
import { TrainingList } from './pages/training/TrainingList';
import { AccessDenied } from './components/common/AccessDenied';
import { RoleSwitcher } from './components/common/RoleSwitcher';

// --- IMPORTACIONES DE EMPLEADOS ---
// @ts-ignore
import EmployeesPage from './pages/employees/EmployeesPage'; 
// @ts-ignore
import SocioDemograficPage from './pages/employees/SocioDemograficPage'; 

// @ts-ignore
import Signup from './pages/signup'; 
// @ts-ignore
import { AdminDashboard } from './pages/AdminDashboard'; 
import ResponsablesPage from './components/layout/ResponsiblesPage';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<string>('/signup');
  const { currentRole } = useApp();

  const normalizedRole = currentRole?.replace('_', '').toLowerCase();
  const isSuperAdmin = normalizedRole === 'superadmin';

  const handleNavigate = (path: string) => {
    setCurrentPage(path);
  };

  const hasAccess = (path: string): boolean => {
    const sessionStr = localStorage.getItem('sb-rtezouotyomzmmwevbpz-auth-token');
    if (sessionStr && sessionStr.includes('seguridadeneltrabajo2023@gmail.com')) return true;
    if (isSuperAdmin) return true;

    const accessMap: Record<string, string[]> = {
      '/companies': ['super_admin'],
      '/users': ['company_admin'],
      '/employees/general': ['super_admin', 'company_admin', 'osh_responsible'],
      '/employees/socio': ['super_admin', 'company_admin', 'osh_responsible'],
      '/employees': ['super_admin', 'company_admin', 'osh_responsible'],
    };

    const allowedRoles = accessMap[path];
    if (!allowedRoles) return true;
    return allowedRoles.some(role => role.replace('_', '').toLowerCase() === normalizedRole);
  };

  const renderPage = () => {
    if (!hasAccess(currentPage)) return <AccessDenied onBack={() => setCurrentPage('/dashboard')} />;

    console.log("Renderizando componente para:", currentPage);

    switch (currentPage) {
      case '/employees/socio':
        return <SocioDemograficPage />;

      case '/employees/general':
      case '/employees':
        return <EmployeesPage />;

      case '/dashboard':
        if (isSuperAdmin || localStorage.getItem('sb-rtezouotyomzmmwevbpz-auth-token')?.includes('seguridadeneltrabajo2023@gmail.com')) {
          return <AdminDashboard onNavigate={handleNavigate} />;
        }
        if (currentRole === 'worker') return <WorkerHome />;
        if (currentRole === 'osh_responsible') return <OSHDashboard />;
        return <Dashboard />;

      case '/admin-dashboard': return <AdminDashboard onNavigate={handleNavigate} />;
      case '/companies': return <Companies />;
      case '/users': return <UserManagement />;
      case '/workplan': return <WorkPlan />;
      case '/hazard': return <HazardMatrix />;
      case '/accidents': return <AccidentList />;
      case '/training': return <TrainingList />;
      case '/evidence': return <ListPage />;
      case '/responsible': return <ResponsablesPage />;
      case '/reports': return <ListPage />;
      case '/permissions': return <PermissionsMatrix />;
      default:
        return <Dashboard />;
    }
  };

  if (currentPage === '/signup') {
    return <Signup onNavigate={handleNavigate} />;
  }

  return (
    <div className="relative min-h-screen">
      <AppLayout currentPath={currentPage} onNavigate={handleNavigate}>
        {renderPage()}
      </AppLayout>
      
      {/* RoleSwitcher corregido para no bloquear el centro de la pantalla */}
      <div className="fixed bottom-4 right-4 z-[9999] pointer-events-auto">
        <RoleSwitcher />
      </div>
    </div>
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