import { useState, useEffect } from 'react';
import { 
  Users, Search, UserPlus, Edit, Trash2, MoreVertical, 
  Briefcase, Building, Calendar, ArrowLeft, Save, User, 
  Activity, MapPin, Phone, Mail, Home, HeartPulse, FileText 
} from 'lucide-react';

// Datos simplificados de Colombia para los selectores
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
  const [employees] = useState([
    { id: 1, names: 'Carlos Alberto', lastNames: 'Rodríguez Cano', typeId: 'C.C.', numId: '1.035.456.789', job: 'Coordinador SST', area: 'Seguridad', entryDate: '2021-05-12', status: 'Activo' },
    { id: 2, names: 'Ana Lucía', lastNames: 'Méndez Ruiz', typeId: 'C.E.', numId: '987.654.321', job: 'Analista de Riesgos', area: 'Administrativa', entryDate: '2022-08-20', status: 'Inactivo' },
  ]);

  return (
    <div className="p-4 bg-gray-50 min-h-screen w-full">
      <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {showForm ? (
          <EmployeeForm onBack={() => setShowForm(false)} />
        ) : (
          <EmployeeTable employees={employees} onAdd={() => setShowForm(true)} />
        )}
      </div>
    </div>
  );
}

function EmployeeTable({ employees, onAdd }: { employees: any[], onAdd: () => void }) {
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
              <th className="px-6 py-4 text-center text-nowrap">Tipo ID</th>
              <th className="px-6 py-4">Número ID</th>
              <th className="px-6 py-4">Cargo</th>
              <th className="px-6 py-4">Área</th>
              <th className="px-6 py-4 text-center text-nowrap">F. Ingreso</th>
              <th className="px-6 py-4 text-center">Estado</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-blue-50/30 transition-colors group">
                <td className="px-6 py-4 text-sm font-bold text-gray-800">{emp.names}</td>
                <td className="px-6 py-4 text-sm font-bold text-gray-800">{emp.lastNames}</td>
                <td className="px-6 py-4 text-xs text-gray-600 text-center font-medium">{emp.typeId}</td>
                <td className="px-6 py-4 text-xs font-mono text-gray-600">{emp.numId}</td>
                <td className="px-6 py-4 text-xs font-bold text-gray-800">
                  <div className="flex items-center gap-1"><Briefcase size={12} className="text-gray-400" /> {emp.job}</div>
                </td>
                <td className="px-6 py-4 text-[10px] text-gray-500 uppercase font-medium">
                  <div className="flex items-center gap-1"><Building size={10} className="text-gray-400" /> {emp.area}</div>
                </td>
                <td className="px-6 py-4 text-xs text-gray-600 text-center">
                  <div className="flex items-center justify-center gap-1"><Calendar size={12} className="text-gray-400" /> {emp.entryDate}</div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${emp.status === 'Activo' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{emp.status}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-1">
                    <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"><Edit size={16} /></button>
                    <button className="p-2 text-red-600 hover:bg-red-100 rounded-lg"><Trash2 size={16} /></button>
                    <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg"><MoreVertical size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EmployeeForm({ onBack }: { onBack: () => void }) {
  const [birthDate, setBirthDate] = useState('');
  const [entryDate, setEntryDate] = useState('');
  const [age, setAge] = useState<number | string>(0);
  const [antiquity, setAntiquity] = useState<number | string>(0);
  const [selectedDeptNac, setSelectedDeptNac] = useState('');
  const [selectedDeptRes, setSelectedDeptRes] = useState('');

  useEffect(() => {
    if (birthDate) {
      const birth = new Date(birthDate);
      const today = new Date();
      let calcAge = today.getFullYear() - birth.getFullYear();
      if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) calcAge--;
      setAge(calcAge > 0 ? calcAge : 0);
    }
  }, [birthDate]);

  useEffect(() => {
    if (entryDate) {
      const start = new Date(entryDate);
      const today = new Date();
      const months = (today.getFullYear() - start.getFullYear()) * 12 + (today.getMonth() - start.getMonth());
      setAntiquity(months > 0 ? months : 0);
    }
  }, [entryDate]);

  const inputClass = "w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all";
  const labelClass = "text-[10px] font-black text-gray-400 uppercase ml-1 mb-1 block";

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold transition-colors">
          <ArrowLeft size={20} /> Volver al listado
        </button>
        <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Registro de Nuevo Trabajador</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-blue-600 border-l-4 border-blue-600 pl-2 mb-4">
            <User size={18} /> <h3 className="font-black text-xs uppercase">Identificación y Perfil</h3>
          </div>
          <div><label className={labelClass}>Nombres</label><input type="text" className={inputClass} /></div>
          <div><label className={labelClass}>Apellidos</label><input type="text" className={inputClass} /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className={labelClass}>Tipo ID</label>
              <select className={inputClass}><option>Cédula</option><option>Tarjeta Identidad</option><option>Registro Civil</option></select>
            </div>
            <div><label className={labelClass}>Número ID</label><input type="text" className={inputClass} /></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
               <label className={labelClass}>Fecha Expedición ID</label>
               <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input type="date" className={`${inputClass} pl-9`} />
               </div>
            </div>
            <div className="relative">
               <label className={labelClass}>Lugar Expedición ID</label>
               <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input type="text" placeholder="Ciudad" className={`${inputClass} pl-9`} />
               </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className={labelClass}>Fecha Nacimiento</label><input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Edad</label><input type="text" value={`${age} años`} readOnly className={`${inputClass} bg-gray-50 font-bold text-blue-600`} /></div>
          </div>
          <div><label className={labelClass}>Estado Civil</label>
              <select className={inputClass}><option>Soltero</option><option>Casado</option><option>Unión Libre</option><option>Otro</option></select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-red-600 border-l-4 border-red-600 pl-2 mb-4">
            <Activity size={18} /> <h3 className="font-black text-xs uppercase">Ubicación y Salud</h3>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl border border-dashed border-gray-200 space-y-3">
             <div className="flex items-center gap-2 text-[9px] font-bold text-gray-400 uppercase"><MapPin size={12}/> Lugar de Nacimiento</div>
             <div className="grid grid-cols-2 gap-2">
                <select className={inputClass} value={selectedDeptNac} onChange={(e) => setSelectedDeptNac(e.target.value)}>
                   <option value="">Depto...</option>
                   {Object.keys(colombiaData).map(dept => <option key={dept} value={dept}>{dept}</option>)}
                </select>
                <select className={inputClass} disabled={!selectedDeptNac}><option value="">Ciudad...</option>
                   {selectedDeptNac && colombiaData[selectedDeptNac].map(city => <option key={city} value={city}>{city}</option>)}
                </select>
             </div>
          </div>
          <div className="relative">
             <label className={labelClass}>Dirección Residencia</label>
             <div className="relative">
                <Home className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input type="text" className={`${inputClass} pl-9`} />
             </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
             <select className={inputClass} value={selectedDeptRes} onChange={(e) => setSelectedDeptRes(e.target.value)}>
                <option value="">Depto Residencia...</option>
                {Object.keys(colombiaData).map(dept => <option key={dept} value={dept}>{dept}</option>)}
             </select>
             <select className={inputClass} disabled={!selectedDeptRes}><option value="">Ciudad Residencia...</option>
                {selectedDeptRes && colombiaData[selectedDeptRes].map(city => <option key={city} value={city}>{city}</option>)}
             </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
               <label className={labelClass}>Celular</label>
               <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} /><input type="text" className={`${inputClass} pl-9`} /></div>
            </div>
            <div><label className={labelClass}>Tipo Sangre</label>
              <select className={inputClass}><option>A+</option><option>O+</option><option>B+</option><option>AB+</option><option>A-</option><option>O-</option><option>B-</option><option>AB-</option></select>
            </div>
          </div>
          <div className="relative">
             <label className={labelClass}>Correo Electrónico</label>
             <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input type="email" className={`${inputClass} pl-9`} />
             </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-emerald-600 border-l-4 border-emerald-600 pl-2 mb-4">
            <Briefcase size={18} /> <h3 className="font-black text-xs uppercase">Laboral y Seguridad</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className={labelClass}>Cargo</label><input type="text" className={inputClass} /></div>
            <div><label className={labelClass}>Escolaridad</label>
              <select className={inputClass}><option>Técnico</option><option>Tecnólogo</option><option>Profesional</option><option>Postgrado</option><option>Bachiller</option></select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className={labelClass}>Fecha Ingreso</label><input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Antigüedad</label><input type="text" value={`${antiquity} meses`} readOnly className={`${inputClass} bg-gray-50 font-bold text-emerald-600`} /></div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div><label className={labelClass}>EPS</label><input type="text" className={inputClass} /></div>
            <div><label className={labelClass}>AFP</label><input type="text" className={inputClass} /></div>
            <div><label className={labelClass}>CCF</label><input type="text" className={inputClass} /></div>
          </div>
          <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100">
             <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase mb-2"><HeartPulse size={12}/> Contacto Emergencia</div>
             <div className="grid grid-cols-2 gap-2">
                <input type="text" placeholder="Nombre" className={inputClass} />
                <input type="text" placeholder="Número" className={inputClass} />
             </div>
          </div>
        </div>
      </div>

      <div className="pt-6 flex justify-end gap-3">
        <button onClick={onBack} className="px-8 py-3 rounded-xl font-bold text-gray-400 hover:bg-gray-100 transition-all">Cancelar</button>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-10 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg active:scale-95 transition-all">
          <Save size={18} /> Guardar Trabajador
        </button>
      </div>
    </div>
  );
}