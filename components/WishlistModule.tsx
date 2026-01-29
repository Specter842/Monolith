
import React, { useState } from 'react';
import { WishlistItem } from '../types';
import { Plus, Trash2, ExternalLink, X } from 'lucide-react';

interface Props {
  items: WishlistItem[];
  onAdd: (item: Omit<WishlistItem, 'id'>) => void;
  onDelete: (id: string) => void;
  customCategories: string[];
  onAddCategory: (cat: string) => void;
  onDeleteCategory: (cat: string) => void;
}

const WishlistModule: React.FC<Props> = ({ items, onDelete, onAdd, customCategories, onAddCategory, onDeleteCategory }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [isAddingOther, setIsAddingOther] = useState(false);
  const [otherCategoryName, setOtherCategoryName] = useState('');
  const [newItem, setNewItem] = useState({ 
    name: '', 
    link: '', 
    category: customCategories[0] || 'Other', 
    price: 0 
  });

  const handleAddCategory = () => {
    if (otherCategoryName.trim()) {
      onAddCategory(otherCategoryName.trim());
      setNewItem({ ...newItem, category: otherCategoryName.trim() });
      setOtherCategoryName('');
      setIsAddingOther(false);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-black min-h-full">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black uppercase tracking-tighter">Wishlist</h2>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="bg-white text-black px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-transform"
        >
          {showAdd ? 'Close' : 'Add Item'}
        </button>
      </div>

      {showAdd && (
        <div className="p-6 bg-white/5 border border-white/10 rounded-[32px] space-y-6 animate-in slide-in-from-top-2">
          <input 
            type="text" 
            placeholder="Product name" 
            className="w-full text-xl font-bold bg-transparent border-b border-white/10 py-2 focus:outline-none focus:border-white transition-colors"
            value={newItem.name}
            onChange={(e) => setNewItem({...newItem, name: e.target.value})}
          />
          <div className="flex gap-4">
            <input 
              type="text" 
              placeholder="Link URL" 
              className="flex-1 text-xs bg-transparent border-b border-white/10 py-2 focus:outline-none focus:border-white transition-colors"
              value={newItem.link}
              onChange={(e) => setNewItem({...newItem, link: e.target.value})}
            />
            <input 
              type="number" 
              placeholder="Price" 
              className="w-24 text-xs bg-transparent border-b border-white/10 py-2 focus:outline-none focus:border-white transition-colors"
              onChange={(e) => setNewItem({...newItem, price: parseFloat(e.target.value)})}
            />
          </div>

          <div>
            <label className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-500 block mb-3">Category</label>
            <div className="flex flex-wrap gap-2">
              {customCategories.map(cat => (
                <div key={cat} className="relative group">
                  <button 
                    key={cat}
                    onClick={() => setNewItem({...newItem, category: cat})}
                    className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${newItem.category === cat ? 'bg-white text-black border-white' : 'border-white/10 text-gray-500'}`}
                  >
                    {cat}
                  </button>
                  <button 
                    onClick={() => onDeleteCategory(cat)}
                    className="absolute -top-1 -right-1 bg-white text-black rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={8} />
                  </button>
                </div>
              ))}
              <button 
                onClick={() => setIsAddingOther(true)}
                className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-dashed border-white/20 text-gray-500 hover:text-white transition-all`}
              >
                + Other
              </button>
            </div>

            {isAddingOther && (
              <div className="mt-4 p-4 bg-black border border-white/10 rounded-2xl space-y-3">
                <input 
                  type="text" 
                  placeholder="New Category..." 
                  className="w-full bg-transparent border-b border-white/20 text-xs py-2 focus:outline-none"
                  value={otherCategoryName}
                  onChange={e => setOtherCategoryName(e.target.value)}
                />
                <div className="flex gap-2">
                  <button onClick={handleAddCategory} className="flex-1 bg-white text-black py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest">Save</button>
                  <button onClick={() => setIsAddingOther(false)} className="flex-1 bg-white/5 text-white py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest">X</button>
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={() => {
              if (newItem.name) {
                onAdd({ ...newItem, image: `https://picsum.photos/seed/${newItem.name}/400/500` });
                setShowAdd(false);
                setNewItem({ name: '', link: '', category: customCategories[0] || 'Other', price: 0 });
              }
            }}
            className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase text-xs tracking-widest"
          >
            Save to List
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 pb-12">
        {items.length === 0 ? (
          <div className="col-span-2 text-center py-32 text-gray-700 uppercase tracking-widest text-[10px] font-black italic">
            Quiet Desires.
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="group relative bg-white/5 border border-white/5 rounded-[32px] overflow-hidden hover:border-white/20 transition-all">
              <div className="aspect-[3/4] bg-gray-900 relative overflow-hidden">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
                <div className="absolute top-4 left-4">
                   <span className="bg-black/80 backdrop-blur-md px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest text-white">
                    {item.category}
                   </span>
                </div>
                <button 
                  onClick={() => onDelete(item.id)}
                  className="absolute top-4 right-4 p-2 bg-black/80 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={12} />
                </button>
              </div>
              <div className="p-5 space-y-2 bg-black">
                <h3 className="font-black text-[10px] tracking-widest uppercase leading-tight line-clamp-1">{item.name}</h3>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-gray-400">${item.price || '??'}</span>
                  {item.link && (
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="p-2 bg-white text-black rounded-full transition-transform hover:scale-110">
                      <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WishlistModule;
