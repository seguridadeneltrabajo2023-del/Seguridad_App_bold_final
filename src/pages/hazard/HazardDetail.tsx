import { useState } from 'react';
import {
  ArrowLeft,
  AlertTriangle,
  Calendar,
  User,
  FileText,
  Image,
  Plus,
  Eye,
  Download,
  CheckCircle,
  Clock,
  Edit,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { MainContent } from '../../components/layout/MainContent';
import { StatusChip } from '../../components/common/StatusChip';
import { RiskMatrix } from '../../components/hazard/RiskMatrix';
import { useApp } from '../../contexts/AppContext';

interface Evidence {
  id: string;
  type: 'photo' | 'inspection_report' | 'document';
  fileName: string;
  uploadedBy: string;
  uploadedAt: string;
  description: string;
}

interface Action {
  id: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  completionDate?: string;
  completionNotes?: string;
}

const mockEvidence: Evidence[] = [
  {
    id: '1',
    type: 'photo',
    fileName: 'forklift_area_photo1.jpg',
    uploadedBy: 'Sarah Johnson',
    uploadedAt: '2026-01-20 14:30',
    description: 'Current traffic flow in production area',
  },
  {
    id: '2',
    type: 'inspection_report',
    fileName: 'safety_inspection_jan2026.pdf',
    uploadedBy: 'Michael Chen',
    uploadedAt: '2026-01-18 09:15',
    description: 'Monthly safety inspection report',
  },
];

const mockActions: Action[] = [
  {
    id: '1',
    description: 'Install proximity sensors on all forklifts',
    priority: 'high',
    assignedTo: 'Sarah Johnson',
    dueDate: '2026-02-15',
    status: 'in_progress',
  },
  {
    id: '2',
    description: 'Conduct additional forklift safety training for all operators',
    priority: 'high',
    assignedTo: 'Michael Chen',
    dueDate: '2026-02-28',
    status: 'pending',
  },
  {
    id: '3',
    description: 'Review and update pedestrian pathway markings',
    priority: 'medium',
    assignedTo: 'Emma Davis',
    dueDate: '2026-02-20',
    status: 'pending',
  },
];

export function HazardDetail() {
  const { addToast } = useApp();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAddActionModal, setShowAddActionModal] = useState(false);

  const hazard = {
    id: '1',
    processArea: 'Production Floor',
    taskActivity: 'Operating forklift',
    hazardType: 'Moving Machinery',
    hazardCategory: 'Physical',
    hazardDescription:
      'Risk of collision between forklifts and pedestrians or other equipment in high-traffic production areas. Current traffic patterns create blind spots and congestion during peak hours.',
    consequence: 'Serious injury or fatality from impact with moving forklift',
    probability: 3,
    severity: 5,
    riskScore: 15,
    riskLevel: 'high',
    existingControls:
      'Warning lights and alarms on forklifts, designated pedestrian pathways marked with yellow lines, speed limit of 5 mph in production areas, forklift operator certification required',
    proposedControls:
      'Install proximity sensors with automatic braking, implement one-way traffic system, add convex mirrors at blind corners, increase frequency of safety audits',
    owner: 'Sarah Johnson',
    reviewDate: '2026-03-01',
    status: 'open',
    createdAt: '2026-01-15',
    createdBy: 'Sarah Johnson',
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
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

  const handleAction = (action: string) => {
    addToast({ type: 'info', message: action });
  };

  return (
    <MainContent
      title="Hazard Detail"
      subtitle="View and manage hazard information"
      actions={
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleAction('Navigating back to hazard matrix')}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <button
            onClick={() => handleAction('Editing hazard')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit className="w-5 h-5" />
            Edit
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4 flex-1">
              <div className="p-3 bg-orange-100 rounded-lg">
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">{hazard.hazardType}</h2>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${getRiskLevelColor(
                      hazard.riskLevel
                    )}`}
                  >
                    Risk Score: {hazard.riskScore} - {hazard.riskLevel.toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{hazard.hazardDescription}</p>
                <div className="flex items-center gap-4">
                  <StatusChip
                    status={hazard.status === 'open' ? 'rejected' : 'pending'}
                    label={hazard.status}
                  />
                  <span className="text-sm text-gray-600">
                    Created {hazard.createdAt} by {hazard.createdBy}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Process / Area</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">{hazard.processArea}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Task / Activity</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">{hazard.taskActivity}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <User className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Responsible Owner</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">{hazard.owner}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Next Review</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">{hazard.reviewDate}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Assessment</h3>
          <RiskMatrix
            selectedProbability={hazard.probability}
            selectedSeverity={hazard.severity}
            showLegend={true}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Consequence Analysis</h3>
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-gray-900">{hazard.consequence}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hazard Category</h3>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-semibold text-blue-900">{hazard.hazardCategory}</p>
              <p className="text-xs text-blue-700 mt-1">{hazard.hazardType}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Existing Control Measures</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{hazard.existingControls}</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Proposed Control Measures</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{hazard.proposedControls}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Related Evidence</h3>
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
              <div key={evidence.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {evidence.type === 'photo' ? (
                      <Image className="w-5 h-5 text-blue-600" />
                    ) : (
                      <FileText className="w-5 h-5 text-blue-600" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{evidence.fileName}</p>
                      <p className="text-xs text-gray-600 capitalize">{evidence.type.replace('_', ' ')}</p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mb-2">{evidence.description}</p>
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <span className="text-xs text-gray-600">
                    {evidence.uploadedBy} • {evidence.uploadedAt}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleAction('Viewing evidence')}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleAction('Downloading evidence')}
                      className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Improvement Actions</h3>
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
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        {action.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span className={`font-medium ${getPriorityColor(action.priority)}`}>
                          {action.priority.toUpperCase()} Priority
                        </span>
                        <span>Assigned to: {action.assignedTo}</span>
                        <span>Due: {action.dueDate}</span>
                      </div>
                      <div className="mt-2">
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
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleAction('Editing action')}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleAction('Deleting action')}
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
                  <option value="inspection_report">Inspection Report</option>
                  <option value="document">Document</option>
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
                    handleAction('Uploading evidence');
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
              <h3 className="text-lg font-semibold text-gray-900">Add Improvement Action</h3>
              <button
                onClick={() => setShowAddActionModal(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Action Description
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the improvement action..."
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
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select person</option>
                  <option value="1">Sarah Johnson</option>
                  <option value="2">Michael Chen</option>
                  <option value="3">Emma Davis</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    handleAction('Adding improvement action');
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
