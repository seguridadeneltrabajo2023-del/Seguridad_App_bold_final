import { useState } from 'react';
import {
  ArrowLeft,
  Upload,
  X,
  FileText,
  CheckCircle,
  Users,
  Plus,
  Trash2,
} from 'lucide-react';
import { MainContent } from '../../components/layout/MainContent';
import { useApp } from '../../contexts/AppContext';

interface TrainingFormData {
  topic: string;
  objective: string;
  trainingDate: string;
  trainingTime: string;
  durationHours: number;
  site: string;
  location: string;
  instructor: string;
  instructorCredentials: string;
  trainingType: string;
  minAttendanceRequired: number;
  requiresSignature: boolean;
  requiresCertificate: boolean;
}

interface Participant {
  id: string;
  name: string;
  email: string;
  jobRole: string;
}

interface Material {
  id: string;
  file: File | null;
  fileName: string;
  type: 'presentation' | 'document' | 'video' | 'reference' | 'handout';
  description: string;
}

const mockEmployees: Participant[] = [
  { id: '1', name: 'John Smith', email: 'john.smith@company.com', jobRole: 'Warehouse Worker' },
  { id: '2', name: 'Maria Garcia', email: 'maria.garcia@company.com', jobRole: 'Forklift Operator' },
  { id: '3', name: 'Robert Johnson', email: 'robert.j@company.com', jobRole: 'Safety Inspector' },
  { id: '4', name: 'Sarah Williams', email: 'sarah.w@company.com', jobRole: 'Team Lead' },
  { id: '5', name: 'Michael Brown', email: 'michael.b@company.com', jobRole: 'Warehouse Worker' },
];

export function CreateTraining() {
  const { addToast } = useApp();
  const [formData, setFormData] = useState<TrainingFormData>({
    topic: '',
    objective: '',
    trainingDate: '',
    trainingTime: '',
    durationHours: 2,
    site: '',
    location: '',
    instructor: '',
    instructorCredentials: '',
    trainingType: 'safety',
    minAttendanceRequired: 80,
    requiresSignature: true,
    requiresCertificate: false,
  });

  const [selectedParticipants, setSelectedParticipants] = useState<Participant[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [showParticipantModal, setShowParticipantModal] = useState(false);

  const handleInputChange = (field: keyof TrainingFormData, value: string | boolean | number) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleAddMaterial = () => {
    const newMaterial: Material = {
      id: Date.now().toString(),
      file: null,
      fileName: '',
      type: 'document',
      description: '',
    };
    setMaterials([...materials, newMaterial]);
  };

  const handleFileSelect = (id: string, file: File) => {
    setMaterials(materials.map(m => (m.id === id ? { ...m, file, fileName: file.name } : m)));
  };

  const handleRemoveMaterial = (id: string) => {
    setMaterials(materials.filter(m => m.id !== id));
  };

  const handleAddParticipant = (participant: Participant) => {
    if (!selectedParticipants.find(p => p.id === participant.id)) {
      setSelectedParticipants([...selectedParticipants, participant]);
    }
  };

  const handleRemoveParticipant = (id: string) => {
    setSelectedParticipants(selectedParticipants.filter(p => p.id !== id));
  };

  const handleSubmit = () => {
    if (!formData.topic || !formData.trainingDate || !formData.instructor) {
      addToast({ type: 'error', message: 'Please fill in all required fields' });
      return;
    }

    if (selectedParticipants.length === 0) {
      addToast({ type: 'error', message: 'Please select at least one participant' });
      return;
    }

    addToast({ type: 'success', message: 'Training created successfully' });
  };

  return (
    <MainContent
      title="Create Training"
      subtitle="Set up a new training session"
      actions={
        <button
          onClick={() => addToast({ type: 'info', message: 'Navigating back' })}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
      }
    >
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Training Information</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Training Topic <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.topic}
                onChange={e => handleInputChange('topic', e.target.value)}
                placeholder="e.g., Fire Safety and Emergency Procedures"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Objective</label>
              <textarea
                rows={3}
                value={formData.objective}
                onChange={e => handleInputChange('objective', e.target.value)}
                placeholder="Describe the learning objectives and expected outcomes..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Training Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.trainingType}
                  onChange={e => handleInputChange('trainingType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="safety">Safety</option>
                  <option value="technical">Technical</option>
                  <option value="compliance">Compliance</option>
                  <option value="leadership">Leadership</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Training Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.trainingDate}
                  onChange={e => handleInputChange('trainingDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Training Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={formData.trainingTime}
                  onChange={e => handleInputChange('trainingTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (hours)
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={formData.durationHours}
                  onChange={e =>
                    handleInputChange('durationHours', parseFloat(e.target.value) || 0)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min. Attendance Required (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.minAttendanceRequired}
                  onChange={e =>
                    handleInputChange('minAttendanceRequired', parseInt(e.target.value) || 0)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Location & Instructor</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Site</label>
              <select
                value={formData.site}
                onChange={e => handleInputChange('site', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select site</option>
                <option value="Main Warehouse">Main Warehouse</option>
                <option value="Production Plant">Production Plant</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={e => handleInputChange('location', e.target.value)}
                placeholder="e.g., Training Room A"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instructor <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.instructor}
                onChange={e => handleInputChange('instructor', e.target.value)}
                placeholder="Instructor name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instructor Credentials
              </label>
              <input
                type="text"
                value={formData.instructorCredentials}
                onChange={e => handleInputChange('instructorCredentials', e.target.value)}
                placeholder="e.g., Certified Safety Professional"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Participants</h3>
              <p className="text-sm text-gray-600">
                {selectedParticipants.length} participant(s) selected
              </p>
            </div>
            <button
              onClick={() => setShowParticipantModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Participants
            </button>
          </div>

          {selectedParticipants.length > 0 ? (
            <div className="space-y-2">
              {selectedParticipants.map(participant => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{participant.name}</p>
                      <p className="text-xs text-gray-600">
                        {participant.jobRole} • {participant.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveParticipant(participant.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No participants added yet</p>
              <p className="text-sm text-gray-500">Click the button above to add participants</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Training Materials</h3>
            <button
              onClick={handleAddMaterial}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Material
            </button>
          </div>

          {materials.length > 0 ? (
            <div className="space-y-3">
              {materials.map(material => (
                <div key={material.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <select
                          value={material.type}
                          onChange={e => {
                            setMaterials(
                              materials.map(m =>
                                m.id === material.id
                                  ? { ...m, type: e.target.value as Material['type'] }
                                  : m
                              )
                            );
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="presentation">Presentation</option>
                          <option value="document">Document</option>
                          <option value="video">Video</option>
                          <option value="reference">Reference</option>
                          <option value="handout">Handout</option>
                        </select>

                        <label className="flex flex-col items-center justify-center border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors px-3 py-2">
                          {material.file ? (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-xs text-gray-900 truncate">
                                {material.fileName}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Upload className="w-4 h-4 text-gray-400" />
                              <span className="text-xs text-gray-600">Upload file</span>
                            </div>
                          )}
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) handleFileSelect(material.id, file);
                            }}
                          />
                        </label>
                      </div>

                      <input
                        type="text"
                        placeholder="Description (optional)"
                        value={material.description}
                        onChange={e => {
                          setMaterials(
                            materials.map(m =>
                              m.id === material.id ? { ...m, description: e.target.value } : m
                            )
                          );
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <button
                      onClick={() => handleRemoveMaterial(material.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No materials added yet</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Training Settings</h3>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                checked={formData.requiresSignature}
                onChange={e => handleInputChange('requiresSignature', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">Require Signature</p>
                <p className="text-xs text-gray-600">
                  Participants must sign attendance confirmation
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                checked={formData.requiresCertificate}
                onChange={e => handleInputChange('requiresCertificate', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">Issue Certificates</p>
                <p className="text-xs text-gray-600">
                  Generate completion certificates for participants
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <button
            onClick={() => addToast({ type: 'info', message: 'Form cancelled' })}
            className="px-6 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Training
          </button>
        </div>
      </div>

      {showParticipantModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Select Participants</h3>
              <button
                onClick={() => setShowParticipantModal(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-2 mb-6">
              {mockEmployees.map(employee => {
                const isSelected = selectedParticipants.find(p => p.id === employee.id);
                return (
                  <div
                    key={employee.id}
                    onClick={() =>
                      isSelected
                        ? handleRemoveParticipant(employee.id)
                        : handleAddParticipant(employee)
                    }
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{employee.name}</p>
                          <p className="text-xs text-gray-600">
                            {employee.jobRole} • {employee.email}
                          </p>
                        </div>
                      </div>
                      {isSelected && <CheckCircle className="w-5 h-5 text-blue-600" />}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowParticipantModal(false)}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Done ({selectedParticipants.length} selected)
              </button>
            </div>
          </div>
        </div>
      )}
    </MainContent>
  );
}
