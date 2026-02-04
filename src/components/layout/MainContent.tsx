import React from 'react';

interface MainContentProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function MainContent({ title, subtitle, actions, children }: MainContentProps) {
  return (
    <main className="flex-1 overflow-y-auto bg-slate-50/50 p-4 md:p-8">
      {/* Contenedor de cabecera sin límite de ancho */}
      <div className="w-full mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
              {title}
            </h1>
            {subtitle && (
              <p className="text-slate-500 text-sm mt-1">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
      </div>

      {/* Contenedor de contenido: Quitamos max-w-7xl para ancho total */}
      <div className="w-full">
        {children}
      </div>
    </main>
  );
}