import React, { useState, useMemo } from 'react';
import { WishlistItem } from '../types';
import { Plus, Trash2, ExternalLink, X, Package } from 'lucide-react';

interface Props {
  items: WishlistItem[];
  onAdd: (item: Omit<WishlistItem, 'id'>) => void;
  onDelete: (id: string) => void;
  customCategories: string[];
  onAddCategory: (cat: string) => void;
  onDeleteCategory: (cat: string) => void;
}

// Logical grouping function for similar categories
const getUnifiedCategory = (cat: string) => {
  const c = cat.toLowerCase();
  if (['tech', 'electronics', 'gadget', 'computer', 'mobile'].some(kw => c.includes(kw))) return 'Tech';
  if (['fashion', 'wear', 'clothing', 'shoes', 'accessory'].some(kw => c.includes(kw))) return 'Fashion';
  if (['home', 'living', 'furniture', 'decor'].some(kw => c.includes(kw))) return 'Home';
  if (['book', 'reading', 'education', 'learning'].some(kw => c.includes(kw))) return 'Books';
  return cat;
};

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

  // Grouped items logic
  const groupedItems = useMemo(() => {
    const groups: { [key: string]: WishlistItem[] } = {};
    items.forEach(item => {
      const group = getUnifiedCategory(item.category);
      if (!groups[group]) groups[group] = [];
      groups[group].push(item);
    });
    return groups;
  }, [items]);

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
                // Image removed as per requirement
                onAdd({ ...newItem, image: '' });
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

      <div className="space-y-8 pb-12">
        {Object.keys(groupedItems).length === 0 ? (
          <div className="text-center py-32 text-gray-700 uppercase tracking-widest text-[10px] font-black italic">
            Quiet Desires.
          </div>
        ) : (
          Object.entries(groupedItems).map(([group, groupItems]) => (
            <div key={group} className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 border-l-2 border-white pl-3">{group}</h3>
              <div className="grid grid-cols-1 gap-3">
                {/* Fixed: Added explicit type casting for groupItems to resolve 'unknown' type error in map function */}
                {(groupItems as WishlistItem[]).map((item) => (
                  <div key={item.id} className="p-5 bg-white/5 border border-white/5 rounded-[24px] flex items-center justify-between hover:border-white/20 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500">
                        <Package size={16} />
                      </div>
                      <div>
                        <h4 className="font-black text-xs tracking-widest uppercase leading-tight">{item.name}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-black text-gray-500">${item.price || '??'}</span>
                          <span className="text-[8px] font-bold text-gray-700 uppercase tracking-widest">{item.category}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.link && (
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 text-gray-400 rounded-full hover:bg-white hover:text-black transition-all">
                          <ExternalLink size={14} />
                        </a>
                      )}
                      <button 
                        onClick={() => onDelete(item.id)}
                        className="p-3 bg-white/5 text-gray-400 rounded-full hover:bg-red-500 hover:text-white transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WishlistModule;