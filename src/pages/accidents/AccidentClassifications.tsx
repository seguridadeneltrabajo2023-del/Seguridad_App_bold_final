import { useState } from 'react';
import { Plus, Edit, Trash2, Search, Tag, X } from 'lucide-react';
import { MainContent } from '../../components/layout/MainContent';
import { StatusChip } from '../../components/common/StatusChip';
import { useApp } from '../../contexts/AppContext';

interface Classification {
  id: string;
  catalogType: string;
  name: string;
  description: string;
  isActive: boolean;
  isGlobal: boolean;
}

const mockClassifications: Classification[] = [
  {
    id: '1',
    catalogType: 'injury_type',
    name: 'Fracture',
    description: 'Broken bone or bones',
    isActive: true,
    isGlobal: true,
  },
  {
    id: '2',
    catalogType: 'injury_type',
    name: 'Laceration',
    description: 'Deep cut or tear in skin',
    isActive: true,
    isGlobal: true,
  },
  {
    id: '3',
    catalogType: 'body_part',
    name: 'Hand/Fingers',
    description: 'Hands and fingers',
    isActive: true,
    isGlobal: true,
  },
  {
    id: '4',
    catalogType: 'agent',
    name: 'Machinery/Equipment',
    description: 'Powered machinery or equipment',
    isActive: true,
    isGlobal: true,
  },
  {
    id: '5',
    catalogType: 'unsafe_act',
    name: 'Not Using PPE',
    description: 'Failure to use required safety equipment',
    isActive: true,
    isGlobal: true,
  },
];

const catalogTypes = [
  { value: 'injury_type', label: 'Injury Type', color: 'red' },
  { value: 'body_part', label: 'Body Part', color: 'blue' },
  { value: 'agent', label: 'Agent', color: 'purple' },
  { value: 'unsafe_act', label: 'Unsafe Act', color: 'orange' },
  { value: 'unsafe_condition', label: 'Unsafe Condition', color: 'yellow' },
];

const getCatalogTypeColor = (type: string) => {
  const catalog = catalogTypes.find(c => c.value === type);
  const color = catalog?.color || 'gray';

  const colors: Record<string, string> = {
    red: 'bg-red-100 text-red-800 border-red-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    orange: 'bg-orange-100 text-orange-800 border-orange-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    gray: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  return colors[color];
};

export function AccidentClassifications() {
  const { addToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [catalogTypeFilter, setCatalogTypeFilter] = useState('all');
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Classification | null>(null);
  const [classifications, setClassifications] = useState<Classification[]>(mockClassifications);

  const filteredClassifications = classifications.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = catalogTypeFilter === 'all' || item.catalogType === catalogTypeFilter;
    const matchesActive = !showActiveOnly || item.isActive;

    return matchesSearch && matchesType && matchesActive;
  });

  const handleToggleActive = (item: Classification) => {
    setClassifications(
      classifications.map(c =>
        c.id === item.id ? { ...c, isActive: !c.isActive } : c
      )
    );
    addToast({
      type: 'success',
      message: `Classification ${item.isActive ? 'deactivated' : 'activated'}`,
    });
  };

  const handleDelete = (item: Classification) => {
    if (item.isGlobal) {
      addToast({ type: 'error', message: 'Cannot delete global classifications' });
      return;
    }
    setClassifications(classifications.filter(c => c.id !== item.id));
    addToast({ type: 'success', message: 'Classification deleted' });
  };

  const handleEdit = (item: Classification) => {
    setEditingItem(item);
    setShowAddModal(true);
  };

  const handleSave = () => {
    addToast({ type: 'success', message: 'Classification saved successfully' });
    setShowAddModal(false);
    setEditingItem(null);
  };

  const stats = {
    total: classifications.length,
    active: classifications.filter(c => c.isActive).length,
    byType: catalogTypes.map(type => ({
      type: type.label,
      count: classifications.filter(c => c.catalogType === type.value).length,
    })),
  };

  return (
    <MainContent
      title="Accident Classifications"
      subtitle="Manage accident classification catalogs"
      actions={
        <button
          onClick={() => {
            setEditingItem(null);
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Classification
        </button>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Tag className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          {stats.byType.map(item => (
            <div key={item.type} className="bg-white border border-gray-200 rounded-lg p-4">
              <div>
                <p className="text-xs text-gray-600 font-medium mb-1">{item.type}</p>
                <p className="text-xl font-bold text-gray-900">{item.count}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search classifications..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={catalogTypeFilter}
                  onChange={e => setCatalogTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  {catalogTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={showActiveOnly}
                    onChange={e => setShowActiveOnly(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Active only</span>
                </label>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Scope
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClassifications.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${getCatalogTypeColor(
                          item.catalogType
                        )}`}
                      >
                        {catalogTypes.find(t => t.value === item.catalogType)?.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                    </td>
                    <td className="px-6 py-4 max-w-md">
                      <div className="text-sm text-gray-600">{item.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {item.isGlobal ? 'Global' : 'Company'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusChip
                        status={item.isActive ? 'approved' : 'rejected'}
                        label={item.isActive ? 'Active' : 'Inactive'}
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleActive(item)}
                          className={`px-3 py-1 text-xs font-medium rounded ${
                            item.isActive
                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          } transition-colors`}
                        >
                          {item.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {!item.isGlobal && (
                          <button
                            onClick={() => handleDelete(item)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredClassifications.length === 0 && (
            <div className="p-8 text-center">
              <Tag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No classifications found matching your criteria</p>
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editingItem ? 'Edit Classification' : 'Add Classification'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingItem(null);
                }}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catalog Type <span className="text-red-500">*</span>
                </label>
                <select
                  defaultValue={editingItem?.catalogType || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select type</option>
                  {catalogTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  defaultValue={editingItem?.name || ''}
                  placeholder="e.g., Fracture"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  defaultValue={editingItem?.description || ''}
                  placeholder="Describe the classification..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  defaultChecked={editingItem?.isActive !== false}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">Active</p>
                  <p className="text-xs text-gray-600">
                    Make this classification available for selection
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingItem ? 'Update' : 'Create'} Classification
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainContent>
  );
}
