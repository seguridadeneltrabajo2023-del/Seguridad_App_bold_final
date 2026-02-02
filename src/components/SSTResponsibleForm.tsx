import { useState, useEffect } from 'react';
import { Upload, CheckCircle2, X, ShieldCheck } from 'lucide-react';
import { supabase } from '../SupabaseClient'; 

const FileButton = ({ label, id, onChange, hasFile, isExisting }: any) => (
  <div className="relative group">
    <label htmlFor={id} className={`flex items-center justify-between p-4 border-2 border-dashed rounded-xl cursor-pointer transition-all ${(hasFile || isExisting) ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-blue-400 bg-white hover:shadow-md'}`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${(hasFile || isExisting) ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
          {(hasFile || isExisting) ? <CheckCircle2 className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
        </div>
        <div className="flex flex-col text-left">
          <span className={`text-[11px] font-black uppercase ${(hasFile || isExisting) ? 'text-green-700' : 'text-gray-500'}`}>{label}</span>
          <span className="text-[9px] text-gray-400 font-medium">{hasFile ? 'Seleccionado' : isExisting ? 'Cargado' : 'Subir'}</span>
        </div>
      </div>
      <input type="file" id={id} className="hidden" onChange={onChange} accept=".pdf,image/*" />
    </label>
  </div>
);

export const SSTResponsibleForm = ({ onCreated, onClose, initialData }: any) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<Record<string, File>>({});
  const [is50hVigente, setIs50hVigente] = useState(true);

  const [formData, setFormData] = useState({
    nombres: initialData?.nombres || '',
    apellidos: initialData?.apellidos || '',
    tipo_id: initialData?.tipo_id || '',
    numero_id: initialData?.numero_id || '',
    nivel_academico: initialData?.nivel_academico || '',
    profesion: initialData?.profesion || '',
    num_licencia: initialData?.num_licencia || '',
    fecha_exp_licencia: initialData?.fecha_exp_licencia || '',
    fecha_ven_licencia: initialData?.fecha_ven_licencia || '',
    fecha_curso_50h: initialData?.fecha_curso_50h || '',
    fecha_ven_50h: initialData?.fecha_ven_50h || '',
    fecha_curso_20h: initialData?.fecha_curso_20h || '',
    fecha_ven_20h: initialData?.fecha_ven_20h || '',
    es_activo: initialData?.es_activo || false,
  });

  useEffect(() => {
    if (formData.fecha_ven_50h) {
      const hoy = new Date();
      const vencimiento = new Date(formData.fecha_ven_50h);
      setIs50hVigente(vencimiento > hoy);
    }
  }, [formData.fecha_ven_50h]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (name === 'numero_id') {
      const onlyNums = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({ ...prev, [name]: onlyNums }));
      return;
    }
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFiles(prev => ({ ...prev, [type]: file }));
    }
  };

  const handleSaveData = async () => {
    // 1. REGLAS DE OBLIGATORIEDAD (Ajustadas a los nuevos nombres de llaves)
    const obligatorios = [
      { key: 'cedula', label: 'Cédula', urlKey: 'url_cedula' },
      { key: 'diploma', label: 'Diploma', urlKey: 'url_diploma' },
      { key: 'licencia', label: 'Licencia SST', urlKey: 'url_licencia' },
      { key: 'curso50', label: 'Curso 50H', urlKey: 'url_curso50' }, // Llave unificada
      { key: 'contrato', label: 'Contrato', urlKey: 'url_contrato' },
      { key: 'designacion', label: 'Designación Responsable', urlKey: 'url_designacion' }
    ];

    for (const doc of obligatorios) {
      if (!files[doc.key] && !initialData?.[doc.urlKey]) {
        alert(`⚠️ El documento "${doc.label}" es obligatorio.`);
        setStep(3); return;
      }
    }

    setLoading(true);
    try {
      if (formData.es_activo === true) {
        await supabase.from('sst_responsibles').update({ es_activo: false }).neq('id', initialData?.id || '00000000-0000-0000-0000-000000000000');
      }

      // 2. CARGA DE ARCHIVOS A STORAGE
      const fileUrls: Record<string, string> = {};
      for (const [key, file] of Object.entries(files)) {
        const fileName = `${formData.numero_id}_${key}_${Date.now()}.${file.name.split('.').pop()}`;
        const { data, error: uploadError } = await supabase.storage.from('sst_docs').upload(fileName, file, { upsert: true });
        if (uploadError) throw uploadError;
        
        // Aquí mapeamos la subida a la columna url_ correspondiente (ej: url_curso50)
        fileUrls[`url_${key}`] = data.path;
      }

      const cleanPayload = {
        ...formData,
        fecha_exp_licencia: formData.fecha_exp_licencia || null,
        fecha_ven_licencia: formData.fecha_ven_licencia || null,
        fecha_curso_50h: formData.fecha_curso_50h || null,
        fecha_ven_50h: formData.fecha_ven_50h || null,
        fecha_curso_20h: formData.fecha_curso_20h || null,
        fecha_ven_20h: formData.fecha_ven_20h || null,
        es_activo: Boolean(formData.es_activo),
        ...fileUrls
      };

      const { error: saveError } = initialData?.id 
        ? await supabase.from('sst_responsibles').update(cleanPayload).eq('id', initialData.id)
        : await supabase.from('sst_responsibles').insert([cleanPayload]);

      if (saveError) throw saveError;

      alert(formData.es_activo ? "✅ Responsable designado y activado." : "✅ Registro actualizado.");
      await onCreated(); 
      onClose();
    } catch (err: any) {
      alert("❌ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] font-sans">
      <div className="p-5 bg-blue-600 text-white flex justify-between items-center shadow-lg">
        <div>
          <h3 className="text-xl font-black uppercase tracking-tight">{initialData ? 'Editar' : 'Nuevo'} Responsable</h3>
          <p className="text-xs opacity-80 font-bold">Paso {step} de 3</p>
        </div>
        <button type="button" onClick={onClose} className="p-1 hover:rotate-90 transition-transform"><X /></button>
      </div>

      <div className="p-8 overflow-y-auto space-y-6 bg-slate-50/30">
        <div className="flex gap-2 mb-2">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-blue-600' : 'bg-gray-200'}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h4 className="font-bold text-gray-800 border-l-4 border-blue-500 pl-3 uppercase text-sm">Información Personal</h4>
            {/* Selector de Activo */}
            <div className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${formData.es_activo ? 'border-green-500 bg-green-50' : 'border-gray-100 bg-white'}`}>
              <div className="flex items-center gap-3">
                <ShieldCheck className={formData.es_activo ? 'text-green-600' : 'text-gray-400'} />
                <div>
                  <p className="text-xs font-black uppercase leading-none">Establecer como Activo</p>
                  <p className="text-[10px] text-gray-400 font-bold mt-1">Habilitar como responsable actual</p>
                </div>
              </div>
              <input type="checkbox" name="es_activo" checked={formData.es_activo} onChange={handleInputChange} className="w-6 h-6 rounded-lg text-green-600" />
            </div>

            {/* Inputs de texto */}
            <div className="grid grid-cols-2 gap-4">
              <input type="text" name="nombres" placeholder="Nombres" value={formData.nombres} onChange={handleInputChange} className="p-3 border rounded-xl" />
              <input type="text" name="apellidos" placeholder="Apellidos" value={formData.apellidos} onChange={handleInputChange} className="p-3 border rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <select name="tipo_id" value={formData.tipo_id} onChange={handleInputChange} className="p-3 border rounded-xl bg-white outline-none">
                <option value="">Tipo ID</option>
                <option value="CC">CC</option>
                <option value="CE">CE</option>
              </select>
              <input type="text" name="numero_id" placeholder="ID" value={formData.numero_id} onChange={handleInputChange} className="p-3 border rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <select name="nivel_academico" value={formData.nivel_academico} onChange={handleInputChange} className="p-3 border rounded-xl bg-white">
                <option value="">Nivel Académico</option>
                <option value="Técnico">Técnico</option>
                <option value="Tecnólogo">Tecnólogo</option>
                <option value="Profesional">Profesional</option>
                <option value="Especialista">Especialista</option>
              </select>
              <input type="text" name="profesion" placeholder="Profesión" value={formData.profesion} onChange={handleInputChange} className="p-3 border rounded-xl" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h4 className="font-bold text-gray-800 border-l-4 border-blue-500 pl-3 uppercase text-sm">Vencimientos y Licencia</h4>
            <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 space-y-4">
              <input type="text" name="num_licencia" placeholder="Licencia SST" value={formData.num_licencia} onChange={handleInputChange} className="w-full p-3 border rounded-xl" />
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[10px] font-black text-blue-600 uppercase">Expedición</label><input type="date" name="fecha_exp_licencia" value={formData.fecha_exp_licencia} onChange={handleInputChange} className="w-full p-2 border rounded-lg" /></div>
                <div><label className="text-[10px] font-black text-blue-600 uppercase">Vencimiento</label><input type="date" name="fecha_ven_licencia" value={formData.fecha_ven_licencia} onChange={handleInputChange} className="w-full p-2 border rounded-lg" /></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-[10px] font-black uppercase text-gray-500">Curso 50H</label><input type="date" name="fecha_curso_50h" value={formData.fecha_curso_50h} onChange={handleInputChange} className="w-full p-2 border rounded-lg" /></div>
              <div><label className="text-[10px] font-black uppercase text-gray-500">Venc. 50H</label><input type="date" name="fecha_ven_50h" value={formData.fecha_ven_50h} onChange={handleInputChange} className="w-full p-2 border rounded-lg" /></div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h4 className="font-bold text-gray-800 border-l-4 border-blue-500 pl-3 uppercase text-sm">Carga de Documentos</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FileButton label="Cédula (*)" id="cedula" onChange={(e: any) => handleFileChange(e, 'cedula')} hasFile={!!files.cedula} isExisting={!!initialData?.url_cedula} />
              <FileButton label="Diploma (*)" id="diploma" onChange={(e: any) => handleFileChange(e, 'diploma')} hasFile={!!files.diploma} isExisting={!!initialData?.url_diploma} />
              <FileButton label="Licencia SST (*)" id="licencia" onChange={(e: any) => handleFileChange(e, 'licencia')} hasFile={!!files.licencia} isExisting={!!initialData?.url_licencia} />
              
              {/* CAMBIO CLAVE: Llave 'curso50' para url_curso50 */}
              <FileButton label="Curso 50H (*)" id="curso50" onChange={(e: any) => handleFileChange(e, 'curso50')} hasFile={!!files.curso50} isExisting={!!initialData?.url_curso50} />
              
              <FileButton label="Contrato (*)" id="contrato" onChange={(e: any) => handleFileChange(e, 'contrato')} hasFile={!!files.contrato} isExisting={!!initialData?.url_contrato} />
              <FileButton label="Designación (*)" id="designacion" onChange={(e: any) => handleFileChange(e, 'designacion')} hasFile={!!files.designacion} isExisting={!!initialData?.url_designacion} />
              
              {/* CAMBIO CLAVE: Llave 'curso20' para url_curso20 */}
              <div className="relative">
                <FileButton label="Curso 20H" id="curso20" onChange={(e: any) => handleFileChange(e, 'curso20')} hasFile={!!files.curso20} isExisting={!!initialData?.url_curso20} />
                {!is50hVigente && <span className="absolute -top-2 right-2 bg-orange-500 text-white text-[8px] px-2 py-0.5 rounded-full font-black animate-bounce shadow-md">REQUERIDO POR VTO 50H</span>}
              </div>
              
              <FileButton label="Otros" id="otros" onChange={(e: any) => handleFileChange(e, 'otros')} hasFile={!!files.otros} isExisting={!!initialData?.url_otros} />
            </div>
            <p className="text-[10px] text-gray-400 font-bold italic">(*) Documentos obligatorios para guardar.</p>
          </div>
        )}

        <div className="flex justify-between pt-6 mt-4 border-t border-gray-100">
          <button type="button" onClick={onClose} className="text-gray-400 font-bold uppercase text-xs hover:text-red-500 transition-colors">Cancelar</button>
          <div className="flex gap-3">
            {step > 1 && <button type="button" onClick={() => setStep(step - 1)} className="px-6 py-2 border-2 rounded-xl font-bold text-gray-500">Atrás</button>}
            <button type="button" onClick={() => { step < 3 ? setStep(step + 1) : handleSaveData(); }} className={`px-8 py-3 bg-blue-600 text-white rounded-xl font-black uppercase text-xs shadow-lg transition-all ${loading ? 'opacity-50' : 'hover:bg-blue-700 active:scale-95'}`} disabled={loading}>{loading ? 'Guardando...' : step < 3 ? 'Siguiente' : 'Finalizar'}</button>
          </div>
        </div>
      </div>
    </div>
  );
};