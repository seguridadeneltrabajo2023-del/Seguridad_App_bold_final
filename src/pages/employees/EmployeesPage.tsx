import { useState, useEffect } from 'react';
import { 
  User, 
  Users, 
  ShieldCheck, 
  FolderOpen, 
  History, 
  Save, 
  MapPin, 
  Briefcase, 
  Activity,
  Edit, 
  Trash2, 
  Search, 
  UserPlus,
  Mail,
  Phone,
  Calendar
} from 'lucide-react';

interface EmployeesProps {
  initialTab?: string;
}

export default function Employees({ initialTab = 'general' }: EmployeesProps) {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (initialTab) {
      const tabMap: Record<string, string> = {
        'general': 'general',
        'socio': 'demographic',
        'sst': 'sst',
        'docs': 'docs',
        'history': 'history'
      };
      setActiveTab(tabMap[initialTab] || initialTab);
    }
  }, [initialTab]);

  const tabs = [
    { id: 'general', label: 'Información General', icon: User },
    { id: 'demographic', label: 'Perfil Sociodemográfico', icon: Users },
    { id: 'sst', label: 'SST', icon: ShieldCheck },
    { id: 'docs', label: 'Documentos', icon: FolderOpen },
    { id: 'history', label: 'Historial', icon: History },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Navegación de Pestañas */}
        <div className="flex bg-gray-50 border-b border-gray-200 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === tab.id 
                ? 'bg-white text-blue-600 border-t-4 border-t-blue-600' 
                : 'text-gray-400 hover:text-gray-600 border-t-4 border-t-transparent'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenido Dinámico */}
        <div className="p-8">
          {activeTab === 'general' && <GeneralInfoTable onEdit={() => setActiveTab('demographic')} />}
          {activeTab === 'demographic' && <DemographicForm />}
          {activeTab === 'sst' && <div className="text-gray-400 italic">Módulo de Seguridad y Salud en desarrollo...</div>}
          {activeTab === 'docs' && <div className="text-gray-400 italic">Gestor de Documentos en desarrollo...</div>}
          {activeTab === 'history' && <div className="text-gray-400 italic">Historial Laboral en desarrollo...</div>}
        </div>

        {activeTab !== 'general' && (
          <div className="px-8 py-4 bg-gray-50 border-t flex justify-end">
            <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
              <Save size={18} />
              Guardar Cambios
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function GeneralInfoTable({ onEdit }: { onEdit: () => void }) {
  const [employees] = useState([
    { 
      id: 1, name: 'Juan', last_name: 'Pérez', type_id: 'C.C', num_id: '102030', 
      job: 'Operario', area: 'Producción', date: '2023-01-15', status: 'Activo' 
    },
    { 
      id: 2, name: 'Maria', last_name: 'Gómez', type_id: 'C.C', num_id: '405060', 
      job: 'Supervisor', area: 'Calidad', date: '2022-06-10', status: 'Inactivo' 
    }
  ]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Buscar trabajador..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button onClick={onEdit} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md">
          <UserPlus size={18} /> Nuevo Empleado
        </button>
      </div>

      <div className="overflow-x-auto border border-gray-100 rounded-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase">Nombre Completo</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase">Identificación</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase">Cargo / Área</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase">Ingreso</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase text-center">Estado</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-800">{emp.name} {emp.last_name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{emp.type_id}: {emp.num_id}</td>
                <td className="px-6 py-4">
                  <div className="text-sm font-bold">{emp.job}</div>
                  <div className="text-[10px] text-gray-500 uppercase">{emp.area}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{emp.date}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${emp.status === 'Activo' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {emp.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={onEdit} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"><Edit size={16} /></button>
                    <button className="p-2 text-red-600 hover:bg-red-100 rounded-lg"><Trash2 size={16} /></button>
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

function DemographicForm() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Bloque 1: Datos Personales */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-blue-600 mb-2 border-l-4 border-blue-600 pl-2">
            <User size={18} />
            <h3 className="font-black uppercase text-xs tracking-widest">Datos Personales</h3>
          </div>
          <input type="text" placeholder="Nombres" className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
          <input type="text" placeholder="Apellidos" className="w-full p-2.5 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
          <div className="grid grid-cols-2 gap-2">
            <select className="p-2.5 border border-gray-200 rounded-lg outline-none bg-white">
              <option>Tipo ID</option>
              <option>C.C.</option><option>C.E.</option><option>P.P.T.</option>
            </select>
            <input type="text" placeholder="Número ID" className="w-full p-2.5 border border-gray-200 rounded-lg outline-none" />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="date" className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg outline-none" title="Fecha Expedición ID" />
          </div>
        </div>
        
        {/* Bloque 2: Residencia y Salud */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-red-600 mb-2 border-l-4 border-red-600 pl-2">
            <Activity size={18} />
            <h3 className="font-black uppercase text-xs tracking-widest">Residencia y Salud</h3>
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 text-gray-400" size={16} />
            <input type="text" placeholder="Dirección Residencia" className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg outline-none" />
          </div>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Celular" className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg outline-none" />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="email" placeholder="Correo Electrónico" className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg outline-none" />
          </div>
          <textarea placeholder="Enfermedades o Alergias..." className="w-full p-2.5 border border-gray-200 rounded-lg outline-none h-20 resize-none"></textarea>
        </div>

        {/* Bloque 3: Laboral */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-emerald-600 mb-2 border-l-4 border-emerald-600 pl-2">
            <Briefcase size={18} />
            <h3 className="font-black uppercase text-xs tracking-widest">Laboral y Seguridad</h3>
          </div>
          <input type="text" placeholder="Cargo" className="w-full p-2.5 border border-gray-200 rounded-lg outline-none font-bold text-blue-700 shadow-sm" />
          <div className="grid grid-cols-2 gap-2">
            <select className="p-2.5 border border-gray-200 rounded-lg outline-none bg-white font-medium">
              <option>Escolaridad</option>
              <option>Primaria</option><option>Bachiller</option><option>Técnico</option><option>Profesional</option>
            </select>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input type="date" className="w-full pl-9 pr-2 py-2.5 border border-gray-200 rounded-lg outline-none text-sm" title="Fecha Ingreso" />
            </div>
          </div>
          <div className="pt-2 border-t border-gray-100">
            <p className="text-[10px] font-black text-gray-400 mb-2 uppercase">Emergencia</p>
            <div className="relative mb-2">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input type="text" placeholder="Nombre Contacto" className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg outline-none" />
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input type="text" placeholder="Teléfono Contacto" className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg outline-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}