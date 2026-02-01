import { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  Edit,
  XCircle,
  RefreshCw,
  Printer,
  Upload,
  FileText,
  Download,
  Eye,
  X,
  AlertCircle,
  Bell,
  BellOff,
} from 'lucide-react';
import { MainContent } from '../../components/layout/MainContent';
import { StatusChip } from '../../components/common/StatusChip';
import { useApp } from '../../contexts/AppContext';

interface EvidenceRequirement {
  id: string;
  name: string;
  isRequired: boolean;
  isCompleted: boolean;
  files: EvidenceFile[];
}

interface EvidenceFile {
  id: string;
  fileName: string;
  fileSize: string;
  uploadedBy: string;
  uploadedAt: string;
  notes: string;
}

interface Participant {
  id: string;
  name: string;
  role: string;
  status: 'confirmed' | 'declined' | 'pending';
}

const mockRequirements: EvidenceRequirement[] = [
  {
    id: '1',
    name: 'Inspection Checklist',
    isRequired: true,
    isCompleted: true,
    files: [
      {
        id: '1',
        fileName: 'safety_checklist_jan2026.pdf',
        fileSize: '245 KB',
        uploadedBy: 'Sarah Johnson',
        uploadedAt: '2026-01-25 10:30',
        notes: 'All items reviewed and approved',
      },
    ],
  },
  {
    id: '2',
    name: 'Photo Documentation',
    isRequired: true,
    isCompleted: false,
    files: [],
  },
  {
    id: '3',
    name: 'Corrective Action Report',
    isRequired: false,
    isCompleted: false,
    files: [],
  },
];

const mockParticipants: Participant[] = [
  { id: '1', name: 'Sarah Johnson', role: 'Organizer', status: 'confirmed' },
  { id: '2', name: 'Michael Chen', role: 'Participant', status: 'confirmed' },
  { id: '3', name: 'Emma Davis', role: 'Observer', status: 'pending' },
  { id: '4', name: 'Robert Williams', role: 'Participant', status: 'confirmed' },
];

export function ActivityDetail() {
  const { addToast } = useApp();
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState('1_day_before');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<EvidenceRequirement | null>(null);

  const activity = {
    id: '1',
    title: 'Safety Inspection - Building A',
    description:
      'Comprehensive monthly safety inspection covering all facilities, equipment, and work areas in Building A. This includes fire safety systems, emergency exits, PPE stations, and hazard identification.',
    activityType: 'inspection',
    status: 'in_progress',
    startDate: '2026-01-25',
    startTime: '09:00',
    endTime: '11:00',
    site: 'Building A',
    location: 'Main Facility - All Floors',
    owner: 'Sarah Johnson',
    color: '#3B82F6',
  };

  const handleAction = (action: string) => {
    addToast({ type: 'info', message: action });
  };

  const handleUpload = (requirement: EvidenceRequirement) => {
    setSelectedRequirement(requirement);
    setShowUploadModal(true);
  };

  const handleFileUpload = () => {
    addToast({ type: 'success', message: 'File uploaded successfully' });
    setShowUploadModal(false);
  };

  const completedRequirements = mockRequirements.filter(r => r.isCompleted).length;
  const totalRequiredRequirements = mockRequirements.filter(r => r.isRequired).length;
  const allRequiredCompleted = completedRequirements >= totalRequiredRequirements;

  return (
    <MainContent
      title="Activity Details"
      subtitle="View and manage activity information"
      actions={
        <button
          onClick={() => handleAction('Navigating back')}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
      }
    >
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4 flex-1">
              <div
                className="w-2 h-20 rounded-full"
                style={{ backgroundColor: activity.color }}
              />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{activity.title}</h2>
                <p className="text-gray-600 mb-4">{activity.description}</p>
                <div className="flex items-center gap-3">
                  <StatusChip
                    status={
                      activity.status === 'completed'
                        ? 'approved'
                        : activity.status === 'overdue'
                        ? 'rejected'
                        : 'pending'
                    }
                    label={activity.status.replace('_', ' ')}
                  />
                  <span
                    className="px-3 py-1 text-sm font-medium rounded capitalize"
                    style={{
                      backgroundColor: `${activity.color}20`,
                      color: activity.color,
                    }}
                  >
                    {activity.activityType}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAction('Editing activity')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-5 h-5" />
                Edit
              </button>
              <button
                onClick={() => handleAction('Printing activity')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Printer className="w-5 h-5" />
                Print
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Date</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">{activity.startDate}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Time</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {activity.startTime} - {activity.endTime}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Location</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">{activity.site}</p>
              <p className="text-xs text-gray-600">{activity.location}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Participants</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {mockParticipants.length} people
              </p>
              <p className="text-xs text-gray-600">Owner: {activity.owner}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Participants</h3>
            <div className="space-y-3">
              {mockParticipants.map(participant => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{participant.name}</p>
                    <p className="text-xs text-gray-600">{participant.role}</p>
                  </div>
                  <StatusChip
                    status={
                      participant.status === 'confirmed'
                        ? 'approved'
                        : participant.status === 'declined'
                        ? 'rejected'
                        : 'pending'
                    }
                    label={participant.status}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reminder Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {reminderEnabled ? (
                    <Bell className="w-5 h-5 text-blue-600" />
                  ) : (
                    <BellOff className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email Reminders</p>
                    <p className="text-xs text-gray-600">
                      {reminderEnabled ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setReminderEnabled(!reminderEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    reminderEnabled ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      reminderEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {reminderEnabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reminder Timing
                  </label>
                  <select
                    value={reminderTime}
                    onChange={e => setReminderTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1_day_before">1 day before</option>
                    <option value="2_hours_before">2 hours before</option>
                    <option value="1_hour_before">1 hour before</option>
                    <option value="30_min_before">30 minutes before</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Evidence Requirements</h3>
              <p className="text-sm text-gray-600">
                {completedRequirements} of {totalRequiredRequirements} required items completed
              </p>
            </div>
            {allRequiredCompleted && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">All required evidence collected</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {mockRequirements.map(requirement => (
              <div
                key={requirement.id}
                className={`p-4 border rounded-lg ${
                  requirement.isCompleted
                    ? 'bg-green-50 border-green-200'
                    : requirement.isRequired
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    {requirement.isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : requirement.isRequired ? (
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    ) : (
                      <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-gray-900">
                          {requirement.name}
                        </h4>
                        {requirement.isRequired && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-600 rounded">
                            Required
                          </span>
                        )}
                      </div>
                      {requirement.files.length > 0 && (
                        <div className="space-y-2 mt-3">
                          {requirement.files.map(file => (
                            <div
                              key={file.id}
                              className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded"
                            >
                              <div className="flex items-center gap-3">
                                <FileText className="w-4 h-4 text-gray-400" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {file.fileName}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {file.fileSize} • Uploaded by {file.uploadedBy} •{' '}
                                    {file.uploadedAt}
                                  </p>
                                  {file.notes && (
                                    <p className="text-xs text-gray-600 mt-1">{file.notes}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleAction('Viewing file')}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  title="View"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleAction('Downloading file')}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                                  title="Download"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleUpload(requirement)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Upload
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
          <div className="flex flex-wrap gap-3">
            {activity.status !== 'completed' && (
              <button
                onClick={() => handleAction('Marking as complete')}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckCircle className="w-5 h-5" />
                Mark Complete
              </button>
            )}
            <button
              onClick={() => handleAction('Rescheduling activity')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Reschedule
            </button>
            <button
              onClick={() => handleAction('Cancelling activity')}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              <XCircle className="w-5 h-5" />
              Cancel Activity
            </button>
          </div>
        </div>
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Upload Evidence</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Upload files for: <strong>{selectedRequirement?.name}</strong>
              </p>
            </div>

            <div className="mb-4">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PDF, images, or documents (max 10MB)</p>
                </div>
                <input type="file" className="hidden" />
              </label>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add notes about this evidence..."
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleFileUpload}
                className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Upload
              </button>
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </MainContent>
  );
}
