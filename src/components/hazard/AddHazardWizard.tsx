import { useState, useEffect } from 'react';
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
  probabilityLevel: number;
  riskScore: number;
  riskLevel: string;
  acceptability: string;
  intervention: string;
  owner: string;
  reviewDate: string;
}

interface AddHazardWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (hazard: HazardData) => void;
  initialData: HazardData | null;
}

export function AddHazardWizard({ isOpen, onClose, onSave, initialData }: AddHazardWizardProps) {
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

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({ ...initialFormState, ...initialData });
      } else {
        setFormData(initialFormState);
      }
      setCurrentStep(1);
    }
  }, [isOpen, initialData]);

  const ndValue = Number(formData?.deficiencyLevel) || 0;
  const neValue = Number(formData?.exposureLevel) || 0;
  const ncValue = Number(formData?.consequenceLevel) || 0;
  
  const npValue = ndValue * neValue; 
  const nrValue = npValue * ncValue;

  // 1. ACTUALIZACIÓN: SOLO RETORNA EL NÚMERO ROMANO
  const getRiskLevelLabel = (nr: number) => {
    if (nr >= 600) return 'I';
    if (nr >= 150) return 'II';
    if (nr >= 40) return 'III';
    return 'IV';
  };

  // 2. ACTUALIZACIÓN: INTERPRETACIÓN TÉCNICA GTC 45 EN ACTION
  const getAcceptabilityData = (nr: number) => {
    if (nr >= 600) return { 
      label: 'No aceptable', 
      action: 'Situación crítica. Suspender actividades hasta que el riesgo esté bajo control. Intervención urgente.' 
    };
    if (nr >= 150) return { 
      label: 'No aceptable o aceptable con control específico', 
      action: 'Corregir y adoptar medidas de control de inmediato.' 
    };
    if (nr >= 40) return { 
      label: 'Mejorable', 
      action: 'Mejorar si es posible. Sería conveniente justificar la intervención y su rentabilidad.' 
    };
    return { 
      label: 'Aceptable', 
      action: 'Mantener las medidas de control existentes.' 
    };
  };

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const handlePrevious = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSave = () => {
    const accData = getAcceptabilityData(nrValue);
    onSave({ 
      ...formData, 
      probabilityLevel: npValue,
      riskScore: nrValue,
      riskLevel: getRiskLevelLabel(nrValue),
      acceptability: accData.label,
      intervention: accData.action 
    } as HazardData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[2.5rem] max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        
        {/* HEADER */}
        <div className="p-8 border-b border-gray-100 bg-white text-left">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
                {initialData ? 'Actualizar Registro' : 'Identificación de Peligro'}
              </h3>
              <p className="text-slate-500 text-sm font-medium italic">GTC 45 - Matriz de Riesgos</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>

          <div className="flex items-center justify-between px-10">
            {[1, 2, 3].map(step => (
              <div key={step} className="flex items-center flex-1 last:flex-none">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold transition-all ${
                  currentStep >= step ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-300'
                }`}>
                  {currentStep > step ? <Check size={18} /> : step}
                </div>
                {step < 3 && <div className={`flex-1 h-1 mx-4 rounded ${currentStep > step ? 'bg-blue-600' : 'bg-slate-100'}`} />}
              </div>
            ))}
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-8 overflow-y-auto flex-1 bg-slate-50/30 text-left">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Proceso / Área</label>
                  <input type="text" value={formData.processArea} onChange={e => setFormData({...formData, processArea: e.target.value})} className="w-full px-5 py-3 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Actividad</label>
                  <input type="text" value={formData.taskActivity} onChange={e => setFormData({...formData, taskActivity: e.target.value})} className="w-full px-5 py-3 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Tipo de Peligro</label>
                  <select value={formData.hazardType} onChange={e => setFormData({...formData, hazardType: e.target.value})} className="w-full px-5 py-3 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none">
                    <option value="">Seleccione tipo...</option>
                    <option value="físico">Físico</option><option value="químico">Químico</option><option value="biológico">Biológico</option><option value="biomecánico">Biomecánico</option><option value="psicosocial">Psicosocial</option><option value="mecanico">Mecánico</option><option value="electrico">Eléctrico</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Peligro (Fuente)</label>
                  <input type="text" value={formData.hazard} onChange={e => setFormData({...formData, hazard: e.target.value})} className="w-full px-5 py-3 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Descripción del Peligro</label>
                  <textarea value={formData.hazardDescription} onChange={e => setFormData({...formData, hazardDescription: e.target.value})} className="w-full px-5 py-3 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white" rows={2} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Consecuencia Potencial</label>
                  <textarea value={formData.consequence} onChange={e => setFormData({...formData, consequence: e.target.value})} className="w-full px-5 py-3 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white" rows={2} />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6 text-left">
              <div className="p-8 bg-blue-50/50 rounded-[2.5rem] border border-blue-100">
                <h4 className="text-blue-700 font-black text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
                  <ShieldCheck size={16} /> Controles Existentes
                </h4>
                <div className="space-y-5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-2">Control en la Fuente</label>
                    <input type="text" value={formData.controlSource} onChange={e => setFormData({...formData, controlSource: e.target.value})} className="w-full px-5 py-3 border border-slate-200 rounded-xl font-bold text-sm outline-none bg-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-2">Control en el Medio</label>
                    <input type="text" value={formData.controlMedium} onChange={e => setFormData({...formData, controlMedium: e.target.value})} className="w-full px-5 py-3 border border-slate-200 rounded-xl font-bold text-sm outline-none bg-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-2">Control en el Trabajador</label>
                    <input type="text" value={formData.controlWorker} onChange={e => setFormData({...formData, controlWorker: e.target.value})} className="w-full px-5 py-3 border border-slate-200 rounded-xl font-bold text-sm outline-none bg-white" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-8 text-left">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Nivel Deficiencia (ND)</label>
                  <select value={formData.deficiencyLevel} onChange={e => setFormData({...formData, deficiencyLevel: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-2xl font-bold text-xs outline-none bg-white">
                    <option value="">Seleccione ND</option>
                    <option value="10">Muy Alto (10) - Peligros significativos</option>
                    <option value="6">Alto (6) - Deficiencias notables</option>
                    <option value="2">Medio (2) - Deficiencias moderadas</option>
                    <option value="0">Bajo (0) - No se detecta deficiencia</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Nivel Exposición (NE)</label>
                  <select value={formData.exposureLevel} onChange={e => setFormData({...formData, exposureLevel: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-2xl font-bold text-xs outline-none bg-white">
                    <option value="">Seleccione NE</option>
                    <option value="4">Continua (4) - Sin interrupción</option>
                    <option value="3">Frecuente (3) - Varias veces jornada</option>
                    <option value="2">Ocasional (2) - Alguna vez jornada</option>
                    <option value="1">Esporádica (1) - Alguna vez año</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Nivel Consecuencia (NC)</label>
                  <select value={formData.consequenceLevel} onChange={e => setFormData({...formData, consequenceLevel: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-2xl font-bold text-xs outline-none bg-white">
                    <option value="">Seleccione NC</option>
                    <option value="100">Muerte (100) - Catastrófico</option>
                    <option value="60">Grave (60) - Incapacidad permanente</option>
                    <option value="25">Leve (25) - Incapacidad temporal</option>
                    <option value="10">Menor (10) - Sin incapacidad</option>
                  </select>
                </div>
              </div>

              {formData.deficiencyLevel && formData.exposureLevel && formData.consequenceLevel && (
                <div className="space-y-4">
                  <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white flex items-center justify-between shadow-xl">
                    <div className="flex items-center gap-5">
                      <div className="p-4 bg-blue-600 rounded-3xl text-white shadow-lg shadow-blue-500/20">
                        <AlertTriangle size={24} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Valoración Riesgo (NR)</p>
                        <h5 className="text-2xl font-black">{`NR: ${nrValue}`}</h5>
                        <p className="text-[10px] text-blue-400 font-bold uppercase tracking-tight">{`NP: ${npValue} (Probabilidad)`}</p>
                      </div>
                    </div>
                    <div className={`px-8 py-3 rounded-2xl text-xs font-black uppercase border-2 ${
                      nrValue >= 600 ? 'bg-red-500/20 border-red-500 text-red-500' : 
                      nrValue >= 150 ? 'bg-orange-500/20 border-orange-500 text-orange-500' :
                      nrValue >= 40 ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500' :
                      'bg-emerald-500/20 border-emerald-500 text-emerald-500'
                    }`}>
                      {`Nivel ${getRiskLevelLabel(nrValue)}`}
                    </div>
                  </div>
                  <div className="p-6 bg-white border border-slate-200 rounded-[2rem] shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Aceptabilidad e Interpretación GTC 45</p>
                    <p className="text-sm font-black text-slate-800 mb-1">{getAcceptabilityData(nrValue).label}</p>
                    <p className="text-[10px] text-slate-500 italic leading-relaxed uppercase font-bold">{getAcceptabilityData(nrValue).action}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-8 border-t border-gray-100 flex items-center justify-between bg-white">
          <button onClick={onClose} className="px-6 py-3 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-slate-600 transition-colors">Cancelar</button>
          <div className="flex gap-3">
            {currentStep > 1 && (
              <button onClick={handlePrevious} className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-2xl text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">
                <ChevronLeft size={16} /> Anterior
              </button>
            )}
            {currentStep < 3 ? (
              <button onClick={handleNext} className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl text-[10px] uppercase tracking-widest hover:bg-blue-700 shadow-lg transition-all">
                Siguiente <ChevronRight size={16} />
              </button>
            ) : (
              <button onClick={handleSave} className="flex items-center gap-2 px-8 py-3 bg-emerald-500 text-white font-bold rounded-2xl text-[10px] uppercase shadow-lg hover:bg-emerald-600 transition-all">
                <Check size={16} /> {initialData ? 'Actualizar' : 'Guardar'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}