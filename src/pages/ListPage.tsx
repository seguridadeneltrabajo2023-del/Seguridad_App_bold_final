import { Plus } from 'lucide-react';
import { MainContent } from '../components/layout/MainContent';
import { StatusChip } from '../components/common/StatusChip';

const mockData = [
  {
    id: 'ACT-001',
    title: 'Monthly Safety Inspection',
    site: 'Building A',
    area: 'Warehouse',
    status: 'approved' as const,
    dueDate: '2024-01-20',
    assignee: 'John Smith',
  },
  {
    id: 'ACT-002',
    title: 'Fire Drill Exercise',
    site: 'Building B',
    area: 'Office Floor 3',
    status: 'pending' as const,
    dueDate: '2024-01-22',
    assignee: 'Sarah Johnson',
  },
  {
    id: 'ACT-003',
    title: 'PPE Compliance Check',
    site: 'Building A',
    area: 'Production Area',
    status: 'pending' as const,
    dueDate: '2024-01-21',
    assignee: 'Mike Chen',
  },
];

export function ListPage() {
  return (
    <MainContent
      breadcrumbs={[{ label: 'Home', path: '/' }, { label: 'Activities' }]}
      title="Activities"
      subtitle="Manage and track all safety activities"
      actions={
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          New Activity
        </button>
      }
    >
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Site
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Due Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Assignee
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mockData.map(row => (
              <tr
                key={row.id}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="px-6 py-4 text-sm text-gray-900">{row.id}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{row.title}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{row.site}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <StatusChip status={row.status} />
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{row.dueDate}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{row.assignee}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MainContent>
  );
}
