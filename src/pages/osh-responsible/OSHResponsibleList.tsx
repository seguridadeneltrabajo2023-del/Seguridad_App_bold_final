import { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  UserX,
  RefreshCw,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { MainContent } from '../../components/layout/MainContent';
import { StatusChip } from '../../components/common/StatusChip';
import { useApp } from '../../contexts/AppContext';

type ResponsibleStatus = 'active' | 'inactive' | 'pending';

interface OSHResponsible {
  id: string;
  name: string;
  employeeId: string;
  roleTitle: string;
  licenseExpiryDate: string;
  status: ResponsibleStatus;
  approvedBy: string;
  lastUpdated: string;
  site: string;
  email: string;
}

const mockResponsibles: OSHResponsible[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    employeeId: 'EMP-001',
    roleTitle: 'Chief Safety Officer',
    licenseExpiryDate: '2025-06-15',
    status: 'active',
    approvedBy: 'John Smith',
    lastUpdated: '2024-01-15',
    site: 'Building A',
    email: 'sarah.johnson@company.com',
  },
  {
    id: '2',
    name: 'Michael Chen',
    employeeId: 'EMP-045',
    roleTitle: 'Safety Manager',
    licenseExpiryDate: '2024-03-20',
    status: 'active',
    approvedBy: 'Sarah Johnson',
    lastUpdated: '2024-01-10',
    site: 'Building B',
    email: 'michael.chen@company.com',
  },
  {
    id: '3',
    name: 'Emma Davis',
    employeeId: 'EMP-032',
    roleTitle: 'HSE Coordinator',
    licenseExpiryDate: '2024-02-10',
    status: 'pending',
    approvedBy: '',
    lastUpdated: '2024-01-20',
    site: 'Building C',
    email: 'emma.davis@company.com',
  },
  {
    id: '4',
    name: 'Robert Williams (Historical)',
    employeeId: 'EMP-012',
    roleTitle: 'Former Safety Officer',
    licenseExpiryDate: '2023-12-31',
    status: 'inactive',
    approvedBy: 'John Smith',
    lastUpdated: '2023-12-15',
    site: 'Building A',
    email: 'robert.williams@company.com',
  },
];

export function OSHResponsibleList() {
  const { addToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [siteFilter, setSiteFilter] = useState<string>('all');
  const [expiryFilter, setExpiryFilter] = useState<string>('all');

  const handleAction = (action: string, responsible: OSHResponsible) => {
    addToast({ type: 'info', message: `${action}: ${responsible.name}` });
  };

  const getLicenseStatus = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) return { status: 'expired', color: 'red', icon: AlertTriangle };
    if (daysUntilExpiry <= 30) return { status: 'expiring', color: 'yellow', icon: Clock };
    return { status: 'valid', color: 'green', icon: CheckCircle };
  };

  const filteredResponsibles = mockResponsibles.filter(resp => {
    const matchesSearch = resp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          resp.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || resp.status === statusFilter;
    const matchesSite = siteFilter === 'all' || resp.site === siteFilter;

    let matchesExpiry = true;
    if (expiryFilter === 'expiring') {
      const licenseStatus = getLicenseStatus(resp.licenseExpiryDate);
      matchesExpiry = licenseStatus.status === 'expiring' || licenseStatus.status === 'expired';
    } else if (expiryFilter === 'valid') {
      const licenseStatus = getLicenseStatus(resp.licenseExpiryDate);
      matchesExpiry = licenseStatus.status === 'valid';
    }

    return matchesSearch && matchesStatus && matchesSite && matchesExpiry;
  });

  if (mockResponsibles.length === 0) {
    return (
      <MainContent
        title="OSH Responsible Persons"
        subtitle="Manage authorized health and safety leads"
      >
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserX className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No OSH Responsible Persons
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Get started by adding your first OSH responsible person. They will be authorized to manage health and safety activities.
          </p>
          <button
            onClick={() => handleAction('Creating new OSH Responsible', {} as OSHResponsible)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add OSH Responsible
          </button>
        </div>
      </MainContent>
    );
  }

  return (
    <MainContent
      title="OSH Responsible Persons"
      subtitle="Manage authorized health and safety leads"
      actions={
        <button
          onClick={() => handleAction('Creating new OSH Responsible', {} as OSHResponsible)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Responsible
        </button>
      }
    >
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or employee ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-5 h-5" />
                Filters
                {(statusFilter !== 'all' || siteFilter !== 'all' || expiryFilter !== 'all') && (
                  <span className="ml-1 px-2 py-0.5 bg-blue-600 text-white text-xs font-medium rounded-full">
                    {[statusFilter !== 'all', siteFilter !== 'all', expiryFilter !== 'all'].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>

            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending Approval</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Site
                    </label>
                    <select
                      value={siteFilter}
                      onChange={(e) => setSiteFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Sites</option>
                      <option value="Building A">Building A</option>
                      <option value="Building B">Building B</option>
                      <option value="Building C">Building C</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      License Expiry
                    </label>
                    <select
                      value={expiryFilter}
                      onChange={(e) => setExpiryFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All</option>
                      <option value="expiring">Expiring Soon / Expired</option>
                      <option value="valid">Valid</option>
                    </select>
                  </div>
                </div>

                {(statusFilter !== 'all' || siteFilter !== 'all' || expiryFilter !== 'all') && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => {
                        setStatusFilter('all');
                        setSiteFilter('all');
                        setExpiryFilter('all');
                      }}
                      className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name / ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role / Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    License Expiry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Approved By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredResponsibles.map((responsible) => {
                  const licenseStatus = getLicenseStatus(responsible.licenseExpiryDate);
                  const StatusIcon = licenseStatus.icon;

                  return (
                    <tr key={responsible.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {responsible.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {responsible.employeeId}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{responsible.roleTitle}</div>
                        <div className="text-sm text-gray-500">{responsible.site}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <StatusIcon
                            className={`w-4 h-4 ${
                              licenseStatus.color === 'red'
                                ? 'text-red-600'
                                : licenseStatus.color === 'yellow'
                                ? 'text-yellow-600'
                                : 'text-green-600'
                            }`}
                          />
                          <div>
                            <div className="text-sm text-gray-900">
                              {responsible.licenseExpiryDate}
                            </div>
                            <div
                              className={`text-xs font-medium ${
                                licenseStatus.color === 'red'
                                  ? 'text-red-600'
                                  : licenseStatus.color === 'yellow'
                                  ? 'text-yellow-600'
                                  : 'text-green-600'
                              }`}
                            >
                              {licenseStatus.status === 'expired'
                                ? 'Expired'
                                : licenseStatus.status === 'expiring'
                                ? 'Expiring Soon'
                                : 'Valid'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusChip
                          status={
                            responsible.status === 'active'
                              ? 'approved'
                              : responsible.status === 'pending'
                              ? 'pending'
                              : 'rejected'
                          }
                          label={responsible.status}
                        />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {responsible.approvedBy || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {responsible.lastUpdated}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleAction('Viewing', responsible)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleAction('Editing', responsible)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {responsible.status === 'active' && (
                            <>
                              <button
                                onClick={() => handleAction('Deactivating', responsible)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Deactivate"
                              >
                                <UserX className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleAction('Replacing', responsible)}
                                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                title="Replace"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredResponsibles.length === 0 && (
            <div className="p-12 text-center">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No results found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filters to find what you're looking for.
              </p>
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-blue-900 mb-1">
                Historical Records
              </h4>
              <p className="text-sm text-blue-800">
                Inactive responsibles are retained for audit purposes. They remain visible but cannot be assigned to new activities.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainContent>
  );
}
