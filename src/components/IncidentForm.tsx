import { useState } from 'react';
import { supabase } from '../SupabaseClient';
import { useApp } from '../contexts/AppContext';

const COLOMBIA_DATA: any = {
  "Antioquia": ["Medellín", "Bello", "Itagüí", "Envigado", "Apartadó"],
  "Bogotá D.C.": ["Bogotá D.C."],
  "Valle del Cauca": ["Cali", "Palmira", "Buenaventura", "Tuluá"],
  "Atlántico": ["Barranquilla", "Soledad", "Malambo"],
  "Santander": ["Bucaramanga", "Floridablanca", "Girón"]
};

export const IncidentForm = ({ onIncidentCreated, onClose }: any) => {
  const context = useApp() as any;
  const currentCompanyId = context.currentCompany?.id || context.selectedCompany?.id;

  const [eventType, setEventType] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    incident_date: new Date().toISOString().split('T')[0],
    event_time: '',
    work_shift: '',
    is_habitual_task: '',
    department: '',
    municipality: '',
    zone: '',
    location_scope: '',
    specific_site: '',
    accident_type: '',
    lesion_type: '',
    lesion_type_other: '',
    body_part: '',
    accident_agent: '',
    accident_mechanism: '',
    accident_mechanism_other: '',
    description: '',
    has_witnesses: 'no',
    witness_name: '',
    witness_id_number: '',
    witness_role: '',
    reporter_name: '',
    reporter_id_number: '',
    reporter_role: '',
  });

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'department') setFormData(prev => ({ ...prev, municipality: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('incident_reports').insert([{
        ...formData,
        event_type: eventType,
        company_id: currentCompanyId,
      }]);
      if (error) throw error;
      alert("✅ Registro guardado exitosamente");
      onIncidentCreated?.();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderSimpleForm = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="text-xs font-bold text-gray-500 uppercase">Hora del suceso *</label><input type="time" name="event_time" required onChange={handleInputChange} className="w-full p-2 border rounded-lg bg-gray-50" /></div>
        <div><label className="text-xs font-bold text-gray-500 uppercase">Nombre reporta *</label><input type="text" name="reporter_name" required onChange={handleInputChange} className="w-full p-2 border rounded-lg bg-gray-50" /></div>
      </div>
      <input type="text" name="reporter_role" placeholder="Cargo de quien reporta *" required onChange={handleInputChange} className="w-full p-2 border rounded-lg bg-gray-50" />
      <input type="text" name="location" placeholder="Lugar de ocurrencia del suceso *" required onChange={handleInputChange} className="w-full p-2 border rounded-lg bg-gray-50" />
      <textarea name="description" placeholder="¿Qué ocurrió? *" required onChange={handleInputChange} className="w-full p-2 border rounded-lg bg-gray-50" rows={3} />
      <input type="text" name="activity_during_event" placeholder="¿Durante qué actividad? *" required onChange={handleInputChange} className="w-full p-2 border rounded-lg bg-gray-50" />
      <input type="text" name="risk_generator" placeholder="¿Qué generó el riesgo? *" required onChange={handleInputChange} className="w-full p-2 border rounded-lg bg-gray-50" />
    </div>
  );

  const renderAccidenteSteps = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4 animate-in fade-in">
            <h4 className="font-bold text-blue-700 border-b pb-1 uppercase text-sm italic">A. Datos Generales y B. Ubicación</h4>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-[10px] font-bold text-gray-400">FECHA *</label><input type="date" name="incident_date" required value={formData.incident_date} onChange={handleInputChange} className="w-full p-2 border rounded-lg bg-gray-50" /></div>
              <div><label className="text-[10px] font-bold text-gray-400">HORA *</label><input type="time" name="event_time" required onChange={handleInputChange} className="w-full p-2 border rounded-lg bg-gray-50" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <select name="work_shift" required onChange={handleInputChange} className="p-2 border rounded-lg bg-gray-50">
                <option value="">Jornada Laboral *</option>
                <option value="normal">Jornada Normal</option>
                <option value="extra">Jornada Extra</option>
              </select>
              <select name="is_habitual_task" required onChange={handleInputChange} className="p-2 border rounded-lg bg-gray-50">
                <option value="">¿Tarea habitual? *</option>
                <option value="si">SÍ</option>
                <option value="no">NO</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <select name="department" required value={formData.department} onChange={handleInputChange} className="p-2 border rounded-lg bg-gray-50 font-medium">
                <option value="">Departamento *</option>
                {Object.keys(COLOMBIA_DATA).map(dept => <option key={dept} value={dept}>{dept}</option>)}
              </select>
              <select name="municipality" required value={formData.municipality} disabled={!formData.department} onChange={handleInputChange} className="p-2 border rounded-lg bg-gray-50 disabled:opacity-50">
                <option value="">Municipio *</option>
                {formData.department && COLOMBIA_DATA[formData.department].map((muni: string) => (
                  <option key={muni} value={muni}>{muni}</option>
                ))}
              </select>
            </div>
            <select name="specific_site" required onChange={handleInputChange} className="w-full p-2 border rounded-lg bg-gray-50">
              <option value="">Indique el sitio exacto *</option>
              <option value="Almacenes">Almacenes y depósitos</option>
              <option value="Producción">Áreas de producción</option>
              <option value="Recreativas">Áreas recreativas o deportivas</option>
              <option value="Corredores">Corredores y pasillos</option>
              <option value="Escaleras">Escaleras</option>
              <option value="Parqueaderos">Parqueaderos</option>
              <option value="Oficinas">Oficinas</option>
            </select>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4 animate-in fade-in">
            <h4 className="font-bold text-blue-700 border-b pb-1 uppercase text-sm italic">C. Clasificación y D. Lesión</h4>
            <select name="accident_type" required onChange={handleInputChange} className="w-full p-2 border rounded-lg bg-gray-50">
              <option value="">Tipo de accidente *</option>
              <option value="Violencia">Violencia</option>
              <option value="Tránsito">Tránsito</option>
              <option value="Propio">Propio del trabajo</option>
            </select>
            <select name="lesion_type" required onChange={handleInputChange} className="w-full p-2 border rounded-lg bg-gray-50">
              <option value="">Tipo de lesión *</option>
              <option value="Fractura">Fractura</option>
              <option value="Luxación">Luxación</option>
              <option value="Herida">Herida</option>
              <option value="Otro">Otro</option>
            </select>
            {formData.lesion_type === 'Otro' && (
              <input type="text" name="lesion_type_other" required placeholder="Especifique la lesión *" onChange={handleInputChange} className="w-full p-2 border-2 border-blue-200 rounded-lg" />
            )}
            <select name="body_part" required onChange={handleInputChange} className="w-full p-2 border rounded-lg bg-gray-50">
              <option value="">Parte del cuerpo afectada *</option>
              <option value="Cabeza">Cabeza</option>
              <option value="Ojo">Ojo</option>
              <option value="Tronco">Tronco</option>
              <option value="Manos">Manos</option>
              <option value="Pies">Pies</option>
            </select>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4 animate-in fade-in">
            <h4 className="font-bold text-blue-700 border-b pb-1 uppercase text-sm italic">E. Agente y F. Mecanismo</h4>
            <select name="accident_agent" required onChange={handleInputChange} className="w-full p-2 border rounded-lg bg-gray-50">
              <option value="">Agente del accidente *</option>
              <option value="Maquinas">Máquinas / Equipos</option>
              <option value="Herramientas">Herramientas / Utensilios</option>
              <option value="Ambiente">Ambiente de trabajo</option>
            </select>
            <textarea name="description" required placeholder="Descripción detallada del accidente *" onChange={handleInputChange} className="w-full p-2 border rounded-lg bg-gray-50" rows={4} />
          </div>
        );
      case 4:
        return (
          <div className="space-y-4 animate-in fade-in">
            <h4 className="font-bold text-blue-700 border-b pb-1 uppercase text-sm italic">H. Testigos e I. Responsable</h4>
            <select name="has_witnesses" required onChange={handleInputChange} className="w-full p-2 border rounded-lg bg-gray-50">
              <option value="no">¿Hubo testigos? NO</option>
              <option value="si">¿Hubo testigos? SÍ</option>
            </select>
            {formData.has_witnesses === 'si' && (
              <div className="p-3 bg-blue-50/50 rounded-lg space-y-2 border border-blue-100">
                <input type="text" name="witness_name" required placeholder="Nombre completo testigo *" onChange={handleInputChange} className="w-full p-2 border rounded-lg bg-white" />
                <input type="text" name="witness_id_number" required placeholder="N° Identificación *" onChange={handleInputChange} className="w-full p-2 border rounded-lg bg-white" />
              </div>
            )}
            <div className="pt-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase">RESPONSABLE DEL INFORME *</label>
              <input type="text" name="reporter_name" required placeholder="Nombres completos *" onChange={handleInputChange} className="w-full p-2 border rounded-lg bg-gray-50 mb-2" />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" name="reporter_id_number" required placeholder="N° ID *" onChange={handleInputChange} className="p-2 border rounded-lg bg-gray-50" />
                <input type="text" name="reporter_role" required placeholder="Cargo *" onChange={handleInputChange} className="p-2 border rounded-lg bg-gray-50" />
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
      <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
        <h3 className="font-black text-gray-800 tracking-tight">REGISTRO OFICIAL DE EVENTOS</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors text-xl">✕</button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
        <div className="mb-6">
          <label className="block text-xs font-black text-blue-600 uppercase mb-2">Seleccione el Tipo de Evento *</label>
          <select 
            className="w-full p-4 border-2 border-blue-50 rounded-xl bg-blue-50/30 font-bold focus:border-blue-500 outline-none"
            value={eventType}
            onChange={(e) => {setEventType(e.target.value); setStep(1);}}
            required
          >
            <option value="">ELIJA UNA OPCIÓN...</option>
            <option value="Accidente de trabajo">ACCIDENTE DE TRABAJO (FURAT)</option>
            <option value="Incidente">INCIDENTE</option>
            <option value="Acto inseguro">ACTO INSEGURO</option>
            <option value="Condición insegura">CONDICIÓN INSEGURA</option>
            <option value="Presunta enfermedad laboral">PRESUNTA ENFERMEDAD LABORAL</option>
          </select>
        </div>

        {eventType === "Accidente de trabajo" ? (
          <>
            <div className="flex gap-2 mb-6 px-1">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`h-2 flex-1 rounded-full ${step >= i ? 'bg-blue-600' : 'bg-gray-200'}`} />
              ))}
            </div>
            {renderAccidenteSteps()}
          </>
        ) : eventType !== "" ? (
          renderSimpleForm()
        ) : (
          <div className="text-center py-10 text-gray-400 italic">Debe seleccionar un tipo de evento para desplegar los campos obligatorios.</div>
        )}

        <div className="flex justify-between mt-8 pt-4 border-t">
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-400 font-bold hover:text-gray-600">CANCELAR</button>
          <div className="flex gap-3">
            {eventType === "Accidente de trabajo" && step > 1 && (
              <button type="button" onClick={() => setStep(step - 1)} className="px-6 py-2 border-2 border-gray-100 rounded-xl font-bold bg-white">ATRÁS</button>
            )}
            <button 
              type={ (eventType === "Accidente de trabajo" && step < 4) ? "button" : "submit" }
              onClick={() => {
                if(eventType === "Accidente de trabajo" && step < 4) setStep(step + 1);
              }}
              disabled={loading || !eventType}
              className="px-8 py-2 bg-blue-600 text-white rounded-xl font-black hover:bg-blue-700 shadow-lg active:scale-95 transition-all"
            >
              {loading ? 'GUARDANDO...' : (eventType === "Accidente de trabajo" && step < 4 ? 'SIGUIENTE' : 'FINALIZAR REPORTE')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};