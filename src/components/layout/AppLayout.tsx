import { ReactNode } from 'react';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { ToastContainer } from '../common/ToastContainer';

interface AppLayoutProps {
  children: ReactNode;
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

export function AppLayout({ children, currentPath, onNavigate }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      <Sidebar currentPath={currentPath} onNavigate={onNavigate} />
      {children}
      <ToastContainer />
    </div>
  );
}
