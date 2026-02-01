import { useState } from 'react';
import {
  List,
  LayoutGrid,
  Filter,
  Search,
  Calendar,
  MapPin,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';
import { MainContent } from '../../components/layout/MainContent';
import { StatusChip } from '../../components/common/StatusChip';
import { useApp } from '../../contexts/AppContext';

type ViewMode = 'list' | 'kanban';

interface Activity {
  id: string;
  title: string;
  description: string;
  activityType: 'inspection' | 'training' | 'audit' | 'report_delivery';
  status: 'planned' | 'in_progress' | 'completed' | 'overdue';
  startDate: string;
  endDate: string;
  site: string;
  owner: string;
  participants: number;
  color: string;
}

const mockActivities: Activity[] = [
  {
    id: '1',
    title: 'Safety Inspection - Building A',
    description: 'Monthly safety inspection of all facilities',
    activityType: 'inspection',
    status: 'planned',
    startDate: '2026-01-25',
    endDate: '2026-01-25',
    site: 'Building A',
    owner: 'Sarah Johnson',
    participants: 5,
    color: '#3B82F6',
  },
  {
    id: '2',
    title: 'Fire Safety Training',
    description: 'Quarterly fire safety and evacuation training',
    activityType: 'training',
    status: 'in_progress',
    startDate: '2026-01-27',
    endDate: '2026-01-27',
    site: 'Building B',
    owner: 'Michael Chen',
    participants: 12,
    color: '#10B981',
  },
  {
    id: '3',
    title: 'Annual Compliance Audit',
    description: 'Annual OSH compliance audit',
    activityType: 'audit',
    status: 'planned',
    startDate: '2026-01-30',
    endDate: '2026-01-30',
    site: 'All Sites',
    owner: 'Sarah Johnson',
    participants: 8,
    color: '#F59E0B',
  },
  {
    id: '4',
    title: 'Q1 Safety Report',
    description: 'Quarterly safety performance report',
    activityType: 'report_delivery',
    status: 'overdue',
    startDate: '2026-01-15',
    endDate: '2026-01-15',
    site: 'All Sites',
    owner: 'Emma Davis',
    participants: 3,
    color: '#8B5CF6',
  },
  {
    id: '5',
    title: 'Equipment Safety Check',
    description: 'Weekly equipment safety verification',
    activityType: 'inspection',
    status: 'completed',
    startDate: '2026-01-20',
    endDate: '2026-01-20',
    site: 'Building C',
    owner: 'Robert Williams',
    participants: 4,
    color: '#3B82F6',
  },
];

const statusConfig = {
  planned: { label: 'Planned', icon: Clock, color: 'blue' },
  in_progress: { label: 'In Progress', icon: PlayCircle, color: 'yellow' },
  completed: { label: 'Completed', icon: CheckCircle, color: 'green' },
  overdue: { label: 'Overdue', icon: AlertCircle, color: 'red' },
};

export function WorkPlanListKanban() {
  const { addToast } = useApp();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [siteFilter, setSiteFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const handleAction = (action: string, activity: Activity) => {
    addToast({ type: 'info', message: `${action}: ${activity.title}` });
  };

  const filteredActivities = mockActivities.filter(activity => {
    const matchesSearch =
      activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOwner = ownerFilter === 'all' || activity.owner === ownerFilter;
    const matchesSite = siteFilter === 'all' || activity.site === siteFilter;
    const matchesType = typeFilter === 'all' || activity.activityType === typeFilter;

    return matchesSearch && matchesOwner && matchesSite && matchesType;
  });

  const stats = {
    planned: mockActivities.filter(a => a.status === 'planned').length,
    inProgress: mockActivities.filter(a => a.status === 'in_progress').length,
    completed: mockActivities.filter(a => a.status === 'completed').length,
    overdue: mockActivities.filter(a => a.status === 'overdue').length,
  };

  const getActivitiesByStatus = (status: string) =>
    filteredActivities.filter(a => a.status === status);

  return (
    <MainContent
      title="Work Plan Activities"
      subtitle="Manage and track OSH activities"
      actions={
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="List View"
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Kanban View"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Planned</p>
                <p className="text-2xl font-bold text-blue-900">{stats.planned}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">In Progress</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.inProgress}</p>
              </div>
              <PlayCircle className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Completed</p>
                <p className="text-2xl font-bold text-green-900">{stats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Overdue</p>
                <p className="text-2xl font-bold text-red-900">{stats.overdue}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
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
                  placeholder="Search activities..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-5 h-5" />
                Filters
                {(ownerFilter !== 'all' || siteFilter !== 'all' || typeFilter !== 'all') && (
                  <span className="ml-1 px-2 py-0.5 bg-blue-600 text-white text-xs font-medium rounded-full">
                    {
                      [ownerFilter !== 'all', siteFilter !== 'all', typeFilter !== 'all'].filter(
                        Boolean
                      ).length
                    }
                  </span>
                )}
              </button>
            </div>

            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Owner</label>
                    <select
                      value={ownerFilter}
                      onChange={e => setOwnerFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Owners</option>
                      <option value="Sarah Johnson">Sarah Johnson</option>
                      <option value="Michael Chen">Michael Chen</option>
                      <option value="Emma Davis">Emma Davis</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Site</label>
                    <select
                      value={siteFilter}
                      onChange={e => setSiteFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Sites</option>
                      <option value="Building A">Building A</option>
                      <option value="Building B">Building B</option>
                      <option value="Building C">Building C</option>
                      <option value="All Sites">All Sites</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Activity Type
                    </label>
                    <select
                      value={typeFilter}
                      onChange={e => setTypeFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Types</option>
                      <option value="inspection">Inspection</option>
                      <option value="training">Training</option>
                      <option value="audit">Audit</option>
                      <option value="report_delivery">Report Delivery</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {viewMode === 'list' ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Site
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredActivities.map(activity => (
                    <tr key={activity.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{activity.title}</div>
                          <div className="text-sm text-gray-500">{activity.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="px-2 py-1 text-xs font-medium rounded capitalize"
                          style={{
                            backgroundColor: `${activity.color}20`,
                            color: activity.color,
                          }}
                        >
                          {activity.activityType.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {activity.startDate}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          {activity.site}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <User className="w-4 h-4 text-gray-400" />
                          {activity.owner}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusChip
                          status={
                            activity.status === 'completed'
                              ? 'approved'
                              : activity.status === 'overdue'
                              ? 'rejected'
                              : 'pending'
                          }
                          label={statusConfig[activity.status].label}
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleAction('Viewing', activity)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleAction('Editing', activity)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleAction('Deleting', activity)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
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
          ) : (
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {(['planned', 'in_progress', 'completed', 'overdue'] as const).map(status => {
                  const activities = getActivitiesByStatus(status);
                  const config = statusConfig[status];
                  const StatusIcon = config.icon;

                  return (
                    <div key={status} className="space-y-3">
                      <div className="flex items-center gap-2 mb-3">
                        <StatusIcon className="w-5 h-5 text-gray-600" />
                        <h3 className="font-semibold text-gray-900">
                          {config.label} ({activities.length})
                        </h3>
                      </div>

                      <div className="space-y-3">
                        {activities.map(activity => (
                          <div
                            key={activity.id}
                            className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => handleAction('Viewing', activity)}
                          >
                            <div
                              className="w-full h-1 rounded-full mb-3"
                              style={{ backgroundColor: activity.color }}
                            />
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">
                              {activity.title}
                            </h4>
                            <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                              {activity.description}
                            </p>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <Calendar className="w-3 h-3" />
                                {activity.startDate}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <MapPin className="w-3 h-3" />
                                {activity.site}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <User className="w-3 h-3" />
                                {activity.owner}
                              </div>
                            </div>
                          </div>
                        ))}

                        {activities.length === 0 && (
                          <div className="p-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg text-center">
                            <p className="text-sm text-gray-500">No activities</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </MainContent>
  );
}
