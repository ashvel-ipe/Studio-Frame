import React, { useEffect, useRef, useState } from 'react';
import { PosterData } from '../types';
import { Camera, Image as ImageIcon, Move, RotateCw, ZoomIn } from 'lucide-react';

const logoUrl = new URL('../../mbc.png', import.meta.url).href;

interface PosterCanvasProps {
  data: PosterData;
  onPhotoUpload?: (file: File) => void;
  onPhotoTransformChange?: (x: number, y: number, scale: number) => void;
  className?: string;
  isExporting?: boolean;
}

export const PosterCanvas: React.FC<PosterCanvasProps> = ({
  data,
  onPhotoUpload,
  onPhotoTransformChange,
  className = '',
  isExporting = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [photoImage, setPhotoImage] = useState<HTMLImageElement | null>(null);
  const [logoImage, setLogoImage] = useState<HTMLImageElement | null>(null);
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; initialX: number; initialY: number }>({
    x: 0,
    y: 0,
    initialX: 0,
    initialY: 0,
  });

  // Load user image when photoUrl changes
  useEffect(() => {
    if (!data.photoUrl) {
      setPhotoImage(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setPhotoImage(img);
    };
    img.onerror = () => {
      console.error('Failed to load user photo');
    };
    img.src = data.photoUrl;
  }, [data.photoUrl]);

  // Preload the uploaded logo image once
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setLogoImage(img);
    img.onerror = () => console.error('Failed to load frame logo');
    img.src = logoUrl;
  }, []);

  // Helper to draw text scaled dynamically to fit maximum width
  const drawFittedText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxW: number,
    baseSize: number,
    fontWeight: string,
    fontFamily: string,
    color: string,
    align: 'left' | 'center' | 'right' = 'left'
  ) => {
    ctx.save();
    let size = baseSize;
    ctx.font = `${fontWeight} ${size}px ${fontFamily}`;
    ctx.textAlign = align;
    ctx.textBaseline = 'top';
    let textW = ctx.measureText(text).width;

    while (textW > maxW && size > 12) {
      size -= 1;
      ctx.font = `${fontWeight} ${size}px ${fontFamily}`;
      textW = ctx.measureText(text).width;
    }

    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    ctx.restore();
    return size;
  };

  // Ensure custom web fonts are loaded before canvas renders
  useEffect(() => {
    if (document.fonts) {
      document.fonts.ready.then(() => {
        renderCanvas();
      });
    }
  }, [data]);

  // Render poster on canvas
  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High resolution canvas dimensions (1200 x 1500)
    const W = 1200;
    const H = 1500;

    canvas.width = W;
    canvas.height = H;

    // 1. Draw Background
    ctx.fillStyle = '#06050a';
    ctx.fillRect(0, 0, W, H);

    // Subtle dark gradient overlay
    const bgGradient = ctx.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, 900);
    bgGradient.addColorStop(0, '#110b22');
    bgGradient.addColorStop(1, '#050409');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, W, H);

    // 2. Draw Decorative Glowing Purple Accent Blocks
    if (data.showPurpleAccents) {
      // Top left block
      drawPurpleGlowBlock(ctx, 180, 35, 130, 70, 0.9);
      // Mid left block
      drawPurpleGlowBlock(ctx, 50, 700, 95, 80, 0.85);
      // Mid right block 1
      drawPurpleGlowBlock(ctx, 990, 580, 120, 65, 0.85);
      // Mid right block 2
      drawPurpleGlowBlock(ctx, 930, 640, 70, 60, 0.95);
    }

    // 3. Draw Top Header
    // Left vertical text: "WELCOME TO THE FUTURE, FRESHERS!"
    ctx.save();
    ctx.translate(100, 590);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 22px "Space Grotesk", "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = '0.22em';
    ctx.fillText(data.headerText, 0, 0);
    ctx.restore();

    // Top Right Logo Image
    const logoMaxWidth = 850;
    const logoMaxHeight = 330;
    const logoAspect = logoImage ? (logoImage.width / logoImage.height) : 1;
    const logoTargetWidth = logoImage ? Math.min(logoMaxWidth, Math.round(logoMaxHeight * logoAspect)) : logoMaxWidth;
    const logoTargetHeight = logoImage ? Math.round(logoTargetWidth / logoAspect) : 140;
    const logoX = W - logoTargetWidth - 10;
    const logoY = 40;

    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    if (logoImage) {
      ctx.drawImage(logoImage, logoX, logoY, logoTargetWidth, logoTargetHeight);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'right';
      ctx.font = '800 46px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(data.chapterName, W - 40, logoY + 20);
      ctx.font = '700 24px "Space Grotesk", sans-serif';
      ctx.fillText(data.chapterCode, W - 40, logoY + 60);
    }
    ctx.restore();

    // 4. Centerpiece - Double Cards Assembly
    const centerX = 600;
    const centerY = 650;

    // A) Back White Sheet (Tilted clockwise ~ +3.5 deg)
    ctx.save();
    ctx.translate(centerX + 30, centerY + 20);
    ctx.rotate((3.8 * Math.PI) / 180);

    const backW = 690;
    const backH = 880;

    // Shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetX = 10;
    ctx.shadowOffsetY = 15;

    ctx.fillStyle = '#f1f1f4';
    drawRoundedRect(ctx, -backW / 2, -backH / 2, backW, backH, 8);
    ctx.fill();
    ctx.restore();

    // B) Front Main Polaroid Card (Tilted counter-clockwise ~ -7.5 deg)
    ctx.save();
    ctx.translate(centerX - 10, centerY);
    ctx.rotate((-7.5 * Math.PI) / 180);

    const cardW = 710;
    const cardH = 890;
    const cardLeft = -cardW / 2;
    const cardTop = -cardH / 2;

    // Card drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetX = -5;
    ctx.shadowOffsetY = 20;

    // Main Polaroid White Base
    ctx.fillStyle = '#fdfdfd';
    drawRoundedRect(ctx, cardLeft, cardTop, cardW, cardH, 12);
    ctx.fill();

    // Subtle polaroid edge stroke
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Inner Cutout Rectangle for User Photo
    const boxPaddingX = 42;
    const boxPaddingTop = 42;
    const boxW = cardW - boxPaddingX * 2; // 626px
    const boxH = 650; // 650px
    const boxX = cardLeft + boxPaddingX;
    const boxY = cardTop + boxPaddingTop;

    // Draw dark inner rectangle background for photo box
    ctx.fillStyle = '#09090b';
    ctx.fillRect(boxX, boxY, boxW, boxH);

    // Render User Photo Inside Box (with Clipping)
    ctx.save();
    ctx.beginPath();
    ctx.rect(boxX, boxY, boxW, boxH);
    ctx.clip();

    if (photoImage) {
      ctx.save();
      // Apply CSS Filters (brightness, contrast, saturation)
      ctx.filter = `brightness(${data.brightness}%) contrast(${data.contrast}%) saturate(${data.saturation}%)`;

      // Center of the inner photo box
      const photoBoxCenterX = boxX + boxW / 2;
      const photoBoxCenterY = boxY + boxH / 2;

      ctx.translate(photoBoxCenterX + data.photoX, photoBoxCenterY + data.photoY);
      ctx.rotate((data.photoRotate * Math.PI) / 180);

      // Scale photo to fit box nicely by default
      const scaleToFit = Math.max(boxW / photoImage.width, boxH / photoImage.height);
      const finalScale = scaleToFit * data.photoScale;

      const drawW = photoImage.width * finalScale;
      const drawH = photoImage.height * finalScale;

      ctx.drawImage(photoImage, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();
    } else {
      // Placeholder state inside empty box
      ctx.fillStyle = '#18181b';
      ctx.fillRect(boxX, boxY, boxW, boxH);

      // Camera Icon + Guide text
      ctx.fillStyle = '#a1a1aa';
      ctx.font = '600 26px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('📷 Click or Drop Photo Here', boxX + boxW / 2, boxY + boxH / 2 - 20);

      ctx.font = '400 18px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#71717a';
      ctx.fillText('Fits automatically into this frame', boxX + boxW / 2, boxY + boxH / 2 + 25);
    }
    ctx.restore(); // end clip

    // Inner shadow on photo box for realistic depth
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.lineWidth = 3;
    ctx.strokeRect(boxX, boxY, boxW, boxH);
    ctx.restore();

    // C) Bottom "White Sloppy Space" on Polaroid Card (Where Name is shown!)
    const whiteSpaceTop = boxY + boxH;
    const whiteSpaceH = cardTop + cardH - whiteSpaceTop; // ~156px space

    // Render User Name
    ctx.save();
    const nameCenterY = whiteSpaceTop + whiteSpaceH / 2 - 12 + data.nameOffsetY;
    const maxNameWidth = cardW - 70; // 640px max width

    // Draw fitted user name text
    drawFittedText(
      ctx,
      data.userName || 'YOUR NAME',
      0,
      nameCenterY - data.fontSize / 2,
      maxNameWidth,
      data.fontSize,
      '700',
      `"${data.fontFamily}", cursive, sans-serif`,
      data.textColor || '#111827',
      'center'
    );

    // Draw Subtext if provided
    if (data.userSubtext) {
      drawFittedText(
        ctx,
        data.userSubtext.toUpperCase(),
        0,
        nameCenterY + data.fontSize / 2 + 10,
        maxNameWidth,
        17,
        '600',
        '"Plus Jakarta Sans", sans-serif',
        '#64748b',
        'center'
      );
    }
    ctx.restore();

    // D) Paperclip at top center of front card
    if (data.showPaperclip) {
      drawPaperclip(ctx, 0, cardTop - 15);
    }

    ctx.restore(); // end front card transform

    // 5. Lower Section - Purple Box (Sized to fit text perfectly without spilling outside!)
    const purpleBoxX = 75;
    const purpleBoxY = 1040;
    const purpleBoxW = 730;
    const purpleBoxH = 260;

    ctx.save();
    // Purple box shadow
    ctx.shadowColor = 'rgba(88, 28, 135, 0.5)';
    ctx.shadowBlur = 25;
    ctx.shadowOffsetY = 10;

    // Fill solid deep purple box
    ctx.fillStyle = '#581c87'; // rich purple
    ctx.fillRect(purpleBoxX, purpleBoxY, purpleBoxW, purpleBoxH);

    ctx.shadowColor = 'transparent';

    // Text inside purple box - dynamically fitted to purpleBoxW bounds
    const bannerPaddingX = 32;
    const maxBannerWidth = purpleBoxW - bannerPaddingX * 2; // ~666px text area

    // Banner Line 1
    drawFittedText(
      ctx,
      data.bannerText1,
      purpleBoxX + bannerPaddingX,
      purpleBoxY + 30,
      maxBannerWidth,
      34,
      '500',
      '"Plus Jakarta Sans", sans-serif',
      '#ffffff',
      'left'
    );

    // Banner Line 2
    drawFittedText(
      ctx,
      data.bannerText2,
      purpleBoxX + bannerPaddingX,
      purpleBoxY + 110,
      maxBannerWidth,
      40,
      '800',
      '"Plus Jakarta Sans", sans-serif',
      '#ffffff',
      'left'
    );
    ctx.restore();

    // 6. Bottom Right "Join Now!" Callout
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'right';
    ctx.font = '700 34px "Fira Code", monospace';
    ctx.fillText(data.calloutText, 1120, 1330);
    ctx.restore();

    // 7. Bottom Center Tagline
    ctx.save();
    ctx.fillStyle = '#f1f5f9';
    ctx.textAlign = 'center';
    ctx.font = '600 24px "Space Grotesk", sans-serif';
    ctx.fillText(data.quoteText, W / 2, 1430);
    ctx.restore();
  };

  // Helper to draw purple glowing accent blocks
  const drawPurpleGlowBlock = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    alpha = 0.8
  ) => {
    ctx.save();
    ctx.globalAlpha = alpha;

    // Outer blur shadow
    ctx.shadowColor = 'rgba(147, 51, 234, 0.7)';
    ctx.shadowBlur = 25;

    const grad = ctx.createLinearGradient(x, y, x + w, y + h);
    grad.addColorStop(0, '#6b21a8');
    grad.addColorStop(1, '#3b0764');

    ctx.fillStyle = grad;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
  };

  // Helper to draw realistic metal paperclip
  const drawPaperclip = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.save();
    ctx.translate(x, y);

    // Metallic clip drop shadow
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 5;

    ctx.lineWidth = 9;
    ctx.strokeStyle = '#94a3b8'; // metallic silver
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw paperclip loops path
    ctx.beginPath();
    ctx.moveTo(15, 120);
    ctx.lineTo(15, 25);
    ctx.arc(0, 25, 15, 0, Math.PI, true);
    ctx.lineTo(-15, 135);
    ctx.arc(-2, 135, 13, Math.PI, 0, true);
    ctx.lineTo(11, 45);
    ctx.arc(4, 45, 7, 0, Math.PI, true);
    ctx.lineTo(-3, 105);
    ctx.stroke();

    // Metallic highlight overlay
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#f8fafc';
    ctx.shadowColor = 'transparent';
    ctx.stroke();

    ctx.restore();
  };

  // Helper to draw rounded rectangle
  const drawRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  // Render trigger whenever inputs change
  useEffect(() => {
    renderCanvas();
  }, [data, photoImage, logoImage]);

  // Mouse / Touch Dragging to reposition photo inside canvas
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!data.photoUrl) return;
    setIsDraggingPhoto(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      initialX: data.photoX,
      initialY: data.photoY,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingPhoto || !onPhotoTransformChange) return;
    const deltaX = (e.clientX - dragStart.x) * 1.5; // Sensitivity factor
    const deltaY = (e.clientY - dragStart.y) * 1.5;

    // Apply rotation angle correction to drag movement so dragging feels natural
    const rad = (-7.5 * Math.PI) / 180;
    const correctedX = deltaX * Math.cos(-rad) - deltaY * Math.sin(-rad);
    const correctedY = deltaX * Math.sin(-rad) + deltaY * Math.cos(-rad);

    onPhotoTransformChange(
      Math.round(dragStart.initialX + correctedX),
      Math.round(dragStart.initialY + correctedY),
      data.photoScale
    );
  };

  const handleMouseUp = () => {
    setIsDraggingPhoto(false);
  };

  // File Drop handler on Canvas
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0] && onPhotoUpload) {
      onPhotoUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col items-center justify-center w-full max-w-full ${className}`}
    >
      <div className="relative group rounded-xl overflow-hidden shadow-2xl border border-zinc-800 bg-zinc-950 p-2 sm:p-4">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`w-full max-w-[540px] h-auto rounded-lg cursor-${
            data.photoUrl ? (isDraggingPhoto ? 'grabbing' : 'grab') : 'pointer'
          } transition-all duration-200`}
        />

        {/* Hover hint for photo drag */}
        {data.photoUrl && !isExporting && (
          <div className="absolute top-6 left-6 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900/90 text-zinc-200 text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur-md border border-zinc-700 flex items-center gap-1.5 shadow-lg">
            <Move className="w-3.5 h-3.5 text-purple-400" />
            <span>Click & Drag to align photo</span>
          </div>
        )}
      </div>
    </div>
  );
};
