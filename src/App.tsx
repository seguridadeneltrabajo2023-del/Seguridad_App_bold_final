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
import { OSHResponsibleList } from './pages/osh-responsible/OSHResponsibleList';
import { OSHResponsibleForm } from './pages/osh-responsible/OSHResponsibleForm';
import { OSHResponsibleDetail } from './pages/osh-responsible/OSHResponsibleDetail';
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

function AppContent() {
  const [currentPage, setCurrentPage] = useState<string>('/dashboard');
  const { currentRole } = useApp();

  const hasAccess = (path: string): boolean => {
    const accessMap: Record<string, string[]> = {
      '/companies': ['super_admin'],
      '/templates': ['super_admin'],
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
    return allowedRoles.includes(currentRole);
  };

  const renderPage = () => {
    if (!hasAccess(currentPage)) {
      return <AccessDenied onBack={() => setCurrentPage('/dashboard')} />;
    }

    switch (currentPage) {
      case '/dashboard':
        if (currentRole === 'worker') {
          return <WorkerHome />;
        }
        if (currentRole === 'osh_responsible') {
          return <OSHDashboard />;
        }
        return <Dashboard />;

      case '/companies':
        return <Companies />;

      case '/templates':
        return <Templates />;

      case '/users':
        return <UserManagement />;

      case '/org-structure':
        return <OrgStructure />;

      case '/workplan':
        return <WorkPlan />;

      case '/workplan/activity':
        return <ActivityDetail />;

      case '/hazard':
        return <HazardMatrix />;

      case '/hazard/detail':
        return <HazardDetail />;

      case '/hazard/catalog':
        return <HazardCatalog />;

      case '/accidents':
        return <AccidentList />;

      case '/accidents/report':
        return <ReportAccident />;

      case '/accidents/detail':
        return <AccidentDetail />;

      case '/accidents/classifications':
        return <AccidentClassifications />;

      case '/training':
        return <TrainingList />;

      case '/training/create':
        return <CreateTraining />;

      case '/training/detail':
        return <TrainingDetail />;

      case '/evidence':
        return <ListPage />;

      case '/responsible':
        return <OSHResponsibleList />;

      case '/responsible/new':
        return <OSHResponsibleForm />;

      case '/responsible/detail':
        return <OSHResponsibleDetail />;

      case '/reports':
        return <ListPage />;

      case '/permissions':
        return <PermissionsMatrix />;

      case '/activity-detail':
        return <DetailPage />;

      default:
        return currentRole === 'worker' ? <WorkerHome /> :
               currentRole === 'osh_responsible' ? <OSHDashboard /> :
               <Dashboard />;
    }
  };

  const handleNavigate = (path: string) => {
    setCurrentPage(path);
  };

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
