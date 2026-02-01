import { Plus, MapPin, Edit, Trash2 } from 'lucide-react';
import { MainContent } from '../../components/layout/MainContent';
import { StatusChip } from '../../components/common/StatusChip';
import { Site } from '../../types';
import { useApp } from '../../contexts/AppContext';

const mockSites: Site[] = [
  {
    id: '1',
    name: 'Building A - Main Warehouse',
    address: '123 Industrial Drive, City, State 12345',
    status: 'active',
  },
  {
    id: '2',
    name: 'Building B - Office Complex',
    address: '456 Business Park, City, State 12345',
    status: 'active',
  },
  {
    id: '3',
    name: 'Building C - Storage Facility',
    address: '789 Logistics Lane, City, State 12345',
    status: 'active',
  },
  {
    id: '4',
    name: 'Remote Site - North Plant',
    address: '321 Manufacturing Road, North City, State 54321',
    status: 'inactive',
  },
];

const mockAreas = [
  { id: '1', name: 'Warehouse Floor', siteId: '1', count: 8 },
  { id: '2', name: 'Loading Docks', siteId: '1', count: 3 },
  { id: '3', name: 'Office Floors 1-3', siteId: '2', count: 12 },
  { id: '4', name: 'Conference Rooms', siteId: '2', count: 5 },
];

export function OrgStructure() {
  const { addToast } = useApp();

  const handleAction = (action: string, item: string) => {
    addToast({
      type: 'info',
      message: `${action}: ${item}`,
    });
  };

  return (
    <MainContent
      title="Organization Structure"
      subtitle="Manage sites, branches, areas, and job roles"
    >
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Sites & Branches
            </h2>
            <button
              onClick={() => handleAction('Add new site', '')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Site
            </button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Site Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Address
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
                {mockSites.map(site => (
                  <tr
                    key={site.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {site.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {site.address}
                    </td>
                    <td className="px-6 py-4">
                      <StatusChip status={site.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleAction('Edit', site.name)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAction('Delete', site.name)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Areas</h2>
            <button
              onClick={() => handleAction('Add new area', '')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Area
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockAreas.map(area => (
              <div
                key={area.id}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  {area.name}
                </h3>
                <p className="text-xs text-gray-500 mb-3">
                  {mockSites.find(s => s.id === area.siteId)?.name}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">
                    {area.count} activities
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleAction('Edit area', area.name)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleAction('Delete area', area.name)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainContent>
  );
}
