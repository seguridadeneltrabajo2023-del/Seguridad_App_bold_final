import { useState } from 'react';
import { supabase } from '../SupabaseClient';
import { useApp } from '../contexts/AppContext';
import { 
  X, MapPin, FileText, Clock, Calendar, 
  ChevronRight, ChevronLeft, Check, ShieldAlert 
} from 'lucide-react';

const COLOMBIA_DATA: any = {
  "Antioquia": ["Medellín", "Bello", "Itagüí", "Envigado", "Apartadó"],
  "Bogotá D.C.": ["Bogotá D.C."],
  "Valle del Cauca": ["Cali", "Palmira", "Buenaventura", "Tuluá"],
  "Atlántico": ["Barranquilla", "Soledad", "Malambo"],
  "Santander": ["Bucaramanga", "Floridablanca", "Girón"]
};

// ASEGÚRATE DE QUE TENGA EL "export" AL INICIO
export const IncidentForm = ({ onIncidentCreated, onClose }: any) => {
  const context = useApp() as any;
  const currentCompanyId = context.currentCompany?.id || context.selectedCompany?.id;

  const [eventType, setEventType] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    incident_date: new Date().toISOString().split('T')[0],
    event_time: '',
    time_worked_before_accident: '',
    work_shift: '',
    is_habitual_task: '',
    department: '',
    municipality: '',
    specific_site: '',
    specific_site_other: '',
    accident_type: '',
    lesion_type: '',
    lesion_type_other: '',
    body_part: '',
    accident_agent: '',
    accident_mechanism: '',
    description: '',
    has_witnesses: 'no',
    witness_name: '',
    witness_id_number: '',
    reporter_name: '',
    reporter_id_number: '',
    reporter_role: '',
    status: 'Abierto'
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
      const processedLocation = (formData.specific_site === 'Otras áreas comunes' || formData.specific_site === 'Otro') 
        ? formData.specific_site_other 
        : formData.specific_site;

      const dataToSave = {
        incident_date: formData.incident_date,
        event_time: formData.event_time,
        event_type: eventType,
        description: formData.description || "Sin descripción detallada",
        company_id: currentCompanyId,
        status: 'Abierto',
        location: processedLocation || formData.specific_site || "Sitio no especificado",
        is_habitual_task: formData.is_habitual_task === 'si', 
        has_witnesses: formData.has_witnesses === 'si',
        department: formData.department,
        municipality: formData.municipality,
        work_shift: formData.work_shift,
        time_worked_before_accident: formData.time_worked_before_accident,
        accident_type: formData.accident_type,
        lesion_type: formData.lesion_type === 'Otro' ? formData.lesion_type_other : formData.lesion_type,
        body_part: formData.body_part,
        accident_agent: formData.accident_agent,
        accident_mechanism: formData.accident_mechanism,
        witness_name: formData.witness_name,
        witness_id_number: formData.witness_id_number,
        reporter_name: formData.reporter_name,
        reporter_id_number: formData.reporter_id_number,
        reporter_role: formData.reporter_role
      };

      const { error } = await supabase.from('incident_reports').insert([dataToSave]);
      if (error) throw error;
      alert("✅ Reporte guardado con éxito");
      onIncidentCreated?.(); 
    } catch (err: any) {
      alert("❌ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderAccidenteSteps = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4 animate-in fade-in text-left">
            <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><MapPin size={14}/> A. General y B. Ubicación</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-2 flex items-center gap-1"><Calendar size={10} /> Fecha *</label>
                <input type="date" name="incident_date" required value={formData.incident_date} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border rounded-xl text-xs font-bold outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-2 flex items-center gap-1"><Clock size={10} /> Hora *</label>
                <input type="time" name="event_time" required onChange={handleInputChange} className="w-full p-3 bg-slate-50 border rounded-xl text-xs font-bold outline-none" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Tiempo laborado previo al accidente *</label>
              <input type="text" name="time_worked_before_accident" placeholder="Ej: 4 horas 30 min" onChange={handleInputChange} className="w-full p-3 bg-slate-50 border rounded-xl text-xs font-bold outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <select name="work_shift" required onChange={handleInputChange} className="p-3 bg-slate-50 border rounded-xl text-xs font-bold outline-none">
                <option value="">Jornada Laboral *</option>
                <option value="normal">Normal</option>
                <option value="extra">Extra</option>
              </select>
              <select name="is_habitual_task" required onChange={handleInputChange} className="p-3 bg-slate-50 border rounded-xl text-xs font-bold outline-none">
                <option value="">¿Tarea habitual? *</option>
                <option value="si">SÍ</option>
                <option value="no">NO</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <select name="department" required value={formData.department} onChange={handleInputChange} className="p-3 bg-slate-50 border rounded-xl text-xs font-bold outline-none">
                <option value="">Departamento *</option>
                {Object.keys(COLOMBIA_DATA).map(dept => <option key={dept} value={dept}>{dept}</option>)}
              </select>
              <select name="municipality" required value={formData.municipality} disabled={!formData.department} onChange={handleInputChange} className="p-3 bg-slate-50 border rounded-xl text-xs font-bold outline-none disabled:opacity-50">
                <option value="">Municipio *</option>
                {formData.department && COLOMBIA_DATA[formData.department].map((muni: string) => <option key={muni} value={muni}>{muni}</option>)}
              </select>
            </div>
            <select name="specific_site" required value={formData.specific_site} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border rounded-xl text-xs font-bold outline-none">
              <option value="">Indique el sitio exacto *</option>
              <option value="Almacenes o depósitos">Almacenes o depósitos</option>
              <option value="Areas de producción">Areas de producción</option>
              <option value="Areas recreativas o deportivas">Areas recreativas o deportivas</option>
              <option value="Corredores o pasillos">Corredores o pasillos</option>
              <option value="Escaleras">Escaleras</option>
              <option value="Parqueaderos o áreas de circulación vehicular">Parqueaderos o áreas de circulación vehicular</option>
              <option value="Oficinas">Oficinas</option>
              <option value="Otras áreas comunes">Otras áreas comunes</option>
              <option value="Otro">Otro</option>
            </select>
            {(formData.specific_site === 'Otras áreas comunes' || formData.specific_site === 'Otro') && (
              <input type="text" name="specific_site_other" required placeholder="Especifique el sitio exacto *" onChange={handleInputChange} className="w-full p-3 border-2 border-blue-200 rounded-xl text-xs font-bold animate-in slide-in-from-top-2 outline-none" />
            )}
          </div>
        );
      case 2:
        return (
          <div className="space-y-4 animate-in fade-in text-left">
            <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><ShieldAlert size={14}/> C. Clasificación y D. Lesión</h4>
            <select name="accident_type" required onChange={handleInputChange} className="w-full p-3 bg-slate-50 border rounded-xl text-xs font-bold outline-none">
              <option value="">Tipo de accidente *</option>
              <option value="Propio">Propio del trabajo</option>
              <option value="Violencia">Violencia</option>
              <option value="Tránsito">Tránsito</option>
              <option value="Deportivo">Deportivo</option>
              <option value="Recreativo">Recreativo o Cultural</option>
            </select>
            <select name="lesion_type" required onChange={handleInputChange} className="w-full p-3 bg-slate-50 border rounded-xl text-xs font-bold outline-none">
              <option value="">Tipo de lesión *</option>
              <option value="Fractura">Fractura</option>
              <option value="Luxación">Luxación</option>
              <option value="Torcedura/Esguince/Desgarro/Hernia">Torcedura/Esguince/Desgarro/Hernia</option>
              <option value="Conmoción">Conmoción o trauma interno</option>
              <option value="Amputación">Amputación o enucleación</option>
              <option value="Trauma superficial">Trauma superficial (Rasguño/Pinchazo)</option>
              <option value="Golpe/Contusión/Aplastamiento">Golpe/Contusión/Aplastamiento</option>
              <option value="Quemaduras">Quemaduras</option>
              <option value="Envenenamiento">Envenenamiento o intoxicación</option>
              <option value="Asfixia">Asfixia</option>
              <option value="Electricidad">Efecto de la electricidad</option>
              <option value="Radiación">Efecto nocivo de la radiación</option>
              <option value="Lesiones múltiples">Lesiones múltiples</option>
              <option value="Otro">Otro</option>
            </select>
            {formData.lesion_type === 'Otro' && (
              <input type="text" name="lesion_type_other" required placeholder="Especifique la lesión *" onChange={handleInputChange} className="w-full p-3 border-2 border-blue-200 rounded-xl text-xs font-bold animate-in slide-in-from-top-2 outline-none" />
            )}
            <select name="body_part" required onChange={handleInputChange} className="w-full p-3 bg-slate-50 border rounded-xl text-xs font-bold outline-none">
              <option value="">Parte del cuerpo afectada *</option>
              <option value="Cabeza">Cabeza</option>
              <option value="Ojo">Ojo</option>
              <option value="Cuello">Cuello</option>
              <option value="Tronco">Tronco (incluye espalda, columna vertebral, médula espinal, pelvis)</option>
              <option value="Tórax">Tórax</option>
              <option value="Abdómen">Abdómen</option>
              <option value="Miembros superiores">Miembros superiores</option>
              <option value="Manos">Manos</option>
              <option value="Miembros inferiores">Miembros inferiores</option>
              <option value="Pies">Pies</option>
              <option value="Ubicaciones múltiples">Ubicaciones múltiples</option>
              <option value="Lesiones generales u otras">Lesiones generales u otras</option>
            </select>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4 animate-in fade-in text-left">
            <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><FileText size={14}/> E. Agente y F. Mecanismo</h4>
            <select name="accident_agent" required onChange={handleInputChange} className="w-full p-3 bg-slate-50 border rounded-xl text-xs font-bold outline-none">
              <option value="">Agente del accidente *</option>
              <option value="Máquinas y/o equipos">Máquinas y/o equipos</option>
              <option value="Medios de transporte">Medios de transporte</option>
              <option value="Aparatos">Aparatos</option>
              <option value="Herramientas, implementos ó utensilios">Herramientas, implementos ó utensilios</option>
              <option value="Materiales o sustancias">Materiales o sustancias</option>
              <option value="Radiaciones">Radiaciones</option>
              <option value="Ambiente de trabajo">Ambiente de trabajo (incluye superficie de tránsito, muebles, tejados, etc)</option>
              <option value="Otros agentes no clasificados">Otros agentes no clasificados</option>
              <option value="Animales">Animales (vivos o productos animales)</option>
              <option value="Agentes no clasificados por falta de datos">Agentes no clasificados por falta de datos</option>
            </select>
            <select name="accident_mechanism" required onChange={handleInputChange} className="w-full p-3 bg-slate-50 border rounded-xl text-xs font-bold outline-none">
              <option value="">Mecanismo o forma del accidente *</option>
              <option value="Caida de personas">Caida de personas</option>
              <option value="Caida de objetos">Caida de objetos</option>
              <option value="Pisadas, choques o golpes">Pisadas, choques o golpes</option>
              <option value="Atrapamientos">Atrapamientos</option>
              <option value="Sobreesfuerzo, esfuerzo excesivo o falso movimiento">Sobreesfuerzo, esfuerzo excesivo o falso movimiento</option>
              <option value="Exposición o contacto con temperatura extrema">Exposición o contacto con temperatura extrema</option>
              <option value="Exposición o contacto con la electricidad">Exposición o contacto con la electricidad</option>
              <option value="Exposición o contacto con sustancias nocivas o radiaciones o salpicaduras">Exposición o contacto con sustancias nocivas o radiaciones o salpicaduras</option>
              <option value="Otro">Otro</option>
            </select>
            <textarea name="description" required placeholder="Relato detallado del accidente..." onChange={handleInputChange} className="w-full p-4 bg-slate-50 border rounded-2xl text-xs font-bold outline-none" rows={4} />
          </div>
        );
      case 4:
        return (
          <div className="space-y-4 animate-in fade-in text-left">
            <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><Check size={14}/> H. Testigos e I. Responsable</h4>
            <select name="has_witnesses" required value={formData.has_witnesses} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border rounded-xl text-xs font-bold outline-none">
              <option value="no">¿Hubo testigos? NO</option>
              <option value="si">¿Hubo testigos? SÍ</option>
            </select>
            {formData.has_witnesses === 'si' && (
              <div className="p-3 bg-blue-50/50 rounded-xl space-y-2 border border-blue-100">
                <input type="text" name="witness_name" required placeholder="Nombre completo testigo" onChange={handleInputChange} className="w-full p-2 text-xs font-bold bg-white border rounded-lg outline-none" />
                <input type="text" name="witness_id_number" required placeholder="N° Identificación" onChange={handleInputChange} className="w-full p-2 text-xs font-bold bg-white border rounded-lg outline-none" />
              </div>
            )}
            <div className="pt-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Responsable del Informe</label>
              <input type="text" name="reporter_name" required placeholder="Nombres completos *" onChange={handleInputChange} className="w-full p-3 bg-slate-50 border rounded-xl text-xs font-bold mb-2 outline-none" />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" name="reporter_id_number" required placeholder="N° ID *" onChange={handleInputChange} className="p-3 bg-slate-50 border rounded-xl text-xs font-bold outline-none" />
                <input type="text" name="reporter_role" required placeholder="Cargo *" onChange={handleInputChange} className="p-3 bg-slate-50 border rounded-xl text-xs font-bold outline-none" />
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
      <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-left">
        <div>
          <h3 className="font-black text-slate-800 tracking-tighter uppercase text-lg leading-none">Reporte de Evento Laboral</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">SST - Gestión de Riesgos</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-full transition-all">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-8 overflow-y-auto flex-1">
        <div className="mb-8 text-left">
          <label className="block text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3 ml-2">Tipo de Evento *</label>
          <select className="w-full p-4 border-2 border-blue-50 rounded-2xl bg-blue-50/30 font-black text-xs outline-none focus:border-blue-500 transition-all" value={eventType} onChange={(e) => {setEventType(e.target.value); setStep(1);}} required>
            <option value="">ELIJA UNA OPCIÓN...</option>
            <option value="Accidente de trabajo">ACCIDENTE DE TRABAJO (FURAT)</option>
            <option value="Incidente">INCIDENTE</option>
            <option value="Acto inseguro">ACTO INSEGURO</option>
            <option value="Condición insegura">CONDICIÓN PELIGROSA / INSEGURA</option>
            <option value="Presunta enfermedad laboral">PRESUNTA ENFERMEDAD LABORAL</option>
          </select>
        </div>

        {eventType === "Accidente de trabajo" ? (
          <div className="space-y-6">
            <div className="flex gap-2 mb-8 px-1">
              {[1, 2, 3, 4].map(i => <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${step >= i ? 'bg-blue-600' : 'bg-slate-100'}`} />)}
            </div>
            {renderAccidenteSteps()}
          </div>
        ) : eventType !== "" ? (
          <div className="space-y-4 text-left animate-in slide-in-from-bottom-2">
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-2 flex items-center gap-1"><Clock size={10} /> Hora</label>
                <input type="time" name="event_time" required onChange={handleInputChange} className="w-full p-3 bg-slate-50 border rounded-xl text-xs font-bold outline-none" />
               </div>
               <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase ml-2 flex items-center gap-1"><Calendar size={10} /> Fecha</label>
                <input type="date" name="incident_date" required value={formData.incident_date} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border rounded-xl text-xs font-bold outline-none" />
               </div>
            </div>
            <input type="text" name="reporter_name" placeholder="Nombre de quien reporta *" required onChange={handleInputChange} className="w-full p-3 bg-slate-50 border rounded-xl text-xs font-bold outline-none" />
            <input type="text" name="reporter_role" placeholder="Cargo *" required onChange={handleInputChange} className="w-full p-3 bg-slate-50 border rounded-xl text-xs font-bold outline-none" />
            <textarea name="description" placeholder="Descripción detallada de lo ocurrido... *" required onChange={handleInputChange} className="w-full p-4 bg-slate-50 border rounded-2xl text-xs font-bold outline-none" rows={4} />
          </div>
        ) : null}

        <div className="flex justify-between mt-12 pt-6 border-t border-slate-50">
          <button type="button" onClick={onClose} className="px-6 py-3 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-600 transition-colors">Cancelar</button>
          <div className="flex gap-3">
            {eventType === "Accidente de trabajo" && step > 1 && (
              <button type="button" onClick={() => setStep(step - 1)} className="px-6 py-3 border-2 border-slate-100 rounded-xl font-black text-[10px] uppercase flex items-center gap-2 transition-all hover:bg-slate-50"><ChevronLeft size={16}/> Atrás</button>
            )}
            <button type={(eventType === "Accidente de trabajo" && step < 4) ? "button" : "submit"} onClick={() => { if(eventType === "Accidente de trabajo" && step < 4) setStep(step + 1); }} disabled={loading || !eventType} className="px-10 py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase shadow-xl flex items-center gap-2 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50">
              {loading ? 'Guardando...' : (eventType === "Accidente de trabajo" && step < 4 ? <>Siguiente <ChevronRight size={16}/></> : <>Finalizar <Check size={16}/></>)}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};