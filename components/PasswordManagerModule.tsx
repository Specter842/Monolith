import React, { useState } from 'react';
import { PasswordEntry } from '../types';
import { Shield, Copy, Eye, EyeOff, Search, Plus, Trash2, Check, Lock } from 'lucide-react';

interface Props {
  passwords: PasswordEntry[];
  setPasswords: React.Dispatch<React.SetStateAction<PasswordEntry[]>>;
}

const PasswordManagerModule: React.FC<Props> = ({ passwords, setPasswords }) => {
  const [isLocked, setIsLocked] = useState(true);
  const [inputKey, setInputKey] = useState('');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [visiblePassIds, setVisiblePassIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [newEntry, setNewEntry] = useState({ site: '', username: '', password: '', notes: '' });

  // Master Key updated to 42 as per requirement
  const CORRECT_KEY = "42"; 

  const handleUnlock = () => {
    if (inputKey === CORRECT_KEY) {
      setIsLocked(false);
    } else {
      alert("Invalid Master Key");
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleVisibility = (id: string) => {
    const next = new Set(visiblePassIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setVisiblePassIds(next);
  };

  const addEntry = () => {
    if (newEntry.site && newEntry.password) {
      setPasswords(prev => [...prev, { ...newEntry, id: Math.random().toString(36).substr(2, 9) }]);
      setNewEntry({ site: '', username: '', password: '', notes: '' });
      setShowAdd(false);
    }
  };

  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-6 animate-in fade-in">
        <div className="w-20 h-20 rounded-full border-2 border-white/20 flex items-center justify-center">
          <Lock size={32} className="text-white/40" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black uppercase tracking-tighter">Vault Locked</h2>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest leading-relaxed">Enter your master key to decrypt access</p>
        </div>
        <div className="w-full max-w-xs space-y-4">
          <input 
            type="password" 
            placeholder="MASTER KEY" 
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-center text-xl font-black tracking-[0.5em] focus:outline-none focus:border-white transition-all"
            value={inputKey}
            onChange={e => setInputKey(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleUnlock()}
          />
          <button 
            onClick={handleUnlock}
            className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase text-xs tracking-widest"
          >
            Decrypt Vault
          </button>
        </div>
      </div>
    );
  }

  const filtered = passwords.filter(p => 
    p.site.toLowerCase().includes(search.toLowerCase()) || 
    p.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 bg-black min-h-full pb-24 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Shield size={24} className="text-white" />
          <h2 className="text-2xl font-black uppercase tracking-tighter">Keys</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsLocked(true)} className="p-2 bg-white/5 text-gray-400 rounded-full"><Lock size={18} /></button>
          <button onClick={() => setShowAdd(!showAdd)} className="p-2 bg-white text-black rounded-full transition-transform"><Plus size={18} /></button>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
        <Search size={16} className="text-gray-500" />
        <input 
          type="text" 
          placeholder="SEARCH KEYS..." 
          className="bg-transparent flex-1 text-[10px] font-black uppercase tracking-[0.2em] focus:outline-none"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {showAdd && (
        <div className="p-6 bg-white/5 border border-white/10 rounded-[32px] space-y-4 animate-in fade-in zoom-in duration-200">
          <input type="text" placeholder="Platform / Website" className="w-full bg-transparent border-b border-white/10 py-2 text-lg font-bold focus:outline-none" value={newEntry.site} onChange={e => setNewEntry({...newEntry, site: e.target.value})} />
          <input type="text" placeholder="Username / Email" className="w-full bg-transparent border-b border-white/10 py-2 text-xs focus:outline-none" value={newEntry.username} onChange={e => setNewEntry({...newEntry, username: e.target.value})} />
          <div className="flex gap-2">
            <input type="text" placeholder="Password" className="flex-1 bg-transparent border-b border-white/10 py-2 text-xs focus:outline-none" value={newEntry.password} onChange={e => setNewEntry({...newEntry, password: e.target.value})} />
            <button onClick={() => setNewEntry({...newEntry, password: Math.random().toString(36).slice(-8)})} className="px-3 text-[8px] font-black uppercase tracking-widest text-gray-400">Generate</button>
          </div>
          <button onClick={addEntry} className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase text-xs tracking-widest">Encrypt & Store</button>
        </div>
      )}

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-gray-700 uppercase tracking-widest text-[10px] font-black italic">No records found.</div>
        ) : (
          filtered.map(entry => (
            <div key={entry.id} className="p-5 bg-white/5 border border-white/5 rounded-[32px] space-y-4 group">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-sm font-black uppercase tracking-widest leading-none">{entry.site}</h3>
                  <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{entry.username}</p>
                </div>
                <button onClick={() => setPasswords(p => p.filter(x => x.id !== entry.id))} className="text-gray-800 hover:text-white transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 bg-black rounded-xl border border-white/5 p-3 flex items-center justify-between overflow-hidden">
                   <code className="text-[10px] font-mono tracking-wider text-gray-300">
                     {visiblePassIds.has(entry.id) ? (entry.password || '') : '••••••••••••'}
                   </code>
                   <div className="flex gap-2">
                     <button onClick={() => toggleVisibility(entry.id)} className="text-gray-500 hover:text-white">
                        {visiblePassIds.has(entry.id) ? <EyeOff size={14} /> : <Eye size={14} />}
                     </button>
                     <button onClick={() => copyToClipboard(entry.password || '', entry.id)} className="text-gray-500 hover:text-white relative">
                        {copiedId === entry.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                     </button>
                   </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PasswordManagerModule;