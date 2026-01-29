
import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  CheckSquare, 
  ShoppingBag, 
  Wallet as WalletIcon, 
  Briefcase, 
  Archive
} from 'lucide-react';
import { CalendarEvent, Task, WishlistItem, Transaction, Wallet, Project, ResourceItem, Folder } from './types';

// Sub-components
import CalendarModule from './components/CalendarModule';
import TasksModule from './components/TasksModule';
import WishlistModule from './components/WishlistModule';
import FinanceModule from './components/FinanceModule';
import ProjectsModule from './components/ProjectsModule';
import ResourcesModule from './components/ResourcesModule';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'calendar' | 'tasks' | 'projects' | 'finance' | 'resources' | 'wishlist'>('calendar');

  // App State
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([{ id: '1', name: 'Main', balance: 0 }]);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);

  // Category State
  const [financeCategories, setFinanceCategories] = useState<string[]>(['Food', 'Rent', 'Travel', 'Bills', 'Shopping']);
  const [wishlistCategories, setWishlistCategories] = useState<string[]>(['Fashion', 'Gadgets', 'Home', 'Books']);

  // Handlers
  const addEvent = (event: Omit<CalendarEvent, 'id'>) => {
    setEvents(prev => [...prev, { ...event, id: Math.random().toString(36).substr(2, 9) }]);
  };

  const addTask = (task: Omit<Task, 'id' | 'progress' | 'completed' | 'workedToday' | 'history'>) => {
    setTasks(prev => [...prev, {
      ...task,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0,
      completed: false,
      workedToday: false,
      history: []
    }]);
  };

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setTransactions(prev => [...prev, { ...t, id }]);
    setWallets(prev => prev.map(w => ({
      ...w,
      balance: t.type === 'INCOME' ? w.balance + t.amount : w.balance - t.amount
    })));
  };

  return (
    <div className="flex flex-col h-screen w-full max-w-lg mx-auto bg-black overflow-hidden relative border-x border-white/5 text-white selection:bg-white selection:text-black">
      {/* Header */}
      <header className="px-6 pt-10 pb-4 border-b border-white/5 flex justify-between items-end bg-black/90 backdrop-blur-md sticky top-0 z-50">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase leading-none">Monolith</h1>
          <p className="text-[9px] text-gray-500 mt-1 uppercase tracking-[0.4em] font-black opacity-70">Vault v1.0</p>
        </div>
        <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center font-black text-xs bg-white/5">
          {activeTab.slice(0, 1).toUpperCase()}
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto pb-32 bg-black scroll-smooth">
        {activeTab === 'calendar' && (
          <CalendarModule events={events} setEvents={setEvents} onAdd={addEvent} />
        )}
        {activeTab === 'tasks' && (
          <TasksModule tasks={tasks} setTasks={setTasks} onAdd={addTask} />
        )}
        {activeTab === 'projects' && (
          <ProjectsModule projects={projects} setProjects={setProjects} />
        )}
        {activeTab === 'finance' && (
          <FinanceModule 
            transactions={transactions} 
            wallets={wallets} 
            onAddTransaction={addTransaction}
            customCategories={financeCategories}
            onAddCategory={(cat) => setFinanceCategories(prev => [...prev, cat])}
            onDeleteCategory={(cat) => setFinanceCategories(prev => prev.filter(c => c !== cat))}
          />
        )}
        {activeTab === 'resources' && (
          <ResourcesModule resources={resources} setResources={setResources} folders={folders} setFolders={setFolders} />
        )}
        {activeTab === 'wishlist' && (
          <WishlistModule 
            items={wishlist} 
            onAdd={(i) => setWishlist(p => [...p, {...i, id: Math.random().toString(36).substr(2, 9)}])} 
            onDelete={(id) => setWishlist(prev => prev.filter(i => i.id !== id))} 
            customCategories={wishlistCategories}
            onAddCategory={(cat) => setWishlistCategories(prev => [...prev, cat])}
            onDeleteCategory={(cat) => setWishlistCategories(prev => prev.filter(c => c !== cat))}
          />
        )}
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-24 bg-black/80 backdrop-blur-xl border-t border-white/10 flex items-center justify-around px-4 z-[100] pb-6">
        <NavButton active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} icon={<CalendarIcon size={20} />} label="Life" />
        <NavButton active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} icon={<CheckSquare size={20} />} label="Queue" />
        <NavButton active={activeTab === 'projects'} onClick={() => setActiveTab('projects')} icon={<Briefcase size={20} />} label="Build" />
        <NavButton active={activeTab === 'finance'} onClick={() => setActiveTab('finance')} icon={<WalletIcon size={20} />} label="Wealth" />
        <NavButton active={activeTab === 'resources'} onClick={() => setActiveTab('resources')} icon={<Archive size={20} />} label="Vault" />
        <NavButton active={activeTab === 'wishlist'} onClick={() => setActiveTab('wishlist')} icon={<ShoppingBag size={20} />} label="Want" />
      </nav>
    </div>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-1.5 transition-all duration-300 flex-1 py-2 ${active ? 'text-white scale-110' : 'text-gray-600'}`}
  >
    <div className={`p-1.5 rounded-xl transition-colors ${active ? 'bg-white/10' : 'bg-transparent'}`}>
      {icon}
    </div>
    <span className="text-[7px] uppercase tracking-[0.2em] font-black">{label}</span>
  </button>
);

export default App;
