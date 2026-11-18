import React, { useRef, useState, useEffect } from 'react';
import { X, Undo2, Trash2, Download, Check } from 'lucide-react';
import { saveDrawingDraft, loadDrawingDraft } from '../services/storage';

interface DrawingModalProps {
  onClose: () => void;
}

export const DrawingModal: React.FC<DrawingModalProps> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState('#34312E');
  const [lineWidth, setLineWidth] = useState(4);
  const [isEraser, setIsEraser] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [savedNotice, setSavedNotice] = useState(false);
  const [exportUrl, setExportUrl] = useState('');
  const [ready, setReady] = useState(false);
  const [saveStatus, setSaveStatus] = useState('Restoring this device's draft…');

  const colors = [
    { hex: '#34312E', name: 'Charcoal' },
    { hex: '#C98464', name: 'Terracotta' },
    { hex: '#91A58C', name: 'Sage' },
    { hex: '#C9A47E', name: 'Wood' },
    { hex: '#D97706', name: 'Amber' },
    { hex: '#4F46E5', name: 'Night blue' },
  ];

  // Initialize canvas and load draft from IndexedDB
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high-res backing
    const width = 640;
    const height = 480;
    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = '#FAF7F0';
    ctx.fillRect(0, 0, width, height);

    let active = true;
    // Load before accepting strokes, so a late draft cannot overwrite a new drawing.
    loadDrawingDraft().then((saved) => {
      if (!active) return;
      if (saved) {
        const img = new Image();
        img.onload = () => {
          if (!active) return;
          ctx.drawImage(img, 0, 0);
          setHistory([ctx.getImageData(0, 0, width, height)]);
          setReady(true); setSaveStatus('Draft restored · stored on this device');
        };
        img.onerror = () => { if (active) { setReady(true); setSaveStatus('The draft could not be restored. Export important work.'); } };
        img.src = saved;
      } else {
        setHistory([ctx.getImageData(0, 0, width, height)]);
        setReady(true); setSaveStatus('Drawing stays on this device');
      }
    });
    return () => { active = false; };
  }, []);

  const saveHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-15), snapshot]);

    // Autosave to IndexedDB
    const dataUrl = canvas.toDataURL();
    setSaveStatus('Saving…');
    saveDrawingDraft(dataUrl).then(ok => setSaveStatus(ok ? 'Draft saved · on this device' : 'Could not save · export a PNG'));
  };

  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!ready) return;
    isDrawing.current = true;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const scaleX = 640 / rect.width;
    const scaleY = 480 / rect.height;

    lastPos.current = {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !lastPos.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const scaleX = 640 / rect.width;
    const scaleY = 480 / rect.height;

    const currentX = (clientX - rect.left) * scaleX;
    const currentY = (clientY - rect.top) * scaleY;

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(currentX, currentY);
    ctx.strokeStyle = isEraser ? '#FAF7F0' : color;
    ctx.lineWidth = lineWidth * (isEraser ? 3 : 1);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    lastPos.current = { x: currentX, y: currentY };
  };

  const endDraw = () => {
    if (isDrawing.current) {
      isDrawing.current = false;
      lastPos.current = null;
      saveHistory();
    }
  };

  const undo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const nextHistory = [...history];
    nextHistory.pop(); // remove current
    const previous = nextHistory[nextHistory.length - 1];
    ctx.putImageData(previous, 0, 0);
    setHistory(nextHistory);

    // Save to IndexedDB
    saveDrawingDraft(canvas.toDataURL());
  };

  const clearCanvas = () => {
    if (!window.confirm('Clear the canvas?')) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#FAF7F0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveHistory();
  };

  const exportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `roomforone-doodle-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    setExportUrl(link.href);
    document.body.appendChild(link);
    link.click();
    link.remove();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-[#FAF7F0] border border-[#C9A47E]/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#C9A47E]/20">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#91A58C]" />
            <h3 className="text-sm font-bold text-[#34312E]">
              Drawing Board
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close drawing board"
            className="p-1.5 rounded-full hover:bg-[#EFE8DC] text-[#34312E]/70 hover:text-[#34312E] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-3 bg-[#EFE8DC]/50 border-b border-[#C9A47E]/20 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Colors */}
          <div className="flex items-center gap-1.5">
            {colors.map((c) => (
              <button
                key={c.hex}
                onClick={() => {
                  setColor(c.hex);
                  setIsEraser(false);
                }}
                className={`w-6 h-6 rounded-full border transition-all cursor-pointer ${
                  !isEraser && color === c.hex
                    ? 'ring-2 ring-offset-2 ring-[#C98464] scale-110'
                    : 'border-black/10'
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
                aria-label={c.name}
              />
            ))}
          </div>

          {/* Stroke Width & Eraser */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEraser(!isEraser)}
              className={`px-2.5 py-1 rounded-lg border font-medium transition-all cursor-pointer ${
                isEraser
                  ? 'bg-[#C98464] text-white border-[#C98464]'
                  : 'bg-[#FAF7F0] text-[#34312E] border-[#C9A47E]/30 hover:bg-[#FAF7F0]'
              }`}
            >
              Eraser
            </button>
            <div className="flex items-center gap-1 bg-[#FAF7F0] px-2 py-1 rounded-lg border border-[#C9A47E]/30">
              <span className="text-[10px] text-[#34312E]/60">Size</span>
              {[2, 5, 10].map((w) => (
                <button
                  key={w}
                  onClick={() => setLineWidth(w)}
                  className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] cursor-pointer ${
                    lineWidth === w ? 'bg-[#C9A47E] text-white' : 'text-[#34312E]/70'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={undo}
              disabled={history.length <= 1}
              className="p-1.5 rounded-lg bg-[#FAF7F0] border border-[#C9A47E]/30 hover:bg-white text-[#34312E] disabled:opacity-40 cursor-pointer"
              title="Undo" aria-label="Undo"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={clearCanvas}
              className="p-1.5 rounded-lg bg-[#FAF7F0] border border-[#C9A47E]/30 hover:bg-red-50 text-red-600 cursor-pointer"
              title="Clear canvas" aria-label="Clear canvas"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={exportPNG}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#91A58C] hover:bg-[#7F937A] text-white font-medium cursor-pointer transition-colors shadow-xs"
            >
              {savedNotice ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
              <span>{savedNotice ? 'PNG ready' : 'Export PNG'}</span>
            </button>
          </div>
          {exportUrl && <a className="text-xs underline text-[#825E3B]" href={exportUrl} download="roomforone-doodle.png">Download PNG</a>}
        </div>

        {/* Canvas Area */}
        <div className="p-4 bg-[#EFE8DC]/30 flex items-center justify-center">
          <div className="relative rounded-2xl overflow-hidden border-2 border-[#C9A47E]/30 shadow-inner bg-[#FAF7F0]">
            <canvas
              ref={canvasRef}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={endDraw}
              aria-label="Drawing canvas"
              className="w-full max-w-[560px] h-auto block touch-none cursor-crosshair"
            />
          </div>
        </div>

        <div className="px-6 py-2 bg-[#FAF7F0] border-t border-[#C9A47E]/15 text-[11px] text-[#34312E]/60 flex items-center justify-between">
          <span>{saveStatus}</span>
          <span>Never uploaded to an external server</span>
        </div>
      </div>
    </div>
  );
};
