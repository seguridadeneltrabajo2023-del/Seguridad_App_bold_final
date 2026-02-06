import { useEffect, useState, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { supabase } from '../SupabaseClient';

export const IncidentDashboard = ({ refreshKey }: { refreshKey: number }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Función para obtener los datos (Estable con useCallback)
  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const { data: incidents, error } = await supabase
        .from('incident_reports')
        .select('incident_date')
        .order('incident_date', { ascending: false });

      if (error) throw error;

      const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
      const counts: Record<string, number> = {};
      months.forEach(m => counts[m] = 0);

      incidents?.forEach(item => {
        if (!item.incident_date) return;
        const date = new Date(item.incident_date);
        if (!isNaN(date.getTime())) {
          counts[months[date.getMonth()]]++;
        }
      });

      setData(months.map(m => ({ name: m, cantidad: counts[m] })));
    } catch (err) {
      console.error("Error al cargar estadísticas:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Efecto para carga inicial, refreshKey y suscripción Realtime
  useEffect(() => {
    // Carga inicial
    fetchStats();

    // SUSCRIPCIÓN REALTIME: Escucha cualquier cambio (INSERT, UPDATE, DELETE)
    const channel = supabase
      .channel('db-changes-incidents')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'incident_reports' },
        () => {
          console.log("Cambio detectado en Realtime, actualizando gráfica...");
          fetchStats();
        }
      )
      .subscribe();

    // Limpieza al desmontar el componente
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshKey, fetchStats]);

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-6 font-sans overflow-hidden text-left">
      <div className="flex items-center justify-between mb-6">
        <div className="text-left">
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight font-sans">Tendencia de Incidentes</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-sans">
            {loading ? "Sincronizando..." : "Actualización en Tiempo Real Activa"}
          </p>
        </div>
        {loading && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping"></div>
            <span className="text-[10px] font-black text-blue-600 uppercase font-sans">Actualizando</span>
          </div>
        )}
      </div>
      
      <div className="h-[250px] w-full font-sans">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} 
            />
            <Tooltip 
              cursor={{fill: '#f8fafc'}} 
              contentStyle={{
                borderRadius: '16px', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', 
                fontSize: '10px', 
                fontWeight: 'bold'
              }} 
            />
            <Bar 
              dataKey="cantidad" 
              radius={[6, 6, 0, 0]} 
              barSize={30}
              animationDuration={500}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.cantidad > 0 ? '#2563eb' : '#e2e8f0'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};