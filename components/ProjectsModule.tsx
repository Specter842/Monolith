
import React, { useState } from 'react';
import { Project } from '../types';
import { Plus, CheckCircle2, Circle, Layers, FileText, ArrowRight } from 'lucide-react';

interface Props {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
}

const ProjectsModule: React.FC<Props> = ({ projects, setProjects }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '' });

  const addProject = () => {
    if (!newProject.title) return;
    const project: Project = {
      id: Math.random().toString(36).substr(2, 9),
      title: newProject.title,
      description: newProject.description,
      progress: 0,
      milestones: [],
      resources: []
    };
    setProjects(prev => [...prev, project]);
    setNewProject({ title: '', description: '' });
    setShowAdd(false);
  };

  const updateProgress = (id: string, progress: number) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, progress } : p));
  };

  return (
    <div className="p-6 space-y-6 bg-black min-h-full">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black uppercase tracking-tighter">Projects</h2>
        <button onClick={() => setShowAdd(true)} className="p-2 bg-white text-black rounded-full hover:scale-110 transition-transform">
          <Plus size={20} />
        </button>
      </div>

      {showAdd && (
        <div className="p-6 bg-white/5 border border-white/10 rounded-[32px] space-y-4 animate-in fade-in zoom-in duration-200">
          <input 
            type="text" 
            placeholder="Project Title" 
            className="w-full bg-transparent border-b border-white/10 py-2 text-xl font-bold focus:outline-none focus:border-white transition-colors"
            value={newProject.title}
            onChange={e => setNewProject({...newProject, title: e.target.value})}
          />
          <textarea 
            placeholder="Project vision/brief..." 
            className="w-full bg-transparent border-b border-white/10 py-2 text-sm focus:outline-none focus:border-white transition-colors h-20 resize-none"
            value={newProject.description}
            onChange={e => setNewProject({...newProject, description: e.target.value})}
          />
          <button onClick={addProject} className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase text-xs tracking-widest mt-2">
            Launch Project
          </button>
        </div>
      )}

      <div className="space-y-4">
        {projects.length === 0 ? (
          <div className="py-32 text-center text-gray-700 uppercase tracking-[0.2em] text-[10px] font-black italic">No Projects in Orbit</div>
        ) : (
          projects.map(p => (
            <div key={p.id} className="p-6 bg-white/5 border border-white/5 rounded-[32px] space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight leading-none">{p.title}</h3>
                  <p className="text-[10px] text-gray-500 mt-2 line-clamp-2 uppercase tracking-widest font-bold">{p.description}</p>
                </div>
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center">
                  <span className="text-xs font-black">{p.progress}%</span>
                </div>
              </div>

              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-white transition-all duration-1000" style={{ width: `${p.progress}%` }}></div>
              </div>

              <div className="flex gap-4 pt-2">
                <div className="flex-1 space-y-2">
                  <p className="text-[8px] uppercase font-black tracking-widest text-gray-600">Milestones</p>
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] font-bold text-white uppercase">{p.milestones.length} Phases</span>
                     <ArrowRight size={10} className="text-gray-500" />
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-[8px] uppercase font-black tracking-widest text-gray-600">Attachments</p>
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] font-bold text-white uppercase">{p.resources.length} Assets</span>
                     <ArrowRight size={10} className="text-gray-500" />
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

export default ProjectsModule;
