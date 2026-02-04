import { useState, useMemo } from 'react';
import {
  Plus,
  Filter,
  Search,
  Download,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  User,
  ShieldCheck
} from 'lucide-react';
import { MainContent } from '../../components/layout/MainContent';
import { StatusChip } from '../../components/common/StatusChip';
import { AddHazardWizard, HazardData } from '../../components/hazard/AddHazardWizard';
import { HazardExportModal } from '../../components/hazard/HazardExportModal';
import { useApp } from '../../contexts/AppContext';

// INTERFAZ DE DATOS PARA LA TABLA
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
    existingControls: 'F: N/A, M: Warning lights, T: PPE',
    proposedControls: 'Install proximity sensors',
    owner: 'Sarah Johnson',
    reviewDate: '2026-03-01',
    status: 'open',
  }
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

  const filteredHazards = useMemo(() => {
    return hazards.filter(hazard => {
      const matchesSearch =
        hazard.processArea.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hazard.taskActivity.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hazard.hazardDescription.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesArea = areaFilter === 'all' || hazard.processArea === areaFilter;
      const matchesRiskLevel = riskLevelFilter === 'all' || hazard.riskLevel === riskLevelFilter;
      const matchesStatus = statusFilter === 'all' || hazard.status === statusFilter;
      return matchesSearch && matchesArea && matchesRiskLevel && matchesStatus;
    });
  }, [hazards, searchQuery, areaFilter, riskLevelFilter, statusFilter]);

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-50 text-red-700 border-red-100';
      case 'high': return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      case 'low': return 'bg-green-50 text-green-700 border-green-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  const handleSaveHazard = (hazardData: HazardData) => {
    const newHazard: Hazard = {
      id: String(hazards.length + 1),
      processArea: hazardData.processArea,
      taskActivity: hazardData.taskActivity,
      hazardType: hazardData.hazardType, 
      hazardDescription: hazardData.hazardDescription,
      consequence: hazardData.consequence,
      probability: parseInt(hazardData.exposureLevel) || 0, 
      severity: parseInt(hazardData.consequenceLevel) || 0,
      riskScore: hazardData.riskScore,
      riskLevel: hazardData.riskLevel as 'low' | 'medium' | 'high' | 'critical',
      existingControls: `F: ${hazardData.controlSource}, M: ${hazardData.controlMedium}, T: ${hazardData.controlWorker}`,
      proposedControls: '', 
      owner: hazardData.owner,
      reviewDate: hazardData.reviewDate,
      status: 'open',
    };

    setHazards([...hazards, newHazard]);
    addToast({ type: 'success', message: 'Hazard added successfully' });
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
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all shadow-sm text-xs uppercase tracking-widest"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setShowWizard(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 text-xs uppercase tracking-widest"
          >
            <Plus className="w-4 h-4" />
            Add Hazard
          </button>
        </div>
      }
    >
      <div className="w-full space-y-8">
        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 w-full">
          {Object.entries(stats).map(([label, value]) => (
            <div key={label} className="bg-white border border-slate-100 rounded-[2rem] p-5 shadow-sm w-full text-left">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{label}</p>
              <p className="text-2xl font-black text-slate-800">{value}</p>
            </div>
          ))}
        </div>

        {/* CONTENEDOR DE TABLA */}
        <div className="w-full bg-white shadow-xl rounded-[3rem] overflow-hidden border border-slate-100">
          <div className="p-6 border-b border-gray-100 bg-slate-50/30">
            <div className="flex flex-col sm:flex-row gap-4 items-center w-full">
              <div className="flex-1 relative w-full">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search hazards..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 text-sm font-bold outline-none shadow-sm transition-all"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold text-xs uppercase hover:bg-slate-50 transition-all shrink-0"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>

            {showFilters && (
              <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 text-left">Area</label>
                  <select 
                    value={areaFilter}
                    onChange={(e) => setAreaFilter(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 outline-none"
                  >
                    <option value="all">All Areas</option>
                    <option value="Production Floor">Production Floor</option>
                    <option value="Warehouse">Warehouse</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 text-left">Risk Level</label>
                  <select 
                    value={riskLevelFilter}
                    onChange={(e) => setRiskLevelFilter(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 outline-none"
                  >
                    <option value="all">All Levels</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 text-left">Status</label>
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full table-fixed border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[9px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-200">
                  <th className="w-[15%] px-6 py-4 text-left">Process / Area</th>
                  <th className="w-[18%] px-4 py-4 text-left">Task / Hazard</th>
                  <th className="w-[8%] px-4 py-4 text-center">P / S</th>
                  <th className="w-[10%] px-4 py-4 text-center">Risk</th>
                  <th className="w-[15%] px-4 py-4 text-left">Controls (F,M,T)</th>
                  <th className="w-[12%] px-4 py-4 text-left">Responsibility</th>
                  <th className="w-[10%] px-4 py-4 text-center">Status</th>
                  <th className="w-[12%] px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHazards.map(hazard => (
                  <tr key={hazard.id} className="hover:bg-blue-50/10 transition-colors group">
                    <td className="px-6 py-4 text-left">
                      <div className="text-xs font-bold text-slate-700 uppercase truncate">{hazard.processArea}</div>
                      <div className="text-[10px] text-slate-400 truncate italic">Task: {hazard.taskActivity}</div>
                    </td>
                    
                    <td className="px-4 py-4 text-left">
                      <div className="flex items-center gap-1.5 mb-1">
                        <AlertTriangle size={11} className="text-orange-500" />
                        <span className="text-xs font-black text-slate-700 truncate">{hazard.hazardType}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-1">{hazard.hazardDescription}</p>
                    </td>

                    <td className="px-4 py-4 text-center">
                      <div className="text-[10px] font-bold text-slate-600">
                        {hazard.probability} | {hazard.severity}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-center">
                      <div className={`inline-flex flex-col items-center justify-center px-3 py-1 rounded-xl border font-black ${getRiskLevelColor(hazard.riskLevel)}`}>
                        <span className="text-xs uppercase">{hazard.riskScore}</span>
                        <span className="text-[7px] uppercase tracking-tighter">{hazard.riskLevel}</span>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-left text-[10px] text-slate-500">
                      <div className="flex items-center gap-1.5 truncate">
                        <ShieldCheck size={11} className="text-emerald-500 shrink-0" />
                        {hazard.existingControls}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-left">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 uppercase">
                        <User size={11} className="text-blue-500 shrink-0" />
                        <span className="truncate">{hazard.owner}</span>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-center">
                      <div className="flex justify-center">
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
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleAction('Viewing', hazard)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-md transition-all"><Eye size={14} /></button>
                        <button onClick={() => handleAction('Editing', hazard)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-all"><Edit size={14} /></button>
                        <button onClick={() => handleAction('Deleting', hazard)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-all"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODALES */}
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