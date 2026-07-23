import React, { useState } from 'react';
import { Download, Copy, FileImage, Check, Sparkles, ExternalLink, BookmarkCheck, FolderDown } from 'lucide-react';

interface ExportToolbarProps {
  onDownloadPosterPNG: () => void;
  onDownloadPosterJPG: () => void;
  onDownloadPolaroidOnly: () => void;
  onCopyClipboard: () => Promise<boolean>;
  onSaveToArchive: () => void;
  directDownloadUrl: string | null;
}

export const ExportToolbar: React.FC<ExportToolbarProps> = ({
  onDownloadPosterPNG,
  onDownloadPosterJPG,
  onDownloadPolaroidOnly,
  onCopyClipboard,
  onSaveToArchive,
  directDownloadUrl,
}) => {
  const [hasCopied, setHasCopied] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [showDirectModal, setShowDirectModal] = useState(false);

  const handleCopy = async () => {
    const success = await onCopyClipboard();
    if (success) {
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 3000);
    }
  };

  const handleSaveArchive = () => {
    onSaveToArchive();
    setHasSaved(true);
    setTimeout(() => setHasSaved(false), 3000);
  };

  return (
    <div className="w-full bg-white border border-black p-5 sm:p-6 flex flex-col gap-5 shadow-sm">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-black/10">
        <div>
          <h3 className="text-lg font-serif italic text-black flex items-center gap-2">
            <span>Export & Local Download Center</span>
            <span className="text-[9px] font-sans font-bold uppercase tracking-widest bg-black text-white px-2 py-0.5">
              1200 × 1500 px HD
            </span>
          </h3>
          <p className="text-xs font-sans uppercase tracking-widest text-black/50 mt-0.5">
            Save high-fidelity frames directly to your local device
          </p>
        </div>

        <button
          onClick={handleSaveArchive}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 text-black border border-black font-sans text-[10px] font-bold uppercase tracking-widest hover:bg-amber-300 transition-colors shrink-0"
        >
          {hasSaved ? (
            <>
              <BookmarkCheck className="w-3.5 h-3.5 text-black" />
              <span>Saved to Admin Portal!</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-black" />
              <span>Save to Admin Archive</span>
            </>
          )}
        </button>
      </div>

      {/* Main Download Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Download PNG */}
        <button
          onClick={onDownloadPosterPNG}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-black hover:bg-neutral-800 text-white font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.15em] transition-all"
        >
          <Download className="w-4 h-4 text-amber-300" />
          <span>Download PNG</span>
        </button>

        {/* Download JPG */}
        <button
          onClick={onDownloadPosterJPG}
          className="flex items-center justify-center gap-2 px-4 py-3 border border-black/30 hover:border-black font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.15em] text-black transition-all"
        >
          <FileImage className="w-4 h-4 text-black/60" />
          <span>Download JPG</span>
        </button>

        {/* Download Polaroid Badge Only */}
        <button
          onClick={onDownloadPolaroidOnly}
          className="flex items-center justify-center gap-2 px-4 py-3 border border-black/30 hover:border-black font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.15em] text-black transition-all"
        >
          <FolderDown className="w-4 h-4 text-purple-700" />
          <span>Polaroid Only</span>
        </button>

        {/* Copy to Clipboard */}
        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 px-4 py-3 border border-black/30 hover:border-black font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.15em] text-black transition-all"
        >
          {hasCopied ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-black/60" />
              <span>Copy Image</span>
            </>
          )}
        </button>
      </div>

      {/* Direct File Link Access for Sandboxed Environments */}
      {directDownloadUrl && (
        <div className="bg-[#f8f7f4] border border-black/15 p-3 flex items-center justify-between gap-3 text-xs font-sans">
          <div className="flex items-center gap-2 text-black/80">
            <ExternalLink className="w-4 h-4 text-black/60 shrink-0" />
            <span>
              Direct File Access: If automatic popup download is blocked by iframe security
            </span>
          </div>
          <a
            href={directDownloadUrl}
            download="fresher_ulearn_poster.png"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-black text-amber-300 font-sans text-[10px] uppercase font-bold tracking-widest hover:bg-neutral-800 shrink-0 flex items-center gap-1"
          >
            <span>Direct Save / Open</span>
          </a>
        </div>
      )}
    </div>
  );
};
