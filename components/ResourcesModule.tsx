import React, { useState, useRef, useEffect } from 'react';
import { ResourceItem, Folder } from '../types';
import { Plus, Folder as FolderIcon, Link as LinkIcon, FileText, Trash2, Search, ChevronRight, Upload, Eye, X, Download } from 'lucide-react';

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
  const [previewItem, setPreviewItem] = useState<ResourceItem | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Added addFolder function to fix "Cannot find name 'addFolder'" error
  const addFolder = (name: string) => {
    if (!name.trim()) return;
    const folder: Folder = {
      id: Math.random().toString(36).substr(2, 9),
      name: name.trim()
    };
    setFolders(prev => [...prev, folder]);
    setShowAdd(false);
  };

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const item: ResourceItem = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        url: reader.result as string,
        type: 'FILE'
      };
      setResources(prev => [...prev, item]);
      setShowAdd(false);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (previewItem && (previewItem.url.startsWith('data:text/plain') || previewItem?.name.endsWith('.txt'))) {
      fetch(previewItem.url)
        .then(res => res.text())
        .then(setTextContent)
        .catch(() => setTextContent("Error loading text content."));
    } else {
      setTextContent(null);
    }
  }, [previewItem]);

  const renderPreview = () => {
    if (!previewItem) return null;
    const isImage = previewItem.url.match(/\.(jpg|jpeg|png|gif|webp)$|^data:image/i);
    const isPDF = previewItem.url.match(/\.pdf$/i) || previewItem.url.startsWith('data:application/pdf');

    return (
      <div className="fixed inset-0 bg-black/95 z-[500] flex flex-col animate-in fade-in">
        <header className="p-8 flex justify-between items-center border-b border-white/10">
          <div className="flex items-center gap-4 overflow-hidden">
            <div className="p-2 bg-white text-black rounded-lg shrink-0">
              {previewItem.type === 'LINK' ? <LinkIcon size={16} /> : <FileText size={16} />}
            </div>
            <h3 className="text-xs font-black uppercase tracking-widest truncate">{previewItem.name}</h3>
          </div>
          <div className="flex gap-4">
            <a href={previewItem.url} download={previewItem.name} className="p-3 bg-white/5 border border-white/10 rounded-full hover:bg-white hover:text-black">
              <Download size={18} />
            </a>
            <button onClick={() => setPreviewItem(null)} className="p-3 bg-white/5 border border-white/10 rounded-full hover:bg-white hover:text-black">
              <X size={18} />
            </button>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
          {isImage ? (
            <img src={previewItem.url} alt={previewItem.name} className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl" />
          ) : isPDF ? (
            <embed src={previewItem.url} type="application/pdf" className="w-full h-full rounded-2xl" />
          ) : textContent ? (
            <div className="w-full max-w-2xl bg-white/5 p-10 rounded-[40px] border border-white/10 font-mono text-[10px] whitespace-pre-wrap text-gray-300">
              {textContent}
            </div>
          ) : (
            <div className="bg-white/5 p-10 rounded-[40px] border border-white/10 text-center space-y-6 w-full max-w-lg">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto">
                <FileText size={40} className="text-gray-500" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Limited Preview</p>
              <div className="pt-4 flex gap-4">
                <button onClick={() => window.open(previewItem.url, '_blank')} className="flex-1 py-4 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest">Open Raw Asset</button>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6 bg-black min-h-full">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black uppercase tracking-tighter">Vault</h2>
        <div className="flex gap-2">
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
          <button onClick={() => fileInputRef.current?.click()} className="p-2 bg-white/5 border border-white/10 text-gray-400 rounded-full hover:bg-white hover:text-black transition-all">
            <Upload size={20} />
          </button>
          <button onClick={() => setShowAdd(true)} className="p-2 bg-white text-black rounded-full transition-transform">
            <Plus size={20} />
          </button>
        </div>
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
        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">Recent Assets</h3>
          {resources.length === 0 ? (
            <div className="py-20 text-center text-gray-700 uppercase tracking-widest text-[10px] font-black">Archive Empty</div>
          ) : (
            <div className="space-y-3 pb-24">
              {resources.map(r => (
                <div key={r.id} className="flex items-center justify-between p-4 bg-white/5 rounded-3xl border border-white/5 group hover:border-white/20 transition-all" onClick={() => setPreviewItem(r)}>
                  <div className="flex items-center gap-4 flex-1 overflow-hidden">
                    <div className="p-3 bg-white text-black rounded-2xl shrink-0">
                       {r.type === 'LINK' ? <LinkIcon size={16} /> : <FileText size={16} />}
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-bold text-xs uppercase tracking-tight truncate">{r.name}</h4>
                      <p className="text-[8px] text-gray-500 mt-1 uppercase font-black truncate">{r.url.startsWith('data:') ? 'Local Asset' : r.url}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={(e) => { e.stopPropagation(); setPreviewItem(r); }} className="p-2 text-gray-700 hover:text-white transition-opacity">
                      <Eye size={16} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setResources(prev => prev.filter(i => i.id !== r.id)); }} className="p-2 text-gray-700 hover:text-red-500 transition-opacity">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {renderPreview()}
    </div>
  );
};

export default ResourcesModule;