import { useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { MainContent } from '../components/layout/MainContent';
import { StatusChip } from '../components/common/StatusChip';

const mockItem = {
  id: 'ACT-001',
  title: 'Monthly Safety Inspection',
  description: 'Comprehensive safety inspection covering all critical areas of the warehouse facility.',
  site: 'Building A',
  area: 'Warehouse',
  status: 'approved' as const,
  dueDate: '2024-01-20',
  assignee: 'John Smith',
};

export function DetailPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'evidence' | 'history'>('overview');

  const tabs = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'evidence' as const, label: 'Evidence' },
    { id: 'history' as const, label: 'History' },
  ];

  return (
    <MainContent
      breadcrumbs={[
        { label: 'Home', path: '/' },
        { label: 'Activities', path: '/activities' },
        { label: mockItem.id },
      ]}
      title={mockItem.title}
      subtitle={`${mockItem.site} • ${mockItem.area}`}
      actions={
        <>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors">
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </>
      }
    >
      <div className="space-y-6">
        <div className="border-b border-gray-200">
          <nav className="flex gap-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-1 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === 'overview' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Description
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed mb-6">
              {mockItem.description}
            </p>

            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Details
            </h2>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-500">Status</dt>
                <dd className="mt-1">
                  <StatusChip status={mockItem.status} />
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Due Date</dt>
                <dd className="text-sm font-medium text-gray-900 mt-1">
                  {mockItem.dueDate}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Assignee</dt>
                <dd className="text-sm font-medium text-gray-900 mt-1">
                  {mockItem.assignee}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Site</dt>
                <dd className="text-sm font-medium text-gray-900 mt-1">
                  {mockItem.site}
                </dd>
              </div>
            </dl>
          </div>
        )}

        {activeTab === 'evidence' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-500 text-center py-8">
              No evidence uploaded yet
            </p>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-500 text-center py-8">
              No activity history
            </p>
          </div>
        )}
      </div>
    </MainContent>
  );
}
