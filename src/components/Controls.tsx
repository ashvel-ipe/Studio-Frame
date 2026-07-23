import React, { useRef } from 'react';
import { ControlTab, FontOption, FILTER_PRESETS, FilterPreset, PosterData } from '../types';
import {
  Type,
  Image as ImageIcon,
  Sliders,
  Palette,
  RotateCcw,
  Upload,
  Check,
  Sparkles,
  Trash2,
  Settings,
  SlidersHorizontal,
  Wand2,
} from 'lucide-react';

interface ControlsProps {
  data: PosterData;
  onChange: (newData: Partial<PosterData>) => void;
  onPhotoUpload: (file: File) => void;
  onClearPhoto: () => void;
  activeTab: ControlTab;
  setActiveTab: (tab: ControlTab) => void;
}

const FONT_OPTIONS: { id: FontOption; name: string; preview: string; fontClass: string }[] = [
  { id: 'Caveat', name: 'Casual Marker', preview: 'Alex Morgan', fontClass: 'font-["Caveat"] text-2xl' },
  { id: 'Permanent Marker', name: 'Bold Marker', preview: 'ALEX MORGAN', fontClass: 'font-["Permanent_Marker"] text-xl' },
  { id: 'Dancing Script', name: 'Elegant Cursive', preview: 'Alex Morgan', fontClass: 'font-["Dancing_Script"] text-2xl' },
  { id: 'Plus Jakarta Sans', name: 'Clean Modern', preview: 'ALEX MORGAN', fontClass: 'font-["Plus_Jakarta_Sans"] font-bold text-lg' },
  { id: 'Space Grotesk', name: 'Tech Grotesk', preview: 'ALEX MORGAN', fontClass: 'font-["Space_Grotesk"] font-bold text-lg' },
  { id: 'Fira Code', name: 'Monospace Code', preview: 'Alex Morgan', fontClass: 'font-["Fira_Code"] font-semibold text-base' },
];

const COLOR_PRESETS = [
  { name: 'Deep Navy', hex: '#1e1b4b' },
  { name: 'Pure Black', hex: '#09090b' },
  { name: 'Royal Purple', hex: '#581c87' },
  { name: 'Charcoal', hex: '#27272a' },
  { name: 'Crimson', hex: '#881337' },
  { name: 'Emerald', hex: '#064e3b' },
  { name: 'Dark Indigo', hex: '#312e81' },
];

export const Controls: React.FC<ControlsProps> = ({
  data,
  onChange,
  onPhotoUpload,
  onClearPhoto,
  activeTab,
  setActiveTab,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onPhotoUpload(e.target.files[0]);
    }
  };

  const handleResetPhotoTransform = () => {
    onChange({
      photoScale: 1.0,
      photoX: 0,
      photoY: 0,
      photoRotate: 0,
      brightness: 100,
      contrast: 100,
      saturation: 100,
    });
  };

  const handleApplyFilter = (preset: FilterPreset) => {
    onChange({
      brightness: preset.brightness,
      contrast: preset.contrast,
      saturation: preset.saturation,
    });
  };

  // Determine active filter preset if values match
  const activePreset = FILTER_PRESETS.find(
    (p) =>
      p.brightness === data.brightness &&
      p.contrast === data.contrast &&
      p.saturation === data.saturation
  );

  return (
    <div className="w-full bg-white border border-black p-5 sm:p-7 flex flex-col gap-6 shadow-sm">
      {/* Editorial Header Title */}
      <div className="border-b border-black/10 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="h-[1px] w-6 bg-black"></span>
          <h2 className="text-xl font-serif italic text-black">
            Identity & Studio Controls
          </h2>
        </div>
        <span className="text-[10px] font-sans uppercase tracking-widest text-black/50 hidden sm:inline">
          Composition Engine
        </span>
      </div>

      {/* Tab Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 border-b border-black/10 pb-4">
        <button
          onClick={() => setActiveTab('photo_name')}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-2 font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.12em] transition-all border ${
            activeTab === 'photo_name'
              ? 'bg-black text-white border-black font-semibold'
              : 'bg-transparent text-black/70 border-black/15 hover:border-black hover:text-black'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Photo & Name</span>
        </button>

        <button
          onClick={() => setActiveTab('photo_transform')}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-2 font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.12em] transition-all border ${
            activeTab === 'photo_transform'
              ? 'bg-black text-white border-black font-semibold'
              : 'bg-transparent text-black/70 border-black/15 hover:border-black hover:text-black'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Adjust</span>
        </button>

        <button
          onClick={() => setActiveTab('filters')}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-2 font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.12em] transition-all border ${
            activeTab === 'filters'
              ? 'bg-black text-white border-black font-semibold'
              : 'bg-transparent text-black/70 border-black/15 hover:border-black hover:text-black'
          }`}
        >
          <Wand2 className="w-3.5 h-3.5 shrink-0 text-amber-300" />
          <span className="truncate">Filters</span>
        </button>

        <button
          onClick={() => setActiveTab('font_style')}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-2 font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.12em] transition-all border ${
            activeTab === 'font_style'
              ? 'bg-black text-white border-black font-semibold'
              : 'bg-transparent text-black/70 border-black/15 hover:border-black hover:text-black'
          }`}
        >
          <Type className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Typography</span>
        </button>

        <button
          onClick={() => setActiveTab('template_text')}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-2 font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.12em] transition-all border ${
            activeTab === 'template_text'
              ? 'bg-black text-white border-black font-semibold'
              : 'bg-transparent text-black/70 border-black/15 hover:border-black hover:text-black'
          }`}
        >
          <Settings className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Poster Text</span>
        </button>
      </div>

      {/* TAB 1: Photo & Name Inputs */}
      {activeTab === 'photo_name' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
          {/* Photo Upload Section */}
          <div className="flex flex-col gap-2">
            <label className="font-sans text-[10px] uppercase tracking-widest font-bold text-black/60 flex items-center justify-between">
              <span>1. Visual Media (Your Photo)</span>
              {data.photoUrl && (
                <button
                  onClick={onClearPhoto}
                  className="text-[10px] text-rose-600 hover:text-rose-800 flex items-center gap-1 font-sans uppercase tracking-widest transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Photo</span>
                </button>
              )}
            </label>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {!data.photoUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="group border border-dashed border-black/20 p-8 text-center bg-[#fcfbf9] hover:bg-white hover:border-black transition-all cursor-pointer flex flex-col items-center justify-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-black/5 text-black group-hover:scale-110 flex items-center justify-center transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-sans text-xs uppercase tracking-wider font-semibold text-black">
                    Click to Upload Image
                  </p>
                  <p className="text-[10px] text-black/50 uppercase tracking-widest mt-1">
                    JPG, PNG or RAW supported (Auto-fits frame)
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 bg-[#f8f7f4] border border-black/15 p-3">
                <div className="w-14 h-14 bg-black/5 shrink-0 border border-black/20 relative overflow-hidden">
                  <img
                    src={data.photoUrl}
                    alt="Uploaded user photo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-xs font-semibold text-black truncate uppercase tracking-wider">
                    Photo Uploaded
                  </p>
                  <p className="text-[11px] text-black/60 mt-0.5 italic font-serif">
                    Drag on preview canvas to align
                  </p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-black text-white font-sans text-[10px] uppercase tracking-widest hover:bg-neutral-800 transition-colors shrink-0"
                >
                  Change
                </button>
              </div>
            )}
          </div>

          {/* User Name Input */}
          <div className="flex flex-col gap-2">
            <label className="font-sans text-[10px] uppercase tracking-widest font-bold text-black/60">
              2. Full Name (Appears on Sloppy Frame Space)
            </label>
            <input
              type="text"
              value={data.userName}
              onChange={(e) => onChange({ userName: e.target.value })}
              placeholder="Enter name..."
              className="bg-transparent border-b border-black/30 py-2.5 text-2xl font-serif italic text-black focus:outline-none focus:border-black placeholder:text-black/20 transition-colors"
            />
          </div>

          {/* User Subtext / Department Input */}
          <div className="flex flex-col gap-2">
            <label className="font-sans text-[10px] uppercase tracking-widest font-bold text-black/60">
              3. Subtitle / Department (Optional)
            </label>
            <input
              type="text"
              value={data.userSubtext}
              onChange={(e) => onChange({ userSubtext: e.target.value })}
              placeholder="e.g. CSE • BATCH OF 2028"
              className="bg-transparent border-b border-black/30 py-2 text-sm font-sans uppercase tracking-widest text-black/80 focus:outline-none focus:border-black placeholder:text-black/20 transition-colors"
            />
          </div>

          {/* Quick Preset Names */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[10px] font-sans uppercase tracking-widest text-black/50">Samples:</span>
            {['Ashish Velip', 'Ananya Sharma', 'Rahul K.', 'Siddharth M.'].map(
              (sample) => (
                <button
                  key={sample}
                  onClick={() => onChange({ userName: sample })}
                  className="px-2.5 py-1 bg-black/5 hover:bg-black hover:text-white font-sans text-[10px] uppercase tracking-widest text-black/70 transition-colors"
                >
                  {sample}
                </button>
              )
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Photo Adjustments */}
      {activeTab === 'photo_transform' && (
        <div className="flex flex-col gap-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-black/10">
            <span className="font-sans text-[10px] uppercase tracking-widest font-bold text-black/60">
              Transform & Scale
            </span>
            <button
              onClick={handleResetPhotoTransform}
              className="text-[10px] text-black/60 hover:text-black font-sans uppercase tracking-widest flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Adjustments</span>
            </button>
          </div>

          {/* Scale / Zoom Slider */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs font-sans">
              <span className="text-black/80 font-medium uppercase tracking-wider text-[10px]">Zoom / Scale</span>
              <span className="text-black font-mono font-bold">
                {Math.round(data.photoScale * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.05"
              value={data.photoScale}
              onChange={(e) =>
                onChange({ photoScale: parseFloat(e.target.value) })
              }
              className="w-full accent-black h-1 bg-black/10 rounded-none cursor-pointer"
            />
          </div>

          {/* Rotation Slider */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs font-sans">
              <span className="text-black/80 font-medium uppercase tracking-wider text-[10px]">Photo Rotation</span>
              <span className="text-black font-mono font-bold">
                {data.photoRotate}°
              </span>
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              step="1"
              value={data.photoRotate}
              onChange={(e) =>
                onChange({ photoRotate: parseInt(e.target.value) })
              }
              className="w-full accent-black h-1 bg-black/10 rounded-none cursor-pointer"
            />
          </div>

          {/* Position Sliders (Horizontal / Vertical) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs font-sans">
                <span className="text-black/80 font-medium uppercase tracking-wider text-[10px]">Horizontal (X)</span>
                <span className="text-black/60 font-mono text-xs">{data.photoX}px</span>
              </div>
              <input
                type="range"
                min="-300"
                max="300"
                step="2"
                value={data.photoX}
                onChange={(e) =>
                  onChange({ photoX: parseInt(e.target.value) })
                }
                className="w-full accent-black h-1 bg-black/10 rounded-none cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs font-sans">
                <span className="text-black/80 font-medium uppercase tracking-wider text-[10px]">Vertical (Y)</span>
                <span className="text-black/60 font-mono text-xs">{data.photoY}px</span>
              </div>
              <input
                type="range"
                min="-300"
                max="300"
                step="2"
                value={data.photoY}
                onChange={(e) =>
                  onChange({ photoY: parseInt(e.target.value) })
                }
                className="w-full accent-black h-1 bg-black/10 rounded-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Preset Filters */}
      {activeTab === 'filters' && (
        <div className="flex flex-col gap-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-black/10">
            <div>
              <span className="font-sans text-[10px] uppercase tracking-widest font-bold text-black/60">
                Preset Color Grading & Filters
              </span>
              <p className="text-xs font-serif italic text-black/70 mt-0.5">
                Active Filter: <strong className="text-black">{activePreset ? activePreset.name : 'Custom Tuning'}</strong>
              </p>
            </div>
            <button
              onClick={() => onChange({ brightness: 100, contrast: 100, saturation: 100 })}
              className="text-[10px] text-black/60 hover:text-black font-sans uppercase tracking-widest flex items-center gap-1 transition-colors shrink-0"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filter</span>
            </button>
          </div>

          {/* Preset Buttons Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {FILTER_PRESETS.map((preset) => {
              const isSelected =
                data.brightness === preset.brightness &&
                data.contrast === preset.contrast &&
                data.saturation === preset.saturation;

              return (
                <button
                  key={preset.id}
                  onClick={() => handleApplyFilter(preset)}
                  className={`flex flex-col gap-2 p-3 text-left border transition-all relative ${
                    isSelected
                      ? 'border-black bg-black text-white shadow-md'
                      : 'border-black/15 bg-white hover:border-black text-black'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className={`w-6 h-6 border border-black/20 ${preset.previewBg}`} />
                    {preset.badge && (
                      <span
                        className={`text-[8px] font-sans font-bold uppercase tracking-widest px-1.5 py-0.5 ${
                          isSelected ? 'bg-amber-400 text-black' : 'bg-black/5 text-black/60'
                        }`}
                      >
                        {preset.badge}
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-sans text-xs font-bold uppercase tracking-wider truncate">
                      {preset.name}
                    </h4>
                    <p
                      className={`text-[10px] line-clamp-1 mt-0.5 ${
                        isSelected ? 'text-white/70 font-serif italic' : 'text-black/50 font-serif italic'
                      }`}
                    >
                      {preset.description}
                    </p>
                  </div>

                  {isSelected && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Fine Tuning Sliders */}
          <div className="border-t border-black/10 pt-4 flex flex-col gap-3">
            <span className="font-sans text-[10px] uppercase tracking-widest font-bold text-black/60">
              Fine-Tune Intensity Parameters
            </span>

            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[10px] font-sans text-black/70">
                  <span>Brightness</span>
                  <span className="font-mono font-bold">{data.brightness}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={data.brightness}
                  onChange={(e) => onChange({ brightness: parseInt(e.target.value) })}
                  className="w-full accent-black h-1 bg-black/10 rounded-none cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[10px] font-sans text-black/70">
                  <span>Contrast</span>
                  <span className="font-mono font-bold">{data.contrast}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={data.contrast}
                  onChange={(e) => onChange({ contrast: parseInt(e.target.value) })}
                  className="w-full accent-black h-1 bg-black/10 rounded-none cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[10px] font-sans text-black/70">
                  <span>Saturation</span>
                  <span className="font-mono font-bold">{data.saturation}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={data.saturation}
                  onChange={(e) => onChange({ saturation: parseInt(e.target.value) })}
                  className="w-full accent-black h-1 bg-black/10 rounded-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Name Style & Typography */}
      {activeTab === 'font_style' && (
        <div className="flex flex-col gap-5 animate-in fade-in duration-200">
          <label className="font-sans text-[10px] uppercase tracking-widest font-bold text-black/60">
            Typography Selection for Frame
          </label>

          {/* Font Picker Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {FONT_OPTIONS.map((font) => (
              <button
                key={font.id}
                onClick={() => onChange({ fontFamily: font.id })}
                className={`flex flex-col gap-1 p-3 text-left border transition-all ${
                  data.fontFamily === font.id
                    ? 'border-black bg-black text-white'
                    : 'border-black/15 bg-white hover:border-black text-black'
                }`}
              >
                <span className={`text-[10px] font-sans tracking-widest uppercase ${
                  data.fontFamily === font.id ? 'text-white/70' : 'text-black/50'
                }`}>
                  {font.name}
                </span>
                <span className={`truncate ${font.fontClass}`}>
                  {font.preview}
                </span>
              </button>
            ))}
          </div>

          {/* Size & Color Controls */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            {/* Font Size Slider */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs font-sans">
                <span className="text-black/80 font-medium uppercase tracking-wider text-[10px]">Font Size</span>
                <span className="text-black font-mono font-bold">{data.fontSize}px</span>
              </div>
              <input
                type="range"
                min="32"
                max="72"
                step="2"
                value={data.fontSize}
                onChange={(e) =>
                  onChange({ fontSize: parseInt(e.target.value) })
                }
                className="w-full accent-black h-1 bg-black/10 rounded-none cursor-pointer"
              />
            </div>

            {/* Vertical Position Slider */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs font-sans">
                <span className="text-black/80 font-medium uppercase tracking-wider text-[10px]">Vertical Offset</span>
                <span className="text-black font-mono font-bold">{data.nameOffsetY}px</span>
              </div>
              <input
                type="range"
                min="-30"
                max="30"
                step="1"
                value={data.nameOffsetY}
                onChange={(e) =>
                  onChange({ nameOffsetY: parseInt(e.target.value) })
                }
                className="w-full accent-black h-1 bg-black/10 rounded-none cursor-pointer"
              />
            </div>
          </div>

          {/* Text Color Picker */}
          <div className="flex flex-col gap-2 pt-1">
            <label className="font-sans text-[10px] uppercase tracking-widest font-bold text-black/60">
              Ink Color
            </label>
            <div className="flex items-center gap-2">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color.hex}
                  onClick={() => onChange({ textColor: color.hex })}
                  title={color.name}
                  className={`w-7 h-7 transition-transform flex items-center justify-center border border-black/20 ${
                    data.textColor === color.hex ? 'scale-110 ring-2 ring-black' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.hex }}
                >
                  {data.textColor === color.hex && (
                    <Check className="w-3.5 h-3.5 text-white drop-shadow-md" />
                  )}
                </button>
              ))}
              <input
                type="color"
                value={data.textColor}
                onChange={(e) => onChange({ textColor: e.target.value })}
                className="w-7 h-7 cursor-pointer bg-transparent border-0 p-0"
                title="Custom Color"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Poster Text & Options */}
      {activeTab === 'template_text' && (
        <div className="flex flex-col gap-4 animate-in fade-in duration-200">
          <label className="font-sans text-[10px] uppercase tracking-widest font-bold text-black/60">
            Poster Layout Text & Variables
          </label>

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-[10px] font-sans uppercase tracking-widest text-black/60">Header Tagline</label>
              <input
                type="text"
                value={data.headerText}
                onChange={(e) => onChange({ headerText: e.target.value })}
                className="w-full bg-transparent border-b border-black/30 py-1.5 text-xs font-sans uppercase tracking-widest text-black outline-none focus:border-black"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-sans uppercase tracking-widest text-black/60">Logo Title</label>
                <input
                  type="text"
                  value={data.chapterName}
                  onChange={(e) => onChange({ chapterName: e.target.value })}
                  className="w-full bg-transparent border-b border-black/30 py-1.5 text-xs font-sans uppercase tracking-widest text-black outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="text-[10px] font-sans uppercase tracking-widest text-black/60">College Code</label>
                <input
                  type="text"
                  value={data.chapterCode}
                  onChange={(e) => onChange({ chapterCode: e.target.value })}
                  className="w-full bg-transparent border-b border-black/30 py-1.5 text-xs font-sans uppercase tracking-widest text-black outline-none focus:border-black"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-sans uppercase tracking-widest text-black/60">Banner Line 1</label>
              <input
                type="text"
                value={data.bannerText1}
                onChange={(e) => onChange({ bannerText1: e.target.value })}
                className="w-full bg-transparent border-b border-black/30 py-1.5 text-xs font-sans text-black outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="text-[10px] font-sans uppercase tracking-widest text-black/60">Banner Line 2</label>
              <input
                type="text"
                value={data.bannerText2}
                onChange={(e) => onChange({ bannerText2: e.target.value })}
                className="w-full bg-transparent border-b border-black/30 py-1.5 text-xs font-sans text-black outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="text-[10px] font-sans uppercase tracking-widest text-black/60">Bottom Quote</label>
              <input
                type="text"
                value={data.quoteText}
                onChange={(e) => onChange({ quoteText: e.target.value })}
                className="w-full bg-transparent border-b border-black/30 py-1.5 text-xs font-serif italic text-black outline-none focus:border-black"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-black/10">
            <span className="text-xs font-sans uppercase tracking-wider text-black/80">Show Paperclip</span>
            <input
              type="checkbox"
              checked={data.showPaperclip}
              onChange={(e) => onChange({ showPaperclip: e.target.checked })}
              className="accent-black w-4 h-4 rounded-none cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-sans uppercase tracking-wider text-black/80">Show Purple Accent Blocks</span>
            <input
              type="checkbox"
              checked={data.showPurpleAccents}
              onChange={(e) => onChange({ showPurpleAccents: e.target.checked })}
              className="accent-black w-4 h-4 rounded-none cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
};
