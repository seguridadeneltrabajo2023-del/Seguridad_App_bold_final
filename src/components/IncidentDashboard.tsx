import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { supabase } from '../SupabaseClient';

export const IncidentDashboard = ({ refreshKey }: { refreshKey: number }) => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const { data: incidents } = await supabase
        .from('incident_reports')
        .select('incident_date');

      if (!incidents) return;

      const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
      const counts: any = {};
      months.forEach(m => counts[m] = 0);

      incidents.forEach(item => {
        // Extracción segura del mes (formato YYYY-MM-DD)
        const dateParts = item.incident_date.split('-');
        const monthIndex = parseInt(dateParts[1], 10) - 1;
        if (monthIndex >= 0 && monthIndex < 12) {
          counts[months[monthIndex]]++;
        }
      });

      const formattedData = months.map(m => ({ name: m, cantidad: counts[m] }));
      setData(formattedData);
    };

    fetchStats();
  }, [refreshKey]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Tendencia de Incidentes</h2>
          <p className="text-xs text-gray-400">Visualización de reportes mensuales</p>
        </div>
        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">
          Año {new Date().getFullYear()}
        </span>
      </div>
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#9ca3af', fontSize: 12}} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#9ca3af', fontSize: 12}} 
            />
            <Tooltip 
              cursor={{fill: '#f9fafb'}}
              contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
            />
            <Bar dataKey="cantidad" radius={[6, 6, 0, 0]} barSize={32}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.cantidad > 0 ? '#3b82f6' : '#e5e7eb'} 
                  className="transition-all duration-300 hover:opacity-80"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};