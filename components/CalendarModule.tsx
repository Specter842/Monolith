
import React, { useState } from 'react';
import { CalendarEvent, RepeatType } from '../types';
// Fixed: Added missing CheckSquare import from lucide-react to fix line 125 error
import { Plus, Copy, Trash2, ChevronLeft, ChevronRight, MapPin, Bell, RefreshCw, Download, CheckSquare } from 'lucide-react';

interface Props {
  events: CalendarEvent[];
  setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
  onAdd: (event: Omit<CalendarEvent, 'id'>) => void;
}

type ViewMode = 'day' | 'week' | 'month' | 'year';

const CalendarModule: React.FC<Props> = ({ events, setEvents, onAdd }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEvent, setNewEvent] = useState<Omit<CalendarEvent, 'id'>>({ 
    title: '', 
    startTime: '09:00', 
    endTime: '10:00', 
    date: selectedDate,
    location: '',
    repeat: 'NONE',
    notificationMinutes: 10
  });

  const dayEvents = events.filter(e => e.date === selectedDate).sort((a, b) => a.startTime.localeCompare(b.startTime));

  const handleImport = () => {
    alert("Integration with Google/iCal requested. Authenticating...");
  };

  const handleCopyDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDayStr = nextDay.toISOString().split('T')[0];
    const duplicated = dayEvents.map(e => ({ ...e, id: Math.random().toString(36).substr(2, 9), date: nextDayStr }));
    setEvents(prev => [...prev, ...duplicated]);
  };

  return (
    <div className="p-6 space-y-6 bg-black min-h-full">
      {/* View & Import Controls */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-1 bg-white/5 p-1 rounded-xl">
            {(['day', 'week', 'month', 'year'] as ViewMode[]).map(v => (
              <button 
                key={v}
                onClick={() => setViewMode(v)}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === v ? 'bg-white text-black' : 'text-gray-500'}`}
              >
                {v}
              </button>
            ))}
          </div>
          <button onClick={handleImport} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors">
            <Download size={14} /> Import
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() - (viewMode === 'day' ? 1 : 7));
              setSelectedDate(d.toISOString().split('T')[0]);
            }} className="text-gray-500 hover:text-white"><ChevronLeft size={20} /></button>
            <div className="text-left">
              <h2 className="text-xl font-black tracking-tighter uppercase leading-none">{new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</h2>
              <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' })}</p>
            </div>
            <button onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() + (viewMode === 'day' ? 1 : 7));
              setSelectedDate(d.toISOString().split('T')[0]);
            }} className="text-gray-500 hover:text-white"><ChevronRight size={20} /></button>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCopyDay} className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"><Copy size={16} /></button>
            <button onClick={() => setEvents(prev => prev.filter(e => e.date !== selectedDate))} className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"><Trash2 size={16} /></button>
          </div>
        </div>
      </div>

      {/* Main View Render */}
      <div className="space-y-4">
        {viewMode === 'day' ? (
          dayEvents.length === 0 ? (
            <div className="py-20 text-center text-gray-600 italic font-light text-sm uppercase tracking-widest">Quiet Day Ahead</div>
          ) : (
            <div className="space-y-4 border-l border-white/10 ml-2 pl-6">
              {dayEvents.map(event => (
                <div key={event.id} className="relative group bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="absolute -left-[30px] top-4 w-2 h-2 rounded-full bg-white ring-4 ring-black"></div>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{event.startTime} — {event.endTime}</span>
                      <h3 className="text-lg font-bold uppercase tracking-tight text-white">{event.title}</h3>
                      {event.location && (
                        <div className="flex items-center gap-1 text-[9px] text-gray-500 uppercase">
                          <MapPin size={10} /> {event.location}
                        </div>
                      )}
                    </div>
                    <button onClick={() => setEvents(prev => prev.filter(e => e.id !== event.id))} className="text-gray-700 hover:text-white transition-colors"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="py-20 text-center text-gray-600 uppercase tracking-widest text-[10px] font-black">{viewMode} View Placeholder</div>
        )}
      </div>

      {/* Split Add Buttons */}
      {!showAddForm ? (
        <div className="flex gap-2 pt-4">
          <button onClick={() => setShowAddForm(true)} className="flex-1 py-4 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2">
            <Plus size={16} /> Event
          </button>
          <button className="flex-1 py-4 border border-white/20 text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2">
            <CheckSquare size={16} /> Task
          </button>
        </div>
      ) : (
        <div className="p-6 bg-[#111] rounded-[32px] space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-300">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-black uppercase tracking-widest">New Event</h3>
            <button onClick={() => setShowAddForm(false)} className="text-gray-500">Close</button>
          </div>
          
          <input 
            type="text" 
            placeholder="Event Title" 
            className="w-full bg-transparent border-b border-white/10 py-2 text-xl font-bold focus:outline-none focus:border-white transition-colors"
            onChange={e => setNewEvent({...newEvent, title: e.target.value})}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[8px] uppercase tracking-widest text-gray-500 block mb-1">Start</label>
              <input type="time" className="w-full bg-white/5 rounded-xl p-3 text-sm" value={newEvent.startTime} onChange={e => setNewEvent({...newEvent, startTime: e.target.value})} />
            </div>
            <div>
              <label className="text-[8px] uppercase tracking-widest text-gray-500 block mb-1">End</label>
              <input type="time" className="w-full bg-white/5 rounded-xl p-3 text-sm" value={newEvent.endTime} onChange={e => setNewEvent({...newEvent, endTime: e.target.value})} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl">
              <MapPin size={16} className="text-gray-500" />
              <input type="text" placeholder="Location" className="bg-transparent flex-1 text-xs focus:outline-none" onChange={e => setNewEvent({...newEvent, location: e.target.value})} />
            </div>
            <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl">
              <Bell size={16} className="text-gray-500" />
              <select className="bg-transparent flex-1 text-xs focus:outline-none" onChange={e => setNewEvent({...newEvent, notificationMinutes: parseInt(e.target.value)})}>
                <option value="10">10 mins before</option>
                <option value="30">30 mins before</option>
                <option value="60">1 hour before</option>
              </select>
            </div>
            <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl">
              <RefreshCw size={16} className="text-gray-500" />
              <select className="bg-transparent flex-1 text-xs focus:outline-none" onChange={e => setNewEvent({...newEvent, repeat: e.target.value as RepeatType})}>
                <option value="NONE">No Repeat</option>
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            </div>
          </div>

          <button 
            onClick={() => {
              if (newEvent.title) {
                onAdd({ ...newEvent, date: selectedDate });
                setShowAddForm(false);
              }
            }}
            className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase text-xs tracking-widest mt-2"
          >
            Create Event
          </button>
        </div>
      )}
    </div>
  );
};

export default CalendarModule;
