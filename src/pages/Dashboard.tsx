import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Activity,
  Filter,
  Plus,
  Upload,
  Bell,
  Calendar,
  Eye,
  Send,
  Target,
  GraduationCap,
  FileWarning,
  BarChart3,
} from 'lucide-react';
import { MainContent } from '../components/layout/MainContent';
import { StatusChip } from '../components/common/StatusChip';
import { useApp } from '../contexts/AppContext';

const kpiData = {
  plannedVsCompleted: { planned: 156, completed: 142, percentage: 91 },
  complianceRate: 87,
  trainings: { completed: 45, pending: 12, total: 57 },
  accidents: { thisMonth: 3, lastMonth: 5 },
  evidence: { complete: 234, missing: 18, percentage: 93 },
  hazards: { high: 7, medium: 23, low: 45 },
};

const upcomingActivities = [
  {
    id: '1',
    title: 'Monthly Safety Inspection - Building A',
    date: '2024-01-23',
    owner: 'John Smith',
    status: 'pending' as const,
    site: 'Building A',
  },
  {
    id: '2',
    title: 'Fire Drill Exercise',
    date: '2024-01-24',
    owner: 'Sarah Johnson',
    status: 'pending' as const,
    site: 'Building B',
  },
  {
    id: '3',
    title: 'PPE Compliance Check',
    date: '2024-01-25',
    owner: 'Mike Chen',
    status: 'overdue' as const,
    site: 'Building A',
  },
];

const pendingSignatures = [
  {
    id: '1',
    title: 'Fire Safety Training Attendance',
    requester: 'John Smith',
    date: '2024-01-20',
    signaturesNeeded: 12,
  },
  {
    id: '2',
    title: 'Hazard Assessment Sign-off',
    requester: 'Emma Davis',
    date: '2024-01-21',
    signaturesNeeded: 5,
  },
];

const expiringDocuments = [
  {
    id: '1',
    name: 'Forklift Operator License - Mike Chen',
    expiryDate: '2024-02-05',
    daysLeft: 15,
    type: 'license',
  },
  {
    id: '2',
    name: 'First Aid Certification - Sarah Johnson',
    expiryDate: '2024-02-10',
    daysLeft: 20,
    type: 'certification',
  },
  {
    id: '3',
    name: 'Fire Extinguisher Inspection Certificate',
    expiryDate: '2024-01-30',
    daysLeft: 9,
    type: 'inspection',
  },
];

const complianceData = [
  { week: 'Week 1', value: 82 },
  { week: 'Week 2', value: 85 },
  { week: 'Week 3', value: 83 },
  { week: 'Week 4', value: 87 },
];

const siteData = [
  { site: 'Building A', activities: 45, coverage: 92 },
  { site: 'Building B', activities: 38, coverage: 85 },
  { site: 'Building C', activities: 28, coverage: 78 },
  { site: 'Remote Site', activities: 15, coverage: 65 },
];

export function Dashboard() {
  const { addToast } = useApp();
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState('this-month');
  const [selectedSite, setSelectedSite] = useState('all');

  const hasData = true;

  const handleAction = (action: string) => {
    addToast({ type: 'info', message: action });
  };

  if (!hasData) {
    return (
      <MainContent title="Welcome to OSH Manager">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Target className="w-10 h-10 text-blue-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Let's Get Started
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Welcome to your safety management dashboard. Follow these steps to set up your system.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-50 rounded-lg p-6 text-left">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center mb-4 text-lg font-bold">
                  1
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Set Up Your Organization
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Add sites, areas, and invite team members
                </p>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Configure →
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 text-left">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center mb-4 text-lg font-bold">
                  2
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Create Your First Activity
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Start tracking safety inspections and trainings
                </p>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Create Activity →
                </button>
              </div>
            </div>
          </div>
        </div>
      </MainContent>
    );
  }

  return (
    <MainContent
      title="Dashboard"
      subtitle="Executive overview of safety management and compliance"
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {showFilters && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="this-week">This Week</option>
                  <option value="this-month">This Month</option>
                  <option value="last-month">Last Month</option>
                  <option value="this-quarter">This Quarter</option>
                  <option value="this-year">This Year</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site
                </label>
                <select
                  value={selectedSite}
                  onChange={(e) => setSelectedSite(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Sites</option>
                  <option value="building-a">Building A</option>
                  <option value="building-b">Building B</option>
                  <option value="building-c">Building C</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-sm text-gray-600 mb-2">Planned vs Completed</h3>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-bold text-gray-900">
                {kpiData.plannedVsCompleted.completed}
              </span>
              <span className="text-lg text-gray-500">
                / {kpiData.plannedVsCompleted.planned}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${kpiData.plannedVsCompleted.percentage}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900">
                {kpiData.plannedVsCompleted.percentage}%
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-sm text-gray-600 mb-2">Work Plan Compliance</h3>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {kpiData.complianceRate}%
            </div>
            <p className="text-sm text-green-600 font-medium">
              +3% vs last month
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-sm text-gray-600 mb-2">Trainings</h3>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-bold text-gray-900">
                {kpiData.trainings.completed}
              </span>
              <span className="text-sm text-gray-500">
                completed
              </span>
            </div>
            <p className="text-sm text-yellow-600 font-medium">
              {kpiData.trainings.pending} pending
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <TrendingDown className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-sm text-gray-600 mb-2">Accidents This Month</h3>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {kpiData.accidents.thisMonth}
            </div>
            <p className="text-sm text-green-600 font-medium">
              -{kpiData.accidents.lastMonth - kpiData.accidents.thisMonth} vs last month
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-sm text-gray-600 mb-2">Evidence Status</h3>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-bold text-gray-900">
                {kpiData.evidence.complete}
              </span>
              <span className="text-sm text-gray-500">
                complete
              </span>
            </div>
            <p className="text-sm text-red-600 font-medium">
              {kpiData.evidence.missing} missing
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <h3 className="text-sm text-gray-600 mb-2">Hazard Matrix</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-red-600 font-medium">High</span>
                <span className="text-gray-900 font-semibold">{kpiData.hazards.high}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-yellow-600 font-medium">Medium</span>
                <span className="text-gray-900 font-semibold">{kpiData.hazards.medium}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-600 font-medium">Low</span>
                <span className="text-gray-900 font-semibold">{kpiData.hazards.low}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Compliance Trend
              </h2>
            </div>
            <div className="p-6">
              <div className="h-64 flex items-end justify-between gap-4">
                {complianceData.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="relative w-full bg-gray-100 rounded-t-lg" style={{ height: `${(data.value / 100) * 200}px` }}>
                      <div className="absolute inset-0 bg-blue-500 rounded-t-lg" />
                      <div className="absolute -top-6 left-0 right-0 text-center">
                        <span className="text-sm font-semibold text-gray-900">{data.value}%</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-600">{data.week}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Activities by Site
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {siteData.map((site, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">{site.site}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">{site.activities} activities</span>
                        <span className="text-sm font-semibold text-blue-600">{site.coverage}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${site.coverage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Upcoming Activities
                </h2>
                <button
                  onClick={() => handleAction('Creating new activity')}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  New
                </button>
              </div>

              <div className="divide-y divide-gray-200">
                {upcomingActivities.map(activity => (
                  <div
                    key={activity.id}
                    className="px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-sm font-medium text-gray-900">
                            {activity.title}
                          </h3>
                          <StatusChip
                            status={activity.status === 'overdue' ? 'rejected' : 'pending'}
                            label={activity.status}
                          />
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{activity.date}</span>
                          </div>
                          <span>Owner: {activity.owner}</span>
                          <span>Site: {activity.site}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAction(`Viewing ${activity.title}`)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Pending Signatures
                </h2>
              </div>

              <div className="divide-y divide-gray-200">
                {pendingSignatures.map(item => (
                  <div key={item.id} className="px-6 py-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-600 mb-3">
                      Requested by {item.requester} • {item.date}
                    </p>
                    <div className="flex items-center gap-2 mb-3">
                      <Bell className="w-4 h-4 text-orange-500" />
                      <span className="text-sm text-orange-600 font-medium">
                        {item.signaturesNeeded} signatures needed
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAction(`Opening ${item.title}`)}
                        className="flex-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                      >
                        Open
                      </button>
                      <button
                        onClick={() => handleAction(`Sending reminder for ${item.title}`)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                      >
                        <Send className="w-3 h-3" />
                        Remind
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-red-200">
              <div className="px-6 py-4 border-b border-red-200 bg-red-50">
                <div className="flex items-center gap-2">
                  <FileWarning className="w-5 h-5 text-red-600" />
                  <h2 className="text-lg font-semibold text-red-900">
                    Expiring Documents
                  </h2>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {expiringDocuments.map(doc => (
                  <div key={doc.id} className="px-6 py-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      {doc.name}
                    </h3>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-600">
                        Expires: {doc.expiryDate}
                      </span>
                      <span
                        className={`text-xs font-semibold ${
                          doc.daysLeft <= 10
                            ? 'text-red-600'
                            : doc.daysLeft <= 20
                            ? 'text-orange-600'
                            : 'text-yellow-600'
                        }`}
                      >
                        {doc.daysLeft} days left
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${
                          doc.daysLeft <= 10
                            ? 'bg-red-600'
                            : doc.daysLeft <= 20
                            ? 'bg-orange-600'
                            : 'bg-yellow-600'
                        }`}
                        style={{ width: `${Math.max(10, (doc.daysLeft / 30) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => handleAction('Creating new activity')}
              className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="text-sm font-medium">New Activity</span>
            </button>
            <button
              onClick={() => handleAction('Creating new training')}
              className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <GraduationCap className="w-5 h-5" />
              <span className="text-sm font-medium">New Training</span>
            </button>
            <button
              onClick={() => handleAction('Reporting accident')}
              className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <AlertTriangle className="w-5 h-5" />
              <span className="text-sm font-medium">Report Accident</span>
            </button>
            <button
              onClick={() => handleAction('Uploading evidence')}
              className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <Upload className="w-5 h-5" />
              <span className="text-sm font-medium">Upload Evidence</span>
            </button>
          </div>
        </div>
      </div>
    </MainContent>
  );
}
