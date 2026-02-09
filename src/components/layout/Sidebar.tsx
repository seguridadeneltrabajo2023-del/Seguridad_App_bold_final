import {
  LayoutDashboard,
  Shield,
  ClipboardList,
  AlertTriangle,
  Activity,
  GraduationCap,
  FolderOpen,
  BarChart3,
  Users,
  Settings,
  ChevronLeft,
  // ChevronRight eliminado para evitar error TS6133
  Building2,
  FileStack,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { MenuItem } from '../../types';
import { supabase } from '../../lib/supabase';

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    path: '/dashboard',
    roles: ['super_admin', 'company_admin', 'osh_responsible', 'worker']
  },
  {
    id: 'companies',
    label: 'Companies',
    icon: 'Building2',
    path: '/companies',
    roles: ['super_admin']
  },
  {
    id: 'templates',
    label: 'Templates',
    icon: 'FileStack',
    path: '/templates',
    roles: ['super_admin']
  },
  {
    id: 'users',
    label: 'Users & Roles',
    icon: 'Users',
    path: '/users',
    roles: ['company_admin']
  },
  {
    id: 'org-structure',
    label: 'Organization',
    icon: 'Building2',
    path: '/org-structure',
    roles: ['company_admin']
  },
  {
    id: 'responsible',
    label: 'OSH Responsible',
    icon: 'Shield',
    path: '/responsible',
    roles: ['company_admin', 'osh_responsible']
  },
  {
    id: 'workplan',
    label: 'Work Plan',
    icon: 'ClipboardList',
    path: '/workplan',
    roles: ['company_admin', 'osh_responsible']
  },
  {
    id: 'hazard',
    label: 'Hazard Matrix',
    icon: 'AlertTriangle',
    path: '/hazard',
    roles: ['company_admin', 'osh_responsible']
  },
  {
    id: 'accidents',
    label: 'Work Accidents',
    icon: 'Activity',
    path: '/accidents',
    roles: ['company_admin', 'osh_responsible']
  },
  {
    id: 'training',
    label: 'Training',
    icon: 'GraduationCap',
    path: '/training',
    roles: ['company_admin', 'osh_responsible']
  },
  {
    id: 'evidence',
    label: 'Evidence Library',
    icon: 'FolderOpen',
    path: '/evidence',
    roles: ['company_admin', 'osh_responsible']
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: 'BarChart3',
    path: '/reports',
    roles: ['super_admin', 'company_admin', 'osh_responsible']
  },
  {
    id: 'permissions',
    label: 'Permissions',
    icon: 'ShieldCheck',
    path: '/permissions',
    roles: ['super_admin', 'company_admin']
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'Settings',
    path: '/settings',
    roles: ['super_admin', 'company_admin', 'osh_responsible', 'worker']
  },
];

const iconMap: Record<string, any> = {
  LayoutDashboard,
  Shield,
  ClipboardList,
  AlertTriangle,
  Activity,
  GraduationCap,
  FolderOpen,
  BarChart3,
  Users,
  Settings,
  Building2,
  FileStack,
  ShieldCheck,
};

interface SidebarProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

export function Sidebar({ currentPath = '/dashboard', onNavigate }: SidebarProps) {
  const { sidebarCollapsed, setSidebarCollapsed, currentRole } = useApp();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      window.location.href = '/'; 
    } catch (error: any) {
      alert("Error al cerrar sesión: " + error.message);
    }
  };

  const visibleMenuItems = menuItems.filter(
    item => !item.roles || item.roles.includes(currentRole)
  );

  return (
    <>
      <aside
        className={`fixed top-16 left-0 bottom-0 bg-white border-r border-gray-200 transition-all duration-300 z-40 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <nav className="h-full flex flex-col">
          {/* Menu Items Section */}
          <div className="flex-1 overflow-y-auto py-4">
            {visibleMenuItems.map(item => {
              const Icon = iconMap[item.icon];
              const isActive = currentPath === item.path;
              const showTooltip = sidebarCollapsed && hoveredItem === item.id;

              return (
                <div key={item.id} className="relative px-2 mb-1">
                  <button
                    onClick={() => handleNavigate(item.path)}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                    {!sidebarCollapsed && (
                      <span className="text-sm font-medium flex-1 text-left whitespace-nowrap overflow-hidden">
                        {item.label}
                      </span>
                    )}
                  </button>

                  {showTooltip && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Buttons Section */}
          <div className="border-t border-gray-200 p-2 space-y-1 bg-white">
            
            {/* LOGOUT BUTTON */}
            <div className="relative px-1">
              <button
                onClick={handleLogout}
                onMouseEnter={() => setHoveredItem('logout')}
                onMouseLeave={() => setHoveredItem(null)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200 group ${
                  sidebarCollapsed ? 'justify-center' : 'justify-start'
                }`}
              >
                <LogOut className="w-5 h-5 flex-shrink-0 text-red-500 group-hover:rotate-12 transition-transform" />
                {!sidebarCollapsed && (
                  <span className="text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                    Cerrar Sesión
                  </span>
                )}
              </button>
              
              {sidebarCollapsed && hoveredItem === 'logout' && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-2 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-md whitespace-nowrap z-50 shadow-xl border border-red-700 animate-in fade-in slide-in-from-left-2">
                  Cerrar Sesión
                </div>
              )}
            </div>

            {/* COLLAPSE/TOGGLE BUTTON (Solo Icono con Rotación) */}
            <div className="px-1">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="w-full flex items-center justify-center p-2.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-indigo-600 transition-all duration-300 border-t border-gray-50 mt-1"
                title={sidebarCollapsed ? "Expandir menú" : "Colapsar menú"}
              >
                <div className={`transition-transform duration-500 ease-in-out ${sidebarCollapsed ? 'rotate-180' : 'rotate-0'}`}>
                  <ChevronLeft className="w-6 h-6 flex-shrink-0" />
                </div>
              </button>
            </div>
          </div>
        </nav>
      </aside>

      {/* Mobile Overlay */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}
    </>
  );
}