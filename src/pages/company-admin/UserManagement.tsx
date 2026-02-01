import { Plus, Mail, Ban, CheckCircle } from 'lucide-react';
import { MainContent } from '../../components/layout/MainContent';
import { StatusChip } from '../../components/common/StatusChip';
import { User } from '../../types';
import { useApp } from '../../contexts/AppContext';

const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@acme.com',
    role: 'osh_responsible',
    jobTitle: 'Safety Manager',
    companyId: '1',
    status: 'active',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@acme.com',
    role: 'company_admin',
    jobTitle: 'Operations Director',
    companyId: '1',
    status: 'active',
  },
  {
    id: '3',
    name: 'Mike Chen',
    email: 'mike.chen@acme.com',
    role: 'osh_responsible',
    jobTitle: 'Site HSE Lead',
    companyId: '1',
    status: 'active',
  },
  {
    id: '4',
    name: 'Emma Davis',
    email: 'emma.d@acme.com',
    role: 'worker',
    jobTitle: 'Field Technician',
    companyId: '1',
    status: 'active',
  },
  {
    id: '5',
    name: 'Tom Wilson',
    email: 'tom.w@acme.com',
    role: 'worker',
    jobTitle: 'Warehouse Operator',
    companyId: '1',
    status: 'inactive',
  },
];

const roleLabels = {
  super_admin: 'Super Admin',
  company_admin: 'Company Admin',
  osh_responsible: 'OSH Responsible',
  worker: 'Worker',
};

const roleColors = {
  super_admin: 'bg-red-100 text-red-700',
  company_admin: 'bg-blue-100 text-blue-700',
  osh_responsible: 'bg-green-100 text-green-700',
  worker: 'bg-gray-100 text-gray-700',
};

export function UserManagement() {
  const { addToast } = useApp();

  const handleAction = (action: string, user: User) => {
    addToast({
      type: 'success',
      message: `${action} user: ${user.name}`,
    });
  };

  return (
    <MainContent
      title="User Management"
      subtitle="Manage users, roles, and permissions for your organization"
      actions={
        <button
          onClick={() =>
            addToast({ type: 'info', message: 'Opening invite user form' })
          }
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Invite User
        </button>
      }
    >
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Job Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mockUsers.map(user => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {user.name
                          .split(' ')
                          .map(n => n[0])
                          .join('')}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      roleColors[user.role]
                    }`}
                  >
                    {roleLabels[user.role]}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {user.jobTitle}
                </td>
                <td className="px-6 py-4">
                  <StatusChip
                    status={user.status === 'active' ? 'active' : 'inactive'}
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleAction('Resend invite to', user)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Resend invitation"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                    {user.status === 'active' ? (
                      <button
                        onClick={() => handleAction('Deactivate', user)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Deactivate user"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAction('Activate', user)}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        title="Activate user"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MainContent>
  );
}
