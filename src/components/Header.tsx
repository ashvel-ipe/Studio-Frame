import React from 'react';
import { Sparkles, RefreshCw, Shield, Layers, Image as ImageIcon } from 'lucide-react';

interface HeaderProps {
  onLoadSample: () => void;
  onResetAll: () => void;
  onOpenAdmin: () => void;
  archiveCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onLoadSample,
  onResetAll,
  onOpenAdmin,
  archiveCount,
}) => {
  return (
    <header className="w-full border-b border-black pb-4 pt-6 px-4 sm:px-8 bg-[#f8f7f4] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-baseline justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-[0.3em] font-sans font-bold text-black/60 mb-1">
            Personalized Archive • μlearn MBCCET
          </span>
          <h1 className="text-3xl sm:text-4xl tracking-tighter italic font-serif text-[#1a1a1a] flex items-center gap-2">
            <span>Studio Frame</span>
          </h1>
        </div>

        {/* Right Info & Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-2 px-3.5 py-2 bg-amber-400 text-black font-sans text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.18em] border border-black hover:bg-amber-300 transition-colors shadow-sm"
            title="Open Admin Portal to view stored frames"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin Portal</span>
            <span className="bg-black text-amber-300 px-1.5 py-0.2 rounded-none text-[9px] font-mono">
              {archiveCount}
            </span>
          </button>

          <button
            onClick={onLoadSample}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-black text-white font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.18em] hover:bg-neutral-800 transition-colors"
            title="Load a sample student photo to test"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden xs:inline">Sample Photo</span>
          </button>

          <button
            onClick={onResetAll}
            className="flex items-center gap-1.5 px-3 py-2 border border-black/30 text-black font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.18em] hover:bg-black/5 transition-colors"
            title="Reset poster to defaults"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
};
