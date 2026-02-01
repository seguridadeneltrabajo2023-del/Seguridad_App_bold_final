import { useEffect, useState } from 'react';
import { supabase } from '../SupabaseClient';

interface Incident {
  id: string;
  location: string;
  description: string;
  incident_date: string;
  image_path: string | null;
}

export const IncidentTable = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIncidents = async () => {
      const { data, error } = await supabase
        .from('incident_reports')
        .select('*')
        .order('incident_date', { ascending: false });

      if (!error) setIncidents(data || []);
      setLoading(false);
    };
    fetchIncidents();
  }, []);

  const handleViewPhoto = (path: string) => {
    const { data } = supabase.storage
      .from('evidences')
      .getPublicUrl(path);

    if (data?.publicUrl) {
      window.open(data.publicUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Fecha de Reporte
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Ubicación
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Descripción del Incidente
              </th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                Evidencia
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {incidents.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-gray-400">
                  No se encontraron incidentes registrados.
                </td>
              </tr>
            ) : (
              incidents.map((incident) => (
                <tr key={incident.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                    {new Date(incident.incident_date).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-700 font-semibold">
                    <span className="flex items-center gap-1">
                      📍 {incident.location}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <p className="max-w-md line-clamp-2" title={incident.description}>
                      {incident.description}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {incident.image_path ? (
                      <button 
                        onClick={() => handleViewPhoto(incident.image_path!)}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200 hover:bg-green-200 transition-all cursor-pointer shadow-sm"
                      >
                        👁️ VER FOTO
                      </button>
                    ) : (
                      <span className="text-gray-300 text-xs italic font-light">Sin archivos</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};