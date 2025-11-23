import React from 'react';
import { MessageSquarePlus, Clock, Settings, Github, Zap, X, Globe, Cpu } from 'lucide-react';
import { SidebarProps } from '../types';

export const Sidebar: React.FC<SidebarProps> = ({ onNewChat, onLoadChat, onClose }) => {
  const historyItems = [
    "Architecture: 100k User Scale",
    "Project Veda: 7B LLM Architecture",
    "System Architecture: Scalable Microservices",
    "Debug: React Rendering Optimization",
    "Explain: Quantum Entanglement (Simple)",
    "Generate: Python API with FastAPI"
  ];

  return (
    <div className="flex flex-col h-full bg-deep-bg/50 backdrop-blur-xl border-r border-deep-border/50 text-slate-300">
      <div className="p-4 flex items-center justify-between border-b border-deep-border/50">
        <div className="flex items-center gap-2 text-white font-semibold">
           <Cpu size={18} className="text-blue-400" />
           <span>Astra-X Hub</span>
        </div>
        <button onClick={onClose} className="md:hidden p-1 hover:text-white">
            <X size={20} />
        </button>
      </div>

      <div className="p-4">
        <button 
          onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) onClose();
          }}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 font-medium"
        >
          <MessageSquarePlus size={18} />
          <span>New Chat</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        <h3 className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Recent Sessions</h3>
        <div className="space-y-1">
          {historyItems.map((item, index) => (
            <button 
              key={index}
              onClick={() => {
                onLoadChat(item);
                if (window.innerWidth < 768) onClose();
              }}
              className="w-full text-left px-4 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-sm truncate flex items-center gap-3 group"
            >
              <Clock size={14} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
              <span className="truncate">{item}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-deep-border/50 bg-black/20">
        <div className="flex flex-col gap-2">
            <div className="p-3 rounded-lg bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/10">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                        <Zap size={14} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-xs font-bold text-white">Prompt Pack v1.1</span>
                    </div>
                </div>
                <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-400 to-purple-400 w-[95%] h-full" />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Optimization Level: Maximum</p>
            </div>
            
            <button className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-white/5 transition-colors text-sm text-slate-400 hover:text-white">
            <Settings size={18} />
            <span>Config</span>
            </button>
        </div>
      </div>
    </div>
  );
};
