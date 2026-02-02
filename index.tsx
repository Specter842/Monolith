import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Calendar as CalendarIcon, CheckSquare, Wallet as WalletIcon, Briefcase, 
  Archive, Menu, X, Key, Settings as SettingsIcon, Plus, Copy, Trash2, 
  ChevronLeft, ChevronRight, MapPin, Bell, RefreshCw, Download, 
  Camera, CheckCircle2, Circle, Loader2, TrendingUp, TrendingDown,
  Lock, Eye, EyeOff, Search, ExternalLink, Shield, ArrowRight, Layers, ShoppingBag,
  Upload, Folder, FileText, Heart, Edit3, PieChart as PieIcon, RotateCw, Copy as CopyIcon,
  Zap, CalendarDays, History, BookOpen
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CalendarEvent, Task, Transaction, PasswordEntry, WishlistItem, ResourceItem, Folder as FolderType, RepeatType, PriorityType, CalendarView, LearningItem, CurrencyType, CURRENCY_SYMBOLS } from './types';

// --- IMPORT MODULES ---
import PasswordManagerModule from './components/PasswordManagerModule';
import SettingsModule from './components/SettingsModule';
import WishlistModule from './components/WishlistModule';
import ResourcesModule from './components/ResourcesModule';
import LearningModule from './components/LearningModule';

// --- PERSISTENCE UTILITY ---
const usePersistentState = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [state, setState] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initialValue;
    } catch (e) {
      console.error("Persistence Error", e);
      return initialValue;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
};

// --- AI SERVICE ---
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const extractTasksFromImage = async (base64Image: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { 
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } }, 
          { text: "Extract list items from this image. Return a JSON array of {title, priority: 'LOW'|'MEDIUM'|'HIGH'}." }
        ] 
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: { 
              title: { type: Type.STRING }, 
              priority: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH'] } 
            },
            required: ["title", "priority"]
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (e) {
    console.error("OCR Failure", e);
    return [];
  }
};

// --- HELPERS ---
const isEventOnDate = (event: CalendarEvent, targetDateStr: string) => {
  if (event.date === targetDateStr) return true;
  if (!event.repeat || event.repeat === 'NONE') return false;

  const eventDate = new Date(event.date + 'T00:00:00');
  const targetDate = new Date(targetDateStr + 'T00:00:00');

  if (targetDate < eventDate) return false;

  switch (event.repeat) {
    case 'DAILY':
      return true;
    case 'WEEKLY':
      return eventDate.getDay() === targetDate.getDay();
    case 'MONTHLY':
      return eventDate.getDate() === targetDate.getDate();
    case 'YEARLY':
      return eventDate.getMonth() === targetDate.getMonth() && eventDate.getDate() === targetDate.getDate();
    default:
      return false;
  }
};

// --- CORE MODULES ---

const CalendarModule = ({ events, setEvents, tasks, setTasks }: { events: CalendarEvent[], setEvents: any, tasks: Task[], setTasks: any }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAdd, setShowAdd] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [view, setView] = usePersistentState<CalendarView>('monolith_calendar_view', 'DAY');
  const [newEvent, setNewEvent] = useState<{title: string, startTime: string, endTime?: string, date: string, repeat: RepeatType}>({ 
    title: '', startTime: '09:00', endTime: '10:00', date: selectedDate, repeat: 'NONE' 
  });
  const [showReplicateModal, setShowReplicateModal] = useState(false);
  const [replicateTargetDate, setReplicateTargetDate] = useState('');
  const importInputRef = useRef<HTMLInputElement>(null);

  const dayEvents = useMemo(() => 
    events
      .filter((e: CalendarEvent) => isEventOnDate(e, selectedDate))
      .sort((a: CalendarEvent, b: CalendarEvent) => a.startTime.localeCompare(b.startTime)),
  [events, selectedDate]);

  const dayTasks = useMemo(() => 
    tasks.filter(t => t.date === selectedDate || (t.completedAt === selectedDate)),
  [tasks, selectedDate]);

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/);
      const imported: CalendarEvent[] = [];
      let current: any = null;

      lines.forEach(line => {
        const [key, ...rest] = line.split(':');
        const value = rest.join(':').trim();
        
        if (line.includes('BEGIN:VEVENT')) {
          current = { id: Math.random().toString(36).substr(2, 9), title: '', date: '', startTime: '09:00', endTime: '10:00', repeat: 'NONE' };
        } else if (line.includes('END:VEVENT') && current) {
          if (current.title && current.date) imported.push(current);
          current = null;
        } else if (current) {
          if (key.startsWith('SUMMARY')) current.title = value;
          if (key.startsWith('DTSTART')) {
            const raw = value.replace(/[^0-9T]/g, '');
            const y = raw.substring(0,4), m = raw.substring(4,6), d = raw.substring(6,8);
            current.date = `${y}-${m}-${d}`;
            if (raw.includes('T')) current.startTime = `${raw.substring(9,11)}:${raw.substring(11,13)}`;
          }
          if (key.startsWith('DTEND')) {
            const raw = value.replace(/[^0-9T]/g, '');
            if (raw.includes('T')) current.endTime = `${raw.substring(9,11)}:${raw.substring(11,13)}`;
          }
        }
      });
      
      if (imported.length > 0) {
        setEvents((p: any) => [...p, ...imported]);
        alert(`Imported ${imported.length} events.`);
      } else {
        alert("Parsing failed: No valid VEVENT blocks found.");
      }
    };
    reader.readAsText(file);
  };

  const saveEvent = (ev: any) => {
    if (editingEvent) {
      setEvents((p: any) => p.map((e: any) => e.id === editingEvent.id ? { ...ev, id: e.id } : e));
      setEditingEvent(null);
    } else {
      setEvents((p: any) => [...p, { ...ev, id: Math.random().toString(36).substr(2, 9) }]);
      setShowAdd(false);
    }
  };

  const clearDay = () => {
    if (confirm(`CLEAR ALL EVENTS AND TASKS ON ${new Date(selectedDate).toLocaleDateString()}?`)) {
      setEvents((prev: CalendarEvent[]) => prev.filter(e => !isEventOnDate(e, selectedDate)));
      setTasks((prev: Task[]) => prev.filter(t => (t.date !== selectedDate && t.completedAt !== selectedDate)));
    }
  };

  const replicateDay = () => {
    if (!replicateTargetDate) {
      alert("PLEASE SELECT A TARGET DATE.");
      return;
    }
    if (confirm(`REPLICATE ${dayEvents.length} EVENTS AND ${dayTasks.length} TASKS TO ${new Date(replicateTargetDate).toLocaleDateString()}?`)) {
      const duplicatedEvents = dayEvents.map(e => ({
        ...e,
        id: Math.random().toString(36).substr(2, 9),
        date: replicateTargetDate
      }));
      const duplicatedTasks = dayTasks.map(t => ({
        ...t,
        id: Math.random().toString(36).substr(2, 9),
        date: replicateTargetDate,
        createdAt: new Date().toISOString(),
        completed: false,
        completedAt: undefined,
        workHistory: {}
      }));
      setEvents((prev: CalendarEvent[]) => [...prev, ...duplicatedEvents]);
      setTasks((prev: Task[]) => [...prev, ...duplicatedTasks]);
      setShowReplicateModal(false);
      setReplicateTargetDate('');
      setSelectedDate(replicateTargetDate);
    }
  };

  const renderDayView = () => (
    <div className="space-y-3 pb-24 animate-in fade-in">
      <div className="flex gap-2 mb-4">
         <button onClick={clearDay} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-2xl text-[8px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"><Trash2 size={12}/> Clear Schedule</button>
         <button onClick={() => setShowReplicateModal(true)} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-2xl text-[8px] font-black uppercase tracking-widest text-gray-400 hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2"><CopyIcon size={12}/> Replicate Day</button>
      </div>

      <div className="space-y-4">
        <h4 className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] border-l-2 border-white pl-3">Timeline</h4>
        {dayEvents.length === 0 ? (
          <div className="py-10 text-center opacity-10 text-[9px] uppercase tracking-[0.8em] font-black italic border-2 border-dashed border-white/10 rounded-[40px]">No Events</div>
        ) : (
          dayEvents.map((event: CalendarEvent) => (
            <div key={event.id} className="bg-white/5 p-6 rounded-[32px] border border-white/5 shadow-xl transition-all active:scale-[0.98] group" onClick={() => setEditingEvent(event)}>
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                     <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">
                       {event.startTime} {event.endTime ? `— ${event.endTime}` : <span className="ml-1 text-white/20 italic">(Ongoing)</span>}
                     </span>
                     {event.repeat && event.repeat !== 'NONE' && <RotateCw size={10} className="text-gray-700" />}
                  </div>
                  <h3 className="text-base font-bold uppercase tracking-tight">{event.title}</h3>
                </div>
                <div className="flex gap-2">
                  <Edit3 size={14} className="text-gray-900 group-hover:text-gray-400 transition-colors" />
                  <button onClick={(e) => { e.stopPropagation(); setEvents((p: any) => p.filter((x: any) => x.id !== event.id)); }} className="text-gray-900 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}

        {dayTasks.length > 0 && (
          <div className="mt-8 space-y-4">
            <h4 className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] border-l-2 border-white pl-3">Tasks Due</h4>
            {dayTasks.map((task: Task) => (
              <div key={task.id} className="bg-white/5 p-4 rounded-[24px] border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center">
                    {task.completed ? <CheckCircle2 size={20} className="text-white" /> : <Circle size={20} className="text-gray-700" />}
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-tight ${task.completed ? 'line-through text-gray-600' : ''}`}>{task.title}</span>
                </div>
                <span className="text-[7px] font-black text-gray-800 uppercase">{task.priority}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderWeekView = () => {
    const days = [];
    const curr = new Date(selectedDate);
    const startOfWeek = new Date(curr.setDate(curr.getDate() - curr.getDay()));
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      const ds = d.toISOString().split('T')[0];
      days.push({ ds, label: d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }), evs: events.filter(e => isEventOnDate(e, ds)).sort((a,b) => a.startTime.localeCompare(b.startTime)) });
    }
    return (
      <div className="space-y-2 pb-24">
        {days.map(d => (
          <div key={d.ds} className={`p-4 rounded-3xl border ${d.ds === selectedDate ? 'bg-white/10 border-white/10' : 'bg-white/5 border-transparent'}`} onClick={() => setSelectedDate(d.ds)}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest">{d.label}</span>
              <span className="text-[8px] font-bold opacity-30">{d.evs.length} Units</span>
            </div>
            <div className="space-y-1">
              {d.evs.map(e => (
                <div key={e.id} className="flex justify-between items-center bg-white/5 p-2 rounded-xl text-[9px] font-bold uppercase tracking-tight">
                  <span className="truncate flex-1" onClick={() => setEditingEvent(e)}>{e.startTime} {e.title}</span>
                  <button onClick={() => setEvents((p: any) => p.filter((x: any) => x.id !== e.id))}><X size={10} className="text-gray-600" /></button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderMonthView = () => {
    const curr = new Date(selectedDate);
    const y = curr.getFullYear(), m = curr.getMonth();
    const start = new Date(y, m, 1).getDay();
    const end = new Date(y, m + 1, 0).getDate();
    const cells = Array.from({ length: 42 }, (_, i) => {
      const day = i - start + 1;
      return (day > 0 && day <= end) ? day : null;
    });
    return (
      <div className="pb-24 grid grid-cols-7 gap-1">
        {['S','M','T','W','T','F','S'].map(d => <div key={d} className="text-center text-[8px] font-black text-gray-700 py-2">{d}</div>)}
        {cells.map((d, i) => {
          const ds = d ? `${y}-${(m+1).toString().padStart(2,'0')}-${d.toString().padStart(2,'0')}` : '';
          const has = events.some(e => isEventOnDate(e, ds));
          return (
            <div key={i} onClick={() => d && setSelectedDate(ds)} className={`aspect-square flex flex-col items-center justify-center rounded-xl border transition-all ${d ? 'cursor-pointer' : 'opacity-0'} ${ds === selectedDate ? 'bg-white text-black border-white' : 'bg-white/5 border-transparent'}`}>
              <span className="text-[10px] font-black">{d}</span>
              {has && <div className={`w-1 h-1 rounded-full mt-1 ${ds === selectedDate ? 'bg-black' : 'bg-white'}`}></div>}
            </div>
          );
        })}
      </div>
    );
  };

  const renderYearView = () => {
    const curr = new Date(selectedDate);
    const y = curr.getFullYear();
    return (
      <div className="grid grid-cols-3 gap-3 pb-24">
        {Array.from({ length: 12 }, (_, i) => {
          const hasMonthEvent = events.some(e => {
            const evDate = new Date(e.date);
            return evDate.getFullYear() === y && evDate.getMonth() === i;
          });
          return (
            <div key={i} onClick={() => {
              const d = new Date(selectedDate); d.setMonth(i); 
              setSelectedDate(d.toISOString().split('T')[0]); setView('MONTH');
            }} className="aspect-square bg-white/5 border border-white/5 rounded-3xl flex flex-col items-center justify-center hover:bg-white hover:text-black transition-all">
              <span className="text-[10px] font-black uppercase tracking-widest">{new Date(y, i, 1).toLocaleDateString('en-US', { month: 'short' })}</span>
              {hasMonthEvent && <div className="w-1 h-1 bg-current rounded-full mt-1 opacity-50"></div>}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-5 space-y-4 animate-in fade-in duration-300">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-1 bg-white/5 p-1 rounded-2xl border border-white/5">
            {['DAY', 'WEEK', 'MONTH', 'YEAR'].map((v) => (
              <button key={v} onClick={() => setView(v as CalendarView)} className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${view === v ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}>{v}</button>
            ))}
          </div>
          <input type="file" ref={importInputRef} className="hidden" accept=".ics,text/calendar" onChange={handleImportFile} />
          <button onClick={() => importInputRef.current?.click()} className="w-10 h-10 bg-white/5 border border-white/10 text-gray-500 rounded-full flex items-center justify-center active:bg-white active:text-black transition-all"><Upload size={16} /></button>
        </div>
        <div className="flex items-center justify-between bg-white/5 p-4 rounded-[32px] border border-white/5">
          <button onClick={() => { 
            const d = new Date(selectedDate); 
            if (view === 'DAY') d.setDate(d.getDate() - 1);
            else if (view === 'WEEK') d.setDate(d.getDate() - 7);
            else if (view === 'MONTH') d.setMonth(d.getMonth() - 1);
            else d.setFullYear(d.getFullYear() - 1);
            setSelectedDate(d.toISOString().split('T')[0]); 
          }} className="p-2 text-gray-500 active:text-white"><ChevronLeft size={20} /></button>
          <div className="text-center">
            <h2 className="text-xl font-black uppercase tracking-tighter leading-none">
              {view === 'DAY' ? new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 
               view === 'WEEK' ? `Week of ${new Date(new Date(selectedDate).setDate(new Date(selectedDate).getDate() - new Date(selectedDate).getDay())).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` :
               view === 'MONTH' ? new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) :
               new Date(selectedDate).getFullYear()}
            </h2>
          </div>
          <button onClick={() => { 
            const d = new Date(selectedDate); 
            if (view === 'DAY') d.setDate(d.getDate() + 1);
            else if (view === 'WEEK') d.setDate(d.getDate() + 7);
            else if (view === 'MONTH') d.setMonth(d.getMonth() + 1);
            else d.setFullYear(d.getFullYear() + 1);
            setSelectedDate(d.toISOString().split('T')[0]); 
          }} className="p-2 text-gray-500 active:text-white"><ChevronRight size={20} /></button>
        </div>
      </div>
      {view === 'DAY' && renderDayView()}
      {view === 'WEEK' && renderWeekView()}
      {view === 'MONTH' && renderMonthView()}
      {view === 'YEAR' && renderYearView()}
      <div className="fixed bottom-[16vh] left-5 right-5 flex gap-3 z-50">
        <button onClick={() => { setNewEvent({ title: '', startTime: '09:00', endTime: '10:00', date: selectedDate, repeat: 'NONE' }); setShowAdd(true); }} className="flex-1 py-5 bg-white text-black rounded-[28px] font-black uppercase text-[10px] tracking-[0.3em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-2"><Plus size={16} /> NEW EVENT</button>
      </div>

      {(showAdd || editingEvent) && (
        <div className="fixed inset-0 bg-black/98 z-[300] flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#050505] rounded-[48px] border border-white/10 p-10 space-y-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center"><h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">{editingEvent ? 'Modify Entry' : 'Init Node'}</h3><button onClick={() => { setShowAdd(false); setEditingEvent(null); }} className="text-gray-700 uppercase font-black text-[9px]">Cancel</button></div>
            <input type="text" placeholder="EVENT IDENTITY" className="w-full bg-transparent border-b-2 border-white/5 py-4 text-2xl font-black uppercase focus:outline-none focus:border-white transition-all" value={editingEvent ? editingEvent.title : newEvent.title} onChange={e => editingEvent ? setEditingEvent({...editingEvent, title: e.target.value}) : setNewEvent({...newEvent, title: e.target.value})} autoFocus />
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Temporal Frame</label>
                <input type="date" className="w-full bg-white/5 rounded-2xl p-4 text-white font-black" value={editingEvent ? editingEvent.date : newEvent.date} onChange={e => editingEvent ? setEditingEvent({...editingEvent, date: e.target.value}) : setNewEvent({...newEvent, date: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <input type="time" className="w-full bg-white/5 rounded-2xl p-4 text-white font-black" value={editingEvent ? editingEvent.startTime : newEvent.startTime} onChange={e => editingEvent ? setEditingEvent({...editingEvent, startTime: e.target.value}) : setNewEvent({...newEvent, startTime: e.target.value})} />
                  <div className="space-y-1">
                    <input type="time" className="w-full bg-white/5 rounded-2xl p-4 text-white font-black" value={editingEvent ? editingEvent.endTime : newEvent.endTime} onChange={e => editingEvent ? setEditingEvent({...editingEvent, endTime: e.target.value}) : setNewEvent({...newEvent, endTime: e.target.value})} />
                    <button onClick={() => editingEvent ? setEditingEvent({...editingEvent, endTime: undefined}) : setNewEvent({...newEvent, endTime: undefined})} className="text-[7px] text-gray-600 uppercase font-black tracking-widest">Clear End Time (Ongoing)</button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Repetition Pattern</label>
                <div className="grid grid-cols-3 gap-2">
                   {(['NONE', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'] as RepeatType[]).map(r => (
                     <button 
                       key={r} 
                       onClick={() => editingEvent ? setEditingEvent({...editingEvent, repeat: r}) : setNewEvent({...newEvent, repeat: r})}
                       className={`py-2 rounded-xl text-[7px] font-black uppercase tracking-widest transition-all ${ (editingEvent ? editingEvent.repeat : newEvent.repeat) === r ? 'bg-white text-black' : 'bg-white/5 text-gray-600 border border-white/5' }`}
                     >
                       {r}
                     </button>
                   ))}
                </div>
              </div>
            </div>

            <button onClick={() => saveEvent(editingEvent || newEvent)} className="w-full bg-white text-black py-6 rounded-[32px] font-black uppercase text-xs tracking-widest shadow-2xl active:scale-95 transition-all">{editingEvent ? 'Update Record' : 'Create Event'}</button>
          </div>
        </div>
      )}

      {showReplicateModal && (
        <div className="fixed inset-0 bg-black/98 z-[300] flex items-center justify-center p-6 backdrop-blur-sm">
           <div className="w-full max-w-md bg-[#050505] rounded-[48px] border border-white/10 p-10 space-y-6 shadow-2xl">
              <div className="flex justify-between items-center"><h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">Replicate Node</h3><button onClick={() => setShowReplicateModal(false)} className="text-gray-700 uppercase font-black text-[9px]">Cancel</button></div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Select target date for duplication</p>
              <input type="date" className="w-full bg-white/5 rounded-2xl p-4 text-white font-black" value={replicateTargetDate} onChange={e => setReplicateTargetDate(e.target.value)} />
              <button onClick={replicateDay} className="w-full bg-white text-black py-6 rounded-[32px] font-black uppercase text-xs tracking-widest shadow-2xl active:scale-95 transition-all">Execute Replicate</button>
           </div>
        </div>
      )}
    </div>
  );
};

// --- TASKS MODULE ---
const TasksModule = ({ tasks, setTasks }: { tasks: Task[], setTasks: any }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', priority: 'MEDIUM' as PriorityType, date: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const todayStr = new Date().toISOString().split('T')[0];
  const todayDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  const addTask = (t: any) => setTasks((p: any) => [...p, { 
    ...t, 
    id: Math.random().toString(36).substr(2, 9), 
    completed: false, 
    progress: 0,
    createdAt: new Date().toISOString(),
    workHistory: {}
  }]);

  const deleteTask = (id: string) => {
    if (confirm("DELETE TASK PERMANENTLY?")) {
      setTasks((prev: Task[]) => prev.filter(t => t.id !== id));
    }
  };

  const toggleComplete = (task: Task) => {
    setTasks((prev: Task[]) => prev.map(t => {
      if (t.id === task.id) {
        const nowCompleted = !t.completed;
        return {
          ...t,
          completed: nowCompleted,
          completedAt: nowCompleted ? todayStr : undefined
        };
      }
      return t;
    }));
  };

  const toggleWorkTally = (task: Task) => {
    setTasks((prev: Task[]) => prev.map(t => {
      if (t.id === task.id) {
        const history = { ...(t.workHistory || {}) };
        history[todayStr] = !history[todayStr];
        return { ...t, workHistory: history };
      }
      return t;
    }));
  };

  // Grouping tasks
  const activeTasks = useMemo(() => tasks.filter(t => !t.completed), [tasks]);
  const completedGroups = useMemo(() => {
    const groups: Record<string, Task[]> = {};
    tasks.filter(t => t.completed && t.completedAt).forEach(t => {
      const date = t.completedAt!;
      if (!groups[date]) groups[date] = [];
      groups[date].push(t);
    });
    // Sort keys descending
    return Object.keys(groups).sort((a, b) => b.localeCompare(a)).reduce((obj: any, key) => {
      obj[key] = groups[key];
      return obj;
    }, {});
  }, [tasks]);

  const getStreak = (task: Task) => {
    if (!task.workHistory) return 0;
    return Object.values(task.workHistory).filter(v => v).length;
  };

  return (
    <div className="p-5 space-y-6 animate-in fade-in duration-300">
      {/* Header with Date */}
      <div className="flex flex-col gap-1 pb-4 border-b border-white/5">
        <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">{todayDay}</h2>
        <p className="text-[10px] font-black uppercase tracking-[0.8em] text-gray-800">{todayStr}</p>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-500">Active Queue</h2>
        <div className="flex gap-3">
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={async (e) => {
            const file = e.target.files?.[0]; if (!file) return; setIsScanning(true);
            const reader = new FileReader();
            reader.onloadend = async () => {
              const data = (reader.result as string).split(',')[1];
              const extracted = await extractTasksFromImage(data);
              extracted.forEach((t: any) => addTask(t));
              setIsScanning(false);
            };
            reader.readAsDataURL(file);
          }} />
          <button onClick={() => fileInputRef.current?.click()} className="w-10 h-10 bg-white/5 border border-white/10 text-gray-700 rounded-full flex items-center justify-center active:bg-white active:text-black transition-all">{isScanning ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}</button>
          <button onClick={() => setShowAdd(!showAdd)} className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all"><Plus size={18} /></button>
        </div>
      </div>

      {showAdd && (
        <div className="p-8 bg-white/5 border border-white/10 rounded-[36px] space-y-6 animate-in zoom-in duration-200 shadow-2xl">
          <input type="text" placeholder="OBJECTIVE..." className="w-full text-lg font-black bg-transparent border-b-2 border-white/5 py-3 uppercase focus:outline-none focus:border-white transition-all" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} autoFocus />
          <div className="flex gap-2">
            {(['LOW', 'MEDIUM', 'HIGH'] as PriorityType[]).map(p => <button key={p} onClick={() => setNewTask({...newTask, priority: p})} className={`flex-1 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${newTask.priority === p ? 'bg-white text-black' : 'bg-white/5 text-gray-500 border border-white/5'}`}>{p}</button>)}
          </div>
          <button onClick={() => { if (newTask.title) { addTask(newTask); setShowAdd(false); setNewTask({ title: '', priority: 'MEDIUM', date: '' }); } }} className="w-full bg-white text-black py-5 rounded-[28px] font-black uppercase text-[10px] tracking-[0.3em] active:scale-95 transition-all">Commit Node</button>
        </div>
      )}

      {/* Active Tasks */}
      <div className="space-y-4">
        {activeTasks.length === 0 ? (
          <div className="py-20 text-center text-gray-800 uppercase tracking-[0.5em] text-[10px] font-black italic border-2 border-dashed border-white/5 rounded-[40px]">Queue Depleted</div>
        ) : (
          activeTasks.map((task: Task) => (
            <div key={task.id} className="p-6 rounded-[36px] bg-white/5 border border-white/5 shadow-xl space-y-4">
              <div className="flex items-start gap-5">
                <button onClick={() => toggleComplete(task)} className="mt-1">
                  <Circle size={24} className="text-gray-800 hover:text-white transition-colors" />
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded tracking-[0.1em] ${task.priority === 'HIGH' ? 'bg-white text-black' : task.priority === 'MEDIUM' ? 'bg-white/10 text-gray-400' : 'bg-white/5 text-gray-600'}`}>{task.priority}</span>
                    {task.workHistory && getStreak(task) > 0 && (
                      <span className="flex items-center gap-1 text-[7px] font-black text-white/40 uppercase tracking-widest">
                        <Zap size={8} className="fill-current" /> {getStreak(task)}d Effort
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold uppercase mt-1 leading-tight tracking-tight">{task.title}</h3>
                </div>
                <button onClick={() => deleteTask(task.id)} className="text-gray-900 hover:text-red-500 transition-colors p-1">
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Work Tally Table/Toggle */}
              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <div className="flex flex-col">
                  <span className="text-[7px] font-black text-gray-700 uppercase tracking-widest">Daily Effort</span>
                  <div className="flex gap-1 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const d = new Date();
                      d.setDate(d.getDate() - (4 - i));
                      const ds = d.toISOString().split('T')[0];
                      const worked = task.workHistory?.[ds];
                      return (
                        <div key={ds} className={`w-3 h-3 rounded-full border border-white/5 ${worked ? 'bg-white shadow-[0_0_8px_white/20]' : 'bg-black/40'}`} title={ds} />
                      );
                    })}
                  </div>
                </div>
                <button 
                  onClick={() => toggleWorkTally(task)}
                  className={`px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${task.workHistory?.[todayStr] ? 'bg-white text-black' : 'bg-white/5 text-gray-600 border border-white/5'}`}
                >
                  {task.workHistory?.[todayStr] ? <CheckCircle2 size={10} /> : <History size={10} />}
                  Worked Today?
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* History Section */}
      {Object.keys(completedGroups).length > 0 && (
        <div className="pt-10 space-y-8 pb-32">
          <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-500 flex items-center gap-2">
            <History size={14} /> Completion Archive
          </h2>
          {Object.entries(completedGroups).map(([date, groupTasks]) => (
            <div key={date} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-white/5" />
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-700">
                  {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
                <div className="h-px flex-1 bg-white/5" />
              </div>
              <div className="space-y-3">
                {(groupTasks as Task[]).map(task => (
                  <div key={task.id} className="p-5 rounded-[28px] border border-white/5 bg-black/40 opacity-40 group hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-4">
                      <button onClick={() => toggleComplete(task)}>
                        <CheckCircle2 size={20} className="text-white" />
                      </button>
                      <div className="flex-1">
                        <h3 className="text-xs font-bold uppercase line-through text-gray-500 truncate">{task.title}</h3>
                        <p className="text-[7px] font-black uppercase tracking-widest text-gray-800 mt-1">Archived {task.completedAt}</p>
                      </div>
                      <button onClick={() => deleteTask(task.id)} className="text-gray-900 group-hover:text-red-500 transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- FINANCE MODULE ---
const FinanceModule = ({ transactions, wallets, setTransactions, setWallets, customCategories, setCustomCategories, currency, setCurrency }: any) => {
  const [showAdd, setShowAdd] = useState(false);
  const [editingT, setEditingT] = useState<Transaction | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [newT, setNewT] = useState<Omit<Transaction, 'id' | 'timestamp'>>({ amount: 0, type: 'EXPENSE', category: 'Food', date: new Date().toISOString().split('T')[0] });
  const [isAddingOther, setIsAddingOther] = useState(false);
  const [otherCat, setOtherCat] = useState('');
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  const symbol = CURRENCY_SYMBOLS[currency as CurrencyType] || '$';
  const totalBalance = useMemo(() => wallets.reduce((acc: number, w: any) => acc + w.balance, 0), [wallets]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t: any) => {
      const d = new Date(t.date);
      return d.getMonth() === selectedMonth.getMonth() && d.getFullYear() === selectedMonth.getFullYear();
    });
  }, [transactions, selectedMonth]);

  const monthlyIn = filteredTransactions.filter((t:any) => t.type === 'INCOME').reduce((a:number, b:any) => a + b.amount, 0);
  const monthlyOut = filteredTransactions.filter((t:any) => t.type === 'EXPENSE').reduce((a:number, b:any) => a + b.amount, 0);

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredTransactions.filter((t: any) => t.type === 'EXPENSE').forEach((t: any) => {
      counts[t.category] = (counts[t.category] || 0) + t.amount;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredTransactions]);

  const COLORS = ['#FFFFFF', '#888888', '#444444', '#BBBBBB', '#666666'];

  const handleSave = (t: any) => {
    if (t.amount <= 0) return;
    let finalCat = t.category;
    if (t.category === 'Other') {
       if (!otherCat) return;
       finalCat = otherCat;
       setCustomCategories((p: any) => Array.from(new Set([...p, otherCat])));
    }
    
    if (editingT) {
      const oldT = editingT;
      setTransactions((p:any) => p.map((x:any) => x.id === oldT.id ? { ...t, category: finalCat, id: oldT.id, timestamp: oldT.timestamp } : x));
      setWallets((p:any) => p.map((w:any) => {
        let bal = w.balance;
        bal = oldT.type === 'INCOME' ? bal - oldT.amount : bal + oldT.amount;
        bal = t.type === 'INCOME' ? bal + t.amount : bal - t.amount;
        return { ...w, balance: bal };
      }));
      setEditingT(null);
    } else {
      setTransactions((p:any) => [...p, { ...t, category: finalCat, id: Math.random().toString(36).substr(2, 9), timestamp: Date.now() }]);
      setWallets((p:any) => p.map((w:any) => ({ ...w, balance: t.type === 'INCOME' ? w.balance + t.amount : w.balance - t.amount })));
      setShowAdd(false);
    }
    setIsAddingOther(false); setOtherCat('');
  };

  return (
    <div className="p-5 space-y-6 animate-in fade-in duration-300">
      <div className="bg-white text-black p-10 rounded-[48px] shadow-2xl relative overflow-hidden h-[28vh] flex flex-col justify-center">
        <div className="flex justify-between items-start">
          <span className="text-[8px] font-black uppercase tracking-[0.4em] opacity-30">Liquidity Index</span>
          <select 
            value={currency} 
            onChange={(e) => setCurrency(e.target.value)} 
            className="text-[10px] font-black border-none outline-none bg-black/5 px-2 py-1 rounded-lg uppercase tracking-widest cursor-pointer"
          >
            {['USD', 'JPY', 'EUR', 'AED', 'INR'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <h2 className="text-4xl font-black tracking-tighter mt-2 leading-none">{symbol}{totalBalance.toLocaleString()}</h2>
        <div className="flex gap-4 mt-6">
          <div className="bg-black/5 p-3 rounded-2xl flex-1"><p className="text-[6px] font-black uppercase opacity-40">Monthly In</p><p className="text-xs font-black">+{symbol}{monthlyIn.toLocaleString()}</p></div>
          <div className="bg-black/5 p-3 rounded-2xl flex-1"><p className="text-[6px] font-black uppercase opacity-40">Monthly Out</p><p className="text-xs font-black">-{symbol}{monthlyOut.toLocaleString()}</p></div>
        </div>
        <button onClick={() => setShowAnalytics(!showAnalytics)} className="absolute bottom-6 right-8 text-black/20 hover:text-black"><PieIcon size={24} /></button>
        <div className="absolute -right-8 -bottom-8 opacity-5 rotate-12 pointer-events-none"><WalletIcon size={160} /></div>
      </div>

      {showAnalytics && categoryData.length > 0 && (
        <div className="p-8 bg-white/5 border border-white/5 rounded-[40px] space-y-4 animate-in slide-in-from-top duration-300">
          <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-center">Expense Allocation</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '16px', fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between bg-white/5 p-4 rounded-3xl border border-white/5">
        <button onClick={() => { const d = new Date(selectedMonth); d.setMonth(d.getMonth() - 1); setSelectedMonth(d); }} className="p-2 text-gray-500 active:text-white"><ChevronLeft size={18} /></button>
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">{selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
        <button onClick={() => { const d = new Date(selectedMonth); d.setMonth(d.getMonth() + 1); setSelectedMonth(d); }} className="p-2 text-gray-500 active:text-white"><ChevronRight size={18} /></button>
      </div>

      <button onClick={() => { setNewT({ amount: 0, type: 'EXPENSE', category: 'Food', date: new Date().toISOString().split('T')[0] }); setShowAdd(true); }} className="w-full py-6 bg-white text-black rounded-[32px] font-black uppercase text-[10px] tracking-[0.4em] shadow-2xl active:scale-95 transition-all">New Registry Entry</button>
      
      {(showAdd || editingT) && (
        <div className="fixed inset-0 bg-black/98 z-[300] flex items-center justify-center backdrop-blur-md p-6 overflow-y-auto">
          <div className="w-full max-w-lg bg-[#050505] rounded-[56px] p-10 space-y-8 border border-white/10 shadow-2xl my-auto">
            <div className="flex justify-between items-center"><h2 className="text-xl font-black uppercase tracking-[0.3em]">{editingT ? 'Modify Entry' : 'Wealth Audit'}</h2><button onClick={() => { setShowAdd(false); setEditingT(null); }} className="text-gray-700 font-black text-[9px]">EXIT</button></div>
            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
              <button onClick={() => editingT ? setEditingT({...editingT, type: 'EXPENSE'}) : setNewT({...newT, type: 'EXPENSE'})} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${(editingT ? editingT.type : newT.type) === 'EXPENSE' ? 'bg-white text-black' : 'text-gray-500'}`}>EXPENSE</button>
              <button onClick={() => editingT ? setEditingT({...editingT, type: 'INCOME'}) : setNewT({...newT, type: 'INCOME'})} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${(editingT ? editingT.type : newT.type) === 'INCOME' ? 'bg-white text-black' : 'text-gray-500'}`}>INCOME</button>
            </div>
            <div className="flex items-center justify-center text-6xl font-black text-white border-b-4 border-white/5 pb-6">
              <span>{symbol}</span>
              <input type="number" placeholder="0.00" className="w-full bg-transparent text-center focus:outline-none focus:border-white transition-all" autoFocus value={editingT ? editingT.amount : newT.amount} onChange={e => editingT ? setEditingT({...editingT, amount: parseFloat(e.target.value) || 0}) : setNewT({...newT, amount: parseFloat(e.target.value) || 0})} />
            </div>
            <div className="space-y-4">
              <label className="text-[8px] font-black uppercase tracking-widest text-gray-500">Registry Date</label>
              <input type="date" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-xs font-black uppercase focus:outline-none" value={editingT ? editingT.date : newT.date} onChange={e => editingT ? setEditingT({...editingT, date: e.target.value}) : setNewT({...newT, date: e.target.value})} />
            </div>
            <div className="space-y-4">
              <label className="text-[8px] font-black uppercase tracking-widest text-gray-500">Category</label>
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(['Food', 'Travel', 'Transportation', 'Bills', 'Entertainment', ...customCategories, 'Other'])).map(cat => (
                  <button key={cat} onClick={() => { editingT ? setEditingT({...editingT, category: cat}) : setNewT({...newT, category: cat}); setIsAddingOther(cat === 'Other'); }} className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${(editingT ? editingT.category : newT.category) === cat ? 'bg-white text-black' : 'bg-white/5 text-gray-500 border border-white/5'}`}>{cat}</button>
                ))}
              </div>
              {isAddingOther && <input type="text" placeholder="CUSTOM CATEGORY NAME..." className="w-full bg-transparent border-b border-white/10 py-2 text-xs font-black uppercase focus:outline-none" value={otherCat} onChange={e => setOtherCat(e.target.value)} />}
            </div>
            <button onClick={() => handleSave(editingT || newT)} className="w-full bg-white text-black py-7 rounded-[32px] font-black uppercase text-base active:scale-95 transition-all">Submit Entry</button>
          </div>
        </div>
      )}

      <div className="space-y-4 pb-24">
        {filteredTransactions.slice().sort((a: any, b: any) => b.timestamp - a.timestamp).map((t: any) => (
          <div key={t.id} className="flex items-center justify-between p-6 bg-white/5 border border-white/5 rounded-[40px] shadow-lg group" onClick={() => setEditingT(t)}>
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-[20px] bg-white text-black flex items-center justify-center transition-all group-active:scale-90">{t.type === 'INCOME' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}</div>
              <div><h4 className="font-black text-[10px] uppercase tracking-[0.1em]">{t.category}</h4><p className="text-[7px] text-gray-800 uppercase mt-0.5 font-black">{new Date(t.date).toLocaleDateString()}</p></div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`font-black text-xl tracking-tighter ${t.type === 'INCOME' ? 'text-green-500' : 'text-white'}`}>{t.type === 'INCOME' ? '+' : '-'}{symbol}{t.amount.toLocaleString()}</span>
              <button onClick={(e) => { e.stopPropagation(); setTransactions((p: any) => p.filter((x: any) => x.id !== t.id)); setWallets((p: any) => p.map((w: any) => ({ ...w, balance: t.type === 'INCOME' ? w.balance - t.amount : w.balance + t.amount }))); }} className="text-gray-900 group-hover:text-red-500 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {filteredTransactions.length === 0 && <div className="py-20 text-center text-gray-800 uppercase tracking-widest text-[9px] font-black italic">No records for this period</div>}
      </div>
    </div>
  );
};

// --- APP CORE ---
const App = () => {
  const [activeTab, setActiveTab] = usePersistentState('monolith_active_tab', 'calendar');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [backPressTime, setBackPressTime] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [currency, setCurrency] = usePersistentState<string>('monolith_currency', 'USD');
  
  // Persistent States
  const [events, setEvents] = usePersistentState<CalendarEvent[]>('monolith_events', []);
  const [tasks, setTasks] = usePersistentState<Task[]>('monolith_tasks', []);
  const [learning, setLearning] = usePersistentState<LearningItem[]>('monolith_learning', []);
  const [transactions, setTransactions] = usePersistentState<Transaction[]>('monolith_transactions', []);
  const [wallets, setWallets] = usePersistentState('monolith_wallets', [{ id: '1', name: 'Main', balance: 0 }]);
  const [passwords, setPasswords] = usePersistentState<PasswordEntry[]>('monolith_passwords', []);
  const [wishlist, setWishlist] = usePersistentState<WishlistItem[]>('monolith_wishlist', []);
  const [resources, setResources] = usePersistentState<ResourceItem[]>('monolith_resources', []);
  const [folders, setFolders] = usePersistentState<FolderType[]>('monolith_folders', []);
  const [financeCategories, setFinanceCategories] = usePersistentState<string[]>('monolith_fin_cats', []);
  const [customWishlistCats, setCustomWishlistCats] = usePersistentState<string[]>('monolith_wish_cats', ['Tech', 'Fashion', 'Home', 'Books']);

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (isMenuOpen) {
        setIsMenuOpen(false);
        window.history.pushState(null, document.title, window.location.href);
        return;
      }

      const now = Date.now();
      if (now - backPressTime < 2000) {
        setToast("EXITING MONOLITH...");
        setTimeout(() => { window.close(); }, 300);
      } else {
        setBackPressTime(now);
        setToast("PRESS BACK AGAIN TO EXIT");
        setTimeout(() => setToast(null), 2000);
        window.history.pushState(null, document.title, window.location.href);
      }
    };

    window.history.pushState(null, document.title, window.location.href);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [backPressTime, isMenuOpen]);

  const handleMenuNavigation = (tab: string) => {
    setActiveTab(tab);
    setIsMenuOpen(false);
  };

  return (
    <div className="flex flex-col h-screen w-full max-w-lg mx-auto bg-black overflow-hidden relative border-x border-white/5 text-white">
      <header className="h-[14vh] px-8 border-b border-white/5 flex justify-between items-end bg-black/95 backdrop-blur-3xl sticky top-0 z-[150] pb-5" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div onClick={() => setActiveTab('calendar')} className="active:scale-95 transition-transform cursor-pointer">
          <h1 className="text-3xl font-black tracking-tighter uppercase leading-none">Monolith</h1>
          <p className="text-[8px] text-gray-800 mt-1 uppercase tracking-[0.8em] font-black leading-none">Life OS v1.7.0</p>
        </div>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-white/5 active:scale-90 active:bg-white active:text-black transition-all">
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {toast && (
        <div className="fixed bottom-[18vh] left-1/2 -translate-x-1/2 z-[1000] bg-white text-black px-6 py-3 rounded-full font-black uppercase text-[10px] tracking-widest shadow-2xl animate-in fade-in zoom-in duration-300 pointer-events-none">
           {toast}
        </div>
      )}

      <div className={`fixed inset-0 z-[200] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
         <div className="absolute inset-0 bg-black/90 backdrop-blur-3xl" onClick={() => setIsMenuOpen(false)}></div>
         <div className={`absolute right-0 top-0 h-full w-[300px] bg-black border-l border-white/10 p-10 pt-32 flex flex-col transition-transform duration-500 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="space-y-4 flex-1">
              <h3 className="text-[9px] font-black uppercase tracking-[0.8em] text-gray-800 mb-12 px-2">Sub-Systems</h3>
              <MenuBtn onClick={() => handleMenuNavigation('keys')} label="Vault" icon={<Shield size={14} />} />
              <MenuBtn onClick={() => handleMenuNavigation('learning')} label="Learning" icon={<BookOpen size={14} />} />
              <MenuBtn onClick={() => handleMenuNavigation('resources')} label="Archives" icon={<Archive size={14} />} />
              <MenuBtn onClick={() => handleMenuNavigation('wishlist')} label="Wishlist" icon={<Heart size={14} />} />
            </div>
            <div className="pb-10">
              <MenuBtn onClick={() => handleMenuNavigation('system')} label="System" icon={<SettingsIcon size={14} />} />
            </div>
         </div>
      </div>

      <main className="flex-1 overflow-hidden relative">
        <div className="h-full scroll-container">
          {activeTab === 'calendar' && <CalendarModule events={events} setEvents={setEvents} tasks={tasks} setTasks={setTasks} />}
          {activeTab === 'tasks' && <TasksModule tasks={tasks} setTasks={setTasks} />}
          {activeTab === 'learning' && <LearningModule items={learning} setItems={setLearning} />}
          {activeTab === 'finance' && <FinanceModule transactions={transactions} wallets={wallets} setTransactions={setTransactions} setWallets={setWallets} customCategories={financeCategories} setCustomCategories={setFinanceCategories} currency={currency} setCurrency={setCurrency} />}
          {activeTab === 'keys' && <PasswordManagerModule passwords={passwords} setPasswords={setPasswords} />}
          {activeTab === 'system' && <SettingsModule />}
          {activeTab === 'wishlist' && (
            <WishlistModule 
              items={wishlist} 
              onAdd={(i: any) => setWishlist(p => [...p, {...i, id: Math.random().toString(36).substr(2,9)}])} 
              onDelete={(id: string) => setWishlist(p => p.filter(x => x.id !== id))} 
              customCategories={customWishlistCats}
              onAddCategory={(cat: string) => setCustomWishlistCats(p => Array.from(new Set([...p, cat])))}
              onDeleteCategory={(cat: string) => setCustomWishlistCats(p => p.filter(x => x !== cat))}
            />
          )}
          {activeTab === 'resources' && <ResourcesModule resources={resources} setResources={setResources} folders={folders} setFolders={setFolders} />}
        </div>
      </main>

      <nav className="h-[14vh] bg-black/95 backdrop-blur-3xl border-t border-white/5 flex items-center justify-around px-10 z-[100]" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <NavBtn active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} icon={<CalendarIcon size={24} />} label="Life" />
        <NavBtn active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} icon={<CheckSquare size={24} />} label="Queue" />
        <NavBtn active={activeTab === 'finance'} onClick={() => setActiveTab('finance')} icon={<WalletIcon size={24} />} label="Wealth" />
      </nav>
    </div>
  );
};

const MenuBtn = ({ onClick, label, icon }: any) => (
  <button onClick={onClick} className="w-full text-left p-6 rounded-[32px] bg-white/5 text-[9px] font-black uppercase tracking-[0.4em] border border-white/5 active:bg-white active:text-black transition-all flex justify-between items-center group shadow-xl">
    {label} {icon}
  </button>
);

const NavBtn = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1.5 flex-1 py-2 transition-all active:scale-95 ${active ? 'text-white' : 'text-gray-800'}`}>
    <div className={`p-4 rounded-[28px] transition-all border ${active ? 'bg-white/10 border-white/10 shadow-lg' : 'border-transparent'}`}>{icon}</div>
    <span className="text-[8px] uppercase font-black tracking-[0.3em]">{label}</span>
  </button>
);

const rootEl = document.getElementById('root');
if (rootEl) createRoot(rootEl).render(<App />);
