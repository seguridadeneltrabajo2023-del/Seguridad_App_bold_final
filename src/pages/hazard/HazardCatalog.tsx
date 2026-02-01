import { useState } from 'react';
import { Plus, Edit, Trash2, Search, Filter, Tag, X } from 'lucide-react';
import { MainContent } from '../../components/layout/MainContent';
import { StatusChip } from '../../components/common/StatusChip';
import { useApp } from '../../contexts/AppContext';

interface HazardType {
  id: string;
  category: string;
  name: string;
  description: string;
  isActive: boolean;
  isGlobal: boolean;
}

const mockHazardTypes: HazardType[] = [
  {
    id: '1',
    category: 'physical',
    name: 'Slips, Trips, and Falls',
    description: 'Risk of slipping, tripping, or falling on surfaces or from heights',
    isActive: true,
    isGlobal: true,
  },
  {
    id: '2',
    category: 'physical',
    name: 'Moving Machinery',
    description: 'Contact with moving parts of machinery or equipment',
    isActive: true,
    isGlobal: true,
  },
  {
    id: '3',
    category: 'chemical',
    name: 'Hazardous Substances',
    description: 'Exposure to harmful chemicals',
    isActive: true,
    isGlobal: true,
  },
  {
    id: '4',
    category: 'ergonomic',
    name: 'Manual Handling',
    description: 'Risk from lifting, carrying, or moving objects',
    isActive: true,
    isGlobal: true,
  },
  {
    id: '5',
    category: 'physical',
    name: 'Electrical',
    description: 'Risk of electrical shock or burns',
    isActive: true,
    isGlobal: true,
  },
];

const categoryColors: Record<string, string> = {
  physical: 'blue',
  chemical: 'purple',
  biological: 'green',
  ergonomic: 'orange',
  psychosocial: 'pink',
  environmental: 'teal',
};

const categoryBgColors: Record<string, string> = {
  physical: 'bg-blue-100 text-blue-800 border-blue-200',
  chemical: 'bg-purple-100 text-purple-800 border-purple-200',
  biological: 'bg-green-100 text-green-800 border-green-200',
  ergonomic: 'bg-orange-100 text-orange-800 border-orange-200',
  psychosocial: 'bg-pink-100 text-pink-800 border-pink-200',
  environmental: 'bg-teal-100 text-teal-800 border-teal-200',
};

export function HazardCatalog() {
  const { addToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingHazard, setEditingHazard] = useState<HazardType | null>(null);
  const [hazardTypes, setHazardTypes] = useState<HazardType[]>(mockHazardTypes);

  const filteredHazardTypes = hazardTypes.filter(hazard => {
    const matchesSearch =
      hazard.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hazard.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || hazard.category === categoryFilter;
    const matchesActive = !showActiveOnly || hazard.isActive;

    return matchesSearch && matchesCategory && matchesActive;
  });

  const stats = {
    total: hazardTypes.length,
    active: hazardTypes.filter(h => h.isActive).length,
    inactive: hazardTypes.filter(h => !h.isActive).length,
  };

  const handleToggleActive = (hazard: HazardType) => {
    setHazardTypes(
      hazardTypes.map(h =>
        h.id === hazard.id ? { ...h, isActive: !h.isActive } : h
      )
    );
    addToast({
      type: 'success',
      message: `Hazard type ${hazard.isActive ? 'deactivated' : 'activated'}`,
    });
  };

  const handleDelete = (hazard: HazardType) => {
    if (hazard.isGlobal) {
      addToast({ type: 'error', message: 'Cannot delete global hazard types' });
      return;
    }
    setHazardTypes(hazardTypes.filter(h => h.id !== hazard.id));
    addToast({ type: 'success', message: 'Hazard type deleted' });
  };

  const handleEdit = (hazard: HazardType) => {
    setEditingHazard(hazard);
    setShowAddModal(true);
  };

  const handleSave = () => {
    addToast({ type: 'success', message: 'Hazard type saved successfully' });
    setShowAddModal(false);
    setEditingHazard(null);
  };

  return (
    <MainContent
      title="Hazard Type Catalog"
      subtitle="Manage hazard types and categories"
      actions={
        <button
          onClick={() => {
            setEditingHazard(null);
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Hazard Type
        </button>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Hazard Types</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Tag className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Active</p>
                <p className="text-2xl font-bold text-green-900">{stats.active}</p>
              </div>
              <Tag className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Inactive</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
              </div>
              <Tag className="w-8 h-8 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search hazard types..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  <option value="physical">Physical</option>
                  <option value="chemical">Chemical</option>
                  <option value="biological">Biological</option>
                  <option value="ergonomic">Ergonomic</option>
                  <option value="psychosocial">Psychosocial</option>
                  <option value="environmental">Environmental</option>
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
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Hazard Type
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
                {filteredHazardTypes.map(hazard => (
                  <tr key={hazard.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${
                          categoryBgColors[hazard.category]
                        }`}
                      >
                        {hazard.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{hazard.name}</div>
                    </td>
                    <td className="px-6 py-4 max-w-md">
                      <div className="text-sm text-gray-600">{hazard.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {hazard.isGlobal ? 'Global' : 'Company'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusChip
                        status={hazard.isActive ? 'approved' : 'rejected'}
                        label={hazard.isActive ? 'Active' : 'Inactive'}
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleActive(hazard)}
                          className={`px-3 py-1 text-xs font-medium rounded ${
                            hazard.isActive
                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          } transition-colors`}
                        >
                          {hazard.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleEdit(hazard)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {!hazard.isGlobal && (
                          <button
                            onClick={() => handleDelete(hazard)}
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

          {filteredHazardTypes.length === 0 && (
            <div className="p-8 text-center">
              <Tag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No hazard types found matching your criteria</p>
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editingHazard ? 'Edit Hazard Type' : 'Add Hazard Type'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingHazard(null);
                }}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  defaultValue={editingHazard?.category || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select category</option>
                  <option value="physical">Physical</option>
                  <option value="chemical">Chemical</option>
                  <option value="biological">Biological</option>
                  <option value="ergonomic">Ergonomic</option>
                  <option value="psychosocial">Psychosocial</option>
                  <option value="environmental">Environmental</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hazard Type Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  defaultValue={editingHazard?.name || ''}
                  placeholder="e.g., Working at Heights"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  defaultValue={editingHazard?.description || ''}
                  placeholder="Describe the hazard type..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  defaultChecked={editingHazard?.isActive !== false}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">Active</p>
                  <p className="text-xs text-gray-600">
                    Make this hazard type available for selection
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingHazard ? 'Update' : 'Create'} Hazard Type
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingHazard(null);
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
