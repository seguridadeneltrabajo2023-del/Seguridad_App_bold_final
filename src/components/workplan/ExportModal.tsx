import { useState } from 'react';
import { X, Download, FileText, Table } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const { addToast } = useApp();
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel'>('pdf');
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-01-31');
  const [includeSites, setIncludeSites] = useState(true);
  const [includeOwners, setIncludeOwners] = useState(true);
  const [includeParticipants, setIncludeParticipants] = useState(false);
  const [includeEvidence, setIncludeEvidence] = useState(false);

  const handleExport = () => {
    addToast({
      type: 'success',
      message: `Exporting work plan as ${exportFormat.toUpperCase()}...`,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Export Work Plan</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Export Format
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setExportFormat('pdf')}
                className={`flex items-center gap-3 p-4 border-2 rounded-lg transition-all ${
                  exportFormat === 'pdf'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FileText
                  className={`w-6 h-6 ${
                    exportFormat === 'pdf' ? 'text-blue-600' : 'text-gray-400'
                  }`}
                />
                <div className="text-left">
                  <p
                    className={`text-sm font-semibold ${
                      exportFormat === 'pdf' ? 'text-blue-900' : 'text-gray-900'
                    }`}
                  >
                    PDF Document
                  </p>
                  <p className="text-xs text-gray-600">Printable format</p>
                </div>
              </button>

              <button
                onClick={() => setExportFormat('excel')}
                className={`flex items-center gap-3 p-4 border-2 rounded-lg transition-all ${
                  exportFormat === 'excel'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Table
                  className={`w-6 h-6 ${
                    exportFormat === 'excel' ? 'text-blue-600' : 'text-gray-400'
                  }`}
                />
                <div className="text-left">
                  <p
                    className={`text-sm font-semibold ${
                      exportFormat === 'excel' ? 'text-blue-900' : 'text-gray-900'
                    }`}
                  >
                    Excel Spreadsheet
                  </p>
                  <p className="text-xs text-gray-600">Editable data</p>
                </div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Include in Export
            </label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={includeSites}
                  onChange={e => setIncludeSites(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">Site Information</p>
                  <p className="text-xs text-gray-600">
                    Include site names and location details
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={includeOwners}
                  onChange={e => setIncludeOwners(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">Activity Owners</p>
                  <p className="text-xs text-gray-600">
                    Include responsible person information
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={includeParticipants}
                  onChange={e => setIncludeParticipants(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">Participant Lists</p>
                  <p className="text-xs text-gray-600">
                    Include all participants for each activity
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
                  <p className="text-sm font-medium text-gray-900">Evidence Status</p>
                  <p className="text-xs text-gray-600">
                    Include evidence completion status
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Export Preview:</strong> Your export will include all activities between{' '}
              {new Date(startDate).toLocaleDateString()} and{' '}
              {new Date(endDate).toLocaleDateString()}.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleExport}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              Export {exportFormat.toUpperCase()}
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
