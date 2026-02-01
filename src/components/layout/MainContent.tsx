import { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface Breadcrumb {
  label: string;
  path?: string;
}

interface MainContentProps {
  breadcrumbs?: Breadcrumb[];
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function MainContent({
  breadcrumbs = [],
  title,
  subtitle,
  actions,
  children,
}: MainContentProps) {
  const { sidebarCollapsed } = useApp();

  return (
    <main
      className={`pt-16 min-h-screen bg-gray-50 transition-all duration-300 ${
        sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
      }`}
    >
      <div className="p-6">
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-2 text-sm mb-4">
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center gap-2">
                {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
                {crumb.path ? (
                  <button className="text-gray-600 hover:text-gray-900 transition-colors">
                    {crumb.label}
                  </button>
                ) : (
                  <span className="text-gray-900 font-medium">{crumb.label}</span>
                )}
              </div>
            ))}
          </nav>
        )}

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>

        {children}
      </div>
    </main>
  );
}
