import { useState, useEffect } from 'react';
import { 
  Users, Search, UserPlus, Edit, Trash2, 
  Briefcase, Building, Calendar, ArrowLeft, Save, User, 
  Activity, MapPin, Phone, Mail, Home, HeartPulse, FileText,
  UserCheck, AlertTriangle, X, CheckCircle2, XCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const colombiaData: Record<string, string[]> = {
  "Antioquia": ["Medellín", "Envigado", "Itagüí", "Bello", "Rionegro"],
  "Bogotá D.C.": ["Bogotá"],
  "Valle del Cauca": ["Cali", "Palmira", "Buga", "Tuluá"],
  "Atlántico": ["Barranquilla", "Soledad", "Puerto Colombia"],
  "Santander": ["Bucaramanga", "Floridablanca", "Girón"],
  "Bolívar": ["Cartagena", "Magangué", "Turbaco"]
};

export default function EmployeesPage() {
  const [showForm, setShowForm] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [editingEmployee, setEditingEmployee] = useState<any | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [targetEmployee, setTargetEmployee] = useState<any | null>(null);

  const fetchEmployees = async () => {
    const { data, error } = await supabase.from('employees').select('*').order('created_at', { ascending: false });
    if (!error && data) setEmployees(data);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleEdit = (employee: any) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  const openStatusModal = (employee: any) => {
    setTargetEmployee(employee);
    setIsStatusModalOpen(true);
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (targetEmployee) {
      const { error } = await supabase.from('employees').update({ status: newStatus }).eq('id', targetEmployee.id);
      if (!error) {
        setIsStatusModalOpen(false);
        fetchEmployees();
      } else {
        alert("Error al actualizar estado");
      }
    }
  };

  const openDeleteModal = (id: string, name: string) => {
    setTargetEmployee({ id, names: name });
    setIsDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (targetEmployee) {
      const { error } = await supabase.from('employees').delete().eq('id', targetEmployee.id);
      if (!error) {
        setIsDeleteModalOpen(false);
        fetchEmployees();
      } else {
        alert("Error al eliminar");
      }
    }
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen w-full relative">
      <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {showForm ? (
          <EmployeeForm 
            employeeToEdit={editingEmployee}
            onBack={() => { setShowForm(false); setEditingEmployee(null); fetchEmployees(); }} 
          />
        ) : (
          <EmployeeTable 
            employees={employees} 
            onAdd={() => setShowForm(true)} 
            onEdit={handleEdit}
            onDelete={openDeleteModal}
            onChangeStatus={openStatusModal}
          />
        )}
      </div>

      {isStatusModalOpen && (
        <StatusModal 
          employeeName={targetEmployee?.names || ""}
          currentStatus={targetEmployee?.status || ""}
          onClose={() => setIsStatusModalOpen(false)}
          onSelect={handleUpdateStatus}
        />
      )}

      {isDeleteModalOpen && (
        <DeleteModal 
          employeeName={targetEmployee?.names || ""} 
          onClose={() => setIsDeleteModalOpen(false)} 
          onConfirm={executeDelete} 
        />
      )}
    </div>
  );
}

function StatusModal({ employeeName, currentStatus, onClose, onSelect }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden p-6 animate-in zoom-in-95">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-black text-gray-800 uppercase text-sm tracking-tight">Cambiar Estado</h3>
          <button onClick={onClose}><X size={20} className="text-gray-400 hover:text-gray-600" /></button>
        </div>
        <p className="text-center text-gray-500 text-sm mb-6">Seleccione estado para <span className="font-bold text-gray-800">{employeeName}</span></p>
        <div className="grid grid-cols-1 gap-3">
          <button onClick={() => onSelect('Activo')} className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all ${currentStatus === 'Activo' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 hover:border-emerald-200'}`}>
            <div className="flex items-center gap-3"><CheckCircle2 className="text-emerald-600" size={20} /><span className="font-bold text-emerald-700 uppercase">Activo</span></div>
          </button>
          <button onClick={() => onSelect('Inactivo')} className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all ${currentStatus === 'Inactivo' ? 'border-red-500 bg-red-50' : 'border-gray-100 hover:border-red-200'}`}>
            <div className="flex items-center gap-3"><XCircle className="text-red-600" size={20} /><span className="font-bold text-red-700 uppercase">Inactivo</span></div>
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteModal({ employeeName, onClose, onConfirm }: any) {
  const [confirmInput, setConfirmInput] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 animate-in zoom-in-95">
        <div className="flex justify-end"><button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20}/></button></div>
        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600 mb-4 mx-auto"><AlertTriangle size={24} /></div>
        <h3 className="text-xl font-black text-center text-gray-800 mb-2 uppercase tracking-tighter">Confirmar Eliminación</h3>
        <p className="text-gray-500 text-center text-sm mb-6">Vas a borrar permanentemente a <span className="font-bold">{employeeName}</span>.</p>
        <div className="mb-6">
          <label className="text-[10px] font-black text-gray-400 uppercase block text-center mb-2 font-mono">Escribe "ELIMINAR" para confirmar</label>
          <input type="text" onChange={(e) => setConfirmInput(e.target.value.toUpperCase())} className="w-full p-3 border-2 border-gray-100 rounded-xl outline-none focus:border-red-500 text-center font-black" />
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 font-bold text-gray-400 hover:bg-gray-100 rounded-xl uppercase text-xs">Cancelar</button>
          <button disabled={confirmInput !== "ELIMINAR"} onClick={onConfirm} className={`flex-1 py-3 font-bold rounded-xl transition-all uppercase text-xs ${confirmInput === "ELIMINAR" ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'bg-gray-100 text-gray-300'}`}>Eliminar</button>
        </div>
      </div>
    </div>
  );
}

function EmployeeTable({ employees, onAdd, onEdit, onDelete, onChangeStatus }: any) {
  return (
    <div className="p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight flex items-center gap-2">
          <Users className="text-blue-600" /> Panel Informativo de Trabajadores
        </h2>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Buscar trabajador..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
          <button onClick={onAdd} className="bg-blue-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2 shadow-md transition-all">
            <UserPlus size={18} /> Agregar Nuevo
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border border-gray-100 rounded-2xl shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <th className="px-6 py-4">Nombres</th>
              <th className="px-6 py-4">Apellidos</th>
              <th className="px-6 py-4 text-center">Tipo ID</th>
              <th className="px-6 py-4">Número ID</th>
              <th className="px-6 py-4">Cargo</th>
              <th className="px-6 py-4">Área</th>
              <th className="px-6 py-4 text-center">F. Ingreso</th>
              <th className="px-6 py-4 text-center">Estado</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {employees.length > 0 ? employees.map((emp: any) => (
              <tr key={emp.id} className="hover:bg-blue-50/30 transition-colors group">
                <td className="px-6 py-4 text-sm font-bold text-gray-800">{emp.names}</td>
                <td className="px-6 py-4 text-sm font-bold text-gray-800">{emp.last_names}</td>
                <td className="px-6 py-4 text-xs text-center">{emp.type_id}</td>
                <td className="px-6 py-4 text-xs font-mono">{emp.num_id}</td>
                <td className="px-6 py-4 text-xs font-bold text-gray-700">
                  <div className="flex items-center gap-1"><Briefcase size={12} className="text-gray-400" /> {emp.job_title}</div>
                </td>
                <td className="px-6 py-4 text-[10px] uppercase text-gray-500">
                   <div className="flex items-center gap-1"><Building size={10} className="text-gray-400" /> {emp.area || 'General'}</div>
                </td>
                <td className="px-6 py-4 text-xs text-center text-gray-600">
                  <div className="flex items-center justify-center gap-1"><Calendar size={12} className="text-gray-400" /> {emp.entry_date}</div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${emp.status === 'Activo' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{emp.status}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => onChangeStatus(emp)} className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"><UserCheck size={16} /></button>
                    <button onClick={() => onEdit(emp)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"><Edit size={16} /></button>
                    <button onClick={() => onDelete(emp.id, emp.names)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={9} className="px-6 py-10 text-center text-gray-400 italic">No hay registros registrados.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EmployeeForm({ onBack, employeeToEdit }: { onBack: () => void, employeeToEdit?: any }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    names: '', last_names: '', type_id: 'Cédula', num_id: '',
    expedicion_date: '', expedicion_place: '', birth_date: '',
    estado_civil: 'Soltero', sexo: 'Masculino', birth_dept: '',
    birth_city: '', residence_address: '', residence_dept: '',
    residence_city: '', phone_mobile: '', phone_fixed: '',
    email: '', blood_type: 'A+', diseases: '', allergies: '',
    job_title: '', area: '', profession: '', escolaridad: 'Primaria', entry_date: '',
    eps: '', afp: '', ccf: '', housing_type: 'Propia',
    children_count: 0, emergency_contact_name: '', emergency_contact_phone: '',
    status: 'Activo'
  });

  const [age, setAge] = useState<number>(0);
  const [antiquity, setAntiquity] = useState<number>(0);

  useEffect(() => {
    if (employeeToEdit) setFormData({ ...employeeToEdit });
  }, [employeeToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (formData.birth_date) {
      const birth = new Date(formData.birth_date);
      const today = new Date();
      let calcAge = today.getFullYear() - birth.getFullYear();
      if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) calcAge--;
      setAge(calcAge > 0 ? calcAge : 0);
    }
  }, [formData.birth_date]);

  useEffect(() => {
    if (formData.entry_date) {
      const start = new Date(formData.entry_date);
      const today = new Date();
      const months = (today.getFullYear() - start.getFullYear()) * 12 + (today.getMonth() - start.getMonth());
      setAntiquity(months > 0 ? months : 0);
    }
  }, [formData.entry_date]);

  const handleSave = async () => {
    if (!formData.names || !formData.num_id) { alert("Complete campos obligatorios"); return; }
    setLoading(true);
    const dataToSave = { ...formData, children_count: Number(formData.children_count), age: age, antiquity_months: antiquity };
    try {
      if (employeeToEdit) await supabase.from('employees').update(dataToSave).eq('id', employeeToEdit.id);
      else await supabase.from('employees').insert([dataToSave]);
      onBack();
    } catch (error: any) { alert('Error: ' + error.message); }
    finally { setLoading(false); }
  };

  const inputClass = "w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all";
  const labelClass = "text-[10px] font-black text-gray-400 uppercase ml-1 mb-1 block";

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold transition-colors"><ArrowLeft size={20} /> Volver al listado</button>
        <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">{employeeToEdit ? 'Editar Trabajador' : 'Registro de Nuevo Trabajador'}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* COLUMNA 1 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-blue-600 border-l-4 border-blue-600 pl-2 mb-4"><User size={18} /> <h3 className="font-black text-xs uppercase">Identificación y Perfil</h3></div>
          <div><label className={labelClass}>Nombres</label><input type="text" name="names" value={formData.names} onChange={handleChange} className={inputClass} /></div>
          <div><label className={labelClass}>Apellidos</label><input type="text" name="last_names" value={formData.last_names} onChange={handleChange} className={inputClass} /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className={labelClass}>Tipo ID</label><select name="type_id" value={formData.type_id} onChange={handleChange} className={inputClass}><option>Cédula</option><option>Tarjeta Identidad</option><option>Pasaporte</option></select></div>
            <div><label className={labelClass}>Número ID</label><input type="text" name="num_id" value={formData.num_id} onChange={handleChange} className={inputClass} /></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className={labelClass}>Fecha Expedición</label><input type="date" name="expedicion_date" value={formData.expedicion_date} onChange={handleChange} className={inputClass} /></div>
            <div className="relative"><label className={labelClass}>Lugar Expedición</label><div className="relative"><FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} /><input type="text" name="expedicion_place" value={formData.expedicion_place} onChange={handleChange} className={`${inputClass} pl-9`} placeholder="Ciudad" /></div></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className={labelClass}>Fecha Nacimiento</label><input type="date" name="birth_date" value={formData.birth_date} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Edad</label><input type="text" value={`${age} años`} readOnly className={`${inputClass} bg-gray-50 font-bold text-blue-600`} /></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className={labelClass}>Estado Civil</label><select name="estado_civil" value={formData.estado_civil} onChange={handleChange} className={inputClass}><option>Soltero</option><option>Casado</option><option>Unión Libre</option><option>Otro</option></select></div>
            <div><label className={labelClass}>Sexo</label><select name="sexo" value={formData.sexo} onChange={handleChange} className={inputClass}><option>Masculino</option><option>Femenino</option><option>Otro</option></select></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
             <div><label className={labelClass}>Cant. Hijos</label><input type="number" name="children_count" value={formData.children_count} onChange={handleChange} className={inputClass} /></div>
             <div><label className={labelClass}>Tipo Vivienda</label><select name="housing_type" value={formData.housing_type} onChange={handleChange} className={inputClass}><option>Propia</option><option>Arrendada</option><option>Familiar</option></select></div>
          </div>
        </div>

        {/* COLUMNA 2 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-red-600 border-l-4 border-red-600 pl-2 mb-4"><Activity size={18} /> <h3 className="font-black text-xs uppercase">Ubicación y Salud</h3></div>
          <div className="bg-gray-50 p-3 rounded-xl border border-dashed border-gray-200 space-y-3">
             <div className="flex items-center gap-2 text-[9px] font-bold text-gray-400 uppercase"><MapPin size={12}/> Lugar de Nacimiento</div>
             <div className="grid grid-cols-2 gap-2">
                <select name="birth_dept" value={formData.birth_dept} onChange={handleChange} className={inputClass}><option value="">Depto...</option>{Object.keys(colombiaData).map(d => <option key={d} value={d}>{d}</option>)}</select>
                <select name="birth_city" value={formData.birth_city} onChange={handleChange} className={inputClass} disabled={!formData.birth_dept}><option value="">Ciudad...</option>{formData.birth_dept && colombiaData[formData.birth_dept].map(c => <option key={c} value={c}>{c}</option>)}</select>
             </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl border border-dashed border-gray-200 space-y-3">
             <div className="flex items-center gap-2 text-[9px] font-bold text-gray-400 uppercase"><Home size={12}/> Lugar de Residencia</div>
             <div className="grid grid-cols-2 gap-2">
                <select name="residence_dept" value={formData.residence_dept} onChange={handleChange} className={inputClass}><option value="">Depto...</option>{Object.keys(colombiaData).map(d => <option key={d} value={d}>{d}</option>)}</select>
                <select name="residence_city" value={formData.residence_city} onChange={handleChange} className={inputClass} disabled={!formData.residence_dept}><option value="">Ciudad...</option>{formData.residence_dept && colombiaData[formData.residence_dept].map(c => <option key={c} value={c}>{c}</option>)}</select>
             </div>
          </div>
          <div className="relative"><label className={labelClass}>Dirección Residencia</label><div className="relative"><Home className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} /><input type="text" name="residence_address" value={formData.residence_address} onChange={handleChange} className={`${inputClass} pl-9`} /></div></div>
          <div className="grid grid-cols-2 gap-2">
             <div className="relative"><label className={labelClass}>Celular</label><div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} /><input type="text" name="phone_mobile" value={formData.phone_mobile} onChange={handleChange} className={`${inputClass} pl-9`} /></div></div>
             <div><label className={labelClass}>Tipo Sangre</label><select name="blood_type" value={formData.blood_type} onChange={handleChange} className={inputClass}><option>A+</option><option>O+</option><option>B+</option><option>AB+</option><option>A-</option><option>O-</option></select></div>
          </div>
          <div className="relative"><label className={labelClass}>Correo Personal</label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} /><input type="email" name="email" value={formData.email} onChange={handleChange} className={`${inputClass} pl-9`} /></div></div>
          <div className="grid grid-cols-1 gap-2">
             <input type="text" name="diseases" value={formData.diseases} onChange={handleChange} placeholder="Enfermedades" className={inputClass} />
             <input type="text" name="allergies" value={formData.allergies} onChange={handleChange} placeholder="Alergias" className={inputClass} />
          </div>
        </div>

        {/* COLUMNA 3 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-emerald-600 border-l-4 border-emerald-600 pl-2 mb-4"><Briefcase size={18} /> <h3 className="font-black text-xs uppercase">Laboral y Seguridad</h3></div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className={labelClass}>Cargo</label><input type="text" name="job_title" value={formData.job_title} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Área</label><div className="relative"><Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} /><input type="text" name="area" value={formData.area} onChange={handleChange} className={`${inputClass} pl-9`} /></div></div>
          </div>
          <div><label className={labelClass}>Profesión</label><div className="relative"><FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} /><input type="text" name="profession" value={formData.profession} onChange={handleChange} className={`${inputClass} pl-9`} /></div></div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className={labelClass}>Fecha Ingreso</label><input type="date" name="entry_date" value={formData.entry_date} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Antigüedad</label><input type="text" value={`${antiquity} meses`} readOnly className={`${inputClass} bg-gray-50 font-bold text-emerald-600`} /></div>
          </div>
          <div><label className={labelClass}>Nivel Escolaridad</label>
            <select name="escolaridad" value={formData.escolaridad} onChange={handleChange} className={inputClass}>
              <option>Primaria</option><option>Bachiller</option><option>Técnico</option><option>Tecnólogo</option><option>Profesional</option><option>Especialista</option>
            </select>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div><label className={labelClass}>EPS</label><input type="text" name="eps" value={formData.eps} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>AFP</label><input type="text" name="afp" value={formData.afp} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>CCF</label><input type="text" name="ccf" value={formData.ccf} onChange={handleChange} className={inputClass} /></div>
          </div>
          <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
             <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase mb-2"><HeartPulse size={12}/> Contacto Emergencia</div>
             <div className="grid grid-cols-2 gap-2">
                <input type="text" name="emergency_contact_name" value={formData.emergency_contact_name} onChange={handleChange} placeholder="Nombre" className={inputClass} />
                <input type="text" name="emergency_contact_phone" value={formData.emergency_contact_phone} onChange={handleChange} placeholder="Tel" className={inputClass} />
             </div>
          </div>
        </div>
      </div>

      <div className="pt-6 flex justify-end gap-3">
        <button onClick={onBack} disabled={loading} className="px-8 py-3 rounded-xl font-bold text-gray-400 hover:bg-gray-100 transition-all">Cancelar</button>
        <button onClick={handleSave} disabled={loading} className="bg-blue-600 text-white px-10 py-3 rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2 shadow-lg transition-all">
          {loading ? 'Guardando...' : <><Save size={18} /> {employeeToEdit ? 'Actualizar Trabajador' : 'Guardar Trabajador'}</>}
        </button>
      </div>
    </div>
  );
}