import { Plus, MoreVertical, Loader2, Building2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { MainContent } from '../../components/layout/MainContent';
import { StatusChip } from '../../components/common/StatusChip';
import { useApp } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabase';

export function Companies() {
  const { addToast } = useApp();
  const [showActions, setShowActions] = useState<string | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Función para cargar datos reales desde la base de datos
  const loadData = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCompanies(data || []);
    } catch (e: any) {
      addToast({ type: 'error', message: 'Error al conectar: ' + e.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <MainContent
      title="Gestión de Empresas"
      subtitle="Listado de empresas registradas en la plataforma"
      actions={
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all shadow-md">
          <Plus className="w-4 h-4" />
          Nueva Empresa
        </button>
      }
    >
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
            <p className="text-sm font-medium">Sincronizando con Supabase...</p>
          </div>
        ) : companies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Building2 className="w-12 h-12 mb-4 opacity-20" />
            <p>No se encontraron empresas registradas.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Empresa</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">NIT / Identificación</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {companies.map((company) => (
                  <tr key={company.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-sm">
                          {company.name?.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-900">{company.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {company.nit || 'No asignado'}
                    </td>
                    <td className="px-6 py-4">
                      <StatusChip status="active" label="Activo" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setShowActions(showActions === company.id ? null : company.id)}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </MainContent>
  );
}