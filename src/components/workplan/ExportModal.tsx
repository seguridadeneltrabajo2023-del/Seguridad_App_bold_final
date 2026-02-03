import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const exportToPDF = async () => {
    const { data: activities } = await supabase
      .from('work_plan')
      .select('*')
      .order('activity_date', { ascending: true });

    if (!activities) return;

    const doc = new jsPDF('l', 'mm', 'a4'); // Orientación horizontal para más espacio

    // --- 1. Estética del Encabezado ---
    doc.setFillColor(30, 58, 138); // Azul oscuro (blue-900)
    doc.rect(0, 0, 297, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('PLAN DE TRABAJO ANUAL SST', 14, 20);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Sistema de Gestión de Seguridad y Salud en el Trabajo', 14, 30);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 240, 30);

    // --- 2. Generación de la Tabla ---
    autoTable(doc, {
      startY: 50,
      head: [['Actividad', 'Objetivo', 'Responsable', 'Recursos', 'Fecha', 'Estado']],
      body: activities.map(act => [
        act.title.toUpperCase(),
        act.objective,
        act.responsible,
        act.resources || 'No asignado',
        act.activity_date,
        act.status.toUpperCase()
      ]),
      headStyles: {
        fillColor: [37, 99, 235], // Blue-600
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center'
      },
      styles: {
        fontSize: 9,
        cellPadding: 5,
      },
      columnStyles: {
        0: { cellWidth: 40, fontStyle: 'bold' }, // Título
        1: { cellWidth: 70 }, // Objetivo
        4: { halign: 'center' }, // Fecha
        5: { halign: 'center', fontStyle: 'bold' } // Estado
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250]
      },
      margin: { top: 50 }
    });

    doc.save('Plan_de_Trabajo_SST.pdf');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[6000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="p-8 text-center">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-50">
            <FileText size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-2">Exportar Reporte</h2>
          <p className="text-slate-500 text-sm mb-8 italic">Se generará un documento PDF profesional con todas las actividades programadas.</p>
          
          <div className="grid gap-3">
            <button 
              onClick={exportToPDF}
              className="flex items-center justify-center gap-3 w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100"
            >
              <Download size={18} /> Descargar PDF Profesional
            </button>
            <button 
              onClick={onClose}
              className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-slate-200 transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}