import { useState } from 'react';
import {
  Plus,
  Filter,
  Search,
  Eye,
  Calendar,
  MapPin,
  User,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Award,
} from 'lucide-react';
import { MainContent } from '../../components/layout/MainContent';
import { StatusChip } from '../../components/common/StatusChip';
import { useApp } from '../../contexts/AppContext';

interface Accident {
  id: string;
  incidentNumber: string;
  date: string;
  time: string;
  workerName: string;
  site: string;
  location: string;
  incidentType: 'accident' | 'incident' | 'near_miss';
  severity: 'minor' | 'moderate' | 'serious' | 'critical' | 'fatal';
  status: 'open' | 'in_investigation' | 'action_required' | 'closed';
  description: string;
  daysLost: number;
}

const mockAccidents: Accident[] = [
  {
    id: '1',
    incidentNumber: 'ACC-2026-0001',
    date: '2026-01-20',
    time: '14:30',
    workerName: 'John Smith',
    site: 'Main Warehouse',
    location: 'Loading Dock Area',
    incidentType: 'accident',
    severity: 'moderate',
    status: 'in_investigation',
    description: 'Worker slipped on wet floor while carrying boxes',
    daysLost: 2,
  },
  {
    id: '2',
    incidentNumber: 'ACC-2026-0002',
    date: '2026-01-18',
    time: '10:15',
    workerName: 'Maria Garcia',
    site: 'Production Plant',
    location: 'Assembly Line 3',
    incidentType: 'accident',
    severity: 'minor',
    status: 'closed',
    description: 'Minor cut on hand while handling sharp components',
    daysLost: 0,
  },
  {
    id: '3',
    incidentNumber: 'INC-2026-0003',
    date: '2026-01-15',
    time: '09:00',
    workerName: 'Robert Johnson',
    site: 'Main Warehouse',
    location: 'Storage Area B',
    incidentType: 'near_miss',
    severity: 'moderate',
    status: 'action_required',
    description: 'Forklift nearly collided with pedestrian',
    daysLost: 0,
  },
  {
    id: '4',
    incidentNumber: 'ACC-2026-0004',
    date: '2026-01-10',
    time: '16:45',
    workerName: 'Sarah Williams',
    site: 'Production Plant',
    location: 'Maintenance Shop',
    incidentType: 'accident',
    severity: 'serious',
    status: 'action_required',
    description: 'Worker suffered back injury while lifting heavy equipment',
    daysLost: 7,
  },
];

export function AccidentList() {
  const { addToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState('all');
  const [siteFilter, setSiteFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  const filteredAccidents = mockAccidents.filter(accident => {
    const matchesSearch =
      accident.incidentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      accident.workerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      accident.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSite = siteFilter === 'all' || accident.site === siteFilter;
    const matchesStatus = statusFilter === 'all' || accident.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || accident.severity === severityFilter;

    return matchesSearch && matchesSite && matchesStatus && matchesSeverity;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'fatal':
        return 'bg-black text-white border-black';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'serious':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'minor':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'accident':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'incident':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'near_miss':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleViewDetail = (accident: Accident) => {
    addToast({ type: 'info', message: `Opening case ${accident.incidentNumber}` });
  };

  const stats = {
    total: mockAccidents.length,
    open: mockAccidents.filter(a => a.status === 'open').length,
    underInvestigation: mockAccidents.filter(a => a.status === 'in_investigation').length,
    daysWithoutAccident: 6,
    lastAccident: '2026-01-20',
    monthlyTrend: -12,
  };

  return (
    <MainContent
      title="Work Accidents"
      subtitle="Report and manage workplace accidents and incidents"
      actions={
        <button
          onClick={() => addToast({ type: 'info', message: 'Opening accident report form' })}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Report Accident
        </button>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Award className="w-10 h-10 text-white opacity-90" />
              <div className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs font-semibold">
                Safety KPI
              </div>
            </div>
            <div className="mb-2">
              <div className="text-4xl font-bold">{stats.daysWithoutAccident}</div>
              <div className="text-green-100 text-sm font-medium">Days Without Accident</div>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-100">
              <Calendar className="w-4 h-4" />
              Last accident: {stats.lastAccident}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              {stats.monthlyTrend < 0 ? (
                <TrendingDown className="w-6 h-6 text-green-600" />
              ) : (
                <TrendingUp className="w-6 h-6 text-red-600" />
              )}
            </div>
            <div className="mb-2">
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-gray-600 text-sm font-medium">Total Cases This Month</div>
            </div>
            <div
              className={`text-sm font-medium ${
                stats.monthlyTrend < 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {stats.monthlyTrend > 0 ? '+' : ''}
              {stats.monthlyTrend}% vs last month
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <div className="mb-2">
              <div className="text-3xl font-bold text-gray-900">{stats.underInvestigation}</div>
              <div className="text-gray-600 text-sm font-medium">Under Investigation</div>
            </div>
            <div className="text-sm text-gray-600">Requires attention</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="mb-2">
              <div className="text-3xl font-bold text-gray-900">{stats.open}</div>
              <div className="text-gray-600 text-sm font-medium">Open Cases</div>
            </div>
            <div className="text-sm text-gray-600">Awaiting investigation</div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search accidents..."
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
                  severityFilter !== 'all' ||
                  dateRange !== 'all') && (
                  <span className="ml-1 px-2 py-0.5 bg-blue-600 text-white text-xs font-medium rounded-full">
                    {
                      [
                        siteFilter !== 'all',
                        statusFilter !== 'all',
                        severityFilter !== 'all',
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
                      <option value="quarter">This Quarter</option>
                      <option value="year">This Year</option>
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
                      <option value="open">Open</option>
                      <option value="in_investigation">In Investigation</option>
                      <option value="action_required">Action Required</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Severity
                    </label>
                    <select
                      value={severityFilter}
                      onChange={e => setSeverityFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Severities</option>
                      <option value="fatal">Fatal</option>
                      <option value="critical">Critical</option>
                      <option value="serious">Serious</option>
                      <option value="moderate">Moderate</option>
                      <option value="minor">Minor</option>
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
                    Incident #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date/Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Worker
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Site/Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Days Lost
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAccidents.map(accident => (
                  <tr key={accident.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(accident.incidentType)}
                        <span className="text-sm font-medium text-gray-900">
                          {accident.incidentNumber}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{accident.date}</div>
                      <div className="text-xs text-gray-600">{accident.time}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{accident.workerName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{accident.site}</div>
                          <div className="text-xs text-gray-600">{accident.location}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900 capitalize">
                        {accident.incidentType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${getSeverityColor(
                          accident.severity
                        )}`}
                      >
                        {accident.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusChip
                        status={
                          accident.status === 'closed'
                            ? 'approved'
                            : accident.status === 'open'
                            ? 'rejected'
                            : 'pending'
                        }
                        label={accident.status.replace('_', ' ')}
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`text-sm font-semibold ${
                          accident.daysLost > 0 ? 'text-red-600' : 'text-green-600'
                        }`}
                      >
                        {accident.daysLost}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleViewDetail(accident)}
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

          {filteredAccidents.length === 0 && (
            <div className="p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No accidents found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
    </MainContent>
  );
}
