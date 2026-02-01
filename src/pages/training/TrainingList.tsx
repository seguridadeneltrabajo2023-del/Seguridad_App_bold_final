import { useState } from 'react';
import {
  Plus,
  Filter,
  Search,
  Eye,
  Calendar,
  MapPin,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import { MainContent } from '../../components/layout/MainContent';
import { StatusChip } from '../../components/common/StatusChip';
import { useApp } from '../../contexts/AppContext';

interface Training {
  id: string;
  topic: string;
  date: string;
  time: string;
  site: string;
  location: string;
  instructor: string;
  trainingType: string;
  status: 'scheduled' | 'in_progress' | 'done' | 'closed' | 'cancelled';
  totalParticipants: number;
  attendedCount: number;
  signedCount: number;
  coveragePercent: number;
  pendingSignatures: number;
}

const mockTrainings: Training[] = [
  {
    id: '1',
    topic: 'Fire Safety and Emergency Procedures',
    date: '2026-01-25',
    time: '09:00',
    site: 'Main Warehouse',
    location: 'Training Room A',
    instructor: 'Michael Chen',
    trainingType: 'safety',
    status: 'scheduled',
    totalParticipants: 25,
    attendedCount: 0,
    signedCount: 0,
    coveragePercent: 0,
    pendingSignatures: 25,
  },
  {
    id: '2',
    topic: 'Forklift Operation Certification',
    date: '2026-01-22',
    time: '14:00',
    site: 'Production Plant',
    location: 'Warehouse Floor',
    instructor: 'Sarah Johnson',
    trainingType: 'technical',
    status: 'in_progress',
    totalParticipants: 12,
    attendedCount: 10,
    signedCount: 8,
    coveragePercent: 83,
    pendingSignatures: 2,
  },
  {
    id: '3',
    topic: 'OSHA Compliance Standards Update',
    date: '2026-01-20',
    time: '10:00',
    site: 'Main Warehouse',
    location: 'Conference Room',
    instructor: 'Robert Martinez',
    trainingType: 'compliance',
    status: 'done',
    totalParticipants: 30,
    attendedCount: 28,
    signedCount: 28,
    coveragePercent: 93,
    pendingSignatures: 0,
  },
  {
    id: '4',
    topic: 'Chemical Handling and PPE Requirements',
    date: '2026-01-18',
    time: '13:00',
    site: 'Production Plant',
    location: 'Safety Lab',
    instructor: 'Emily Davis',
    trainingType: 'safety',
    status: 'closed',
    totalParticipants: 18,
    attendedCount: 17,
    signedCount: 17,
    coveragePercent: 94,
    pendingSignatures: 0,
  },
];

export function TrainingList() {
  const { addToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState('all');
  const [siteFilter, setSiteFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredTrainings = mockTrainings.filter(training => {
    const matchesSearch =
      training.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      training.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      training.site.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSite = siteFilter === 'all' || training.site === siteFilter;
    const matchesStatus = statusFilter === 'all' || training.status === statusFilter;
    const matchesType = typeFilter === 'all' || training.trainingType === typeFilter;

    return matchesSearch && matchesSite && matchesStatus && matchesType;
  });

  const handleViewDetail = (training: Training) => {
    addToast({ type: 'info', message: `Opening training: ${training.topic}` });
  };

  const getCoverageColor = (percent: number) => {
    if (percent >= 90) return 'text-green-600';
    if (percent >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const stats = {
    total: mockTrainings.length,
    scheduled: mockTrainings.filter(t => t.status === 'scheduled').length,
    inProgress: mockTrainings.filter(t => t.status === 'in_progress').length,
    completed: mockTrainings.filter(t => t.status === 'closed').length,
    avgCoverage:
      mockTrainings.reduce((sum, t) => sum + t.coveragePercent, 0) / mockTrainings.length,
  };

  return (
    <MainContent
      title="Training Programs"
      subtitle="Manage training sessions, attendance, and certificates"
      actions={
        <button
          onClick={() => addToast({ type: 'info', message: 'Opening create training form' })}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Training
        </button>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <BookOpen className="w-8 h-8 text-blue-500" />
            </div>
            <div className="mb-2">
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-gray-600 text-sm font-medium">Total Trainings</div>
            </div>
            <div className="text-sm text-gray-600">This month</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
            <div className="mb-2">
              <div className="text-3xl font-bold text-gray-900">{stats.scheduled}</div>
              <div className="text-gray-600 text-sm font-medium">Scheduled</div>
            </div>
            <div className="text-sm text-gray-600">Upcoming sessions</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-purple-500" />
            </div>
            <div className="mb-2">
              <div className="text-3xl font-bold text-gray-900">{stats.inProgress}</div>
              <div className="text-gray-600 text-sm font-medium">In Progress</div>
            </div>
            <div className="text-sm text-gray-600">Active sessions</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="w-8 h-8 text-white opacity-90" />
            </div>
            <div className="mb-2">
              <div className="text-3xl font-bold">{stats.avgCoverage.toFixed(0)}%</div>
              <div className="text-green-100 text-sm font-medium">Avg. Coverage</div>
            </div>
            <div className="text-sm text-green-100">Attendance rate</div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search trainings..."
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
                {(siteFilter !== 'all' ||
                  statusFilter !== 'all' ||
                  typeFilter !== 'all' ||
                  dateRange !== 'all') && (
                  <span className="ml-1 px-2 py-0.5 bg-blue-600 text-white text-xs font-medium rounded-full">
                    {
                      [
                        siteFilter !== 'all',
                        statusFilter !== 'all',
                        typeFilter !== 'all',
                        dateRange !== 'all',
                      ].filter(Boolean).length
                    }
                  </span>
                )}
              </button>
            </div>

            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date Range
                    </label>
                    <select
                      value={dateRange}
                      onChange={e => setDateRange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="upcoming">Upcoming</option>
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
                      <option value="Main Warehouse">Main Warehouse</option>
                      <option value="Production Plant">Production Plant</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Statuses</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      value={typeFilter}
                      onChange={e => setTypeFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Types</option>
                      <option value="safety">Safety</option>
                      <option value="technical">Technical</option>
                      <option value="compliance">Compliance</option>
                      <option value="leadership">Leadership</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Topic
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date/Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Site
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Instructor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Coverage
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Pending Signatures
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTrainings.map(training => (
                  <tr key={training.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <BookOpen className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{training.topic}</div>
                          <div className="text-xs text-gray-600 capitalize">
                            {training.trainingType}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-900">{training.date}</div>
                          <div className="text-xs text-gray-600">{training.time}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-sm text-gray-900">{training.site}</div>
                          <div className="text-xs text-gray-600">{training.location}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{training.instructor}</div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusChip
                        status={
                          training.status === 'closed'
                            ? 'approved'
                            : training.status === 'scheduled'
                            ? 'rejected'
                            : 'pending'
                        }
                        label={training.status.replace('_', ' ')}
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <span
                          className={`text-sm font-bold ${getCoverageColor(
                            training.coveragePercent
                          )}`}
                        >
                          {training.coveragePercent}%
                        </span>
                        <span className="text-xs text-gray-600">
                          {training.attendedCount}/{training.totalParticipants}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {training.pendingSignatures > 0 ? (
                        <div className="flex items-center justify-center gap-1">
                          <AlertCircle className="w-4 h-4 text-orange-600" />
                          <span className="text-sm font-semibold text-orange-600">
                            {training.pendingSignatures}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-semibold text-green-600">0</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleViewDetail(training)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTrainings.length === 0 && (
            <div className="p-8 text-center">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No trainings found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
    </MainContent>
  );
}
