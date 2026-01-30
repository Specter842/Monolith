import React, { useState } from 'react';
import { Transaction, Wallet } from '../types';
import { Plus, ArrowUpRight, ArrowDownLeft, TrendingUp, TrendingDown, Wallet as WalletIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface Props {
  transactions: Transaction[];
  wallets: Wallet[];
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
  customCategories: string[];
  onAddCategory: (cat: string) => void;
  onDeleteCategory: (cat: string) => void;
}

const FinanceModule: React.FC<Props> = ({ transactions, wallets, onAddTransaction, customCategories, onAddCategory, onDeleteCategory }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [isAddingOther, setIsAddingOther] = useState(false);
  const [otherCategoryName, setOtherCategoryName] = useState('');
  
  const [newT, setNewT] = useState({ 
    amount: 0, 
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE', 
    category: customCategories[0] || 'Other', 
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const monthYearLabel = selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const filteredTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === selectedMonth.getMonth() && d.getFullYear() === selectedMonth.getFullYear();
  });

  const changeMonth = (offset: number) => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() + offset);
    setSelectedMonth(newDate);
  };

  const totalBalance = wallets.reduce((acc: number, w: Wallet) => acc + w.balance, 0);
  const monthlyIn = filteredTransactions.filter(t => t.type === 'INCOME').reduce((a: number, b: Transaction) => a + b.amount, 0);
  const monthlyOut = filteredTransactions.filter(t => t.type === 'EXPENSE').reduce((a: number, b: Transaction) => a + b.amount, 0);

  const categoryData = customCategories.map(cat => ({
    name: cat,
    value: filteredTransactions.filter(t => t.category === cat && t.type === 'EXPENSE').reduce((acc: number, t: Transaction) => acc + t.amount, 0)
  })).filter(d => d.value > 0);

  const COLORS = ['#FFFFFF', '#888888', '#444444', '#BBBBBB', '#666666', '#333333'];

  const handleAddCategory = () => {
    if (otherCategoryName.trim()) {
      onAddCategory(otherCategoryName.trim());
      setNewT({ ...newT, category: otherCategoryName.trim() });
      setOtherCategoryName('');
      setIsAddingOther(false);
    }
  };

  return (
    <div className="p-6 space-y-8 bg-black">
      {/* Month Selector */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-colors">
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-sm font-black uppercase tracking-[0.3em]">{monthYearLabel}</h2>
        <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="bg-white text-black p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Vault Balance</span>
          <h2 className="text-4xl font-black tracking-tighter mt-1">${totalBalance.toLocaleString()}</h2>
          <div className="flex gap-4 mt-8">
            <div className="flex-1 bg-black/5 p-3 rounded-2xl border border-black/5">
              <p className="text-[8px] uppercase font-black opacity-40">Monthly In</p>
              <p className="text-sm font-black">+${monthlyIn.toLocaleString()}</p>
            </div>
            <div className="flex-1 bg-black/5 p-3 rounded-2xl border border-black/5">
              <p className="text-[8px] uppercase font-black opacity-40">Monthly Out</p>
              <p className="text-sm font-black">-${monthlyOut.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="absolute -right-4 -bottom-4 opacity-5 rotate-12">
          <WalletIcon size={120} />
        </div>
      </div>

      {categoryData.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Distribution</h3>
          <div className="h-64 w-full bg-white/5 rounded-[40px] p-4 border border-white/5 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '12px', fontSize: '10px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {categoryData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <button onClick={() => setShowAdd(true)} className="w-full py-5 bg-white text-black rounded-[32px] font-black uppercase text-xs tracking-widest hover:scale-[1.02] transition-transform">
        Log Transaction
      </button>

      {showAdd && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-end justify-center">
          <div className="w-full max-w-lg bg-[#111] rounded-t-[48px] p-8 space-y-6 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black uppercase tracking-tighter text-white">Entry</h2>
              <button onClick={() => {setShowAdd(false); setIsAddingOther(false);}} className="text-gray-500 uppercase font-black text-[10px] tracking-widest">Close</button>
            </div>
            
            <div className="flex bg-white/5 p-1 rounded-2xl">
              <button onClick={() => setNewT({...newT, type: 'EXPENSE'})} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${newT.type === 'EXPENSE' ? 'bg-white text-black shadow-lg' : 'text-gray-500'}`}>Expense</button>
              <button onClick={() => setNewT({...newT, type: 'INCOME'})} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${newT.type === 'INCOME' ? 'bg-white text-black shadow-lg' : 'text-gray-500'}`}>Income</button>
            </div>

            <div className="space-y-6">
              <div className="flex items-end gap-2 border-b-2 border-white/10 pb-4">
                <span className="text-3xl font-black text-white">$</span>
                <input type="number" placeholder="0.00" className="w-full text-5xl font-black focus:outline-none bg-transparent text-white" autoFocus onChange={e => setNewT({...newT, amount: parseFloat(e.target.value) || 0})} />
              </div>

              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 block mb-2">Transaction Date</label>
                <input 
                  type="date" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-white transition-colors"
                  value={newT.date}
                  onChange={e => setNewT({...newT, date: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 block mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                  {customCategories.map(cat => (
                    <div key={cat} className="relative group">
                      <button 
                        onClick={() => setNewT({...newT, category: cat})} 
                        className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${newT.category === cat ? 'bg-white text-black border-white' : 'border-white/10 text-gray-500'}`}
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
                    className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border border-dashed border-white/20 text-gray-500 hover:text-white transition-all`}
                  >
                    + Other
                  </button>
                </div>
              </div>

              {isAddingOther && (
                <div className="p-4 bg-white/5 rounded-3xl space-y-3 animate-in fade-in zoom-in duration-200">
                  <input 
                    type="text" 
                    placeholder="Category Name" 
                    className="w-full bg-transparent border-b border-white/20 text-sm py-2 focus:outline-none focus:border-white"
                    value={otherCategoryName}
                    onChange={e => setOtherCategoryName(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button onClick={handleAddCategory} className="flex-1 bg-white text-black py-2 rounded-xl text-[9px] font-black uppercase tracking-widest">Add</button>
                    <button onClick={() => setIsAddingOther(false)} className="flex-1 bg-white/10 text-white py-2 rounded-xl text-[9px] font-black uppercase tracking-widest">Cancel</button>
                  </div>
                </div>
              )}

              <button 
                onClick={() => { if (newT.amount > 0) { onAddTransaction({...newT, timestamp: new Date(newT.date).getTime()}); setShowAdd(false); } }} 
                className="w-full bg-white text-black py-5 rounded-[24px] font-black uppercase text-sm tracking-[0.2em] shadow-xl"
              >
                Save Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">History: {monthYearLabel}</h3>
        <div className="space-y-3 pb-12">
          {filteredTransactions.length === 0 ? (
            <p className="text-center py-10 text-gray-700 font-light italic text-xs uppercase tracking-widest">Clean ledger.</p>
          ) : (
            filteredTransactions.slice().reverse().map((t) => (
              <div key={t.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${t.type === 'INCOME' ? 'bg-white text-black' : 'bg-black text-white border border-white/10'}`}>
                    {t.type === 'INCOME' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-[10px] tracking-widest uppercase leading-none">{t.category}</h4>
                    <p className="text-[8px] text-gray-500 mt-1 uppercase font-black">{new Date(t.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`font-black text-sm tracking-tighter ${t.type === 'INCOME' ? 'text-white' : 'text-gray-500'}`}>
                  {t.type === 'INCOME' ? '+' : '-'}${t.amount.toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FinanceModule;