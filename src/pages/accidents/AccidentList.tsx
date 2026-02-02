import { useState } from 'react';
import { IncidentTable } from '../../components/IncidentTable';
import { IncidentForm } from '../../components/IncidentForm';
import { IncidentDashboard } from '../../components/IncidentDashboard';

export const AccidentList = () => {
  const [showForm, setShowForm] = useState(false);   
  const [refreshKey, setRefreshKey] = useState(0);

  const handleIncidentCreated = () => {
    setShowForm(false);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gray-50/50 min-h-screen relative">
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Seguridad y Salud</h1>
          <p className="text-gray-500 font-medium">Gestión integral de incidentes laborales</p>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-6 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200"
        >
          {/* PASO 3: Cambio de nombre en el botón de apertura */}
          ＋ Reportar Nuevo Evento
        </button>
      </div>

      {/* DASHBOARD */}
      <IncidentDashboard refreshKey={refreshKey} />

      {/* VENTANA EMERGENTE (MODAL) */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setShowForm(false)} 
          />
          
          <div className="relative z-10 w-full max-w-2xl transform animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <IncidentForm 
              onClose={() => setShowForm(false)} 
              onIncidentCreated={handleIncidentCreated}
            />
          </div>
        </div>
      )}

      {/* TABLA */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30">
          <h3 className="font-bold text-gray-700">Historial de Reportes</h3>
        </div>
        <IncidentTable key={refreshKey} />
      </div>
    </div>
  );
};