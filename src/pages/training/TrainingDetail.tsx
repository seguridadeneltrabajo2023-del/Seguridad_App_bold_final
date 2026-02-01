import { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  Clock,
  BookOpen,
  Users,
  CheckCircle,
  X,
  Upload,
  QrCode,
  Edit2,
  Download,
  FileText,
  Image as ImageIcon,
  Award,
  AlertCircle,
} from 'lucide-react';
import { MainContent } from '../../components/layout/MainContent';
import { StatusChip } from '../../components/common/StatusChip';
import { useApp } from '../../contexts/AppContext';

interface Participant {
  id: string;
  name: string;
  email: string;
  jobRole: string;
  attendanceStatus: 'invited' | 'confirmed' | 'attended' | 'absent';
  hasSigned: boolean;
  checkInTime?: string;
  signatureTimestamp?: string;
}

const mockParticipants: Participant[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@company.com',
    jobRole: 'Warehouse Worker',
    attendanceStatus: 'attended',
    hasSigned: true,
    checkInTime: '09:05',
    signatureTimestamp: '2026-01-22 09:05:30',
  },
  {
    id: '2',
    name: 'Maria Garcia',
    email: 'maria.garcia@company.com',
    jobRole: 'Forklift Operator',
    attendanceStatus: 'attended',
    hasSigned: true,
    checkInTime: '09:03',
    signatureTimestamp: '2026-01-22 09:03:15',
  },
  {
    id: '3',
    name: 'Robert Johnson',
    email: 'robert.j@company.com',
    jobRole: 'Safety Inspector',
    attendanceStatus: 'attended',
    hasSigned: false,
    checkInTime: '09:10',
  },
  {
    id: '4',
    name: 'Sarah Williams',
    email: 'sarah.w@company.com',
    jobRole: 'Team Lead',
    attendanceStatus: 'absent',
    hasSigned: false,
  },
];

export function TrainingDetail() {
  const { addToast } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'evidence' | 'certificates'>('overview');
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [signatureMode, setSignatureMode] = useState<'pad' | 'qr'>('pad');

  const training = {
    id: '1',
    topic: 'Forklift Operation Certification',
    objective: 'Train workers on safe forklift operation, maintenance, and OSHA compliance requirements.',
    date: '2026-01-22',
    time: '14:00',
    durationHours: 4,
    site: 'Production Plant',
    location: 'Warehouse Floor',
    instructor: 'Sarah Johnson',
    instructorCredentials: 'Certified Forklift Trainer (CFT)',
    trainingType: 'technical',
    status: 'in_progress',
    qrCode: 'TRN-A3B2C1D4E5F6',
    requiresSignature: true,
    requiresCertificate: true,
    minAttendanceRequired: 80,
    totalParticipants: 12,
    attendedCount: 10,
    signedCount: 8,
    coveragePercent: 83,
  };

  const evidence = [
    {
      id: '1',
      type: 'photo',
      fileName: 'training_session_1.jpg',
      uploadedBy: 'Michael Chen',
      uploadedAt: '2026-01-22 14:30',
      description: 'Training session in progress',
    },
    {
      id: '2',
      type: 'attendance_sheet',
      fileName: 'attendance_forklift_training.pdf',
      uploadedBy: 'Sarah Johnson',
      uploadedAt: '2026-01-22 15:00',
      description: 'Signed attendance sheet',
    },
  ];

  const handleSignParticipant = (participant: Participant) => {
    setSelectedParticipant(participant);
    setShowSignatureModal(true);
  };

  const handleCompleteSignature = () => {
    addToast({ type: 'success', message: 'Signature saved successfully' });
    setShowSignatureModal(false);
    setSelectedParticipant(null);
  };

  const handleGenerateCertificate = (participant: Participant) => {
    addToast({ type: 'success', message: `Generating certificate for ${participant.name}` });
  };

  const handleCloseTraining = () => {
    const pendingSignatures = mockParticipants.filter(
      p => p.attendanceStatus === 'attended' && !p.hasSigned
    ).length;

    if (pendingSignatures > 0) {
      addToast({
        type: 'error',
        message: `Cannot close training: ${pendingSignatures} pending signature(s)`,
      });
      return;
    }

    if (evidence.length < 2) {
      addToast({
        type: 'error',
        message: 'Cannot close training: Minimum evidence requirements not met',
      });
      return;
    }

    addToast({ type: 'success', message: 'Training closed successfully' });
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'attendance', label: 'Attendance & Signatures', icon: Users },
    { id: 'evidence', label: 'Evidence', icon: FileText },
    { id: 'certificates', label: 'Certificates', icon: Award },
  ];

  return (
    <MainContent
      title={training.topic}
      subtitle="Training session details and management"
      actions={
        <div className="flex items-center gap-3">
          <button
            onClick={() => addToast({ type: 'info', message: 'Navigating back' })}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          {training.status !== 'closed' && (
            <button
              onClick={handleCloseTraining}
              className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              Close Training
            </button>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4 flex-1">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">{training.topic}</h2>
                  <StatusChip
                    status={training.status === 'closed' ? 'approved' : 'pending'}
                    label={training.status.replace('_', ' ')}
                  />
                </div>
                <p className="text-gray-600 mb-4">{training.objective}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium capitalize">
                    {training.trainingType}
                  </span>
                  <span className="text-gray-600">
                    Coverage: <span className="font-semibold">{training.coveragePercent}%</span>
                  </span>
                  <span className="text-gray-600">
                    Signed: <span className="font-semibold">{training.signedCount}/{training.attendedCount}</span>
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
              <p className="text-sm font-semibold text-gray-900">{training.date}</p>
              <p className="text-xs text-gray-600">{training.time}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Location</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">{training.site}</p>
              <p className="text-xs text-gray-600">{training.location}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <User className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Instructor</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">{training.instructor}</p>
              <p className="text-xs text-gray-600">{training.instructorCredentials}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Duration</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">{training.durationHours} hours</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="border-b border-gray-200">
            <div className="flex gap-4 px-6">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`flex items-center gap-2 px-4 py-4 border-b-2 font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Training Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Training Type</p>
                      <p className="text-sm font-semibold text-gray-900 capitalize">
                        {training.trainingType}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Min. Attendance Required</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {training.minAttendanceRequired}%
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Total Participants</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {training.totalParticipants}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">QR Code</p>
                      <p className="text-sm font-mono font-semibold text-gray-900">
                        {training.qrCode}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <CheckCircle
                        className={`w-5 h-5 ${
                          training.requiresSignature ? 'text-green-600' : 'text-gray-400'
                        }`}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Requires Signature</p>
                        <p className="text-xs text-gray-600">
                          {training.requiresSignature ? 'Enabled' : 'Disabled'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <Award
                        className={`w-5 h-5 ${
                          training.requiresCertificate ? 'text-green-600' : 'text-gray-400'
                        }`}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Issues Certificates</p>
                        <p className="text-xs text-gray-600">
                          {training.requiresCertificate ? 'Enabled' : 'Disabled'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'attendance' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Attendance Tracking</h3>
                    <p className="text-sm text-gray-600">
                      {training.attendedCount} of {training.totalParticipants} attended •{' '}
                      {training.signedCount} signatures collected
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setSignatureMode('qr');
                        setShowQRModal(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <QrCode className="w-4 h-4" />
                      Show QR Code
                    </button>
                    <button
                      onClick={() => {
                        setSignatureMode('pad');
                        setShowSignatureModal(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Signature Pad
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {mockParticipants.map(participant => (
                    <div
                      key={participant.id}
                      className={`p-4 border-2 rounded-lg ${
                        participant.hasSigned
                          ? 'border-green-200 bg-green-50'
                          : participant.attendanceStatus === 'attended'
                          ? 'border-yellow-200 bg-yellow-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          {participant.hasSigned ? (
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          ) : participant.attendanceStatus === 'attended' ? (
                            <AlertCircle className="w-6 h-6 text-yellow-600" />
                          ) : (
                            <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <p className="text-sm font-semibold text-gray-900">
                                {participant.name}
                              </p>
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  participant.attendanceStatus === 'attended'
                                    ? 'bg-green-100 text-green-700'
                                    : participant.attendanceStatus === 'absent'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {participant.attendanceStatus}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600">
                              {participant.jobRole} • {participant.email}
                            </p>
                            {participant.signatureTimestamp && (
                              <p className="text-xs text-green-600 mt-1">
                                Signed: {participant.signatureTimestamp}
                              </p>
                            )}
                          </div>
                        </div>
                        {participant.attendanceStatus === 'attended' && !participant.hasSigned && (
                          <button
                            onClick={() => handleSignParticipant(participant)}
                            className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Sign
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'evidence' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Training Evidence</h3>
                    <p className="text-sm text-gray-600">{evidence.length} file(s) uploaded</p>
                  </div>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Evidence
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {evidence.map(item => (
                    <div
                      key={item.id}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {item.type === 'photo' ? (
                            <ImageIcon className="w-5 h-5 text-blue-600" />
                          ) : (
                            <FileText className="w-5 h-5 text-gray-600" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.fileName}</p>
                            <p className="text-xs text-gray-600 capitalize">
                              {item.type.replace('_', ' ')}
                            </p>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mb-3">{item.description}</p>
                      <div className="text-xs text-gray-600">
                        {item.uploadedBy} • {item.uploadedAt}
                      </div>
                    </div>
                  ))}
                </div>

                {evidence.length < 2 && (
                  <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-yellow-800">
                          Minimum evidence requirements not met
                        </p>
                        <p className="text-xs text-yellow-700 mt-1">
                          Upload at least 2 pieces of evidence to close this training
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'certificates' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Training Certificates</h3>
                    <p className="text-sm text-gray-600">
                      Certificates available for participants who completed the training
                    </p>
                  </div>
                  <button
                    onClick={() => addToast({ type: 'success', message: 'Generating all certificates' })}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Award className="w-4 h-4" />
                    Generate All
                  </button>
                </div>

                <div className="space-y-2">
                  {mockParticipants
                    .filter(p => p.attendanceStatus === 'attended' && p.hasSigned)
                    .map(participant => (
                      <div
                        key={participant.id}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Award className="w-6 h-6 text-blue-600" />
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {participant.name}
                              </p>
                              <p className="text-xs text-gray-600">{participant.jobRole}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleGenerateCertificate(participant)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </button>
                        </div>
                      </div>
                    ))}
                </div>

                {mockParticipants.filter(p => p.attendanceStatus === 'attended' && p.hasSigned)
                  .length === 0 && (
                  <div className="text-center py-8">
                    <Award className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No certificates available yet</p>
                    <p className="text-sm text-gray-500">
                      Certificates will be generated after participants sign attendance
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">QR Code Check-In</h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="text-center">
              <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-32 h-32 text-gray-400" />
              </div>
              <p className="text-sm font-mono font-semibold text-gray-900 mb-2">
                {training.qrCode}
              </p>
              <p className="text-sm text-gray-600">
                Workers can scan this QR code to check in and sign attendance from their mobile
                device
              </p>
            </div>

            <button
              onClick={() => setShowQRModal(false)}
              className="w-full mt-6 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showSignatureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {selectedParticipant ? `Sign for ${selectedParticipant.name}` : 'Signature Pad'}
              </h3>
              <button
                onClick={() => {
                  setShowSignatureModal(false);
                  setSelectedParticipant(null);
                }}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {!selectedParticipant && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Participant
                </label>
                <select
                  onChange={e => {
                    const participant = mockParticipants.find(p => p.id === e.target.value);
                    setSelectedParticipant(participant || null);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose participant...</option>
                  {mockParticipants
                    .filter(p => p.attendanceStatus === 'attended' && !p.hasSigned)
                    .map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} - {p.jobRole}
                      </option>
                    ))}
                </select>
              </div>
            )}

            <div className="mb-6">
              <div className="w-full h-64 border-2 border-gray-300 border-dashed rounded-lg flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <Edit2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Signature pad area</p>
                  <p className="text-sm text-gray-500">Sign in the box above</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCompleteSignature}
                disabled={!selectedParticipant}
                className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Save Signature
              </button>
              <button
                onClick={() => addToast({ type: 'info', message: 'Signature cleared' })}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Upload Evidence</h3>
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
                  <option value="attendance_sheet">Attendance Sheet</option>
                  <option value="minutes">Training Minutes</option>
                  <option value="evaluation">Evaluation Form</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                  <input type="file" className="hidden" accept="image/*,.pdf" />
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
