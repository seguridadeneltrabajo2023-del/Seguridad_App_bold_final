import { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Check, AlertTriangle } from 'lucide-react';
import { RiskMatrix } from './RiskMatrix';
import { useApp } from '../../contexts/AppContext';

interface AddHazardWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (hazard: HazardData) => void;
}

export interface HazardData {
  processArea: string;
  taskActivity: string;
  jobRole: string;
  hazardTypeId: string;
  hazardCategory: string;
  hazardDescription: string;
  consequence: string;
  probability: number;
  severity: number;
  riskScore: number;
  riskLevel: string;
  existingControls: string;
  proposedControls: string;
  actionPlan: string;
  ownerId: string;
  reviewDate: string;
}

const hazardCategories = [
  { id: 'physical', name: 'Physical', color: 'blue' },
  { id: 'chemical', name: 'Chemical', color: 'purple' },
  { id: 'biological', name: 'Biological', color: 'green' },
  { id: 'ergonomic', name: 'Ergonomic', color: 'orange' },
  { id: 'psychosocial', name: 'Psychosocial', color: 'pink' },
  { id: 'environmental', name: 'Environmental', color: 'teal' },
];

const hazardTypes = {
  physical: [
    'Slips, Trips, and Falls',
    'Moving Machinery',
    'Noise',
    'Vibration',
    'Temperature Extremes',
    'Electrical',
    'Fire and Explosion',
  ],
  chemical: ['Hazardous Substances', 'Dust and Fumes', 'Asbestos'],
  biological: ['Bacteria and Viruses', 'Mold and Fungi'],
  ergonomic: ['Manual Handling', 'Repetitive Motion', 'Poor Posture'],
  psychosocial: ['Work Stress', 'Violence and Harassment'],
  environmental: ['Confined Spaces', 'Working at Heights', 'Poor Lighting'],
};

export function AddHazardWizard({ isOpen, onClose, onSave }: AddHazardWizardProps) {
  const { addToast } = useApp();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<HazardData>>({
    probability: 0,
    severity: 0,
  });

  const calculateRisk = (probability: number, severity: number) => {
    const score = probability * severity;
    let level = 'low';
    if (score >= 16) level = 'critical';
    else if (score >= 10) level = 'high';
    else if (score >= 5) level = 'medium';

    return { score, level };
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.processArea || !formData.taskActivity) {
          addToast({ type: 'error', message: 'Please fill in all required fields' });
          return false;
        }
        return true;
      case 2:
        if (!formData.hazardCategory || !formData.hazardDescription) {
          addToast({ type: 'error', message: 'Please select hazard type and add description' });
          return false;
        }
        return true;
      case 3:
        if (!formData.probability || !formData.severity || !formData.consequence) {
          addToast({ type: 'error', message: 'Please complete the risk assessment' });
          return false;
        }
        return true;
      case 4:
        return true;
      default:
        return true;
    }
  };

  const handleSave = () => {
    if (validateStep(4)) {
      const { score, level } = calculateRisk(
        formData.probability || 0,
        formData.severity || 0
      );
      onSave({
        ...formData,
        riskScore: score,
        riskLevel: level,
      } as HazardData);
      addToast({ type: 'success', message: 'Hazard added successfully' });
      onClose();
      setCurrentStep(1);
      setFormData({ probability: 0, severity: 0 });
    }
  };

  const handleCancel = () => {
    onClose();
    setCurrentStep(1);
    setFormData({ probability: 0, severity: 0 });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Add New Hazard</h3>
            <button
              onClick={handleCancel}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map(step => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex items-center w-full">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full border-2 font-semibold text-sm ${
                      currentStep > step
                        ? 'bg-green-600 border-green-600 text-white'
                        : currentStep === step
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}
                  >
                    {currentStep > step ? <Check className="w-4 h-4" /> : step}
                  </div>
                  {step < 4 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        currentStep > step ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 text-center">
            <p className="text-sm font-medium text-gray-900">
              Step {currentStep} of 4:{' '}
              {currentStep === 1 && 'Area & Activity'}
              {currentStep === 2 && 'Hazard Selection'}
              {currentStep === 3 && 'Risk Assessment'}
              {currentStep === 4 && 'Control Measures'}
            </p>
          </div>
        </div>

        <div className="p-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Select Area, Process, and Activity
              </h4>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Process / Area <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.processArea || ''}
                  onChange={e => setFormData({ ...formData, processArea: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select process or area</option>
                  <option value="Production Floor">Production Floor</option>
                  <option value="Warehouse">Warehouse</option>
                  <option value="Maintenance Workshop">Maintenance Workshop</option>
                  <option value="Office Area">Office Area</option>
                  <option value="Loading Dock">Loading Dock</option>
                  <option value="Chemical Storage">Chemical Storage</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task / Activity <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.taskActivity || ''}
                  onChange={e => setFormData({ ...formData, taskActivity: e.target.value })}
                  placeholder="e.g., Operating forklift, Manual lifting, Equipment maintenance"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Role / Position
                </label>
                <input
                  type="text"
                  value={formData.jobRole || ''}
                  onChange={e => setFormData({ ...formData, jobRole: e.target.value })}
                  placeholder="e.g., Forklift Operator, Warehouse Worker"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Select Hazard Type and Description
              </h4>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Hazard Category <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {hazardCategories.map(category => (
                    <button
                      key={category.id}
                      onClick={() =>
                        setFormData({ ...formData, hazardCategory: category.id, hazardTypeId: '' })
                      }
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        formData.hazardCategory === category.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="text-sm font-semibold text-gray-900">{category.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              {formData.hazardCategory && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specific Hazard Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.hazardTypeId || ''}
                    onChange={e => setFormData({ ...formData, hazardTypeId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select hazard type</option>
                    {hazardTypes[formData.hazardCategory as keyof typeof hazardTypes]?.map(
                      type => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      )
                    )}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hazard Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={formData.hazardDescription || ''}
                  onChange={e => setFormData({ ...formData, hazardDescription: e.target.value })}
                  placeholder="Describe the specific hazard in detail..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Risk Assessment & Rating
              </h4>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Potential Consequence <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.consequence || ''}
                  onChange={e => setFormData({ ...formData, consequence: e.target.value })}
                  placeholder="Describe what could happen if the hazard is realized..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Probability <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.probability || 0}
                    onChange={e =>
                      setFormData({ ...formData, probability: parseInt(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={0}>Select probability</option>
                    <option value={1}>1 - Very Low (Rare)</option>
                    <option value={2}>2 - Low (Unlikely)</option>
                    <option value={3}>3 - Medium (Possible)</option>
                    <option value={4}>4 - High (Likely)</option>
                    <option value={5}>5 - Very High (Almost Certain)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Severity <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.severity || 0}
                    onChange={e =>
                      setFormData({ ...formData, severity: parseInt(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={0}>Select severity</option>
                    <option value={1}>1 - Very Low (Minor injury)</option>
                    <option value={2}>2 - Low (First aid)</option>
                    <option value={3}>3 - Medium (Medical treatment)</option>
                    <option value={4}>4 - High (Serious injury)</option>
                    <option value={5}>5 - Very High (Fatality)</option>
                  </select>
                </div>
              </div>

              {formData.probability && formData.severity ? (
                <div className="mt-6">
                  <RiskMatrix
                    selectedProbability={formData.probability}
                    selectedSeverity={formData.severity}
                    showLegend={true}
                  />

                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-6 h-6 text-blue-600" />
                      <div>
                        <p className="text-sm font-semibold text-blue-900">
                          Calculated Risk Score:{' '}
                          {calculateRisk(formData.probability, formData.severity).score}
                        </p>
                        <p className="text-sm text-blue-900">
                          Risk Level:{' '}
                          <span className="uppercase font-bold">
                            {calculateRisk(formData.probability, formData.severity).level}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                  <p className="text-sm text-gray-600">
                    Select both Probability and Severity to see the risk calculation
                  </p>
                </div>
              )}
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Control Measures & Action Plan
              </h4>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Existing Control Measures
                </label>
                <textarea
                  rows={4}
                  value={formData.existingControls || ''}
                  onChange={e => setFormData({ ...formData, existingControls: e.target.value })}
                  placeholder="List current controls in place to manage this hazard..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proposed Control Measures
                </label>
                <textarea
                  rows={4}
                  value={formData.proposedControls || ''}
                  onChange={e => setFormData({ ...formData, proposedControls: e.target.value })}
                  placeholder="List proposed improvements or additional controls..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Action Plan
                </label>
                <textarea
                  rows={4}
                  value={formData.actionPlan || ''}
                  onChange={e => setFormData({ ...formData, actionPlan: e.target.value })}
                  placeholder="Describe the steps to implement the proposed controls..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Responsible Person
                  </label>
                  <select
                    value={formData.ownerId || ''}
                    onChange={e => setFormData({ ...formData, ownerId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select owner</option>
                    <option value="1">Sarah Johnson</option>
                    <option value="2">Michael Chen</option>
                    <option value="3">Emma Davis</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review Date
                  </label>
                  <input
                    type="date"
                    value={formData.reviewDate || ''}
                    onChange={e => setFormData({ ...formData, reviewDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex items-center justify-between">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            {currentStep > 1 && (
              <button
                onClick={handlePrevious}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>
            )}

            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                <Check className="w-5 h-5" />
                Save Hazard
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
