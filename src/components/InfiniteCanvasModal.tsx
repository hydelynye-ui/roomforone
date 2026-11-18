import React, { useEffect, useRef, useState } from 'react';
import { Download, Minus, Plus, StickyNote, Trash2, X } from 'lucide-react';
import type { CanvasNote } from '../types';
import { loadDrawingDraft, saveDrawingDraft } from '../services/storage';

interface Props { notes: CanvasNote[]; onNotes: (notes: CanvasNote[]) => void; onClose: () => void }
const width = 640;
const height = 480;
const tones: CanvasNote['tone'][] = ['sage', 'clay', 'cream'];

export const InfiniteCanvasModal: React.FC<Props> = ({ notes, onNotes, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const drawing = useRef(false);
  const pan = useRef<{ id: number; x: number; y: number; offsetX: number; offsetY: number } | null>(null);
  const noteDrag = useRef<{ id: string; pointerId: number; x: number; y: number; noteX: number; noteY: number } | null>(null);
  const notesRef = useRef(notes);
  const [draftNotes, setDraftNotes] = useState(notes);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [color, setColor] = useState('#34312E');
  const [eraser, setEraser] = useState(false);
  const [ready, setReady] = useState(false);
  const [saveStatus, setSaveStatus] = useState('Restoring your canvas…');

  useEffect(() => { notesRef.current = draftNotes; }, [draftNotes]);
  useEffect(() => { setDraftNotes(notes); notesRef.current = notes; }, [notes]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    canvas.width = width;
    canvas.height = height;
    ctx.fillStyle = '#FAF7F0';
    ctx.fillRect(0, 0, width, height);
    let active = true;
    loadDrawingDraft().then(saved => {
      if (!active) return;
      if (!saved) { setReady(true); setSaveStatus('Ready · saved on this device'); return; }
      const image = new Image();
      image.onload = () => {
        if (!active) return;
        ctx.drawImage(image, 0, 0, width, height);
        setReady(true);
        setSaveStatus('Previous sketch restored');
      };
      image.onerror = () => { if (active) { setReady(true); setSaveStatus('Could not restore the previous sketch'); } };
      image.src = saved;
    });
    return () => { active = false; };
  }, []);

  const saveCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setSaveStatus('Saving…');
    saveDrawingDraft(canvas.toDataURL('image/png')).then(ok => setSaveStatus(ok ? 'Saved on this device' : 'Save unavailable · export a PNG'));
  };

  const point = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: (event.clientX - rect.left) * width / rect.width, y: (event.clientY - rect.top) * height / rect.height };
  };
  const startDraw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!ready) return;
    drawing.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    const p = point(event);
    const ctx = event.currentTarget.getContext('2d');
    if (!ctx) return;
    ctx.beginPath(); ctx.moveTo(p.x, p.y);
  };
  const draw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = event.currentTarget.getContext('2d');
    if (!ctx) return;
    const p = point(event);
    ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = eraser ? '#FAF7F0' : color;
    ctx.lineWidth = eraser ? 28 : 4;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
  };
  const endDraw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    drawing.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    saveCanvas();
  };

  const addNote = () => {
    const note: CanvasNote = {
      id: `canvas-note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      text: '',
      x: 340 + (draftNotes.length % 3) * 28,
      y: -180 + (draftNotes.length % 4) * 24,
      tone: tones[draftNotes.length % tones.length],
    };
    const next = [...notesRef.current, note].slice(-100);
    notesRef.current = next; setDraftNotes(next); onNotes(next);
  };
  const updateNote = (id: string, text: string) => {
    const next = notesRef.current.map(note => note.id === id ? { ...note, text } : note);
    notesRef.current = next; setDraftNotes(next); onNotes(next);
  };
  const removeNote = (id: string) => {
    const next = notesRef.current.filter(note => note.id !== id);
    notesRef.current = next; setDraftNotes(next); onNotes(next);
  };
  const startNoteDrag = (event: React.PointerEvent<HTMLDivElement>, note: CanvasNote) => {
    if ((event.target as HTMLElement).closest('textarea,button')) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    noteDrag.current = { id: note.id, pointerId: event.pointerId, x: event.clientX, y: event.clientY, noteX: note.x, noteY: note.y };
  };
  const moveNote = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = noteDrag.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = (event.clientX - drag.x) / zoom;
    const dy = (event.clientY - drag.y) / zoom;
    const next = notesRef.current.map(note => note.id === drag.id ? { ...note, x: drag.noteX + dx, y: drag.noteY + dy } : note);
    notesRef.current = next; setDraftNotes(next);
  };
  const endNoteDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!noteDrag.current || noteDrag.current.pointerId !== event.pointerId) return;
    noteDrag.current = null;
    onNotes(notesRef.current);
  };
  const startPan = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pan.current = { id: event.pointerId, x: event.clientX, y: event.clientY, offsetX: offset.x, offsetY: offset.y };
  };
  const movePan = (event: React.PointerEvent<HTMLDivElement>) => {
    const active = pan.current;
    if (!active || active.id !== event.pointerId) return;
    setOffset({ x: active.offsetX + event.clientX - active.x, y: active.offsetY + event.clientY - active.y });
  };
  const endPan = (event: React.PointerEvent<HTMLDivElement>) => {
    if (pan.current?.id === event.pointerId) pan.current = null;
  };
  const clearCanvas = () => {
    if (!window.confirm('Clear the drawing?')) return;
    const canvas = canvasRef.current, ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.fillStyle = '#FAF7F0'; ctx.fillRect(0, 0, width, height); saveCanvas();
  };
  const exportCanvas = () => {
    const source = canvasRef.current;
    const viewport = viewportRef.current;
    if (!source || !viewport) return;
    const rect = viewport.getBoundingClientRect();
    const output = document.createElement('canvas');
    output.width = Math.max(1, Math.round(rect.width));
    output.height = Math.max(1, Math.round(rect.height));
    const ctx = output.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ECE9E0'; ctx.fillRect(0, 0, output.width, output.height);
    const centerX = output.width / 2 + offset.x;
    const centerY = output.height / 2 + offset.y;
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(zoom, zoom);
    ctx.drawImage(source, -width / 2, -height / 2, width, height);
    const toneColors: Record<CanvasNote['tone'], string> = { sage: '#DCE5D8', clay: '#F0DDD1', cream: '#F0E7C9' };
    for (const note of notesRef.current) {
      ctx.fillStyle = toneColors[note.tone];
      ctx.fillRect(note.x, note.y, 176, 154);
      ctx.strokeStyle = 'rgba(52,49,46,.12)'; ctx.strokeRect(note.x, note.y, 176, 154);
      ctx.fillStyle = 'rgba(52,49,46,.42)'; ctx.font = '7px sans-serif'; ctx.fillText('NOTE', note.x + 12, note.y + 17);
      ctx.fillStyle = '#34312E'; ctx.font = '10px sans-serif';
      const words = note.text.split(/\\s+/);
      let line = '', lineY = note.y + 39;
      for (const word of words) {
        const candidate = line ? line + ' ' + word : word;
        if (ctx.measureText(candidate).width > 150 && line) {
          ctx.fillText(line, note.x + 12, lineY); lineY += 15; line = word;
          if (lineY > note.y + 140) break;
        } else line = candidate;
      }
      if (line && lineY <= note.y + 140) ctx.fillText(line, note.x + 12, lineY);
    }
    ctx.restore();
    const link = document.createElement('a');
    link.download = `roomforone-canvas-${Date.now()}.png`;
    link.href = output.toDataURL('image/png');
    document.body.appendChild(link); link.click(); link.remove();
  };

  return (
    <div className="infinite-canvas-overlay" onClick={event => event.stopPropagation()}>
      <section className="infinite-canvas-shell" role="dialog" aria-modal="true" aria-label="Infinite Canvas">
        <header className="infinite-canvas-header">
          <div><span className="infinite-canvas-mark"><StickyNote size={16} /></span><div><strong>Infinite Canvas</strong><small>Draw, collect and connect ideas.</small></div></div>
          <div className="infinite-canvas-actions">
            <button onClick={addNote}><Plus size={15} /> Add note</button>
            <button onClick={() => setZoom(value => Math.max(.55, Math.min(1.8, value - .1)))} aria-label="Zoom out"><Minus size={15} /></button>
            <span>{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(value => Math.max(.55, Math.min(1.8, value + .1)))} aria-label="Zoom in"><Plus size={15} /></button>
            <button onClick={exportCanvas}><Download size={15} /> Export</button>
            <button onClick={onClose} aria-label="Close canvas"><X size={17} /></button>
          </div>
        </header>
        <div className="infinite-canvas-tools">
          <div className="infinite-canvas-colors">{['#34312E', '#C98464', '#91A58C', '#C9A47E', '#667F91'].map(value => <button key={value} style={{ background: value }} className={color === value && !eraser ? 'active' : ''} onClick={() => { setColor(value); setEraser(false); }} aria-label={`Use ${value}`} />)}</div>
          <button className={eraser ? 'active' : ''} onClick={() => setEraser(value => !value)}>Eraser</button>
          <button onClick={clearCanvas}><Trash2 size={14} /> Clear sketch</button>
          <span>Drag the blank space to move around · Scroll or use + / − to zoom</span>
        </div>
        <div
          ref={viewportRef}
          className="infinite-canvas-viewport"
          onPointerDown={startPan}
          onPointerMove={movePan}
          onPointerUp={endPan}
          onPointerCancel={endPan}
          onWheel={event => { event.preventDefault(); setZoom(value => Math.max(.55, Math.min(1.8, value * Math.exp(-event.deltaY * .001)))); }}
        >
          <div className="infinite-canvas-world" style={{ transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${zoom})` }}>
            <canvas
              ref={canvasRef}
              className="infinite-canvas-drawing"
              onPointerDown={startDraw}
              onPointerMove={draw}
              onPointerUp={endDraw}
              onPointerCancel={endDraw}
              aria-label="Infinite canvas drawing area"
            />
            {draftNotes.map(note => <article
              key={note.id}
              className={`infinite-canvas-note tone-${note.tone}`}
              style={{ left: note.x, top: note.y }}
              onPointerDown={event => startNoteDrag(event, note)}
              onPointerMove={moveNote}
              onPointerUp={endNoteDrag}
              onPointerCancel={endNoteDrag}
            >
              <header><span>NOTE</span><button onClick={() => removeNote(note.id)} aria-label="Delete note"><X size={12} /></button></header>
              <textarea value={note.text} onChange={event => updateNote(note.id, event.target.value)} placeholder="Leave a thought here…" maxLength={2000} />
            </article>)}
          </div>
        </div>
        <footer className="infinite-canvas-footer"><span>{saveStatus}</span><span>{draftNotes.length} notes · Private to this device</span></footer>
      </section>
    </div>
  );
};
