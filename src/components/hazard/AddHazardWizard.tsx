import { useState } from 'react';
import { X, Check, ShieldCheck, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';

export interface HazardData {
  processArea: string;
  taskActivity: string;
  hazard: string;
  hazardType: string;
  hazardDescription: string;
  consequence: string;
  controlSource: string;
  controlMedium: string;
  controlWorker: string;
  deficiencyLevel: string;
  exposureLevel: string;
  consequenceLevel: string;
  riskScore: number;
  riskLevel: string;
  owner: string;
  reviewDate: string;
}

interface AddHazardWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (hazard: HazardData) => void;
}

export function AddHazardWizard({ isOpen, onClose, onSave }: AddHazardWizardProps) {
  // 1. ESTADO INICIAL CONSTANTE
  const initialFormState = {
    processArea: '',
    taskActivity: '',
    hazard: '',
    hazardType: '',
    hazardDescription: '',
    consequence: '',
    controlSource: '',
    controlMedium: '',
    controlWorker: '',
    deficiencyLevel: '',
    exposureLevel: '',
    consequenceLevel: '',
    owner: 'Sarah Johnson',
    reviewDate: new Date().toISOString().split('T')[0],
  };

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialFormState);

  // 2. FUNCIÓN PARA CERRAR Y BORRAR TODO
  const handleCloseAndClear = () => {
    setFormData(initialFormState); // Borra los datos
    setCurrentStep(1);             // Reinicia al paso 1
    onClose();                     // Notifica al padre que cierre
  };

  // PROTECCIÓN MATEMÁTICA
  const ndValue = Number(formData?.deficiencyLevel) || 0;
  const neValue = Number(formData?.exposureLevel) || 0;
  const ncValue = Number(formData?.consequenceLevel) || 0;
  const npValue = ndValue * neValue; 
  const nrValue = npValue * ncValue;

  const getRiskLevelLabel = (nr: number) => {
    if (nr >= 600) return 'I - Crítico';
    if (nr >= 150) return 'II - Alto';
    if (nr >= 40) return 'III - Medio';
    return 'IV - Bajo';
  };

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const handlePrevious = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSave = () => {
    onSave({ 
      ...formData, 
      riskScore: nrValue,
      riskLevel: getRiskLevelLabel(nrValue).split(' - ')[1]?.toLowerCase() || 'low'
    } as HazardData);
    
    // LIMPIAR DESPUÉS DE GUARDAR
    handleCloseAndClear();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[2.5rem] max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col" translate="no">
        
        {/* HEADER */}
        <div className="p-8 border-b border-gray-100 bg-white text-left">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Identificación de Peligro</h3>
              <p className="text-slate-500 text-sm font-medium italic">Metodología GTC 45</p>
            </div>
            {/* BOTÓN X: Ahora limpia el formulario */}
            <button onClick={handleCloseAndClear} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>

          <div className="flex items-center justify-between px-10">
            {[1, 2, 3].map(step => (
              <div key={step} className="flex items-center flex-1 last:flex-none">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold ${
                  currentStep >= step ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-300'
                }`}>
                  {currentStep > step ? <Check size={18} /> : step}
                </div>
                {step < 3 && <div className={`flex-1 h-1 mx-4 rounded ${currentStep > step ? 'bg-blue-600' : 'bg-slate-100'}`} />}
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 overflow-y-auto flex-1 bg-slate-50/30 text-left">
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input type="text" placeholder="Proceso / Área" value={formData.processArea} onChange={e => setFormData({...formData, processArea: e.target.value})} className="w-full px-5 py-3 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                <input type="text" placeholder="Actividad" value={formData.taskActivity} onChange={e => setFormData({...formData, taskActivity: e.target.value})} className="w-full px-5 py-3 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <select value={formData.hazardType} onChange={e => setFormData({...formData, hazardType: e.target.value})} className="w-full px-5 py-3 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="">Tipo de Peligro...</option>
                  <option value="físico">Físico</option>
                  <option value="químico">Químico</option>
                  <option value="biológico">Biológico</option>
                  <option value="biomecánico">Ergonómico / Biomecánico</option>
                  <option value="psicosocial">Psicosocial</option>
                  <option value="mecanico">Condiciones de seguridad / Mecánico</option>
                  <option value="electrico">Condiciones de seguridad / Eléctrico</option>
                  <option value="locativo">Condiciones de seguridad / Locativo</option>
                  <option value="tecnologico">Condiciones de seguridad / Tecnológico</option>
                  <option value="transito">Condiciones de seguridad / Accidente de tránsito</option>
                  <option value="publico">Condiciones de seguridad / Públicos</option>
                  <option value="alto_riesgo">Condiciones de seguridad / Tareas de alto riesgo</option>
                </select>
                <input type="text" placeholder="Peligro (Fuente)" value={formData.hazard} onChange={e => setFormData({...formData, hazard: e.target.value})} className="w-full px-5 py-3 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <textarea placeholder="Descripción del peligro..." value={formData.hazardDescription} onChange={e => setFormData({...formData, hazardDescription: e.target.value})} className="w-full px-5 py-3 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white" rows={2} />
                <textarea placeholder="Consecuencia..." value={formData.consequence} onChange={e => setFormData({...formData, consequence: e.target.value})} className="w-full px-5 py-3 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white" rows={2} />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="p-8 bg-blue-50/50 rounded-[2.5rem] border border-blue-100 text-left">
                <h4 className="text-blue-700 font-black text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
                  <ShieldCheck size={16} /> Controles Existentes
                </h4>
                <div className="space-y-4 text-left">
                  <input type="text" placeholder="Fuente" value={formData.controlSource} onChange={e => setFormData({...formData, controlSource: e.target.value})} className="w-full px-5 py-3 border border-slate-200 rounded-xl font-bold text-sm outline-none bg-white" />
                  <input type="text" placeholder="Medio" value={formData.controlMedium} onChange={e => setFormData({...formData, controlMedium: e.target.value})} className="w-full px-5 py-3 border border-slate-200 rounded-xl font-bold text-sm outline-none bg-white" />
                  <input type="text" placeholder="Trabajador" value={formData.controlWorker} onChange={e => setFormData({...formData, controlWorker: e.target.value})} className="w-full px-5 py-3 border border-slate-200 rounded-xl font-bold text-sm outline-none bg-white" />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 text-left">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <select value={formData.deficiencyLevel} onChange={e => setFormData({...formData, deficiencyLevel: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-2xl font-bold text-[10px] outline-none bg-white">
                  <option value="">Nivel Deficiencia (ND)</option>
                  <option value="10">Muy Alto (10)</option>
                  <option value="6">Alto (6)</option>
                  <option value="2">Medio (2)</option>
                  <option value="0">Bajo (0)</option>
                </select>
                <select value={formData.exposureLevel} onChange={e => setFormData({...formData, exposureLevel: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-2xl font-bold text-[10px] outline-none bg-white">
                  <option value="">Nivel Exposición (NE)</option>
                  <option value="4">Continua (4)</option>
                  <option value="3">Frecuente (3)</option>
                  <option value="2">Ocasional (2)</option>
                  <option value="1">Esporádica (1)</option>
                </select>
                <select value={formData.consequenceLevel} onChange={e => setFormData({...formData, consequenceLevel: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-2xl font-bold text-[10px] outline-none bg-white">
                  <option value="">Nivel Consecuencia (NC)</option>
                  <option value="100">Muerte (100)</option>
                  <option value="60">Lesión Grave (60)</option>
                  <option value="25">Lesión Leve (25)</option>
                  <option value="20">Daño Menor (20)</option>
                </select>
              </div>

              {formData.deficiencyLevel && formData.exposureLevel && formData.consequenceLevel && (
                <div className="p-8 bg-slate-800 rounded-[2.5rem] text-white flex items-center justify-between shadow-xl">
                  <div className="flex items-center gap-5">
                    <div className="p-4 bg-blue-600 rounded-3xl">
                      <AlertTriangle size={24} />
                    </div>
                    <div translate="no">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 text-left">Resultado NR</p>
                      <h5 className="text-2xl font-black text-left">{`NR: ${nrValue}`}</h5>
                    </div>
                  </div>
                  <div className={`px-8 py-3 rounded-2xl text-xs font-black uppercase border-2 ${
                    nrValue >= 600 ? 'bg-red-500/20 border-red-500 text-red-500' : 
                    nrValue >= 150 ? 'bg-orange-500/20 border-orange-500 text-orange-500' :
                    'bg-emerald-500/20 border-emerald-500 text-emerald-500'
                  }`}>
                    {getRiskLevelLabel(nrValue)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-8 border-t border-gray-100 flex items-center justify-between bg-white">
          {/* BOTÓN CANCELAR: Ahora limpia el formulario */}
          <button onClick={handleCloseAndClear} className="px-6 py-3 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-600">Cancelar</button>
          <div className="flex gap-3">
            {currentStep > 1 && (
              <button onClick={handlePrevious} className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-2xl text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">
                <ChevronLeft size={16} /> Anterior
              </button>
            )}
            {currentStep < 3 ? (
              <button onClick={handleNext} className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl text-xs uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all">
                Siguiente <ChevronRight size={16} />
              </button>
            ) : (
              <button onClick={handleSave} className="flex items-center gap-2 px-8 py-3 bg-emerald-500 text-white font-bold rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all">
                <Check size={16} /> Guardar Peligro
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}