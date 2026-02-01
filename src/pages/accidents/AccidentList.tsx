import { useState } from 'react';
import { IncidentTable } from '../../components/IncidentTable';
import { IncidentForm } from '../../components/IncidentForm';

export const AccidentList = () => {
  // Estado para mostrar/ocultar el formulario
  const [showForm, setShowForm] = useState(false);
  // Estado para forzar la recarga de la tabla (usando una key numérica)
  const [refreshKey, setRefreshKey] = useState(0);

  const handleIncidentCreated = () => {
    setShowForm(false); // Cerramos el formulario al terminar
    setRefreshKey(prev => prev + 1); // Aumentamos la key para que la tabla se recargue
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Encabezado con Botón Dinámico */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Registro de Incidentes</h1>
          <p className="text-gray-500 font-medium">Gestión de reportes de seguridad en tiempo real</p>
        </div>
        
        <button
          onClick={() => setShowForm(!showForm)}
          className={`inline-flex items-center px-5 py-2.5 rounded-lg font-bold transition-all shadow-sm ${
            showForm 
              ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
              : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
          }`}
        >
          {showForm ? '✕ Cancelar Registro' : '＋ Reportar Incidente'}
        </button>
      </div>

      {/* Sección del Formulario (Aparece condicionalmente) */}
      {showForm && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
          <IncidentForm 
            onClose={() => setShowForm(false)} 
            onIncidentCreated={handleIncidentCreated}
          />
        </div>
      )}

      {/* Contenedor de la Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Usamos 'key' para que React destruya y recree la tabla cuando hay un nuevo dato */}
        <IncidentTable key={refreshKey} />
      </div>
    </div>
  );
};