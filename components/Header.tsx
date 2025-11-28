import React from 'react';
import { Layers, Zap } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">ClearCut AI</h1>
            <p className="text-xs text-zinc-400 font-medium">Batch Background Remover</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800">
             <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
             <span className="text-xs text-zinc-400">System Operational</span>
          </div>
          <a 
            href="#" 
            className="text-zinc-400 hover:text-white transition-colors"
            title="Powered by Gemini 2.5 Flash"
          >
            <Zap className="w-5 h-5" />
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;