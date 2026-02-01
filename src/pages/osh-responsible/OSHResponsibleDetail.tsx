import { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Edit,
  FileText,
  Eye,
  Download,
  AlertTriangle,
  Clock,
  Calendar,
  Mail,
  Phone,
  MapPin,
  User,
  History,
} from 'lucide-react';
import { MainContent } from '../../components/layout/MainContent';
import { StatusChip } from '../../components/common/StatusChip';
import { useApp } from '../../contexts/AppContext';

interface Document {
  id: string;
  type: string;
  fileName: string;
  expiryDate?: string;
  status: 'valid' | 'expiring' | 'expired';
  uploadedAt: string;
  size: string;
}

interface HistoricalResponsible {
  id: string;
  name: string;
  roleTitle: string;
  period: string;
  reason: string;
}

interface AuditEntry {
  id: string;
  action: string;
  performedBy: string;
  timestamp: string;
  details: string;
}

const mockResponsible = {
  id: '1',
  name: 'Dr. Sarah Johnson',
  employeeId: 'EMP-001',
  roleTitle: 'Chief Safety Officer',
  email: 'sarah.johnson@company.com',
  phone: '+1 (555) 123-4567',
  site: 'Building A',
  status: 'active' as const,
  licenseExpiryDate: '2025-06-15',
  approvedBy: 'John Smith',
  approvedAt: '2024-01-10',
  createdAt: '2024-01-05',
  lastUpdated: '2024-01-15',
};

const mockDocuments: Document[] = [
  {
    id: '1',
    type: 'CV / Resume',
    fileName: 'Sarah_Johnson_CV.pdf',
    uploadedAt: '2024-01-05',
    status: 'valid',
    size: '245 KB',
  },
  {
    id: '2',
    type: 'Occupational Health License',
    fileName: 'OSH_License_2024.pdf',
    expiryDate: '2025-06-15',
    uploadedAt: '2024-01-05',
    status: 'valid',
    size: '185 KB',
  },
  {
    id: '3',
    type: 'Diploma',
    fileName: 'HSE_Diploma.pdf',
    uploadedAt: '2024-01-05',
    status: 'valid',
    size: '320 KB',
  },
  {
    id: '4',
    type: 'Training Certificate',
    fileName: 'Advanced_Safety_Training.pdf',
    expiryDate: '2024-03-20',
    uploadedAt: '2024-01-05',
    status: 'expiring',
    size: '156 KB',
  },
];

const mockHistoricalResponsibles: HistoricalResponsible[] = [
  {
    id: '1',
    name: 'Robert Williams',
    roleTitle: 'Safety Officer',
    period: 'Jan 2022 - Dec 2023',
    reason: 'Retired',
  },
  {
    id: '2',
    name: 'Jennifer Adams',
    roleTitle: 'HSE Manager',
    period: 'Mar 2020 - Dec 2021',
    reason: 'Transferred to another facility',
  },
];

const mockAuditHistory: AuditEntry[] = [
  {
    id: '1',
    action: 'Profile Updated',
    performedBy: 'Sarah Johnson',
    timestamp: '2024-01-15 14:30',
    details: 'Updated phone number',
  },
  {
    id: '2',
    action: 'Document Added',
    performedBy: 'Sarah Johnson',
    timestamp: '2024-01-12 09:15',
    details: 'Uploaded training certificate',
  },
  {
    id: '3',
    action: 'Approved',
    performedBy: 'John Smith',
    timestamp: '2024-01-10 16:45',
    details: 'Profile approved and activated',
  },
  {
    id: '4',
    action: 'Profile Created',
    performedBy: 'Admin User',
    timestamp: '2024-01-05 11:20',
    details: 'Initial profile creation',
  },
];

export function OSHResponsibleDetail() {
  const { addToast } = useApp();
  const [activeTab, setActiveTab] = useState<'profile' | 'documents' | 'history'>('profile');

  const handleAction = (action: string) => {
    addToast({ type: 'info', message: action });
  };

  const getDocumentStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'expiring':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'expired':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getDocumentStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'bg-green-50 border-green-200';
      case 'expiring':
        return 'bg-yellow-50 border-yellow-200';
      case 'expired':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <MainContent
      title="OSH Responsible Details"
      subtitle="View and manage responsible person information"
      actions={
        <button
          onClick={() => handleAction('Navigating back to list')}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to List
        </button>
      }
    >
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {mockResponsible.name}
                </h2>
                <p className="text-gray-600 mb-2">{mockResponsible.roleTitle}</p>
                <div className="flex items-center gap-2">
                  <StatusChip
                    status={
                      mockResponsible.status === 'active'
                        ? 'approved'
                        : mockResponsible.status === 'pending'
                        ? 'pending'
                        : 'rejected'
                    }
                    label={mockResponsible.status}
                  />
                  {mockResponsible.status === 'active' && (
                    <span className="text-sm text-gray-600">
                      • Approved by {mockResponsible.approvedBy}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {mockResponsible.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleAction('Approving responsible')}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction('Rejecting responsible')}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                    Reject
                  </button>
                </>
              )}
              {mockResponsible.status === 'active' && (
                <>
                  <button
                    onClick={() => handleAction('Editing responsible')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleAction('Deactivating responsible')}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                    Deactivate
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="border-b border-gray-200">
            <nav className="flex gap-6">
              <button
                onClick={() => setActiveTab('profile')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'profile'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'documents'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Documents
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'history'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Audit & History
              </button>
            </nav>
          </div>

          <div className="mt-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <Mail className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="text-sm font-medium text-gray-900">
                          {mockResponsible.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <Phone className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="text-sm font-medium text-gray-900">
                          {mockResponsible.phone}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <MapPin className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600">Primary Site</p>
                        <p className="text-sm font-medium text-gray-900">
                          {mockResponsible.site}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <User className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600">Employee ID</p>
                        <p className="text-sm font-medium text-gray-900">
                          {mockResponsible.employeeId}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    License Information
                  </h3>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-green-900 mb-1">
                          License Valid
                        </p>
                        <p className="text-sm text-green-800">
                          Occupational Health License expires on{' '}
                          <span className="font-semibold">
                            {mockResponsible.licenseExpiryDate}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Historical Responsibles
                  </h3>
                  <div className="space-y-3">
                    {mockHistoricalResponsibles.map((historical) => (
                      <div
                        key={historical.id}
                        className="p-4 bg-gray-50 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900">
                              {historical.name}
                            </h4>
                            <p className="text-sm text-gray-600">{historical.roleTitle}</p>
                            <p className="text-xs text-gray-500 mt-1">{historical.period}</p>
                          </div>
                          <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs font-medium rounded">
                            {historical.reason}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Document Library
                  </h3>
                  <button
                    onClick={() => handleAction('Uploading new document')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FileText className="w-5 h-5" />
                    Add Document
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {mockDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className={`p-4 border rounded-lg ${getDocumentStatusColor(
                        doc.status
                      )}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          {getDocumentStatusIcon(doc.status)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-semibold text-gray-900">
                                {doc.type}
                              </h4>
                              <span
                                className={`px-2 py-0.5 text-xs font-medium rounded ${
                                  doc.status === 'valid'
                                    ? 'bg-green-200 text-green-800'
                                    : doc.status === 'expiring'
                                    ? 'bg-yellow-200 text-yellow-800'
                                    : 'bg-red-200 text-red-800'
                                }`}
                              >
                                {doc.status === 'valid'
                                  ? 'Valid'
                                  : doc.status === 'expiring'
                                  ? 'Expiring Soon'
                                  : 'Expired'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">{doc.fileName}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-600">
                              <span>Size: {doc.size}</span>
                              <span>Uploaded: {doc.uploadedAt}</span>
                              {doc.expiryDate && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Expires: {doc.expiryDate}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAction(`Viewing ${doc.fileName}`)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleAction(`Downloading ${doc.fileName}`)}
                            className="p-2 text-green-600 hover:bg-green-100 rounded transition-colors"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-blue-900 mb-1">
                        Document Status Legend
                      </h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>
                            <strong>Valid:</strong> Document is current and valid
                          </span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-yellow-600" />
                          <span>
                            <strong>Expiring Soon:</strong> Document expires within 30 days
                          </span>
                        </li>
                        <li className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          <span>
                            <strong>Expired:</strong> Document has expired and needs renewal
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Audit Trail
                </h3>

                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

                  <div className="space-y-6">
                    {mockAuditHistory.map((entry, index) => (
                      <div key={entry.id} className="relative flex gap-4 pl-10">
                        <div className="absolute left-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center border-4 border-white">
                          <History className="w-4 h-4 text-blue-600" />
                        </div>

                        <div className="flex-1 bg-gray-50 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-sm font-semibold text-gray-900">
                              {entry.action}
                            </h4>
                            <span className="text-xs text-gray-500">{entry.timestamp}</span>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{entry.details}</p>
                          <p className="text-xs text-gray-600">
                            Performed by: <span className="font-medium">{entry.performedBy}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainContent>
  );
}
