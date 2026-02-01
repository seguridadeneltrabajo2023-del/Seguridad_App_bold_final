import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { MainContent } from '../../components/layout/MainContent';
import { useApp } from '../../contexts/AppContext';

interface FormData {
  name: string;
  employeeId: string;
  roleTitle: string;
  email: string;
  phone: string;
  siteId: string;
  licenseExpiryDate: string;
  documents: {
    cv?: File;
    license?: File;
    diploma?: File;
    other?: File[];
  };
}

interface DocumentUploadProps {
  label: string;
  required?: boolean;
  accept?: string;
  onUpload: (file: File) => void;
  currentFile?: File;
  onRemove?: () => void;
  helperText?: string;
}

function DocumentUpload({ label, required, accept, onUpload, currentFile, onRemove, helperText }: DocumentUploadProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {helperText && (
        <p className="text-sm text-gray-600 mb-2">{helperText}</p>
      )}

      {currentFile ? (
        <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <FileText className="w-5 h-5 text-green-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{currentFile.name}</p>
            <p className="text-xs text-gray-600">
              {(currentFile.size / 1024).toFixed(2)} KB
            </p>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">PDF files only (max 10MB)</p>
          </div>
          <input
            type="file"
            className="hidden"
            accept={accept || '.pdf'}
            onChange={handleFileChange}
          />
        </label>
      )}
    </div>
  );
}

export function OSHResponsibleForm() {
  const { addToast } = useApp();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    employeeId: '',
    roleTitle: '',
    email: '',
    phone: '',
    siteId: '',
    licenseExpiryDate: '',
    documents: {},
  });

  const totalSteps = 2;

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDocumentUpload = (docType: 'cv' | 'license' | 'diploma' | 'other', file: File) => {
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [docType]: file,
      },
    }));
    addToast({ type: 'success', message: `${file.name} uploaded successfully` });
  };

  const handleDocumentRemove = (docType: 'cv' | 'license' | 'diploma' | 'other') => {
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [docType]: undefined,
      },
    }));
  };

  const validateStep1 = () => {
    return (
      formData.name.trim() !== '' &&
      formData.roleTitle.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.siteId !== ''
    );
  };

  const validateStep2 = () => {
    return (
      formData.documents.cv !== undefined &&
      formData.documents.license !== undefined &&
      formData.documents.diploma !== undefined
    );
  };

  const canProceed = currentStep === 1 ? validateStep1() : true;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    if (!validateStep2()) {
      addToast({ type: 'error', message: 'Please upload all required documents' });
      return;
    }
    addToast({ type: 'success', message: 'OSH Responsible created successfully' });
  };

  return (
    <MainContent
      title="Add OSH Responsible Person"
      subtitle="Register a new authorized health and safety lead"
    >
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step < currentStep
                      ? 'bg-green-600 text-white'
                      : step === currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step < currentStep ? <CheckCircle className="w-6 h-6" /> : step}
                </div>
                <div className="ml-3 flex-1">
                  <p
                    className={`text-sm font-medium ${
                      step <= currentStep ? 'text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    {step === 1 ? 'Basic Information' : 'Documents'}
                  </p>
                </div>
                {step < totalSteps && (
                  <div
                    className={`h-1 flex-1 mx-4 ${
                      step < currentStep ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Basic Profile & Contact Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Dr. Sarah Johnson"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) => handleInputChange('employeeId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="EMP-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role / Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.roleTitle}
                    onChange={(e) => handleInputChange('roleTitle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Chief Safety Officer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="sarah.johnson@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Site <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.siteId}
                    onChange={(e) => handleInputChange('siteId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a site</option>
                    <option value="building-a">Building A</option>
                    <option value="building-b">Building B</option>
                    <option value="building-c">Building C</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    License Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.licenseExpiryDate}
                    onChange={(e) => handleInputChange('licenseExpiryDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    You'll be notified 30 days before expiry
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900 mb-1">
                      Required Information
                    </h4>
                    <p className="text-sm text-blue-800">
                      All fields marked with an asterisk (*) are required to proceed to the next step.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Required Documents
              </h3>

              <DocumentUpload
                label="CV / Resume"
                required
                onUpload={(file) => handleDocumentUpload('cv', file)}
                currentFile={formData.documents.cv}
                onRemove={() => handleDocumentRemove('cv')}
                helperText="Upload professional CV or resume in PDF format"
              />

              <DocumentUpload
                label="Occupational Health License"
                required
                onUpload={(file) => handleDocumentUpload('license', file)}
                currentFile={formData.documents.license}
                onRemove={() => handleDocumentRemove('license')}
                helperText="Valid occupational health and safety license"
              />

              <DocumentUpload
                label="Diploma / Certification"
                required
                onUpload={(file) => handleDocumentUpload('diploma', file)}
                currentFile={formData.documents.diploma}
                onRemove={() => handleDocumentRemove('diploma')}
                helperText="Educational qualification or professional certification"
              />

              <DocumentUpload
                label="Other Documents (Optional)"
                onUpload={(file) => handleDocumentUpload('other', file)}
                currentFile={formData.documents.other?.[0]}
                onRemove={() => handleDocumentRemove('other')}
                helperText="Additional supporting documents (training certificates, references, etc.)"
              />

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-yellow-900 mb-1">
                      Document Requirements
                    </h4>
                    <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                      <li>Only PDF files are accepted</li>
                      <li>Maximum file size: 10MB per document</li>
                      <li>Documents must be clear and legible</li>
                      <li>All required documents must be uploaded before submission</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>

            <div className="flex items-center gap-3">
              {currentStep < totalSteps ? (
                <button
                  onClick={handleNext}
                  disabled={!canProceed}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="w-5 h-5" />
                  Submit for Approval
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainContent>
  );
}
