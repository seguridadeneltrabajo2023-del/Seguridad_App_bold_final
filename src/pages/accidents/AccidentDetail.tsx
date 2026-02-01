import { useState } from 'react';
import {
  ArrowLeft,
  AlertTriangle,
  Calendar,
  MapPin,
  User,
  Clock,
  Download,
  Upload,
  Eye,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  X,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import { MainContent } from '../../components/layout/MainContent';
import { StatusChip } from '../../components/common/StatusChip';
import { useApp } from '../../contexts/AppContext';

interface TimelineEvent {
  id: string;
  type: string;
  description: string;
  user: string;
  timestamp: string;
  icon: 'reported' | 'investigation' | 'evidence' | 'action' | 'completed' | 'closed';
}

interface Evidence {
  id: string;
  type: 'photo' | 'document' | 'medical_leave' | 'witness_statement';
  fileName: string;
  uploadedBy: string;
  uploadedAt: string;
  description: string;
  isMandatory: boolean;
}

interface CorrectiveAction {
  id: string;
  type: 'corrective' | 'preventive';
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  completionDate?: string;
  completionNotes?: string;
}

const mockTimeline: TimelineEvent[] = [
  {
    id: '1',
    type: 'reported',
    description: 'Accident reported by supervisor',
    user: 'Sarah Johnson',
    timestamp: '2026-01-20 14:35',
    icon: 'reported',
  },
  {
    id: '2',
    type: 'investigation_started',
    description: 'Investigation assigned to OSH team',
    user: 'Michael Chen',
    timestamp: '2026-01-20 15:00',
    icon: 'investigation',
  },
  {
    id: '3',
    type: 'evidence_added',
    description: 'Photos and witness statements uploaded',
    user: 'Sarah Johnson',
    timestamp: '2026-01-20 15:30',
    icon: 'evidence',
  },
  {
    id: '4',
    type: 'action_added',
    description: 'Corrective action created: Install non-slip flooring',
    user: 'Michael Chen',
    timestamp: '2026-01-21 09:00',
    icon: 'action',
  },
];

const mockEvidence: Evidence[] = [
  {
    id: '1',
    type: 'photo',
    fileName: 'accident_scene_1.jpg',
    uploadedBy: 'Sarah Johnson',
    uploadedAt: '2026-01-20 15:30',
    description: 'Wet floor area where slip occurred',
    isMandatory: true,
  },
  {
    id: '2',
    type: 'photo',
    fileName: 'accident_scene_2.jpg',
    uploadedBy: 'Sarah Johnson',
    uploadedAt: '2026-01-20 15:32',
    description: 'Warning signs in area',
    isMandatory: true,
  },
  {
    id: '3',
    type: 'witness_statement',
    fileName: 'witness_statement_JDoe.pdf',
    uploadedBy: 'Michael Chen',
    uploadedAt: '2026-01-20 16:00',
    description: 'Statement from John Doe who witnessed the accident',
    isMandatory: false,
  },
];

const mockActions: CorrectiveAction[] = [
  {
    id: '1',
    type: 'corrective',
    description: 'Install non-slip flooring in loading dock area',
    priority: 'high',
    assignedTo: 'Maintenance Team',
    dueDate: '2026-02-15',
    status: 'in_progress',
  },
  {
    id: '2',
    type: 'corrective',
    description: 'Add additional warning signs for wet floor conditions',
    priority: 'medium',
    assignedTo: 'Safety Officer',
    dueDate: '2026-02-01',
    status: 'completed',
    completionDate: '2026-01-25',
    completionNotes: 'Signs installed and visible from all entry points',
  },
  {
    id: '3',
    type: 'preventive',
    description: 'Conduct slip and fall prevention training for all warehouse staff',
    priority: 'high',
    assignedTo: 'HR Training',
    dueDate: '2026-03-01',
    status: 'pending',
  },
];

export function AccidentDetail() {
  const { addToast } = useApp();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAddActionModal, setShowAddActionModal] = useState(false);

  const accident = {
    id: '1',
    incidentNumber: 'ACC-2026-0001',
    date: '2026-01-20',
    time: '14:30',
    workerName: 'John Smith',
    jobRole: 'Warehouse Worker',
    site: 'Main Warehouse',
    location: 'Loading Dock Area',
    area: 'Shipping & Receiving',
    description:
      'Worker slipped on wet floor while carrying boxes. The floor was wet due to recent cleaning and warning signs were not clearly visible. Worker fell and impacted left side, resulting in bruising and minor injury.',
    witnesses: 'John Doe (Forklift Operator), Mary Williams (Shift Supervisor)',
    incidentType: 'accident',
    severity: 'moderate',
    status: 'in_investigation',
    injuryType: 'Contusion',
    bodyPart: 'Leg/Foot',
    agent: 'Slippery Surface',
    unsafeAct: 'None identified',
    unsafeCondition: 'Slippery Surfaces',
    medicalTreatment: true,
    daysLost: 2,
    reportedBy: 'Sarah Johnson',
    reportedAt: '2026-01-20 14:35',
    investigatedBy: 'Michael Chen',
  };

  const getTimelineIcon = (icon: TimelineEvent['icon']) => {
    switch (icon) {
      case 'reported':
        return <AlertTriangle className="w-5 h-5 text-blue-600" />;
      case 'investigation':
        return <FileText className="w-5 h-5 text-orange-600" />;
      case 'evidence':
        return <Upload className="w-5 h-5 text-purple-600" />;
      case 'action':
        return <Plus className="w-5 h-5 text-green-600" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'closed':
        return <CheckCircle className="w-5 h-5 text-gray-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'serious':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'minor':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleGeneratePDF = () => {
    addToast({ type: 'success', message: 'Generating PDF report...' });
  };

  return (
    <MainContent
      title={`Case ${accident.incidentNumber}`}
      subtitle="Accident investigation and management"
      actions={
        <div className="flex items-center gap-3">
          <button
            onClick={() => addToast({ type: 'info', message: 'Navigating back' })}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <button
            onClick={handleGeneratePDF}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            Generate PDF
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4 flex-1">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">{accident.workerName}</h2>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${getSeverityColor(
                      accident.severity
                    )}`}
                  >
                    {accident.severity.toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{accident.description}</p>
                <div className="flex items-center gap-4">
                  <StatusChip
                    status={accident.status === 'closed' ? 'approved' : 'pending'}
                    label={accident.status.replace('_', ' ')}
                  />
                  <span className="text-sm text-gray-600">
                    Reported {accident.reportedAt} by {accident.reportedBy}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Date/Time</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">{accident.date}</p>
              <p className="text-xs text-gray-600">{accident.time}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Location</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">{accident.site}</p>
              <p className="text-xs text-gray-600">{accident.location}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <User className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Job Role</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">{accident.jobRole}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Days Lost</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">{accident.daysLost} days</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Classification</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Injury Type</span>
                <span className="text-sm font-semibold text-gray-900">{accident.injuryType}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Body Part</span>
                <span className="text-sm font-semibold text-gray-900">{accident.bodyPart}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Agent</span>
                <span className="text-sm font-semibold text-gray-900">{accident.agent}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Unsafe Condition</span>
                <span className="text-sm font-semibold text-gray-900">
                  {accident.unsafeCondition}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Information</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Medical Treatment</span>
                <span
                  className={`text-sm font-semibold ${
                    accident.medicalTreatment ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {accident.medicalTreatment ? 'Required' : 'Not Required'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Days Lost</span>
                <span className="text-sm font-semibold text-gray-900">
                  {accident.daysLost} days
                </span>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600 block mb-2">Witnesses</span>
                <p className="text-sm text-gray-900">{accident.witnesses}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
          <div className="space-y-4">
            {mockTimeline.map((event, index) => (
              <div key={event.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    {getTimelineIcon(event.icon)}
                  </div>
                  {index < mockTimeline.length - 1 && (
                    <div className="w-0.5 h-full bg-gray-200 my-2" />
                  )}
                </div>
                <div className="flex-1 pb-6">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-gray-900">{event.description}</p>
                    <span className="text-xs text-gray-600">{event.timestamp}</span>
                  </div>
                  <p className="text-xs text-gray-600">by {event.user}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Evidence</h3>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload Evidence
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockEvidence.map(evidence => (
              <div
                key={evidence.id}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {evidence.type === 'photo' ? (
                      <ImageIcon className="w-5 h-5 text-blue-600" />
                    ) : (
                      <FileText className="w-5 h-5 text-gray-600" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{evidence.fileName}</p>
                      <p className="text-xs text-gray-600 capitalize">
                        {evidence.type.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  {evidence.isMandatory && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">
                      Required
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 mb-3">{evidence.description}</p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <span className="text-xs text-gray-600">
                    {evidence.uploadedBy} • {evidence.uploadedAt}
                  </span>
                  <button
                    onClick={() => addToast({ type: 'info', message: 'Opening preview' })}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Corrective & Preventive Actions</h3>
              <p className="text-sm text-gray-600">
                {mockActions.filter(a => a.status === 'completed').length} of {mockActions.length}{' '}
                completed
              </p>
            </div>
            <button
              onClick={() => setShowAddActionModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Action
            </button>
          </div>

          <div className="space-y-3">
            {mockActions.map(action => (
              <div
                key={action.id}
                className={`p-4 border rounded-lg ${
                  action.status === 'completed'
                    ? 'bg-green-50 border-green-200'
                    : action.status === 'in_progress'
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {action.status === 'completed' ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : (
                      <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-gray-900">{action.description}</p>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            action.type === 'corrective'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {action.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                        <span className={`font-medium ${getPriorityColor(action.priority)}`}>
                          {action.priority.toUpperCase()} Priority
                        </span>
                        <span>Assigned to: {action.assignedTo}</span>
                        <span>Due: {action.dueDate}</span>
                      </div>
                      <StatusChip
                        status={
                          action.status === 'completed'
                            ? 'approved'
                            : action.status === 'in_progress'
                            ? 'pending'
                            : 'rejected'
                        }
                        label={action.status.replace('_', ' ')}
                      />
                      {action.completionNotes && (
                        <div className="mt-2 p-2 bg-white border border-gray-200 rounded">
                          <p className="text-xs text-gray-600 mb-1">
                            Completed on {action.completionDate}
                          </p>
                          <p className="text-xs text-gray-900">{action.completionNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => addToast({ type: 'info', message: 'Editing action' })}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => addToast({ type: 'info', message: 'Deleting action' })}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
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

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Evidence Type
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="photo">Photo</option>
                  <option value="document">Document</option>
                  <option value="medical_leave">Medical Leave</option>
                  <option value="witness_statement">Witness Statement</option>
                </select>
              </div>

              <div>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                  </div>
                  <input type="file" className="hidden" />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the evidence..."
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    addToast({ type: 'success', message: 'Evidence uploaded successfully' });
                    setShowUploadModal(false);
                  }}
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
        </div>
      )}

      {showAddActionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Corrective Action</h3>
              <button
                onClick={() => setShowAddActionModal(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Action Type</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="corrective">Corrective</option>
                  <option value="preventive">Preventive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Action Description
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the corrective action..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assign To</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Person or team responsible"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    addToast({ type: 'success', message: 'Action added successfully' });
                    setShowAddActionModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Action
                </button>
                <button
                  onClick={() => setShowAddActionModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
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
