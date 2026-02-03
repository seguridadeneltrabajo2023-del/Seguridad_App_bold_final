import { useState } from 'react';
import { X, Target, Users, Box, Calendar, Clock, AlignLeft, ShieldCheck } from 'lucide-react';

interface ActivityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (activity: any) => void;
}

export function ActivityFormModal({ isOpen, onClose, onSave }: ActivityFormModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    objective: '',
    scope: '',
    responsible: '',
    resources: '',
    date: '',
    time: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white">
        
        {/* Cabecera Estética */}
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-none">Nueva Actividad</h2>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Gestión de Seguridad y Salud</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm text-slate-400 hover:text-slate-600">
            <X size={20}/>
          </button>
        </div>

        {/* Cuerpo del Formulario */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Descripción / Título */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 flex items-center gap-2">
              <AlignLeft size={12}/> Descripción de la Actividad
            </label>
            <input 
              required 
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 text-sm font-bold text-slate-700 outline-none" 
              placeholder="Ej: Inspección de extintores bloque A" 
              onChange={e => setFormData({...formData, title: e.target.value})} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Objetivo */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4 flex items-center gap-2">
                <Target size={12}/> Objetivo
              </label>
              <textarea 
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 text-sm h-28 resize-none outline-none" 
                placeholder="¿Qué resultado se espera?" 
                onChange={e => setFormData({...formData, objective: e.target.value})} 
              />
            </div>

            {/* Alcance */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4 flex items-center gap-2">
                <ShieldCheck size={12}/> Alcance
              </label>
              <textarea 
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 text-sm h-28 resize-none outline-none" 
                placeholder="Áreas o personal involucrado" 
                onChange={e => setFormData({...formData, scope: e.target.value})} 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Responsables */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4 flex items-center gap-2">
                <Users size={12}/> Responsables
              </label>
              <input 
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 text-sm outline-none font-medium" 
                placeholder="Ej: Juan Pérez / SST" 
                onChange={e => setFormData({...formData, responsible: e.target.value})} 
              />
            </div>

            {/* Recursos */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4 flex items-center gap-2">
                <Box size={12}/> Recursos
              </label>
              <input 
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 text-sm outline-none font-medium" 
                placeholder="Equipos, papelería, etc." 
                onChange={e => setFormData({...formData, resources: e.target.value})} 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            {/* Fecha */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4 flex items-center gap-2">
                <Calendar size={12}/> Fecha
              </label>
              <input 
                type="date" 
                required 
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 text-sm font-bold outline-none" 
                onChange={e => setFormData({...formData, date: e.target.value})} 
              />
            </div>

            {/* Hora */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4 flex items-center gap-2">
                <Clock size={12}/> Hora
              </label>
              <input 
                type="time" 
                required 
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 text-sm font-bold outline-none" 
                onChange={e => setFormData({...formData, time: e.target.value})} 
              />
            </div>
          </div>

          {/* Botón de Acción */}
          <div className="pt-4">
            <button 
              type="submit" 
              className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-[0.98]"
            >
              Programar Actividad
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}