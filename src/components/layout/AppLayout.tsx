import { ReactNode } from 'react';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { ToastContainer } from '../common/ToastContainer';
import { useApp } from '../../contexts/AppContext'; // Importamos el contexto

interface AppLayoutProps {
  children: ReactNode;
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

export function AppLayout({ children, currentPath, onNavigate }: AppLayoutProps) {
  // Obtenemos el estado de la sidebar del contexto global
  const { sidebarCollapsed } = useApp();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopBar />
      
      <div className="flex flex-1 pt-16">
        <Sidebar currentPath={currentPath} onNavigate={onNavigate} />
        
        {/* El margen izquierdo cambia dinámicamente según sidebarCollapsed */}
        <main className={`flex-1 transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}>
          <div className="p-4 md:p-8">
            {children}
          </div>
        </main>
      </div>
      
      <ToastContainer />
    </div>
  );
}