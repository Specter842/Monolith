import React, { useState } from 'react';
import { LearningItem, LearningStatus } from '../types';
import { Plus, Trash2, ExternalLink, BookOpen, Clock, CheckCircle, Circle } from 'lucide-react';

interface Props {
  items: LearningItem[];
  setItems: React.Dispatch<React.SetStateAction<LearningItem[]>>;
}

const LearningModule: React.FC<Props> = ({ items, setItems }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState<Omit<LearningItem, 'id'>>({
    title: '',
    notes: '',
    link: '',
    status: 'NOT_STARTED'
  });

  const addItem = () => {
    if (!newItem.title) return;
    const item: LearningItem = {
      ...newItem,
      id: Math.random().toString(36).substr(2, 9)
    };
    setItems(prev => [...prev, item]);
    setNewItem({ title: '', notes: '', link: '', status: 'NOT_STARTED' });
    setShowAdd(false);
  };

  const deleteItem = (id: string) => {
    if (confirm("DELETE LEARNING NODE?")) {
      setItems(prev => prev.filter(i => i.id !== id));
    }
  };

  const updateStatus = (id: string, status: LearningStatus) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status } : i));
  };

  const sortedItems = [...items].sort((a, b) => {
    const order = { 'IN_PROGRESS': 0, 'NOT_STARTED': 1, 'COMPLETED': 2 };
    return order[a.status] - order[b.status];
  });

  return (
    <div className="p-5 space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col gap-1 pb-4 border-b border-white/5">
        <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">Learning</h2>
        <p className="text-[10px] font-black uppercase tracking-[0.8em] text-gray-800">Knowledge Acquisition</p>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-500">Skill Tree</h2>
        <button onClick={() => setShowAdd(!showAdd)} className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all">
          <Plus size={18} />
        </button>
      </div>

      {showAdd && (
        <div className="p-8 bg-white/5 border border-white/10 rounded-[36px] space-y-4 animate-in zoom-in duration-200 shadow-2xl">
          <input 
            type="text" 
            placeholder="TOPIC/SKILL..." 
            className="w-full text-lg font-black bg-transparent border-b-2 border-white/5 py-3 uppercase focus:outline-none focus:border-white transition-all" 
            value={newItem.title} 
            onChange={e => setNewItem({...newItem, title: e.target.value})} 
          />
          <textarea 
            placeholder="NOTES/DETAILS..." 
            className="w-full bg-transparent border-b border-white/5 py-2 text-xs uppercase focus:outline-none focus:border-white h-20 resize-none" 
            value={newItem.notes} 
            onChange={e => setNewItem({...newItem, notes: e.target.value})} 
          />
          <input 
            type="text" 
            placeholder="RESOURCE URL..." 
            className="w-full bg-transparent border-b border-white/5 py-2 text-[10px] uppercase focus:outline-none focus:border-white" 
            value={newItem.link} 
            onChange={e => setNewItem({...newItem, link: e.target.value})} 
          />
          <button onClick={addItem} className="w-full bg-white text-black py-5 rounded-[28px] font-black uppercase text-[10px] tracking-[0.3em] active:scale-95 transition-all">Add Knowledge Node</button>
        </div>
      )}

      <div className="space-y-4 pb-32">
        {sortedItems.length === 0 ? (
          <div className="py-20 text-center text-gray-800 uppercase tracking-[0.5em] text-[10px] font-black italic border-2 border-dashed border-white/5 rounded-[40px]">Library Empty</div>
        ) : (
          sortedItems.map((item) => (
            <div key={item.id} className={`p-6 rounded-[36px] border transition-all ${item.status === 'COMPLETED' ? 'opacity-30' : 'bg-white/5 border-white/5 shadow-xl'}`}>
              <div className="flex items-start gap-4">
                <div className="flex flex-col gap-2 pt-1">
                  <button onClick={() => updateStatus(item.id, 'NOT_STARTED')} className={item.status === 'NOT_STARTED' ? 'text-white' : 'text-gray-800'}><Circle size={18} /></button>
                  <button onClick={() => updateStatus(item.id, 'IN_PROGRESS')} className={item.status === 'IN_PROGRESS' ? 'text-white' : 'text-gray-800'}><Clock size={18} /></button>
                  <button onClick={() => updateStatus(item.id, 'COMPLETED')} className={item.status === 'COMPLETED' ? 'text-white' : 'text-gray-800'}><CheckCircle size={18} /></button>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded tracking-[0.1em] ${item.status === 'IN_PROGRESS' ? 'bg-white text-black' : 'bg-white/5 text-gray-600'}`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className={`text-base font-bold uppercase mt-1 leading-tight tracking-tight ${item.status === 'COMPLETED' ? 'line-through' : ''}`}>{item.title}</h3>
                  {item.notes && <p className="text-[10px] text-gray-500 mt-2 uppercase font-medium line-clamp-2">{item.notes}</p>}
                  {item.link && (
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 mt-3 text-[8px] font-black text-white/40 uppercase tracking-widest hover:text-white transition-colors">
                      <ExternalLink size={10} /> View Resource
                    </a>
                  )}
                </div>
                <button onClick={() => deleteItem(item.id)} className="text-gray-900 hover:text-red-500 transition-colors p-1">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LearningModule;
