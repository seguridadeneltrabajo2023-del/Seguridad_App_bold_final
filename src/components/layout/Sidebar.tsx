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
  ChevronRight,
  Building2,
  FileStack,
  ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { MenuItem } from '../../types';

// 1. Limpiamos el objeto de configuración eliminando todos los 'badge'
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
                      <span className="text-sm font-medium flex-1 text-left">
                        {item.label}
                      </span>
                    )}
                  </button>

                  {/* 2. Eliminamos la lógica de renderizado del badge en el tooltip */}
                  {showTooltip && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="border-t border-gray-200 p-2">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-5 h-5 text-gray-500" />
              ) : (
                <>
                  <ChevronLeft className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-600">Collapse</span>
                </>
              )}
            </button>
          </div>
        </nav>
      </aside>

      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}
    </>
  );
}