import React, { useEffect, useRef, useState } from 'react';
import { X, Trophy, Play } from 'lucide-react';
import { SwitchControls, SwitchButton } from './SwitchControls';
interface Props { onClose: () => void; highScore: number; onHighScore: (value: number) => void }
interface Leaf { x: number; y: number; speed: number; phase: number; color: string; points: number }
export const GameModal: React.FC<Props> = ({ onClose, highScore, onHighScore }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playing, setPlaying] = useState(false), [paused, setPaused] = useState(false), [score, setScore] = useState(0), [time, setTime] = useState(30), [ended, setEnded] = useState(false);
  const state = useRef({ playing: false, paused: false, score: 0, seconds: 30, basket: 250, leaves: [] as Leaf[], spawn: 0 });
  const keys = useRef(new Set<SwitchButton>());
  const latest = useRef({ highScore, onHighScore }); latest.current = { highScore, onHighScore };
  const start = () => { state.current = { playing: true, paused: false, score: 0, seconds: 30, basket: 250, leaves: [], spawn: 0 }; setPlaying(true); setPaused(false); setScore(0); setTime(30); setEnded(false); keys.current.clear(); };
  const back = () => { state.current.playing = false; state.current.paused = false; setPlaying(false); setPaused(false); setEnded(false); keys.current.clear(); };
  const pause = () => { if (!state.current.playing) return; state.current.paused = !state.current.paused; setPaused(state.current.paused); };
  const onPress = (b: SwitchButton) => {
    keys.current.add(b);
    if (b === 'A') { if (!state.current.playing) start(); else if (state.current.paused) pause(); }
    if (b === 'B' || b === '−') back();
    if (b === 'Home') onClose();
    if (b === 'X' || b === '+') { if (!state.current.playing) start(); else pause(); }
    if (b === 'Y') start();
  };
  useEffect(() => {
    const canvas = canvasRef.current!, ctx = canvas.getContext('2d')!;
    let frame = 0, last = 0;
    const loop = (now: number) => {
      const dt = Math.min(0.04, (now - last) / 1000 || 0); last = now;
      const s = state.current;
      if (s.playing && !s.paused && !document.hidden) {
        const direction = (['RIGHT', 'R'].some(b => keys.current.has(b as SwitchButton)) ? 1 : 0) - (['LEFT', 'L'].some(b => keys.current.has(b as SwitchButton)) ? 1 : 0);
        const modifier = keys.current.has('ZL') || keys.current.has('DOWN') ? 0.45 : keys.current.has('ZR') || keys.current.has('UP') ? 1.7 : 1;
        s.basket = Math.max(37, Math.min(463, s.basket + direction * 300 * dt * modifier));
        s.seconds -= dt; s.spawn += dt;
        if (s.spawn > 0.43) { s.spawn = 0; const special = Math.random() > 0.7; s.leaves.push({ x: 30 + Math.random() * 440, y: -15, speed: 100 + Math.random() * 65, phase: Math.random() * 8, color: special ? '#C98464' : '#C99B53', points: special ? 20 : 10 }); }
        for (const leaf of s.leaves) {
          const oldY = leaf.y; leaf.y += leaf.speed * dt; leaf.x += Math.sin(leaf.y / 30 + leaf.phase) * 23 * dt;
          if (oldY < 280 && leaf.y >= 280 && Math.abs(leaf.x - s.basket) < 45) { s.score += leaf.points; leaf.y = 400; setScore(s.score); }
        }
        s.leaves = s.leaves.filter(l => l.y < 340);
        setTime(Math.max(0, Math.ceil(s.seconds)));
        if (s.seconds <= 0) { s.playing = false; setPlaying(false); setEnded(true); if (s.score > latest.current.highScore) latest.current.onHighScore(s.score); }
      }
      ctx.fillStyle = '#F1EADD'; ctx.fillRect(0, 0, 500, 320);
      ctx.fillStyle = '#DEDAC4'; ctx.beginPath(); ctx.ellipse(130, -30, 220, 110, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#DAC8A6'; ctx.beginPath(); ctx.ellipse(440, -20, 180, 95, 0, 0, Math.PI * 2); ctx.fill();
      for (const l of s.leaves) { ctx.save(); ctx.translate(l.x, l.y); ctx.rotate(l.y / 90); ctx.fillStyle = l.color; ctx.beginPath(); ctx.moveTo(0, -13); ctx.bezierCurveTo(18, -7, 16, 6, 0, 14); ctx.bezierCurveTo(-16, 6, -18, -7, 0, -13); ctx.fill(); ctx.restore(); }
      ctx.fillStyle = '#C9A47E'; ctx.strokeStyle = '#89674C'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(s.basket - 35, 285, 70, 24, [3, 3, 12, 12]); ctx.fill(); ctx.stroke();
      for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(s.basket - 27 + i * 10, 286); ctx.lineTo(s.basket - 27 + i * 10, 306); ctx.stroke(); }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    const hide = () => { if (document.hidden && state.current.playing) { state.current.paused = true; setPaused(true); keys.current.clear(); } };
    document.addEventListener('visibilitychange', hide);
    return () => { cancelAnimationFrame(frame); document.removeEventListener('visibilitychange', hide); };
  }, []);
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
    <div className="w-full max-w-xl bg-[#FAF7F0] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
      <header className="modal-header"><span className="w-2.5 h-2.5 bg-[#C98464] rounded-full" /><h2>Switch · 秋日接落叶</h2><button onClick={onClose} aria-label="关闭游戏"><X size={18} /></button></header>
      <div className="game-content">
        <div className="flex justify-between text-xs p-3"><span>得分 <b className="text-[#C98464]">{score}</b> · 剩余 {time}s</span><span className="flex items-center gap-1"><Trophy size={14} />最高 {highScore}</span></div>
        <div className="relative game-canvas-wrap"><canvas ref={canvasRef} width="500" height="320" aria-label="落叶小游戏画面" onPointerMove={e => { if (!state.current.playing) return; const r = e.currentTarget.getBoundingClientRect(); state.current.basket = Math.max(37, Math.min(463, (e.clientX - r.left) / r.width * 500)); }} className="w-full block touch-none" />
          {(!playing || paused) && <div className="game-overlay"><h3>{paused ? '留一小会儿空白' : ended ? '接住了 ' + score + ' 分的秋天' : '接住一点秋天'}</h3><p>{ended ? '30 秒结束，随时可以再玩一局。' : '移动竹篮收集落叶，30 秒就好。'}</p><button className="soft-button" onClick={paused ? pause : start}><Play size={14} />{paused ? '继续 / A' : '开始 / A'}</button></div>}
        </div>
        <SwitchControls playing={playing} paused={paused} onPress={onPress} onRelease={b => keys.current.delete(b)} />
        <p className="game-help">A/Enter 开始 · B 返回 · X/+ 暂停 · Y 重开 · 方向键/L/R 移动 · ZL 慢速/ZR 快速 · Home/H 退出</p>
      </div>
    </div>
  </div>;
};
