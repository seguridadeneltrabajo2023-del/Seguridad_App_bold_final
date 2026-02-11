import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Users, UserCheck, UserMinus, PieChart as PieChartIcon, 
  BarChart3, Heart, Fingerprint, LayoutDashboard, RefreshCcw,
  GraduationCap, History, Home, Baby, Users2
} from 'lucide-react'; 
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';

export default function SocioDemograficPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error: sbError } = await supabase.from('employees').select('*');
      if (sbError) throw sbError;
      setEmployees(data || []);
    } catch (err: any) {
      console.error("Error Supabase:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- PROCESAMIENTO DINÁMICO DE DATOS ---
  const total = employees.length;
  const activos = employees.filter(e => e.status === 'Activo').length;
  const inactivos = total - activos;

  // 1. Distribución por Sexo
  const sexoData = [
    { name: 'Masculino', value: employees.filter(e => e.sexo === 'Masculino').length },
    { name: 'Femenino', value: employees.filter(e => e.sexo === 'Femenino').length },
    { name: 'Otro', value: employees.filter(e => e.sexo === 'Otro').length },
  ].filter(item => item.value > 0);

  // 2. Carga Familiar Detallada (0 a 5+)
  const hijosData = [
    { name: '0 Hijos', value: employees.filter(e => (e.children_count || 0) === 0).length },
    { name: '1 Hijo', value: employees.filter(e => (e.children_count || 0) === 1).length },
    { name: '2 Hijos', value: employees.filter(e => (e.children_count || 0) === 2).length },
    { name: '3 Hijos', value: employees.filter(e => (e.children_count || 0) === 3).length },
    { name: '4 Hijos', value: employees.filter(e => (e.children_count || 0) === 4).length },
    { name: '5+ Hijos', value: employees.filter(e => (e.children_count || 0) >= 5).length },
  ];

  const escolaridadData = [
    { name: 'Primaria', value: employees.filter(e => e.escolaridad === 'Primaria').length },
    { name: 'Bachiller', value: employees.filter(e => e.escolaridad === 'Bachiller').length },
    { name: 'Técnico', value: employees.filter(e => e.escolaridad === 'Técnico').length },
    { name: 'Profesional', value: employees.filter(e => e.escolaridad === 'Profesional').length },
  ];

  const antiguedadData = [
    { name: '0-1 año', value: employees.filter(e => (e.antiquity_months || 0) <= 12).length },
    { name: '1-3 años', value: employees.filter(e => (e.antiquity_months || 0) > 12 && (e.antiquity_months || 0) <= 36).length },
    { name: '3-5 años', value: employees.filter(e => (e.antiquity_months || 0) > 36 && (e.antiquity_months || 0) <= 60).length },
    { name: '5+ años', value: employees.filter(e => (e.antiquity_months || 0) > 60).length },
  ];

  const viviendaData = [
    { name: 'Propia', value: employees.filter(e => e.housing_type === 'Propia').length },
    { name: 'Arrendada', value: employees.filter(e => e.housing_type === 'Arrendada').length },
    { name: 'Familiar', value: employees.filter(e => e.housing_type === 'Familiar').length },
  ];

  const edadData = [
    { name: '18-25', value: employees.filter(e => e.age >= 18 && e.age <= 25).length },
    { name: '26-35', value: employees.filter(e => e.age >= 26 && e.age <= 35).length },
    { name: '36-45', value: employees.filter(e => e.age >= 36 && e.age <= 45).length },
    { name: '46-55', value: employees.filter(e => e.age >= 46 && e.age <= 55).length },
    { name: '55+', value: employees.filter(e => e.age > 55).length },
  ];

  const PIE_COLORS = ['#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#6366f1'];

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96 bg-gray-50 rounded-2xl m-6">
      <RefreshCcw className="animate-spin text-blue-600 mb-4" size={40} />
      <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Calculando estadísticas...</p>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6 animate-in fade-in duration-700">
      
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg">
          <BarChart3 size={24} />
        </div>
        <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tighter flex items-center gap-2">
          Perfil Sociodemográfico <LayoutDashboard size={20} className="text-blue-300" />
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Personal" value={total} icon={<Users size={20}/>} color="blue" />
        <StatCard title="Estado Activo" value={activos} icon={<UserCheck size={20}/>} color="emerald" />
        <StatCard title="Estado Inactivo" value={inactivos} icon={<UserMinus size={20}/>} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* GRÁFICO SEXO */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-[11px] font-black text-gray-400 uppercase mb-6 flex items-center gap-2 tracking-widest">
            <Users2 size={14} className="text-pink-500" /> Distribución por Sexo
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={sexoData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {sexoData.map((_, index) => <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="none" />)}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRÁFICO CARGA FAMILIAR (Uso de Heart y Baby) */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-[11px] font-black text-gray-400 uppercase mb-6 flex items-center gap-2 tracking-widest">
            <Heart size={14} className="text-red-500" /> <Baby size={14} className="text-red-300" /> Carga Familiar (Hijos)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hijosData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} width={70} />
                <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '15px', border: 'none'}} />
                <Bar dataKey="value" fill="#ef4444" radius={[0, 10, 10, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRÁFICO ESCOLARIDAD */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-[11px] font-black text-gray-400 uppercase mb-6 flex items-center gap-2 tracking-widest">
            <GraduationCap size={14} className="text-purple-500" /> Nivel de Escolaridad
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={escolaridadData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af', fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} />
                <Tooltip cursor={{fill: '#f9fafb'}} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[10, 10, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRÁFICO EDAD */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-[11px] font-black text-gray-400 uppercase mb-6 flex items-center gap-2 tracking-widest">
            <Fingerprint size={14} className="text-blue-500" /> Rangos de Edad
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={edadData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af', fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} />
                <Tooltip cursor={{fill: '#f9fafb'}} />
                <Bar dataKey="value" fill="#3b82f6" radius={[10, 10, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRÁFICO ANTIGÜEDAD */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-[11px] font-black text-gray-400 uppercase mb-6 flex items-center gap-2 tracking-widest">
            <History size={14} className="text-orange-500" /> Antigüedad en la Empresa
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={antiguedadData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af', fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} />
                <Tooltip cursor={{fill: '#f9fafb'}} />
                <Bar dataKey="value" fill="#f59e0b" radius={[10, 10, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRÁFICO VIVIENDA */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-[11px] font-black text-gray-400 uppercase mb-6 flex items-center gap-2 tracking-widest">
            <Home size={14} className="text-emerald-500" /> <PieChartIcon size={14} className="text-emerald-300" /> Tenencia de Vivienda
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={viviendaData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {viviendaData.map((_, index) => <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="none" />)}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
  const colors: any = {
    blue: 'border-blue-500 text-blue-600 bg-blue-50',
    emerald: 'border-emerald-500 text-emerald-600 bg-emerald-50',
    red: 'border-red-500 text-red-600 bg-red-50'
  };
  return (
    <div className={`bg-white p-6 rounded-3xl shadow-sm border-l-8 ${colors[color].split(' ')[0]} flex items-center justify-between transition-transform hover:scale-[1.02]`}>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
        <p className="text-3xl font-black text-gray-800">{value}</p>
      </div>
      <div className={`p-3 rounded-2xl ${colors[color].split(' ').slice(1).join(' ')}`}>
        {icon}
      </div>
    </div>
  );
}