import { ShieldCheck, AlertTriangle, XCircle, Users } from 'lucide-react';

export const ResponsibleStats = ({ responsibles }: { responsibles: any[] }) => {
  const hoy = new Date();

  // Lógica de conteo para el semáforo legal
  const stats = responsibles.reduce((acc, res) => {
    if (!res.fecha_ven_licencia) return acc;
    
    const venLicencia = new Date(res.fecha_ven_licencia);
    const diasParaVencer = Math.ceil((venLicencia.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

    if (diasParaVencer <= 0) acc.vencidos++;
    else if (diasParaVencer <= 30) acc.porVencer++;
    else acc.vigentes++;
    
    return acc;
  }, { vigentes: 0, porVencer: 0, vencidos: 0 });

  const cards = [
    { label: 'Total Responsables', value: responsibles.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Licencias Vigentes', value: stats.vigentes, icon: ShieldCheck, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Próximos a Vencer', value: stats.porVencer, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Licencias Vencidas', value: stats.vencidos, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, i) => (
        <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className={`p-3 rounded-xl ${card.bg} ${card.color}`}>
            <card.icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider leading-none mb-1">{card.label}</p>
            <p className="text-2xl font-black text-gray-900">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};