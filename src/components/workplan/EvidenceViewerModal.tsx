import { X, Download, FileText, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useState, useEffect } from 'react';

interface EvidenceViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  storagePath: string;
  title: string;
  bucketName?: string;
}

export function EvidenceViewerModal({ 
  isOpen, 
  onClose, 
  storagePath, 
  title,
  bucketName = 'evidences'
}: EvidenceViewerModalProps) {
  const [publicUrl, setPublicUrl] = useState<string>('');
  
  const isPdf = storagePath?.toLowerCase().endsWith('.pdf');

  useEffect(() => {
    if (isOpen && storagePath) {
      const { data } = supabase.storage.from(bucketName).getPublicUrl(storagePath);
      // Agregamos el parámetro de Fit para los PDFs también por si acaso
      const finalUrl = isPdf ? `${data.publicUrl}#view=Fit` : data.publicUrl;
      setPublicUrl(finalUrl);
    }
  }, [isOpen, storagePath, bucketName, isPdf]);

  if (!isOpen || !storagePath) return null;

  return (
    <div className="fixed inset-0 z-[8000] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
      <div className="bg-white w-full max-w-4xl h-[85vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-slate-100">
        
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white text-left">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              {isPdf ? <FileText size={20} /> : <ImageIcon size={20} />}
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-tighter">{title}</h3>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">Documento del Sistema SST</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <a href={publicUrl.split('#')[0]} target="_blank" rel="noreferrer" className="p-2 hover:bg-slate-100 text-slate-400 rounded-full transition-all">
              <Download size={20} />
            </a>
            <button onClick={onClose} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-all">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* CONTENEDOR PRINCIPAL AJUSTADO */}
        <div className="flex-1 bg-slate-100 p-4 overflow-hidden flex items-center justify-center">
          {isPdf ? (
            <iframe 
              src={publicUrl} 
              className="w-full h-full rounded-2xl border-none shadow-inner" 
              title="Visor PDF" 
            />
          ) : (
            /* VISOR DE IMAGEN SIN SCROLL */
            <div className="w-full h-full flex items-center justify-center overflow-hidden">
              <img 
                src={publicUrl} 
                alt="Evidencia" 
                className="max-w-full max-h-full rounded-2xl shadow-xl object-contain bg-white transition-all duration-300" 
                /* max-w-full y max-h-full: No permite que la imagen se desborde.
                   object-contain: Asegura que la imagen se vea completa sin cortes.
                */
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}