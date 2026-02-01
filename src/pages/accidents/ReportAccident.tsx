import { useState } from 'react';
import {
  ArrowLeft,
  AlertTriangle,
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  CheckCircle,
} from 'lucide-react';
import { MainContent } from '../../components/layout/MainContent';
import { useApp } from '../../contexts/AppContext';

interface AccidentFormData {
  incidentDate: string;
  incidentTime: string;
  incidentType: string;
  severity: string;
  workerName: string;
  jobRole: string;
  site: string;
  location: string;
  area: string;
  description: string;
  witnesses: string;
  injuryType: string;
  bodyPart: string;
  agent: string;
  unsafeAct: string;
  unsafeCondition: string;
  medicalTreatment: boolean;
  daysLost: number;
}

interface EvidenceFile {
  id: string;
  file: File | null;
  fileName: string;
  type: 'photo' | 'document' | 'medical_leave' | 'witness_statement';
  description: string;
  isMandatory: boolean;
}

const injuryTypes = [
  'Fracture',
  'Laceration',
  'Contusion',
  'Sprain/Strain',
  'Burn',
  'Amputation',
  'Concussion',
  'Exposure',
];

const bodyParts = [
  'Head',
  'Eyes',
  'Back',
  'Hand/Fingers',
  'Leg/Foot',
  'Arm/Shoulder',
  'Chest/Abdomen',
  'Multiple Areas',
];

const agents = [
  'Machinery/Equipment',
  'Hand Tools',
  'Chemicals',
  'Vehicle',
  'Falling Objects',
  'Sharp Objects',
  'Hot Surface',
  'Electrical',
];

const unsafeActs = [
  'Improper Use of Equipment',
  'Not Using PPE',
  'Working at Unsafe Speed',
  'Improper Lifting',
  'Taking Shortcuts',
  'Horseplay',
];

const unsafeConditions = [
  'Poor Housekeeping',
  'Inadequate Lighting',
  'Defective Equipment',
  'Slippery Surfaces',
  'Inadequate Guarding',
  'Poor Ventilation',
];

export function ReportAccident() {
  const { addToast } = useApp();
  const [formData, setFormData] = useState<AccidentFormData>({
    incidentDate: '',
    incidentTime: '',
    incidentType: 'accident',
    severity: 'minor',
    workerName: '',
    jobRole: '',
    site: '',
    location: '',
    area: '',
    description: '',
    witnesses: '',
    injuryType: '',
    bodyPart: '',
    agent: '',
    unsafeAct: '',
    unsafeCondition: '',
    medicalTreatment: false,
    daysLost: 0,
  });

  const [evidenceFiles, setEvidenceFiles] = useState<EvidenceFile[]>([]);
  const [incompleteWarnings, setIncompleteWarnings] = useState<string[]>([]);

  const handleInputChange = (
    field: keyof AccidentFormData,
    value: string | boolean | number
  ) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleAddEvidence = (type: EvidenceFile['type']) => {
    const newEvidence: EvidenceFile = {
      id: Date.now().toString(),
      file: null,
      fileName: '',
      type,
      description: '',
      isMandatory: type === 'photo' || type === 'medical_leave',
    };
    setEvidenceFiles([...evidenceFiles, newEvidence]);
  };

  const handleFileSelect = (id: string, file: File) => {
    setEvidenceFiles(
      evidenceFiles.map(ev => (ev.id === id ? { ...ev, file, fileName: file.name } : ev))
    );
  };

  const handleRemoveEvidence = (id: string) => {
    setEvidenceFiles(evidenceFiles.filter(ev => ev.id !== id));
  };

  const validateForm = (): boolean => {
    const warnings: string[] = [];

    if (!formData.incidentDate || !formData.incidentTime) {
      warnings.push('Date and time are required');
    }
    if (!formData.workerName) {
      warnings.push('Worker name is required');
    }
    if (!formData.location) {
      warnings.push('Location is required');
    }
    if (!formData.description || formData.description.length < 20) {
      warnings.push('Description must be at least 20 characters');
    }

    const hasPhoto = evidenceFiles.some(ev => ev.type === 'photo' && ev.file);
    if (!hasPhoto && formData.severity !== 'minor') {
      warnings.push('Photo evidence is mandatory for non-minor incidents');
    }

    if (
      formData.medicalTreatment &&
      !evidenceFiles.some(ev => ev.type === 'medical_leave' && ev.file)
    ) {
      warnings.push('Medical leave documentation is required when medical treatment is needed');
    }

    setIncompleteWarnings(warnings);
    return warnings.length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      addToast({
        type: 'success',
        message: 'Accident report submitted successfully',
      });
    } else {
      addToast({
        type: 'error',
        message: 'Please complete all required fields',
      });
    }
  };

  const hasIncompleteCase =
    !formData.incidentDate ||
    !formData.workerName ||
    !formData.location ||
    !formData.description ||
    (formData.severity !== 'minor' &&
      !evidenceFiles.some(ev => ev.type === 'photo' && ev.file));

  return (
    <MainContent
      title="Report Accident"
      subtitle="Complete accident/incident report form"
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
        {hasIncompleteCase && incompleteWarnings.length > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-yellow-800 mb-2">
                  Incomplete Case Warning
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  {incompleteWarnings.map((warning, idx) => (
                    <li key={idx} className="text-sm text-yellow-700">
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Incident Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Incident Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.incidentDate}
                onChange={e => handleInputChange('incidentDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Incident Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={formData.incidentTime}
                onChange={e => handleInputChange('incidentTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Incident Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.incidentType}
                onChange={e => handleInputChange('incidentType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="accident">Accident (with injury)</option>
                <option value="incident">Incident (no injury)</option>
                <option value="near_miss">Near Miss</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Severity <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {['minor', 'moderate', 'serious', 'critical', 'fatal'].map(severity => (
                <button
                  key={severity}
                  onClick={() => handleInputChange('severity', severity)}
                  className={`p-3 border-2 rounded-lg text-sm font-medium transition-all ${
                    formData.severity === severity
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {severity.charAt(0).toUpperCase() + severity.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Worker Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Worker Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.workerName}
                onChange={e => handleInputChange('workerName', e.target.value)}
                placeholder="Full name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Role</label>
              <input
                type="text"
                value={formData.jobRole}
                onChange={e => handleInputChange('jobRole', e.target.value)}
                placeholder="e.g., Warehouse Worker"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Location Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Area</label>
              <input
                type="text"
                value={formData.area}
                onChange={e => handleInputChange('area', e.target.value)}
                placeholder="e.g., Loading Dock"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specific Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={e => handleInputChange('location', e.target.value)}
                placeholder="e.g., Near forklift charging station"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Incident Description</h3>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={5}
              value={formData.description}
              onChange={e => handleInputChange('description', e.target.value)}
              placeholder="Provide a detailed description of what happened..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-600 mt-1">
              {formData.description.length} / 20 minimum characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Witnesses</label>
            <textarea
              rows={2}
              value={formData.witnesses}
              onChange={e => handleInputChange('witnesses', e.target.value)}
              placeholder="List witness names and contact information..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Classification</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Injury Type</label>
              <select
                value={formData.injuryType}
                onChange={e => handleInputChange('injuryType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select injury type</option>
                {injuryTypes.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Body Part</label>
              <select
                value={formData.bodyPart}
                onChange={e => handleInputChange('bodyPart', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select body part</option>
                {bodyParts.map(part => (
                  <option key={part} value={part}>
                    {part}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Agent</label>
              <select
                value={formData.agent}
                onChange={e => handleInputChange('agent', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select agent</option>
                {agents.map(agent => (
                  <option key={agent} value={agent}>
                    {agent}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unsafe Act</label>
              <select
                value={formData.unsafeAct}
                onChange={e => handleInputChange('unsafeAct', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select unsafe act</option>
                {unsafeActs.map(act => (
                  <option key={act} value={act}>
                    {act}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unsafe Condition
              </label>
              <select
                value={formData.unsafeCondition}
                onChange={e => handleInputChange('unsafeCondition', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select unsafe condition</option>
                {unsafeConditions.map(condition => (
                  <option key={condition} value={condition}>
                    {condition}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Medical Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                checked={formData.medicalTreatment}
                onChange={e => handleInputChange('medicalTreatment', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">Medical Treatment Required</p>
                <p className="text-xs text-gray-600">Check if worker received medical attention</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Days Lost (if applicable)
              </label>
              <input
                type="number"
                min="0"
                value={formData.daysLost}
                onChange={e => handleInputChange('daysLost', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Evidence Attachments</h3>
              <p className="text-sm text-gray-600 mt-1">
                Photos are mandatory for non-minor incidents
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAddEvidence('photo')}
                className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors"
              >
                <ImageIcon className="w-4 h-4" />
                Add Photo
              </button>
              <button
                onClick={() => handleAddEvidence('document')}
                className="flex items-center gap-2 px-3 py-2 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FileText className="w-4 h-4" />
                Add Document
              </button>
            </div>
          </div>

          {evidenceFiles.length > 0 ? (
            <div className="space-y-3">
              {evidenceFiles.map(evidence => (
                <div key={evidence.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        {evidence.type === 'photo' ? (
                          <ImageIcon className="w-5 h-5 text-blue-600" />
                        ) : (
                          <FileText className="w-5 h-5 text-gray-600" />
                        )}
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {evidence.type.replace('_', ' ')}
                        </span>
                        {evidence.isMandatory && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">
                            Mandatory
                          </span>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              {evidence.file ? (
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                  <span className="text-sm text-gray-900">{evidence.fileName}</span>
                                </div>
                              ) : (
                                <>
                                  <Upload className="w-6 h-6 text-gray-400 mb-1" />
                                  <p className="text-xs text-gray-600">Click to upload</p>
                                </>
                              )}
                            </div>
                            <input
                              type="file"
                              className="hidden"
                              accept={evidence.type === 'photo' ? 'image/*' : '.pdf,.doc,.docx'}
                              onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) handleFileSelect(evidence.id, file);
                              }}
                            />
                          </label>
                        </div>

                        <input
                          type="text"
                          placeholder="Description (optional)"
                          value={evidence.description}
                          onChange={e => {
                            setEvidenceFiles(
                              evidenceFiles.map(ev =>
                                ev.id === evidence.id
                                  ? { ...ev, description: e.target.value }
                                  : ev
                              )
                            );
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveEvidence(evidence.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No evidence files added yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Add photos or documents to support this report
              </p>
            </div>
          )}
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
            Submit Report
          </button>
        </div>
      </div>
    </MainContent>
  );
}
