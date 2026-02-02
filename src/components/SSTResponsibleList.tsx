import { AlertCircle, CheckCircle, FileText, ExternalLink, Trash2, Edit3, Eye } from 'lucide-react';
import { supabase } from '../SupabaseClient';

interface Responsible {
  id: string;
  nombres: string;
  apellidos: string;
  profesion: string;
  fecha_ven_licencia: string;
  fecha_ven_50h: string;
  fecha_ven_20h?: string;
  url_cedula?: string;
  url_licencia?: string;
}

interface ResponsibleListProps {
  responsibles: Responsible[];
  onRefresh: () => void;
  onEdit: (res: Responsible) => void;
}

export const SSTResponsibleList = ({ responsibles, onRefresh, onEdit }: ResponsibleListProps) => {
  
  const abrirDocumento = async (path: string | undefined) => {
    if (!path) {
      alert("Este documento no ha sido cargado aún.");
      return;
    }
    const { data } = supabase.storage.from('documentos_sst').getPublicUrl(path);
    if (data?.publicUrl) window.open(data.publicUrl, '_blank');
  };

  const eliminarResponsable = async (res: Responsible) => {
    const confirmar = window.confirm(`¿Estás seguro de eliminar a ${res.nombres}?`);
    if (confirmar) {
      try {
        const { error } = await supabase.from('sst_responsibles').delete().eq('id', res.id);
        if (error) throw error;
        alert("Registro eliminado con éxito.");
        onRefresh(); 
      } catch (err: any) {
        alert("Error al eliminar: " + err.message);
      }
    }
  };

  const getStatusStyles = (fecha: string) => {
    const hoy = new Date();
    const vencimiento = new Date(fecha);
    const diasParaVencer = Math.ceil((vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

    if (diasParaVencer <= 0) return 'text-red-700 bg-red-50 border-red-200';
    if (diasParaVencer <= 30) return 'text-orange-700 bg-orange-50 border-orange-200';
    return 'text-green-700 bg-green-50 border-green-200';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 text-[11px] font-black text-gray-500 uppercase tracking-wider">Responsable / ID</th>
              <th className="p-4 text-[11px] font-black text-gray-500 uppercase tracking-wider">Vencimiento Licencia</th>
              <th className="p-4 text-[11px] font-black text-gray-500 uppercase tracking-wider text-center">Documentos</th>
              <th className="p-4 text-[11px] font-black text-gray-500 uppercase text-right tracking-widest">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {responsibles.map((res) => {
              const esVencido = new Date(res.fecha_ven_licencia) < new Date();
              
              return (
                <tr key={res.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-black text-xs uppercase shadow-sm border border-blue-200">
                        {res.nombres[0]}{res.apellidos[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 leading-none">{res.nombres} {res.apellidos}</p>
                        <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-tighter">{res.profesion}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border flex items-center gap-1.5 w-fit ${getStatusStyles(res.fecha_ven_licencia)}`}>
                      {/* Integrated CheckCircle and AlertCircle icons */}
                      {esVencido ? <AlertCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                      {res.fecha_ven_licencia}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => abrirDocumento(res.url_cedula)} 
                        className={`p-2 rounded-lg border transition-all ${res.url_cedula ? 'text-blue-600 bg-blue-50 border-blue-100 hover:scale-110 shadow-sm' : 'text-gray-200 border-gray-100 bg-gray-50 cursor-not-allowed'}`}
                        title="Ver Cédula"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => abrirDocumento(res.url_licencia)} 
                        className={`p-2 rounded-lg border transition-all ${res.url_licencia ? 'text-purple-600 bg-purple-50 border-purple-100 hover:scale-110 shadow-sm' : 'text-gray-200 border-gray-100 bg-gray-50 cursor-not-allowed'}`}
                        title="Ver Licencia"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2 items-center">
                      {/* Integrated Eye icon for viewing details */}
                      <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" /> 
                      </button>

                      <button 
                        onClick={() => onEdit(res)} 
                        className="p-2 text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-600 hover:text-white rounded-lg transition-all shadow-sm"
                        title="Editar Responsable"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button 
                        onClick={() => eliminarResponsable(res)} 
                        className="p-2 text-red-600 bg-red-50 border border-red-100 hover:bg-red-600 hover:text-white rounded-lg transition-all shadow-sm"
                        title="Eliminar Registro"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};