
import React, { useState, useRef } from 'react';
import { Task, Priority } from '../types';
import { Plus, Camera, Trash2, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { extractTasksFromImage } from '../services/geminiService';

interface Props {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  onAdd: (task: Omit<Task, 'id' | 'progress' | 'completed' | 'workedToday' | 'history'>) => void;
}

const TasksModule: React.FC<Props> = ({ tasks, setTasks, onAdd }) => {
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', priority: Priority.MEDIUM });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const extracted = await extractTasksFromImage(base64);
      extracted.forEach((t: any) => onAdd({ title: t.title, priority: t.priority as Priority }));
      setIsScanning(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-6 space-y-6 bg-black min-h-full">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black uppercase tracking-tighter">Queue</h2>
        <div className="flex gap-2">
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
          <button onClick={() => fileInputRef.current?.click()} className="p-2 bg-white/5 text-gray-400 rounded-full transition-all" disabled={isScanning}>
            {isScanning ? <Loader2 className="animate-spin" size={20} /> : <Camera size={20} />}
          </button>
          <button onClick={() => setShowAdd(!showAdd)} className="p-2 bg-white text-black rounded-full transition-transform">
            <Plus size={20} />
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="p-6 bg-white/5 border border-white/10 rounded-[32px] space-y-4 animate-in fade-in zoom-in duration-200">
          <input type="text" placeholder="Mission detail..." className="w-full text-lg font-bold bg-transparent focus:outline-none border-b border-white/10 py-2" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
          <div className="flex gap-2">
            {[Priority.LOW, Priority.MEDIUM, Priority.HIGH].map(p => (
              <button key={p} onClick={() => setNewTask({...newTask, priority: p})} className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl border transition-all ${newTask.priority === p ? 'bg-white text-black border-white' : 'border-white/10 text-gray-500'}`}>
                {p}
              </button>
            ))}
          </div>
          <button onClick={() => { if (newTask.title) { onAdd(newTask); setShowAdd(false); } }} className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase text-xs tracking-widest">Add to Queue</button>
        </div>
      )}

      <div className="space-y-4">
        {tasks.map((task) => (
          <div key={task.id} className={`p-6 rounded-[32px] border transition-all ${task.completed ? 'bg-white/5 border-transparent opacity-40' : 'bg-white/5 border-white/5 shadow-xl'}`}>
            <div className="flex items-start gap-4">
              <button onClick={() => setTasks(p => p.map(t => t.id === task.id ? {...t, completed: !t.completed, progress: !t.completed ? 100 : t.progress} : t))}>
                {task.completed ? <CheckCircle2 size={24} className="text-white" /> : <Circle size={24} className="text-gray-700" />}
              </button>
              <div className="flex-1">
                <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${task.priority === Priority.HIGH ? 'bg-white text-black' : 'bg-white/10 text-gray-400'}`}>{task.priority}</span>
                <h3 className={`text-base font-bold tracking-tight mt-1 uppercase leading-tight ${task.completed ? 'line-through' : ''}`}>{task.title}</h3>
              </div>
              <button onClick={() => setTasks(p => p.filter(t => t.id !== task.id))} className="text-gray-800 hover:text-white"><Trash2 size={16} /></button>
            </div>
            {!task.completed && (
              <div className="mt-6 space-y-3">
                 <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-gray-500">
                   <span>Progress</span>
                   <span>{task.progress}%</span>
                 </div>
                 <input type="range" min="0" max="100" step="10" className="w-full accent-white bg-white/10 h-1 rounded-full appearance-none cursor-pointer" value={task.progress} onChange={e => setTasks(p => p.map(t => t.id === task.id ? {...t, progress: parseInt(e.target.value)} : t))} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TasksModule;
