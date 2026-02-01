import { Plus, MoreVertical, Eye, Ban, CreditCard } from 'lucide-react';
import { useState } from 'react';
import { MainContent } from '../../components/layout/MainContent';
import { StatusChip } from '../../components/common/StatusChip';
import { Company } from '../../types';
import { useApp } from '../../contexts/AppContext';

const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'Acme Corporation',
    plan: 'professional',
    status: 'active',
    activeUsers: 45,
    storageUsage: '2.3 GB',
    createdDate: '2023-06-15',
  },
  {
    id: '2',
    name: 'Global Industries Ltd',
    plan: 'enterprise',
    status: 'active',
    activeUsers: 120,
    storageUsage: '8.7 GB',
    createdDate: '2023-03-20',
  },
  {
    id: '3',
    name: 'SafeTech Solutions',
    plan: 'starter',
    status: 'trial',
    activeUsers: 12,
    storageUsage: '450 MB',
    createdDate: '2024-01-10',
  },
  {
    id: '4',
    name: 'BuildRight Construction',
    plan: 'professional',
    status: 'suspended',
    activeUsers: 35,
    storageUsage: '1.8 GB',
    createdDate: '2023-09-05',
  },
];

export function Companies() {
  const { addToast } = useApp();
  const [showActions, setShowActions] = useState<string | null>(null);

  const handleAction = (action: string, company: Company) => {
    addToast({
      type: 'info',
      message: `${action} ${company.name}`,
    });
    setShowActions(null);
  };

  return (
    <MainContent
      title="Companies"
      subtitle="Manage all client companies and their subscriptions"
      actions={
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          New Company
        </button>
      }
    >
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Plan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Active Users
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Storage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mockCompanies.map(company => (
              <tr key={company.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-700">
                        {company.name.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {company.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                    {company.plan}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <StatusChip
                    status={
                      company.status === 'active'
                        ? 'active'
                        : company.status === 'suspended'
                        ? 'inactive'
                        : 'expiring'
                    }
                    label={company.status}
                  />
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {company.activeUsers}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {company.storageUsage}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {company.createdDate}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="relative inline-block">
                    <button
                      onClick={() =>
                        setShowActions(
                          showActions === company.id ? null : company.id
                        )
                      }
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-500" />
                    </button>

                    {showActions === company.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setShowActions(null)}
                        />
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                          <button
                            onClick={() => handleAction('View', company)}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                          <button
                            onClick={() => handleAction('Change Plan', company)}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                          >
                            <CreditCard className="w-4 h-4" />
                            Change Plan
                          </button>
                          <button
                            onClick={() =>
                              handleAction(
                                company.status === 'suspended'
                                  ? 'Activate'
                                  : 'Suspend',
                                company
                              )
                            }
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                          >
                            <Ban className="w-4 h-4" />
                            {company.status === 'suspended'
                              ? 'Activate'
                              : 'Suspend'}
                          </button>
                        </div>
                      </>
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
