import { useState, useEffect } from 'react';
import { Upload, CheckCircle2, X } from 'lucide-react';
import { supabase } from '../SupabaseClient'; 

const FileButton = ({ label, id, onChange, hasFile, isExisting }: any) => (
  <div className="relative group">
    <label htmlFor={id} className={`flex items-center justify-between p-4 border-2 border-dashed rounded-xl cursor-pointer transition-all ${(hasFile || isExisting) ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-blue-400 bg-white hover:shadow-md'}`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${(hasFile || isExisting) ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
          {(hasFile || isExisting) ? <CheckCircle2 className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
        </div>
        <div className="flex flex-col text-left">
          <span className={`text-[11px] font-black uppercase ${(hasFile || isExisting) ? 'text-green-700' : 'text-gray-50'}`}>{label}</span>
          <span className="text-[9px] text-gray-400 font-medium">
            {hasFile ? 'Seleccionado' : isExisting ? 'Cargado' : 'Subir'}
          </span>
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
  });

  useEffect(() => {
    if (formData.fecha_ven_50h) {
      const hoy = new Date();
      const vencimiento = new Date(formData.fecha_ven_50h);
      setIs50hVigente(vencimiento > hoy);
    }
  }, [formData.fecha_ven_50h]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFiles(prev => ({ ...prev, [type]: file }));
    }
  };

  const handleSaveData = async () => {
    if (!initialData) {
      const missing = [];
      if (!files.cedula) missing.push("Cédula");
      if (!files.diploma) missing.push("Diploma / Acta");
      if (!files.licencia) missing.push("Licencia SST");
      if (!files.curso50) missing.push("Curso 50h");
      if (!is50hVigente && !files.curso20) missing.push("Curso 20h");

      if (missing.length > 0) {
        alert(`❌ No se puede registrar:\nDebes cargar: ${missing.join(", ")}.`);
        return;
      }
    }

    setLoading(true);
    try {
      const fileUrls: Record<string, string> = {};
      for (const [key, file] of Object.entries(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${formData.numero_id}_${key}_${Date.now()}.${fileExt}`;
        
        // --- CAMBIO AQUÍ: Nombre del bucket actualizado a sst_docs ---
        const { data, error: uploadError } = await supabase.storage
          .from('sst_docs') 
          .upload(fileName, file, { upsert: true });

        if (uploadError) throw uploadError;
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
      };

      const finalPayload = { ...cleanPayload, ...fileUrls };
      const { error } = initialData?.id 
        ? await supabase.from('sst_responsibles').update(finalPayload).eq('id', initialData.id)
        : await supabase.from('sst_responsibles').insert([finalPayload]);

      if (error) throw error;
      alert("✅ Guardado correctamente");
      onCreated();
      onClose();
    } catch (err: any) {
      alert("❌ Error: " + (err.message || "Error al procesar"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-100">
      <div className="p-5 bg-blue-600 text-white flex justify-between items-center shadow-lg">
        <div>
          <h3 className="text-xl font-black uppercase tracking-tight">{initialData ? 'Editar' : 'Nuevo'} Responsable</h3>
          <p className="text-xs opacity-80 font-bold">Paso {step} de 3</p>
        </div>
        <button type="button" onClick={onClose} className="hover:rotate-90 transition-transform p-1"><X /></button>
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
            <div className="grid grid-cols-2 gap-4">
              <input type="text" name="nombres" placeholder="Nombres" value={formData.nombres} onChange={handleInputChange} className="p-3 border rounded-xl bg-white outline-none" />
              <input type="text" name="apellidos" placeholder="Apellidos" value={formData.apellidos} onChange={handleInputChange} className="p-3 border rounded-xl bg-white outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <select name="tipo_id" value={formData.tipo_id} onChange={handleInputChange} className="p-3 border rounded-xl bg-white outline-none">
                <option value="">Tipo ID</option>
                <option value="CC">Cédula de Ciudadanía</option>
                <option value="CE">Cédula de Extranjería</option>
              </select>
              <input type="text" name="numero_id" placeholder="Número ID" value={formData.numero_id} onChange={handleInputChange} className="p-3 border rounded-xl bg-white outline-none" />
            </div>
            <select name="nivel_academico" value={formData.nivel_academico} onChange={handleInputChange} className="w-full p-3 border rounded-xl bg-white outline-none">
                <option value="">Nivel Académico</option>
                <option value="Tecnico">Técnico</option>
                <option value="Tecnologo">Tecnólogo</option>
                <option value="Profesional">Profesional</option>
                <option value="Postgrado">Postgrado</option>
            </select>
            <input type="text" name="profesion" placeholder="Profesión" value={formData.profesion} onChange={handleInputChange} className="w-full p-3 border rounded-xl bg-white outline-none" />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h4 className="font-bold text-gray-800 border-l-4 border-blue-500 pl-3 uppercase text-sm">Licencia y Cursos</h4>
            <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 space-y-4">
              <input type="text" name="num_licencia" placeholder="Número Licencia SST" value={formData.num_licencia} onChange={handleInputChange} className="w-full p-3 border rounded-xl bg-white outline-none" />
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[10px] font-black text-blue-600 block uppercase">Expedición</label><input type="date" name="fecha_exp_licencia" value={formData.fecha_exp_licencia} onChange={handleInputChange} className="w-full p-2 border rounded-lg" /></div>
                <div><label className="text-[10px] font-black text-blue-600 block uppercase">Vencimiento</label><input type="date" name="fecha_ven_licencia" value={formData.fecha_ven_licencia} onChange={handleInputChange} className="w-full p-2 border rounded-lg" /></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[10px] font-black text-gray-500 uppercase block">Curso 50h</label><input type="date" name="fecha_curso_50h" value={formData.fecha_curso_50h} onChange={handleInputChange} className="w-full p-2 border rounded-lg" /></div>
                <div><label className="text-[10px] font-black text-gray-500 uppercase block">Venc. 50h</label><input type="date" name="fecha_ven_50h" value={formData.fecha_ven_50h} onChange={handleInputChange} className="w-full p-2 border rounded-lg" /></div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h4 className="font-bold text-gray-800 border-l-4 border-blue-500 pl-3 uppercase text-sm">Carga de Documentos Obligatorios</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FileButton label="Cédula" id="cedula" onChange={(e: any) => handleFileChange(e, 'cedula')} hasFile={!!files.cedula} />
              <FileButton label="Diploma / Acta" id="diploma" onChange={(e: any) => handleFileChange(e, 'diploma')} hasFile={!!files.diploma} />
              <FileButton label="Licencia SST" id="licencia" onChange={(e: any) => handleFileChange(e, 'licencia')} hasFile={!!files.licencia} />
              <FileButton label="Curso 50h" id="curso50" onChange={(e: any) => handleFileChange(e, 'curso50')} hasFile={!!files.curso50} />
              {!is50hVigente && <FileButton label="Curso 20h" id="curso20" onChange={(e: any) => handleFileChange(e, 'curso20')} hasFile={!!files.curso20} />}
            </div>
          </div>
        )}

        <div className="flex justify-between pt-6 mt-4 border-t border-gray-100">
          <button type="button" onClick={onClose} className="text-gray-400 font-bold uppercase text-xs">Cancelar</button>
          <div className="flex gap-3">
            {step > 1 && <button type="button" onClick={() => setStep(step - 1)} className="px-6 py-2 border-2 rounded-xl font-bold text-gray-500">Atrás</button>}
            <button 
              type="button" 
              onClick={() => { if(step < 3) setStep(step + 1); else handleSaveData(); }}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black uppercase text-xs disabled:bg-gray-300"
              disabled={loading}
            >
              {loading ? 'Subiendo...' : step < 3 ? 'Siguiente' : 'Finalizar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};