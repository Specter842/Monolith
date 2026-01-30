
import React from 'react';
import { Settings, User, Bell, Shield, Database, Trash2 } from 'lucide-react';

const SettingsModule: React.FC = () => {
  return (
    <div className="p-6 space-y-8 bg-black min-h-full pb-20">
      <div className="flex items-center gap-3">
        <Settings size={24} className="text-white" />
        <h2 className="text-2xl font-black uppercase tracking-tighter">System</h2>
      </div>

      <div className="space-y-1">
        <SettingItem icon={<User size={18} />} label="Identity Profile" value="Monolith User" />
        <SettingItem icon={<Bell size={18} />} label="Haptic Feedback" value="Enabled" />
        <SettingItem icon={<Shield size={18} />} label="Privacy Protocol" value="Encrypted" />
        <SettingItem icon={<Database size={18} />} label="Storage" value="842 KB Used" />
      </div>

      <div className="pt-8 space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">Danger Zone</h3>
        <button className="w-full flex items-center justify-between p-4 bg-red-500/5 border border-red-500/20 rounded-2xl text-red-500 hover:bg-red-500/10 transition-colors">
          <div className="flex items-center gap-3">
            <Trash2 size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest">Wipe Data Node</span>
          </div>
        </button>
      </div>

      <div className="text-center pt-20">
        <p className="text-[8px] font-black uppercase tracking-[0.5em] text-gray-700">Monolith OS v1.0.4</p>
      </div>
    </div>
  );
};

const SettingItem: React.FC<{ icon: React.ReactNode, label: string, value: string }> = ({ icon, label, value }) => (
  <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl group hover:bg-white/10 transition-colors">
    <div className="flex items-center gap-3">
      <div className="text-gray-500 group-hover:text-white transition-colors">{icon}</div>
      <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">{label}</span>
    </div>
    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{value}</span>
  </div>
);

export default SettingsModule;
