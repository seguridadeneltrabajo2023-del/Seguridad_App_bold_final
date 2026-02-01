import { useState } from 'react';
import { X, Download, FileText, Building2, User, Calendar } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface HazardExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HazardExportModal({ isOpen, onClose }: HazardExportModalProps) {
  const { addToast } = useApp();
  const [includeRiskMatrix, setIncludeRiskMatrix] = useState(true);
  const [includeControls, setIncludeControls] = useState(true);
  const [includeEvidence, setIncludeEvidence] = useState(false);
  const [includeActions, setIncludeActions] = useState(true);
  const [riskLevelFilter, setRiskLevelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [includeCompanyHeader, setIncludeCompanyHeader] = useState(true);
  const [includeSignatureBlock, setIncludeSignatureBlock] = useState(true);
  const [companyName, setCompanyName] = useState('Acme Corporation');
  const [documentTitle, setDocumentTitle] = useState('Hazard Risk Assessment Matrix');

  const handleExport = () => {
    addToast({
      type: 'success',
      message: 'Exporting hazard matrix as branded PDF...',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Export Hazard Matrix</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">Branded PDF Export</p>
                <p>
                  Generate a professional PDF document with your company branding, including header,
                  logo, and signature blocks.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Document Information</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Title
                </label>
                <input
                  type="text"
                  value={documentTitle}
                  onChange={e => setDocumentTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Filter Hazards</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Risk Level
                </label>
                <select
                  value={riskLevelFilter}
                  onChange={e => setRiskLevelFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Risk Levels</option>
                  <option value="critical">Critical Only</option>
                  <option value="high">High and Above</option>
                  <option value="medium">Medium and Above</option>
                  <option value="low">Low Risk Only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="open">Open Only</option>
                  <option value="under_review">Under Review</option>
                  <option value="controls_implemented">Controls Implemented</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Include in Export</h4>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={includeRiskMatrix}
                  onChange={e => setIncludeRiskMatrix(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">Risk Assessment Matrix</p>
                  <p className="text-xs text-gray-600">
                    Include the visual risk matrix with probability and severity scales
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={includeControls}
                  onChange={e => setIncludeControls(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">Control Measures</p>
                  <p className="text-xs text-gray-600">
                    Include existing and proposed control measures for each hazard
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={includeActions}
                  onChange={e => setIncludeActions(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">Improvement Actions</p>
                  <p className="text-xs text-gray-600">
                    Include action items with priorities and due dates
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={includeEvidence}
                  onChange={e => setIncludeEvidence(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">Evidence References</p>
                  <p className="text-xs text-gray-600">
                    Include references to photos and inspection reports
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Document Branding</h4>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={includeCompanyHeader}
                  onChange={e => setIncludeCompanyHeader(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">Company Header</p>
                  <p className="text-xs text-gray-600">
                    Include company logo and name in the document header
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={includeSignatureBlock}
                  onChange={e => setIncludeSignatureBlock(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">Signature Block</p>
                  <p className="text-xs text-gray-600">
                    Include signature lines for review and approval
                  </p>
                </div>
              </label>
            </div>
          </div>

          {includeSignatureBlock && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h5 className="text-sm font-semibold text-gray-900 mb-3">Signature Block Preview</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 border border-gray-300 rounded">
                <div className="border-b-2 border-gray-300 pb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <p className="text-xs font-medium text-gray-700">Prepared By</p>
                  </div>
                  <div className="h-8 border-b border-gray-300 mb-1" />
                  <p className="text-xs text-gray-600">Name & Signature</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <p className="text-xs text-gray-600">Date: _____________</p>
                  </div>
                </div>

                <div className="border-b-2 border-gray-300 pb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <p className="text-xs font-medium text-gray-700">Reviewed By</p>
                  </div>
                  <div className="h-8 border-b border-gray-300 mb-1" />
                  <p className="text-xs text-gray-600">Name & Signature</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <p className="text-xs text-gray-600">Date: _____________</p>
                  </div>
                </div>

                <div className="border-b-2 border-gray-300 pb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <p className="text-xs font-medium text-gray-700">Approved By</p>
                  </div>
                  <div className="h-8 border-b border-gray-300 mb-1" />
                  <p className="text-xs text-gray-600">Name & Signature</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <p className="text-xs text-gray-600">Date: _____________</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleExport}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              Export PDF
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
