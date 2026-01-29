
import React, { useState } from 'react';
import { ResourceItem, Folder } from '../types';
import { Plus, Folder as FolderIcon, Link as LinkIcon, FileText, Trash2, Search, ChevronRight } from 'lucide-react';

interface Props {
  resources: ResourceItem[];
  setResources: React.Dispatch<React.SetStateAction<ResourceItem[]>>;
  folders: Folder[];
  setFolders: React.Dispatch<React.SetStateAction<Folder[]>>;
}

const ResourcesModule: React.FC<Props> = ({ resources, setResources, folders, setFolders }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [addMode, setAddMode] = useState<'resource' | 'folder'>('resource');
  const [newItem, setNewItem] = useState({ name: '', url: '', type: 'LINK' as 'LINK' | 'FILE' });

  const addResource = () => {
    if (!newItem.name) return;
    const item: ResourceItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: newItem.name,
      url: newItem.url,
      type: newItem.type
    };
    setResources(prev => [...prev, item]);
    setShowAdd(false);
    setNewItem({ name: '', url: '', type: 'LINK' });
  };

  const addFolder = (name: string) => {
    if (!name) return;
    setFolders(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), name }]);
    setShowAdd(false);
  };

  return (
    <div className="p-6 space-y-6 bg-black min-h-full">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black uppercase tracking-tighter">Vault</h2>
        <button onClick={() => setShowAdd(true)} className="p-2 bg-white text-black rounded-full transition-transform">
          <Plus size={20} />
        </button>
      </div>

      <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
        <Search size={16} className="text-gray-500" />
        <input type="text" placeholder="SEARCH VAULT..." className="bg-transparent flex-1 text-[10px] font-black uppercase tracking-[0.2em] focus:outline-none" />
      </div>

      {showAdd && (
        <div className="p-6 bg-white/5 border border-white/10 rounded-[32px] space-y-4 animate-in fade-in zoom-in duration-200">
           <div className="flex gap-2 p-1 bg-white/5 rounded-xl mb-4">
              <button onClick={() => setAddMode('resource')} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest ${addMode === 'resource' ? 'bg-white text-black' : 'text-gray-500'}`}>Resource</button>
              <button onClick={() => setAddMode('folder')} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest ${addMode === 'folder' ? 'bg-white text-black' : 'text-gray-500'}`}>Folder</button>
           </div>

           {addMode === 'resource' ? (
             <div className="space-y-4">
                <input type="text" placeholder="Title..." className="w-full bg-transparent border-b border-white/10 py-2 text-lg font-bold focus:outline-none" onChange={e => setNewItem({...newItem, name: e.target.value})} />
                <input type="text" placeholder="URL or Path..." className="w-full bg-transparent border-b border-white/10 py-2 text-xs focus:outline-none" onChange={e => setNewItem({...newItem, url: e.target.value})} />
                <div className="flex gap-2">
                  <button onClick={() => setNewItem({...newItem, type: 'LINK'})} className={`flex-1 py-2 border rounded-lg text-[9px] font-black uppercase tracking-widest ${newItem.type === 'LINK' ? 'bg-white text-black border-white' : 'border-white/10 text-gray-500'}`}>Link</button>
                  <button onClick={() => setNewItem({...newItem, type: 'FILE'})} className={`flex-1 py-2 border rounded-lg text-[9px] font-black uppercase tracking-widest ${newItem.type === 'FILE' ? 'bg-white text-black border-white' : 'border-white/10 text-gray-500'}`}>File</button>
                </div>
                <button onClick={addResource} className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase text-xs tracking-widest">Store Asset</button>
             </div>
           ) : (
             <div className="space-y-4">
                <input type="text" placeholder="Folder Name..." className="w-full bg-transparent border-b border-white/10 py-2 text-lg font-bold focus:outline-none" id="folderNameInput" />
                <button onClick={() => addFolder((document.getElementById('folderNameInput') as HTMLInputElement).value)} className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase text-xs tracking-widest">Create Folder</button>
             </div>
           )}
        </div>
      )}

      <div className="space-y-8">
        {/* Folders Section */}
        {folders.length > 0 && (
          <div className="space-y-4">
             <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">Directories</h3>
             <div className="grid grid-cols-2 gap-3">
               {folders.map(f => (
                 <div key={f.id} className="p-5 bg-white/5 rounded-3xl border border-white/5 flex items-center gap-3 group hover:bg-white/10 transition-all">
                    <FolderIcon size={20} className="text-white" />
                    <span className="text-[10px] font-black uppercase tracking-tighter truncate">{f.name}</span>
                 </div>
               ))}
             </div>
          </div>
        )}

        {/* Resources List */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">Recent Assets</h3>
          {resources.length === 0 ? (
            <div className="py-20 text-center text-gray-700 uppercase tracking-widest text-[10px] font-black">Archive Empty</div>
          ) : (
            <div className="space-y-3">
              {resources.map(r => (
                <div key={r.id} className="flex items-center justify-between p-4 bg-white/5 rounded-3xl border border-white/5 group hover:border-white/20 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white text-black rounded-2xl">
                       {r.type === 'LINK' ? <LinkIcon size={16} /> : <FileText size={16} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs uppercase tracking-tight">{r.name}</h4>
                      <p className="text-[8px] text-gray-500 mt-1 uppercase font-black truncate max-w-[150px]">{r.url}</p>
                    </div>
                  </div>
                  <button onClick={() => setResources(prev => prev.filter(i => i.id !== r.id))} className="text-gray-700 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourcesModule;
