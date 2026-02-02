import { Plus, Bell, ChevronDown, Building2, Menu } from 'lucide-react'; // <-- Quité 'Search' de aquí
import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';

const mockCompanies = [
  { id: '1', name: 'Acme Corporation' },
  { id: '2', name: 'Global Industries Ltd' },
  { id: '3', name: 'SafeTech Solutions' },
];

const quickActions = [
  { id: '1', label: 'Nueva Actividad', action: () => alert('Nueva Actividad') },
  { id: '2', label: 'Nueva Capacitación', action: () => alert('Nueva Capacitación') },
  { id: '3', label: 'Reportar Accidente', action: () => alert('Reportar Accidente') },
];

export function TopBar() {
  const { 
    currentCompany, 
    setCurrentCompany, 
    sidebarCollapsed, 
    setSidebarCollapsed 
  } = useApp();
  
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
      <div className="h-full px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          {/* LADO IZQUIERDO: LOGO LIMPIO SIN CAJÓN */}
          <div className="flex items-center gap-3">
            <img 
              src="/img/Triangulos_Mesa de trabajo 1.png" 
              alt="Logo Empresa" 
              className="h-12 w-auto object-contain transition-transform hover:scale-105" 
            />
            <div className="flex flex-col border-l pl-3 border-gray-100">
              <span className="font-black text-gray-900 hidden sm:inline leading-none text-lg tracking-tight">
                Management App
              </span>
              <span className="text-[10px] text-blue-600 font-bold hidden sm:inline uppercase tracking-widest mt-0.5">
                Occupational Safety and Health
              </span>
            </div>
          </div>

          {/* SELECTOR DE EMPRESA */}
          <div className="relative ml-2">
            <button
              onClick={() => setShowCompanyDropdown(!showCompanyDropdown)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors group"
            >
              <Building2 className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
              <span className="text-sm font-medium text-gray-700 hidden md:inline">
                {currentCompany?.name || 'Seleccionar Empresa'}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {showCompanyDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowCompanyDropdown(false)} />
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-20 animate-in fade-in slide-in-from-top-2">
                  {mockCompanies.map(company => (
                    <button
                      key={company.id}
                      onClick={() => {
                        setCurrentCompany(company);
                        setShowCompanyDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 flex items-center gap-2 transition-colors"
                    >
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className={company.id === currentCompany?.id ? 'font-bold text-blue-600' : 'text-gray-700'}>
                        {company.name}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* LADO DERECHO: BOTONES ORIGINALES SIN ERRORES */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline text-sm font-bold">Crear</span>
            </button>

            {showQuickActions && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowQuickActions(false)} />
                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-20">
                  {quickActions.map(action => (
                    <button
                      key={action.id}
                      onClick={() => {
                        action.action();
                        setShowQuickActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 text-gray-700 font-medium transition-colors"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button className="p-2 hover:bg-gray-100 rounded-lg relative transition-colors group">
            <Bell className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </div>
      </div>
    </header>
  );
}