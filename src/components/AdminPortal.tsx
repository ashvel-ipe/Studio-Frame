import React, { useState } from 'react';
import { ArchivedFrame, PosterData } from '../types';
import {
  X,
  Search,
  Trash2,
  Download,
  RotateCcw,
  Plus,
  FileJson,
  Calendar,
  User,
  Image as ImageIcon,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Layers,
} from 'lucide-react';

interface AdminPortalProps {
  isOpen: boolean;
  onClose: () => void;
  archives: ArchivedFrame[];
  onLoadFrame: (frame: ArchivedFrame) => void;
  onDeleteFrame: (id: string) => void;
  onClearAll: () => void;
  onSaveCurrentFrame: () => void;
  onImportArchives: (jsonString: string) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  isOpen,
  onClose,
  archives,
  onLoadFrame,
  onDeleteFrame,
  onClearAll,
  onSaveCurrentFrame,
  onImportArchives,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');
  const [previewFrame, setPreviewFrame] = useState<ArchivedFrame | null>(null);

  if (!isOpen) return null;

  // Filter and sort frames
  const filteredArchives = archives
    .filter(
      (frame) =>
        frame.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        frame.userSubtext.toLowerCase().includes(searchTerm.toLowerCase()) ||
        frame.chapterCode.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'name') return a.userName.localeCompare(b.userName);
      return 0;
    });

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(archives, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `studio_frame_admin_archive_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onImportArchives(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  const downloadFrameImage = (frame: ArchivedFrame) => {
    const link = document.createElement('a');
    const safeName = (frame.userName || 'frame').toLowerCase().replace(/[^a-z0-9]/g, '_');
    link.download = `${safeName}_archived_frame.png`;
    link.href = frame.thumbnailUrl;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#fcfbf9] border-2 border-black w-full max-w-5xl my-auto shadow-2xl flex flex-col max-h-[90vh] text-black overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Admin Header */}
        <div className="bg-black text-white px-6 py-5 flex items-center justify-between border-b border-black">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-400 text-black flex items-center justify-center font-serif font-bold text-lg">
              A
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-serif italic tracking-tight text-white">
                  Admin Frame Portal & Registry
                </h2>
                <span className="bg-white/10 text-amber-300 font-sans text-[9px] uppercase tracking-[0.2em] px-2 py-0.5 font-bold border border-amber-300/30">
                  Secure Storage
                </span>
              </div>
              <p className="text-[11px] font-sans uppercase tracking-widest text-white/60">
                Central archive of all generated student photo frames
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Close Portal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dashboard Quick Stats Bar */}
        <div className="bg-[#f4f2ec] border-b border-black/15 px-6 py-3.5 grid grid-cols-2 sm:grid-cols-4 gap-4 font-sans">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-[0.2em] text-black/50 font-bold">Total Frames</span>
            <span className="text-xl font-serif italic font-bold text-black">{archives.length} Items</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-[0.2em] text-black/50 font-bold">Latest Archive</span>
            <span className="text-xs font-mono font-medium text-black truncate mt-1">
              {archives.length > 0
                ? new Date(archives[0].createdAt).toLocaleDateString()
                : 'No records'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-[0.2em] text-black/50 font-bold">College Chapter</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-black mt-1">
              μlearn MBCCET
            </span>
          </div>
          <div className="flex flex-col items-end justify-center">
            <button
              onClick={onSaveCurrentFrame}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white font-sans text-[10px] uppercase tracking-widest hover:bg-neutral-800 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-amber-300" />
              <span>Save Current Frame</span>
            </button>
          </div>
        </div>

        {/* Toolbar: Search, Sort & Batch Actions */}
        <div className="px-6 py-4 border-b border-black/10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-black/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search student or department..."
              className="w-full pl-9 pr-4 py-2 border border-black/20 text-xs font-sans text-black focus:outline-none focus:border-black placeholder:text-black/30"
            />
          </div>

          {/* Sort & Actions */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'name')}
              className="px-3 py-2 border border-black/20 text-xs font-sans uppercase tracking-wider bg-white focus:outline-none focus:border-black"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="name">Sort: By Name</option>
            </select>

            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1 px-3 py-2 border border-black/30 hover:border-black text-[10px] uppercase tracking-widest font-sans transition-colors"
              title="Backup archive database to JSON"
            >
              <FileJson className="w-3.5 h-3.5 text-black/60" />
              <span>Export JSON</span>
            </button>

            <label className="flex items-center gap-1 px-3 py-2 border border-black/30 hover:border-black text-[10px] uppercase tracking-widest font-sans transition-colors cursor-pointer">
              <Download className="w-3.5 h-3.5 text-black/60 rotate-180" />
              <span>Import</span>
              <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
            </label>

            {archives.length > 0 && (
              <button
                onClick={onClearAll}
                className="flex items-center gap-1 px-3 py-2 text-rose-600 border border-rose-200 hover:bg-rose-50 text-[10px] uppercase tracking-widest font-sans transition-colors"
                title="Clear all archived frames"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>

        {/* Archives Grid / Gallery */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#fcfbf9]">
          {filteredArchives.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center justify-center border border-dashed border-black/20 p-8">
              <Layers className="w-10 h-10 text-black/20 mb-3" />
              <p className="text-base font-serif italic text-black font-medium">
                No archived frames found
              </p>
              <p className="text-xs font-sans uppercase tracking-widest text-black/50 mt-1 max-w-sm">
                {searchTerm
                  ? 'No frames match your search query.'
                  : 'Create a poster or click "Save Current Frame" above to populate your admin repository.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArchives.map((frame) => (
                <div
                  key={frame.id}
                  className="bg-white border border-black p-4 flex flex-col justify-between gap-4 shadow-sm hover:shadow-md transition-shadow group"
                >
                  {/* Frame Image Preview */}
                  <div className="relative aspect-[4/5] bg-neutral-900 border border-black/10 overflow-hidden cursor-pointer" onClick={() => setPreviewFrame(frame)}>
                    <img
                      src={frame.thumbnailUrl}
                      alt={frame.userName}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <span className="bg-white text-black px-3 py-1.5 font-sans text-[10px] uppercase tracking-widest font-bold shadow-md">
                        Enlarge Preview
                      </span>
                    </div>
                  </div>

                  {/* Frame Metadata */}
                  <div className="flex flex-col gap-1 border-t border-black/10 pt-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-serif italic text-black font-bold truncate">
                        {frame.userName || 'Unnamed Student'}
                      </h4>
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-black/50 bg-black/5 px-2 py-0.5 border border-black/10">
                        {frame.chapterCode}
                      </span>
                    </div>
                    {frame.userSubtext && (
                      <p className="text-[11px] font-sans uppercase tracking-widest text-black/60 truncate">
                        {frame.userSubtext}
                      </p>
                    )}
                    <p className="text-[10px] font-mono text-black/40 flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(frame.createdAt).toLocaleString()}</span>
                    </p>
                  </div>

                  {/* Frame Card Actions */}
                  <div className="grid grid-cols-3 gap-2 border-t border-black/10 pt-3">
                    <button
                      onClick={() => {
                        onLoadFrame(frame);
                        onClose();
                      }}
                      className="flex items-center justify-center gap-1 py-2 bg-black text-white font-sans text-[9px] uppercase tracking-widest hover:bg-neutral-800 transition-colors"
                      title="Restore state to canvas editor"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => downloadFrameImage(frame)}
                      className="flex items-center justify-center gap-1 py-2 border border-black/30 hover:border-black font-sans text-[9px] uppercase tracking-widest text-black transition-colors"
                      title="Download image"
                    >
                      <Download className="w-3 h-3 text-black/60" />
                      <span>PNG</span>
                    </button>

                    <button
                      onClick={() => onDeleteFrame(frame.id)}
                      className="flex items-center justify-center gap-1 py-2 text-rose-600 hover:bg-rose-50 border border-rose-200 font-sans text-[9px] uppercase tracking-widest transition-colors"
                      title="Delete from archive"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Admin Footer */}
        <div className="bg-[#f4f2ec] border-t border-black/15 px-6 py-3 flex items-center justify-between text-[10px] font-sans uppercase tracking-widest text-black/60">
          <span>μlearn MBCCET • Studio Frame Archive System v1.4</span>
          <button
            onClick={onClose}
            className="font-bold text-black underline underline-offset-2 hover:text-black/70"
          >
            Close Admin View
          </button>
        </div>
      </div>

      {/* Frame Full Enlarged Modal */}
      {previewFrame && (
        <div className="fixed inset-0 z-60 bg-black/90 p-4 flex flex-col items-center justify-center animate-in fade-in duration-150">
          <div className="relative max-w-2xl w-full flex flex-col items-center gap-4">
            <button
              onClick={() => setPreviewFrame(null)}
              className="absolute -top-10 right-0 text-white hover:text-amber-300 font-sans text-xs uppercase tracking-widest flex items-center gap-1"
            >
              <X className="w-5 h-5" />
              <span>Close</span>
            </button>
            <img
              src={previewFrame.thumbnailUrl}
              alt={previewFrame.userName}
              className="max-h-[80vh] w-auto border-2 border-white shadow-2xl object-contain"
            />
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  onLoadFrame(previewFrame);
                  setPreviewFrame(null);
                  onClose();
                }}
                className="px-5 py-2.5 bg-amber-400 text-black font-sans font-bold text-xs uppercase tracking-widest hover:bg-amber-300"
              >
                Load into Live Canvas
              </button>
              <button
                onClick={() => downloadFrameImage(previewFrame)}
                className="px-5 py-2.5 bg-white text-black font-sans font-bold text-xs uppercase tracking-widest hover:bg-neutral-200"
              >
                Download HD Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
