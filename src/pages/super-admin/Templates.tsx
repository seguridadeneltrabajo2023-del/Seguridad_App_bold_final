import { Plus, Edit, Copy, Globe, Lock } from 'lucide-react';
import { MainContent } from '../../components/layout/MainContent';
import { Template } from '../../types';
import { useApp } from '../../contexts/AppContext';

const mockTemplates: Template[] = [
  {
    id: '1',
    name: 'Standard Hazard Matrix',
    type: 'hazard_matrix',
    description: 'Basic hazard identification and risk assessment template',
    isPublic: true,
    createdBy: 'System',
    createdDate: '2023-01-15',
    usageCount: 127,
  },
  {
    id: '2',
    name: 'Monthly Safety Inspection',
    type: 'inspection',
    description: 'Comprehensive monthly safety walkthrough checklist',
    isPublic: true,
    createdBy: 'System',
    createdDate: '2023-02-20',
    usageCount: 95,
  },
  {
    id: '3',
    name: 'Fire Safety Training',
    type: 'training',
    description: 'Fire safety and emergency response training template',
    isPublic: true,
    createdBy: 'System',
    createdDate: '2023-03-10',
    usageCount: 68,
  },
  {
    id: '4',
    name: 'Annual Compliance Report',
    type: 'report',
    description: 'Yearly OSH compliance summary report',
    isPublic: false,
    createdBy: 'Admin',
    createdDate: '2023-12-01',
    usageCount: 12,
  },
];

const typeColors = {
  hazard_matrix: 'bg-red-100 text-red-700',
  inspection: 'bg-blue-100 text-blue-700',
  training: 'bg-green-100 text-green-700',
  report: 'bg-purple-100 text-purple-700',
};

const typeLabels = {
  hazard_matrix: 'Hazard Matrix',
  inspection: 'Inspection',
  training: 'Training',
  report: 'Report',
};

export function Templates() {
  const { addToast } = useApp();

  const handleAction = (action: string, template: Template) => {
    addToast({
      type: 'info',
      message: `${action} template: ${template.name}`,
    });
  };

  return (
    <MainContent
      title="Templates"
      subtitle="Manage global templates for hazard matrices, inspections, training, and reports"
      actions={
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          New Template
        </button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockTemplates.map(template => (
          <div
            key={template.id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                  typeColors[template.type]
                }`}
              >
                {typeLabels[template.type]}
              </span>
              <div className="flex items-center gap-1">
                {template.isPublic ? (
                  <Globe className="w-4 h-4 text-green-600" title="Public" />
                ) : (
                  <Lock className="w-4 h-4 text-gray-400" title="Private" />
                )}
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {template.name}
            </h3>

            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {template.description}
            </p>

            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
              <span>By {template.createdBy}</span>
              <span>{template.usageCount} uses</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAction('Edit', template)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => handleAction('Duplicate', template)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Copy className="w-4 h-4" />
                Duplicate
              </button>
            </div>
          </div>
        ))}
      </div>
    </MainContent>
  );
}
