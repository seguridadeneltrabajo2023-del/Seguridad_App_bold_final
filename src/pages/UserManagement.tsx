import { useEffect, useState } from 'react';
import { Plus, Ban, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { MainContent } from '../components/layout/MainContent';
import { StatusChip } from '../components/common/StatusChip';
import { User } from '../types';
import { useApp } from '../contexts/AppContext';

const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  company_admin: 'Company Admin',
  osh_responsible: 'OSH Responsible',
  worker: 'Worker',
};

const roleColors: Record<string, string> = {
  super_admin: 'bg-red-100 text-red-700',
  company_admin: 'bg-blue-100 text-blue-700',
  osh_responsible: 'bg-green-100 text-green-700',
  worker: 'bg-gray-100 text-gray-700',
};

export function UserManagement() {
  const { addToast, currentCompany } = useApp(); // Extraemos la empresa actual del contexto
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    // Si no hay una empresa seleccionada, no intentamos cargar datos
    if (!currentCompany?.id) return;

    try {
      setLoading(true);
      
      // Aplicamos el filtro .eq('company_id', ...) para la seguridad de los datos
      const { data, error } = await supabase
        .from('company_memberships')
        .select(`
          user_id,
          company_id,
          role,
          status,
          profiles:user_id (
            full_name,
            email,
            job_title
          )
        `)
        .eq('company_id', currentCompany.id); 

      if (error) throw error;

      const formattedUsers: User[] = (data || []).map((item: any) => ({
        id: item.user_id,
        name: item.profiles?.full_name || 'Sin nombre',
        email: item.profiles?.email || 'Sin email',
        role: item.role,
        jobTitle: item.profiles?.job_title || 'No asignado',
        status: item.status,
        companyId: item.company_id,
      }));

      setUsers(formattedUsers);
    } catch (error: any) {
      addToast({ type: 'error', message: 'Error: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  // El efecto se dispara al cargar o cuando cambie la empresa seleccionada
  useEffect(() => {
    fetchUsers();
  }, [currentCompany?.id]); 

  const handleToggleStatus = async (user: User) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      const { error } = await supabase
        .from('company_memberships')
        .update({ status: newStatus })
        .eq('user_id', user.id)
        .eq('company_id', currentCompany?.id); // Filtro de seguridad adicional

      if (error) throw error;
      addToast({ type: 'success', message: `Usuario ${newStatus === 'active' ? 'activado' : 'desactivado'}` });
      setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
    } catch (error: any) {
      addToast({ type: 'error', message: error.message });
    }
  };

  return (
    <MainContent
      title="GESTIÓN DE USUARIOS"
      subtitle={`Personal de ${currentCompany?.name || 'la organización'}`}
      actions={
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          Invitar Usuario
        </button>
      }
    >
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cargo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-10 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                  <p className="text-sm text-gray-500 mt-2">Cargando trabajadores...</p>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-gray-500 text-sm">
                  No hay usuarios registrados en esta empresa.
                </td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center font-bold text-blue-600">
                        {user.name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${roleColors[user.role] || 'bg-gray-100'}`}>
                      {roleLabels[user.role] || user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{user.jobTitle}</td>
                  <td className="px-6 py-4">
                    <StatusChip status={user.status as 'active' | 'inactive'} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleToggleStatus(user)} 
                      className={`p-2 rounded-lg transition-colors ${user.status === 'active' ? 'text-gray-400 hover:bg-red-50 hover:text-red-600' : 'text-green-600 hover:bg-green-50'}`}
                    >
                      {user.status === 'active' ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </MainContent>
  );
}