import React, { useState, useEffect } from 'react';
import { DEFAULT_POSTER_DATA, PosterData, ControlTab, ArchivedFrame } from './types';
import { PosterCanvas } from './components/PosterCanvas';
import { Controls } from './components/Controls';
import { Header } from './components/Header';
import { ExportToolbar } from './components/ExportToolbar';
import { AdminPortal } from './components/AdminPortal';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import {
  deleteArchivesFromSupabase,
  isSupabaseConfigured,
  loadArchivesFromSupabase,
  syncArchivesToSupabase,
  uploadGeneratedFrameToSupabase,
} from './lib/supabase';

const STORAGE_KEY = 'studio_frame_archives_v1';

const SAMPLE_STUDENT_PHOTO =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';

const SAMPLE_STUDENT_PHOTO_2 =
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80';

export default function App() {
  const [posterData, setPosterData] = useState<PosterData>(DEFAULT_POSTER_DATA);
  const [activeTab, setActiveTab] = useState<ControlTab>('photo_name');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [archivedFrames, setArchivedFrames] = useState<ArchivedFrame[]>([]);
  const [activeFrameId, setActiveFrameId] = useState<string>(() => 'frame-' + Date.now());
  const [directDownloadUrl, setDirectDownloadUrl] = useState<string | null>(null);

  const mergeArchives = (remoteArchives: ArchivedFrame[], localArchives: ArchivedFrame[]) => {
    const merged = [...remoteArchives, ...localArchives];
    const uniqueById = new Map<string, ArchivedFrame>();

    merged.forEach((frame) => {
      const existing = uniqueById.get(frame.id);
      if (!existing || new Date(frame.createdAt).getTime() > new Date(existing.createdAt).getTime()) {
        uniqueById.set(frame.id, frame);
      }
    });

    return Array.from(uniqueById.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  // Initialize Archived Frames from local storage, then hydrate from Supabase when available
  useEffect(() => {
    const initializeArchives = async () => {
      let localArchives: ArchivedFrame[] = [];

      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            localArchives = parsed;
          }
        }
      } catch (e) {
        console.error('Failed to load archives from localStorage', e);
      }

      if (!isSupabaseConfigured) {
        setArchivedFrames(localArchives);
        return;
      }

      try {
        const remoteArchives = await loadArchivesFromSupabase();
        const merged = mergeArchives(remoteArchives, localArchives);
        setArchivedFrames(merged);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      } catch (e) {
        console.error('Failed to load archives from Supabase, using local fallback', e);
        setArchivedFrames(localArchives);
      }
    };

    void initializeArchives();
  }, []);

  // Sync archives to localStorage and Supabase when configured
  const saveArchivesToStorage = (updated: ArchivedFrame[]) => {
    setArchivedFrames(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to persist archives', e);
    }

    if (!isSupabaseConfigured) {
      return;
    }

    void syncArchivesToSupabase(updated).catch((e) => {
      console.error('Failed to sync archives to Supabase', e);
    });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Capture canvas to Data URL
  const captureCanvasDataUrl = (format: 'png' | 'jpeg' = 'png'): string | null => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return null;
    try {
      return canvas.toDataURL(`image/${format}`, 0.95);
    } catch (err) {
      console.error('Failed to capture canvas data URL:', err);
      return null;
    }
  };

  // Automatic Background Archiving - Stores every frame created/edited without asking
  useEffect(() => {
    // Only auto-save if user has customized photo or student name
    if (!posterData.photoUrl && (!posterData.userName || posterData.userName === 'YOUR NAME HERE')) {
      return;
    }

    const timer = setTimeout(() => {
      const dataUrl = captureCanvasDataUrl('png');
      if (!dataUrl) return;

      setArchivedFrames((prev) => {
        const existingIdx = prev.findIndex((f) => f.id === activeFrameId);
        const updatedFrame: ArchivedFrame = {
          id: activeFrameId,
          createdAt: new Date().toISOString(),
          userName: posterData.userName || 'Unnamed Student',
          userSubtext: posterData.userSubtext || '',
          chapterName: posterData.chapterName || 'μlearn',
          chapterCode: posterData.chapterCode || 'MBCCET',
          thumbnailUrl: dataUrl,
          posterData: { ...posterData },
          downloadCount: existingIdx >= 0 ? prev[existingIdx].downloadCount : 1,
        };

        let newList: ArchivedFrame[];
        if (existingIdx >= 0) {
          newList = [...prev];
          newList[existingIdx] = updatedFrame;
        } else {
          newList = [updatedFrame, ...prev];
        }

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
        } catch (e) {
          console.error('Failed to auto-save frame to storage', e);
        }

        if (isSupabaseConfigured) {
          void syncArchivesToSupabase(newList).catch((error) => {
            console.error('Failed to auto-sync frame to Supabase', error);
          });
        }
        return newList;
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [posterData, activeFrameId]);

  const handlePhotoTransformChange = (x: number, y: number, scale: number) => {
    setPosterData((prev) => ({
      ...prev,
      photoX: x,
      photoY: y,
      photoScale: scale,
    }));
  };

  const handleDataChange = (newData: Partial<PosterData>) => {
    setPosterData((prev) => ({ ...prev, ...newData }));
  };

  // Upload Photo File
  const handlePhotoUpload = (file: File) => {
    const newFrameId = 'frame-' + Date.now();
    setActiveFrameId(newFrameId);

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setPosterData((prev) => ({
          ...prev,
          photoUrl: e.target?.result as string,
          photoScale: 1.0,
          photoX: 0,
          photoY: 0,
          photoRotate: 0,
        }));
        showToast('Photo uploaded & saved to Admin Archive!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleClearPhoto = () => {
    setPosterData((prev) => ({
      ...prev,
      photoUrl: null,
    }));
    showToast('Photo removed.');
  };

  const handleLoadSample = () => {
    const newFrameId = 'frame-' + Date.now();
    setActiveFrameId(newFrameId);
    setPosterData((prev) => ({
      ...prev,
      photoUrl: SAMPLE_STUDENT_PHOTO,
      userName: 'ASHISH VELIP',
      userSubtext: 'CSE • BATCH OF 2028',
      photoScale: 1.0,
      photoX: 0,
      photoY: 0,
    }));
    showToast('Sample student photo loaded & stored in Admin Archive!');
  };

  const handleResetAll = () => {
    setPosterData(DEFAULT_POSTER_DATA);
    setActiveFrameId('frame-' + Date.now());
    showToast('Poster reset to defaults.');
  };

  // Save Current Frame to Admin Archive
  const handleSaveToArchive = () => {
    const dataUrl = captureCanvasDataUrl('png');
    if (!dataUrl) {
      showToast('Could not render frame thumbnail.');
      return;
    }

    const newFrame: ArchivedFrame = {
      id: 'frame-' + Date.now(),
      createdAt: new Date().toISOString(),
      userName: posterData.userName || 'Unnamed Student',
      userSubtext: posterData.userSubtext || '',
      chapterName: posterData.chapterName || 'μlearn',
      chapterCode: posterData.chapterCode || 'MBCCET',
      thumbnailUrl: dataUrl,
      posterData: { ...posterData },
      downloadCount: 1,
    };

    const updated = [newFrame, ...archivedFrames];
    saveArchivesToStorage(updated);
    showToast('Frame successfully saved to Admin Portal!');
  };

  // Export 1: Full Poster Download PNG
  const handleDownloadPosterPNG = async () => {
    const dataUrl = captureCanvasDataUrl('png');
    if (!dataUrl) {
      showToast('Canvas not ready for export.');
      return;
    }

    setDirectDownloadUrl(dataUrl);

    // Auto save copy to admin portal
    handleSaveToArchive();

    const safeName = (posterData.userName || 'fresher')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_');

    const canvas = document.querySelector('canvas');
    if (canvas) {
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((result) => resolve(result), 'image/png');
      });

      if (blob) {
        const fileName = `frame_${Date.now()}.png`;
        try {
          await uploadGeneratedFrameToSupabase(blob, fileName);
        } catch (error) {
          console.error('Failed to upload generated frame to Supabase:', error);
          showToast('Supabase upload failed. Check console for details.');
        }
      } else {
        console.error('Failed to create PNG blob from canvas for Supabase upload.');
        showToast('Could not create image for Supabase upload.');
      }
    }

    const link = document.createElement('a');
    link.download = `${safeName}_ulearn_mbccet_poster.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    link.remove();

    showToast('Poster downloaded in PNG HD!');
  };

  // Export 2: Full Poster Download JPG
  const handleDownloadPosterJPG = () => {
    const dataUrl = captureCanvasDataUrl('jpeg');
    if (!dataUrl) {
      showToast('Canvas not ready for export.');
      return;
    }

    setDirectDownloadUrl(dataUrl);

    const safeName = (posterData.userName || 'fresher')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_');

    const link = document.createElement('a');
    link.download = `${safeName}_ulearn_mbccet_poster.jpg`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    link.remove();

    showToast('Poster downloaded in JPG!');
  };

  // Export 3: Download Polaroid Card Only
  const handleDownloadPolaroidOnly = () => {
    if (!posterData.photoUrl) {
      showToast('Please upload a photo first!');
      return;
    }

    const offscreenCanvas = document.createElement('canvas');
    const ctx = offscreenCanvas.getContext('2d');
    if (!ctx) return;

    offscreenCanvas.width = 900;
    offscreenCanvas.height = 1100;

    const W = 900;
    const H = 1100;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const cardW = 760;
      const cardH = 960;
      const cardX = (W - cardW) / 2;
      const cardY = (H - cardH) / 2;

      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 15;
      ctx.fillRect(cardX, cardY, cardW, cardH);

      const boxW = cardW - 80;
      const boxH = 700;
      const boxX = cardX + 40;
      const boxY = cardY + 40;

      ctx.save();
      ctx.beginPath();
      ctx.rect(boxX, boxY, boxW, boxH);
      ctx.clip();

      ctx.filter = `brightness(${posterData.brightness}%) contrast(${posterData.contrast}%) saturate(${posterData.saturation}%)`;
      const scaleToFit = Math.max(boxW / img.width, boxH / img.height);
      const finalScale = scaleToFit * posterData.photoScale;
      const drawW = img.width * finalScale;
      const drawH = img.height * finalScale;

      ctx.translate(boxX + boxW / 2 + posterData.photoX, boxY + boxH / 2 + posterData.photoY);
      ctx.rotate((posterData.photoRotate * Math.PI) / 180);
      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const nameY = boxY + boxH + (cardY + cardH - (boxY + boxH)) / 2 - 10 + posterData.nameOffsetY;

      ctx.font = `700 ${posterData.fontSize * 1.1}px "${posterData.fontFamily}", cursive, sans-serif`;
      ctx.fillStyle = posterData.textColor || '#111827';
      ctx.fillText(posterData.userName || 'YOUR NAME', W / 2, nameY);

      if (posterData.userSubtext) {
        ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText(posterData.userSubtext.toUpperCase(), W / 2, nameY + posterData.fontSize / 2 + 16);
      }

      const dataUrl = offscreenCanvas.toDataURL('image/png', 1.0);
      setDirectDownloadUrl(dataUrl);

      const link = document.createElement('a');
      const safeName = (posterData.userName || 'fresher').toLowerCase().replace(/[^a-z0-9]/g, '_');
      link.download = `${safeName}_polaroid_badge.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      link.remove();

      showToast('Polaroid Card downloaded!');
    };
    img.src = posterData.photoUrl;
  };

  // Export 4: Copy to Clipboard
  const handleCopyClipboard = async (): Promise<boolean> => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return false;

    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          resolve(false);
          return;
        }
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          showToast('Poster copied to clipboard!');
          resolve(true);
        } catch (err) {
          console.error('Clipboard copy failed:', err);
          showToast('Could not copy automatically. Use Download PNG button!');
          resolve(false);
        }
      });
    });
  };

  // Admin Actions
  const handleLoadArchivedFrame = (frame: ArchivedFrame) => {
    setActiveFrameId(frame.id);
    setPosterData(frame.posterData);
    showToast(`Loaded "${frame.userName}" frame into editor!`);
  };

  const handleDeleteArchivedFrame = (id: string) => {
    const updated = archivedFrames.filter((f) => f.id !== id);
    saveArchivesToStorage(updated);
    if (isSupabaseConfigured) {
      void deleteArchivesFromSupabase([id]).catch((error) => {
        console.error('Failed to delete archive from Supabase', error);
      });
    }
    showToast('Frame deleted from archive.');
  };

  const handleClearAllArchives = () => {
    if (window.confirm('Are you sure you want to clear all archived frames?')) {
      const idsToRemove = archivedFrames.map((frame) => frame.id);
      saveArchivesToStorage([]);
      if (isSupabaseConfigured && idsToRemove.length > 0) {
        void deleteArchivesFromSupabase(idsToRemove).catch((error) => {
          console.error('Failed to clear archives from Supabase', error);
        });
      }
      showToast('Archive repository cleared.');
    }
  };

  const handleImportArchives = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed)) {
        saveArchivesToStorage(parsed);
        showToast('Archived frames imported successfully!');
      } else {
        showToast('Invalid backup JSON format.');
      }
    } catch (err) {
      showToast('Failed to parse JSON backup.');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        onLoadSample={handleLoadSample}
        onResetAll={handleResetAll}
        onOpenAdmin={() => setIsAdminOpen(true)}
        archiveCount={archivedFrames.length}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Live Canvas Preview */}
        <div className="lg:col-span-6 flex flex-col gap-4 items-center">
          <div className="w-full flex items-center justify-between text-xs text-zinc-400 px-1">
            <span className="font-semibold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Live Poster Preview</span>
            </span>
            <span className="text-zinc-500 font-mono">1200 × 1500 px HD</span>
          </div>

          <PosterCanvas
            data={posterData}
            onPhotoUpload={handlePhotoUpload}
            onPhotoTransformChange={handlePhotoTransformChange}
          />

          <p className="text-xs text-zinc-500 text-center max-w-md">
            💡 <strong className="text-zinc-400">Pro Tip:</strong> Click & drag directly on the photo inside the frame on canvas to align it!
          </p>
        </div>

        {/* Right Column: Controls & Export Tools */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <Controls
            data={posterData}
            onChange={handleDataChange}
            onPhotoUpload={handlePhotoUpload}
            onClearPhoto={handleClearPhoto}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          <ExportToolbar
            onDownloadPosterPNG={handleDownloadPosterPNG}
            onDownloadPosterJPG={handleDownloadPosterJPG}
            onDownloadPolaroidOnly={handleDownloadPolaroidOnly}
            onCopyClipboard={handleCopyClipboard}
            onSaveToArchive={handleSaveToArchive}
            directDownloadUrl={directDownloadUrl}
          />
        </div>
      </main>

      {/* Admin Portal Modal */}
      <AdminPortal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        archives={archivedFrames}
        onLoadFrame={handleLoadArchivedFrame}
        onDeleteFrame={handleDeleteArchivedFrame}
        onClearAll={handleClearAllArchives}
        onSaveCurrentFrame={handleSaveToArchive}
        onImportArchives={handleImportArchives}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 border border-amber-400/50 text-zinc-100 text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
