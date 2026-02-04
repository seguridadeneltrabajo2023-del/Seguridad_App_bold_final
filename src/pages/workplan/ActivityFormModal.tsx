import React, { useState, useEffect } from 'react';
import { X, Target, Users, Box, Calendar, Clock, AlignLeft, ShieldCheck, PlusCircle, Flag, FileText } from 'lucide-react';

// Definición de la Interface para eliminar el error 2304
interface ActivityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (activity: any) => void;
  initialData?: any; 
}

export function ActivityFormModal({ isOpen, onClose, onSave, initialData }: ActivityFormModalProps) {
  const [selectedType, setSelectedType] = useState('');
  const [customActivity, setCustomActivity] = useState('');
  const [formData, setFormData] = useState({
    objective: '',
    meta: '',
    scope: '',
    description: '',
    responsible: '',
    resources: '',
    date: '',
    time: ''
  });

  const activityOptions = [
    "Capacitación", "Simulacro", "Inspección extintores", 
    "Inspección instalaciones", "Inspección puestos de trabajo", 
    "Auditoría", "Gestión documental", "Entrega EPP", 
    "Reunión Copasst", "Reunión Cocola", "Reunión brigada", "Otro"
  ];

  // Función controladora para capturar cambios por "name" y asegurar el guardado
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        console.log("Editando actividad:", initialData);
        const isPredefined = activityOptions.includes(initialData.title);
        setSelectedType(isPredefined ? initialData.title : 'Otro');
        setCustomActivity(isPredefined ? '' : initialData.title);
        
        setFormData({
          objective: initialData.objective || '',
          meta: initialData.meta || '',
          scope: initialData.scope || '',
          description: initialData.description || '', // Mapeo desde Supabase 
          responsible: initialData.responsible || '',
          resources: initialData.resources || '',
          date: initialData.activity_date || initialData.date || '',
          time: initialData.activity_time || initialData.time || ''
        });
      } else {
        setSelectedType('');
        setCustomActivity('');
        setFormData({ objective: '', meta: '', scope: '', description: '', responsible: '', resources: '', date: '', time: '' });
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = selectedType === 'Otro' ? customActivity : selectedType;
    
    onSave({
      ...formData,
      id: initialData?.id, // Mantiene ID para el Update blindado 
      title: finalTitle,
      status: initialData?.status || 'planeado'
    });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white">
        
        {/* Cabecera */}
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-none">
                {initialData ? 'Editar Actividad' : 'Nueva Actividad'}
              </h2>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Gestión de Seguridad y Salud</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm text-slate-400 hover:text-slate-600">
            <X size={20}/>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
          
          {/* Tipo de Actividad */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 flex items-center gap-2">
              <AlignLeft size={12}/> Tipo de Actividad
            </label>
            <select
              required
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 text-sm font-bold text-slate-700 outline-none appearance-none"
            >
              <option value="">Seleccione una actividad...</option>
              {activityOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {selectedType === 'Otro' && (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
              <label className="text-[10px] font-black uppercase text-blue-600 ml-4 flex items-center gap-2">
                <PlusCircle size={12}/> Nombre de la actividad
              </label>
              <input 
                required 
                className="w-full px-6 py-4 bg-blue-50 border-2 border-blue-100 rounded-2xl focus:ring-2 focus:ring-blue-500 text-sm font-bold text-slate-700 outline-none" 
                placeholder="Escriba el nombre" 
                value={customActivity}
                onChange={e => setCustomActivity(e.target.value)} 
              />
            </div>
          )}

          {/* Fila: Objetivo y Meta */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4 flex items-center gap-2">
                <Target size={12}/> Objetivo
              </label>
              <textarea 
                name="objective"
                value={formData.objective}
                onChange={handleChange}
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 text-sm h-24 resize-none outline-none font-medium" 
                placeholder="¿Qué resultado se espera?" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4 flex items-center gap-2">
                <Flag size={12}/> Meta
              </label>
              <textarea 
                name="meta"
                value={formData.meta}
                onChange={handleChange}
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 text-sm h-24 resize-none outline-none font-medium" 
                placeholder="Ej: 100% cumplimiento" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 flex items-center gap-2">
              <ShieldCheck size={12}/> Alcance
            </label>
            <input 
              name="scope"
              value={formData.scope}
              onChange={handleChange}
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 text-sm outline-none font-medium" 
              placeholder="Áreas o procesos involucrados" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-4 flex items-center gap-2">
              <FileText size={12}/> Descripción de la Actividad
            </label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 text-sm h-24 resize-none outline-none font-medium" 
              placeholder="Pasos o acciones detalladas" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4 flex items-center gap-2">
                <Users size={12}/> Responsables
              </label>
              <input 
                name="responsible"
                value={formData.responsible}
                onChange={handleChange}
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 text-sm outline-none font-medium" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4 flex items-center gap-2">
                <Box size={12}/> Recursos
              </label>
              <input 
                name="resources"
                value={formData.resources}
                onChange={handleChange}
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 text-sm outline-none font-medium" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4 flex items-center gap-2">
                <Calendar size={12}/> Fecha
              </label>
              <input 
                name="date"
                type="date" 
                required 
                value={formData.date}
                onChange={handleChange}
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 text-sm font-bold outline-none" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4 flex items-center gap-2">
                <Clock size={12}/> Hora
              </label>
              <input 
                name="time"
                type="time" 
                required 
                value={formData.time}
                onChange={handleChange}
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 text-sm font-bold outline-none" 
              />
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-[0.98]"
            >
              {initialData ? 'Guardar Cambios' : 'Programar Actividad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}