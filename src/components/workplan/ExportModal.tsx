import { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download, Upload, Image as ImageIcon, Check } from 'lucide-react'; 
import { supabase } from '../../lib/supabase';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Logo inicial (Se usará como fallback si no se sube nada)
const INITIAL_LOGO = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAACbYAAAMsCAYAAACCqGY5..."; 

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const [currentLogo, setCurrentLogo] = useState<string>(INITIAL_LOGO);
  const [isCustomLogo, setIsCustomLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- FUNCIÓN PARA RESETEAR EL MODAL ---
  const resetLogoState = () => {
    setCurrentLogo(INITIAL_LOGO);
    setIsCustomLogo(false);
    if (fileInputRef.current) fileInputRef.current.value = ""; // Limpiar el input de archivo
  };

  // --- MANEJO DEL CIERRE (Resetear al salir) ---
  const handleClose = () => {
    resetLogoState();
    onClose();
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setCurrentLogo(base64);
        setIsCustomLogo(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const getLogoDimensions = (base64: string): Promise<{ width: number, height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 40;
        const maxHeight = 25;
        let width = img.width;
        let height = img.height;
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        resolve({ width: width * ratio, height: height * ratio });
      };
      img.src = base64;
    });
  };

  const exportToPDF = async () => {
    try {
      const { data: activities, error } = await supabase
        .from('work_plan')
        .select('*')
        .order('activity_date', { ascending: true });

      if (error || !activities || activities.length === 0) {
        alert("Error o no hay datos para exportar.");
        return;
      }

      const doc = new jsPDF('l', 'mm', 'legal'); 
      const pageWidth = doc.internal.pageSize.getWidth();
      const year = activities[0].activity_date ? new Date(activities[0].activity_date).getFullYear() : new Date().getFullYear();

      if (currentLogo && currentLogo.length > 100) {
        try {
          const dims = await getLogoDimensions(currentLogo);
          const format = currentLogo.includes('image/png') ? 'PNG' : 'JPEG';
          doc.addImage(currentLogo, format, 10, 8, dims.width, dims.height, undefined, 'FAST');
        } catch (imgError) {
          console.warn("Error al procesar dimensiones del logo.");
        }
      }

      // --- TÍTULO ---
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      const title = `PLAN DE TRABAJO ANUAL DE SGSST ${year}`;
      doc.text(title, (pageWidth - doc.getTextWidth(title)) / 2, 22);

      // --- TABLA ---
      autoTable(doc, {
        startY: 40,
        head: [['ACTIVIDAD', 'OBJETIVO', 'META', 'DESCRIPCIÓN', 'RESPONSABLE', 'RECURSOS', 'FECHA']],
        body: activities.map(act => [
          (act.title || '---').toUpperCase(), 
          act.objective || '---',
          act.meta || '---',
          act.description || '---',
          act.responsible || '---',
          act.resources || '---',
          act.activity_date || '---'
        ]),
        theme: 'grid',
        headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontSize: 9, halign: 'center' },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 55 },
          2: { cellWidth: 35, halign: 'center' },
          3: { cellWidth: 77 },
          4: { cellWidth: 45 },
          5: { cellWidth: 51.6 },
          6: { cellWidth: 22, halign: 'center' }
        },
        margin: { left: 10, right: 10 }
      });

      doc.save(`Plan_SGSST_${year}.pdf`);
      
      // --- RESETEAR TRAS DESCARGA ---
      handleClose(); 

    } catch (err) {
      alert("Error al generar PDF.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[6000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
        <div className="p-8 text-center">
          
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className={`w-full h-full rounded-2xl flex items-center justify-center border-2 overflow-hidden transition-all ${isCustomLogo ? 'border-emerald-500 bg-emerald-50' : 'border-dashed border-slate-200 bg-slate-50'}`}>
              {isCustomLogo ? (
                <img src={currentLogo} alt="Preview" className="w-full h-full object-contain p-2" />
              ) : (
                <ImageIcon className="text-slate-300" size={32} />
              )}
            </div>
            {isCustomLogo && (
              <div className="absolute -top-2 -right-2 bg-emerald-500 text-white rounded-full p-1 shadow-lg">
                <Check size={14} />
              </div>
            )}
          </div>

          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-2">Exportar Reporte</h2>
          <p className="text-slate-500 text-sm mb-6">Sube un logo para este reporte. Se reseteará al terminar.</p>
          
          <div className="grid gap-3">
            <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />

            <button 
              onClick={() => fileInputRef.current?.click()}
              className={`flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all border ${
                isCustomLogo 
                ? 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700 shadow-lg shadow-emerald-100' 
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <Upload size={14} /> 
              {isCustomLogo ? "Logo Cargado para este reporte" : "Subir Logo de la Empresa"}
            </button>

            <button 
              onClick={exportToPDF}
              className="flex items-center justify-center gap-3 w-full py-4 bg-black text-white rounded-2xl font-bold uppercase text-[10px] tracking-[0.2em] hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 mt-2"
            >
              <Download size={18} /> Descargar PDF Oficio
            </button>

            <button 
              onClick={handleClose} 
              className="w-full py-2 text-slate-400 font-bold uppercase text-[10px] tracking-widest hover:text-slate-600 transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}