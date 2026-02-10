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
  Building2,
  FileStack,
  ShieldCheck,
  LogOut,
  UserCircle,
} from 'lucide-react';
import { useState, useEffect } from 'react';
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
    roles: ['super_admin', 'company_admin']
  },
  {
    id: 'org-structure',
    label: 'Organization',
    icon: 'Building2',
    path: '/org-structure',
    roles: ['super_admin', 'company_admin']
  },
  {
    id: 'responsible',
    label: 'OSH Responsible',
    icon: 'Shield',
    path: '/responsible',
    roles: ['super_admin', 'company_admin', 'osh_responsible']
  },
  {
    id: 'employees',
    label: 'Trabajadores',
    icon: 'Users',
    path: '/employees',
    roles: ['super_admin', 'company_admin', 'osh_responsible'],
    children: [
      { id: 'emp-general', label: 'Información General', path: '/employees/general' },
      { id: 'emp-socio', label: 'Perfil Sociodemográfico', path: '/employees/socio' },
      { id: 'emp-sst', label: 'SST', path: '/employees/sst' },
      { id: 'emp-docs', label: 'Documentos', path: '/employees/docs' },
      { id: 'emp-history', label: 'Historial', path: '/employees/history' },
    ]
  },
  {
    id: 'workplan',
    label: 'Work Plan',
    icon: 'ClipboardList',
    path: '/workplan',
    roles: ['super_admin', 'company_admin', 'osh_responsible']
  },
  {
    id: 'hazard',
    label: 'Hazard Matrix',
    icon: 'AlertTriangle',
    path: '/hazard',
    roles: ['super_admin', 'company_admin', 'osh_responsible']
  },
  {
    id: 'accidents',
    label: 'Safety Report',
    icon: 'Activity',
    path: '/accidents',
    roles: ['super_admin', 'company_admin', 'osh_responsible']
  },
  {
    id: 'training',
    label: 'Training',
    icon: 'GraduationCap',
    path: '/training',
    roles: ['super_admin', 'company_admin', 'osh_responsible', 'worker']
  },
  {
    id: 'evidence',
    label: 'Evidence Library',
    icon: 'FolderOpen',
    path: '/evidence',
    roles: ['super_admin', 'company_admin', 'osh_responsible']
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
  UserCircle,
};

interface SidebarProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

export function Sidebar({ currentPath = '/dashboard', onNavigate }: SidebarProps) {
  const { sidebarCollapsed, setSidebarCollapsed } = useApp();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('worker');
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const role = user.user_metadata?.role || 'worker';
        setUserRole(role);
      }
    });
  }, []);

  const toggleMenu = (id: string) => {
    setOpenMenus(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

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

  const visibleMenuItems = menuItems.filter(item => {
    const cleanUserRole = userRole.replace('_', '').toLowerCase();
    if (cleanUserRole === 'superadmin') return true;
    return item.roles?.some(role => 
      role.replace('_', '').toLowerCase() === cleanUserRole
    );
  });

  const isAdmin = userRole.replace('_', '').toLowerCase() === 'superadmin';

  return (
    <>
      <aside
        className={`fixed top-16 left-0 bottom-0 bg-white border-r border-gray-200 transition-all duration-300 z-40 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <nav className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto py-4">
            {!sidebarCollapsed && isAdmin && (
              <div className="px-6 py-2 mb-2 text-[10px] font-black text-blue-600 uppercase tracking-widest border-l-4 border-blue-600 bg-blue-50/50">
                Administración Global
              </div>
            )}

            {visibleMenuItems.map(item => {
              const Icon = iconMap[item.icon];
              const isActive = currentPath.startsWith(item.path);
              const hasChildren = item.children && item.children.length > 0;
              const isOpen = openMenus.includes(item.id);
              const showTooltip = sidebarCollapsed && hoveredItem === item.id;

              return (
                <div key={item.id} className="relative px-2 mb-1">
                  <button
                    onClick={() => hasChildren ? toggleMenu(item.id) : handleNavigate(item.path)}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                    {!sidebarCollapsed && (
                      <span className="text-sm font-bold flex-1 text-left whitespace-nowrap overflow-hidden">
                        {item.label}
                      </span>
                    )}
                  </button>

                  {!sidebarCollapsed && hasChildren && isOpen && (
                    <div className="ml-9 mt-1 space-y-1 border-l border-gray-100">
                      {item.children?.map(child => (
                        <button
                          key={child.id}
                          onClick={() => handleNavigate(child.path)}
                          className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors rounded-r-md ${
                            currentPath === child.path 
                              ? 'text-blue-600 bg-blue-50 border-l-2 border-blue-600' 
                              : 'text-gray-500 hover:text-blue-600 hover:bg-gray-50'
                          }`}
                        >
                          {child.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {showTooltip && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg whitespace-nowrap z-50 shadow-xl border border-gray-800">
                      {item.label}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="border-t border-gray-200 p-2 space-y-1 bg-white">
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
                  <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                    Cerrar Sesión
                  </span>
                )}
              </button>
            </div>

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

      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}
    </>
  );
}