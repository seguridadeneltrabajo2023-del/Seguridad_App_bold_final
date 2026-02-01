import { useState } from 'react';
import {
  Plus,
  Filter,
  Search,
  Download,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  Calendar,
  User,
} from 'lucide-react';
import { MainContent } from '../../components/layout/MainContent';
import { StatusChip } from '../../components/common/StatusChip';
import { AddHazardWizard, HazardData } from '../../components/hazard/AddHazardWizard';
import { HazardExportModal } from '../../components/hazard/HazardExportModal';
import { useApp } from '../../contexts/AppContext';

interface Hazard {
  id: string;
  processArea: string;
  taskActivity: string;
  hazardType: string;
  hazardDescription: string;
  consequence: string;
  probability: number;
  severity: number;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  existingControls: string;
  proposedControls: string;
  owner: string;
  reviewDate: string;
  status: 'open' | 'under_review' | 'controls_implemented' | 'closed';
}

const mockHazards: Hazard[] = [
  {
    id: '1',
    processArea: 'Production Floor',
    taskActivity: 'Operating forklift',
    hazardType: 'Moving Machinery',
    hazardDescription: 'Risk of collision with pedestrians or equipment',
    consequence: 'Serious injury or fatality',
    probability: 3,
    severity: 5,
    riskScore: 15,
    riskLevel: 'high',
    existingControls: 'Warning lights, designated pathways, speed limits',
    proposedControls: 'Install proximity sensors, additional training',
    owner: 'Sarah Johnson',
    reviewDate: '2026-03-01',
    status: 'open',
  },
  {
    id: '2',
    processArea: 'Warehouse',
    taskActivity: 'Manual lifting',
    hazardType: 'Manual Handling',
    hazardDescription: 'Repetitive lifting of heavy boxes',
    consequence: 'Back injury, musculoskeletal disorders',
    probability: 4,
    severity: 3,
    riskScore: 12,
    riskLevel: 'high',
    existingControls: 'Lifting technique training, weight limits posted',
    proposedControls: 'Mechanical lifting aids, team lifting protocol',
    owner: 'Michael Chen',
    reviewDate: '2026-02-15',
    status: 'under_review',
  },
  {
    id: '3',
    processArea: 'Chemical Storage',
    taskActivity: 'Handling cleaning chemicals',
    hazardType: 'Hazardous Substances',
    hazardDescription: 'Exposure to corrosive cleaning agents',
    consequence: 'Chemical burns, respiratory issues',
    probability: 2,
    severity: 4,
    riskScore: 8,
    riskLevel: 'medium',
    existingControls: 'PPE provided, SDS available, ventilation system',
    proposedControls: 'Switch to less hazardous alternatives',
    owner: 'Emma Davis',
    reviewDate: '2026-04-01',
    status: 'controls_implemented',
  },
  {
    id: '4',
    processArea: 'Office Area',
    taskActivity: 'Computer workstation',
    hazardType: 'Poor Posture',
    hazardDescription: 'Prolonged sitting with inadequate ergonomics',
    consequence: 'Back pain, repetitive strain injury',
    probability: 3,
    severity: 2,
    riskScore: 6,
    riskLevel: 'medium',
    existingControls: 'Adjustable chairs, ergonomic assessments',
    proposedControls: 'Standing desks, regular break reminders',
    owner: 'Robert Williams',
    reviewDate: '2026-05-01',
    status: 'open',
  },
];

export function HazardMatrix() {
  const { addToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [areaFilter, setAreaFilter] = useState('all');
  const [riskLevelFilter, setRiskLevelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showWizard, setShowWizard] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [hazards, setHazards] = useState<Hazard[]>(mockHazards);

  const filteredHazards = hazards.filter(hazard => {
    const matchesSearch =
      hazard.processArea.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hazard.taskActivity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hazard.hazardDescription.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesArea = areaFilter === 'all' || hazard.processArea === areaFilter;
    const matchesRiskLevel = riskLevelFilter === 'all' || hazard.riskLevel === riskLevelFilter;
    const matchesStatus = statusFilter === 'all' || hazard.status === statusFilter;

    return matchesSearch && matchesArea && matchesRiskLevel && matchesStatus;
  });

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleSaveHazard = (hazardData: HazardData) => {
    const newHazard: Hazard = {
      id: String(hazards.length + 1),
      processArea: hazardData.processArea,
      taskActivity: hazardData.taskActivity,
      hazardType: hazardData.hazardTypeId,
      hazardDescription: hazardData.hazardDescription,
      consequence: hazardData.consequence,
      probability: hazardData.probability,
      severity: hazardData.severity,
      riskScore: hazardData.riskScore,
      riskLevel: hazardData.riskLevel as 'low' | 'medium' | 'high' | 'critical',
      existingControls: hazardData.existingControls,
      proposedControls: hazardData.proposedControls,
      owner: 'Sarah Johnson',
      reviewDate: hazardData.reviewDate,
      status: 'open',
    };
    setHazards([...hazards, newHazard]);
  };

  const handleAction = (action: string, hazard: Hazard) => {
    addToast({ type: 'info', message: `${action}: ${hazard.hazardDescription}` });
  };

  const stats = {
    total: hazards.length,
    critical: hazards.filter(h => h.riskLevel === 'critical').length,
    high: hazards.filter(h => h.riskLevel === 'high').length,
    medium: hazards.filter(h => h.riskLevel === 'medium').length,
    low: hazards.filter(h => h.riskLevel === 'low').length,
  };

  return (
    <MainContent
      title="Hazard Matrix"
      subtitle="Identify, assess, and manage workplace hazards"
      actions={
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Download className="w-5 h-5" />
            Export
          </button>
          <button
            onClick={() => setShowWizard(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Hazard
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Hazards</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Critical</p>
                <p className="text-2xl font-bold text-red-900">{stats.critical}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">High</p>
                <p className="text-2xl font-bold text-orange-900">{stats.high}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">Medium</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.medium}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Low</p>
                <p className="text-2xl font-bold text-green-900">{stats.low}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search hazards..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-5 h-5" />
                Filters
                {(areaFilter !== 'all' || riskLevelFilter !== 'all' || statusFilter !== 'all') && (
                  <span className="ml-1 px-2 py-0.5 bg-blue-600 text-white text-xs font-medium rounded-full">
                    {
                      [
                        areaFilter !== 'all',
                        riskLevelFilter !== 'all',
                        statusFilter !== 'all',
                      ].filter(Boolean).length
                    }
                  </span>
                )}
              </button>
            </div>

            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Process / Area
                    </label>
                    <select
                      value={areaFilter}
                      onChange={e => setAreaFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Areas</option>
                      <option value="Production Floor">Production Floor</option>
                      <option value="Warehouse">Warehouse</option>
                      <option value="Chemical Storage">Chemical Storage</option>
                      <option value="Office Area">Office Area</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Risk Level
                    </label>
                    <select
                      value={riskLevelFilter}
                      onChange={e => setRiskLevelFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Levels</option>
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
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
                      <option value="open">Open</option>
                      <option value="under_review">Under Review</option>
                      <option value="controls_implemented">Controls Implemented</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Process / Area
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Task / Activity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Hazard
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Consequence
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    P
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    S
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Risk
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Existing Controls
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Owner
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Review Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredHazards.map(hazard => (
                  <tr key={hazard.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{hazard.processArea}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{hazard.taskActivity}</div>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <div className="text-sm font-medium text-gray-900">{hazard.hazardType}</div>
                      <div className="text-xs text-gray-600 truncate">
                        {hazard.hazardDescription}
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <div className="text-sm text-gray-900 truncate">{hazard.consequence}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="text-sm font-semibold text-gray-900">{hazard.probability}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="text-sm font-semibold text-gray-900">{hazard.severity}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getRiskLevelColor(
                          hazard.riskLevel
                        )}`}
                      >
                        {hazard.riskScore}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <div className="text-sm text-gray-900 truncate">
                        {hazard.existingControls}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <User className="w-4 h-4 text-gray-400" />
                        {hazard.owner}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {hazard.reviewDate}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusChip
                        status={
                          hazard.status === 'closed' || hazard.status === 'controls_implemented'
                            ? 'approved'
                            : hazard.status === 'open'
                            ? 'rejected'
                            : 'pending'
                        }
                        label={hazard.status.replace('_', ' ')}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleAction('Viewing', hazard)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAction('Editing', hazard)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAction('Deleting', hazard)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredHazards.length === 0 && (
            <div className="p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No hazards found matching your criteria</p>
            </div>
          )}
        </div>
      </div>

      <AddHazardWizard
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onSave={handleSaveHazard}
      />

      <HazardExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
    </MainContent>
  );
}
