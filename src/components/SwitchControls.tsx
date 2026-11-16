import React, { useEffect, useRef, useState } from 'react';
export type SwitchButton = 'A' | 'B' | 'X' | 'Y' | 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'L' | 'R' | 'ZL' | 'ZR' | '+' | '−' | 'Home';
interface Props { playing: boolean; paused: boolean; onPress: (button: SwitchButton) => void; onRelease: (button: SwitchButton) => void }
const keymap: Record<string, SwitchButton> = { Enter: 'A', a: 'A', b: 'B', x: 'X', y: 'Y', ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT', l: 'L', r: 'R', q: 'ZL', e: 'ZR', '+': '+', '=': '+', '-': '−', h: 'Home' };
const labels: Record<string, string> = { UP: '↑', DOWN: '↓', LEFT: '←', RIGHT: '→' };
export const SwitchControls: React.FC<Props> = props => {
  const live = useRef(props); live.current = props;
  const [pressed, setPressed] = useState<Set<SwitchButton>>(new Set());
  const down = useRef(new Set<SwitchButton>());
  const disabled = (button: SwitchButton) => !live.current.playing && ['LEFT', 'RIGHT', 'UP', 'DOWN', 'L', 'R', 'ZL', 'ZR', 'X'].includes(button);
  const press = (b: SwitchButton) => {
    if (disabled(b) || down.current.has(b)) return;
    down.current.add(b); setPressed(new Set(down.current)); live.current.onPress(b);
  };
  const release = (b: SwitchButton) => { down.current.delete(b); setPressed(new Set(down.current)); live.current.onRelease(b); };
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (/INPUT|TEXTAREA|SELECT/.test((e.target as HTMLElement)?.tagName)) return;
      const b = keymap[e.key]; if (!b) return;
      e.preventDefault(); if (!e.repeat) press(b);
    };
    const onUp = (e: KeyboardEvent) => { const b = keymap[e.key]; if (b) { e.preventDefault(); release(b); } };
    const clear = () => { for (const b of [...down.current]) release(b); };
    window.addEventListener('keydown', onDown); window.addEventListener('keyup', onUp); window.addEventListener('blur', clear);
    return () => { window.removeEventListener('keydown', onDown); window.removeEventListener('keyup', onUp); window.removeEventListener('blur', clear); clear(); };
  }, []);
  const button = (b: SwitchButton, extra = '') => <button key={b} type="button" aria-label={'手柄 ' + b} aria-pressed={pressed.has(b)} disabled={disabled(b)} className={'switch-button ' + extra + (pressed.has(b) ? ' pressed' : '')}
    onPointerDown={e => { e.preventDefault(); e.currentTarget.focus(); e.currentTarget.setPointerCapture(e.pointerId); press(b); }}
    onPointerUp={e => { release(b); if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId); }}
    onPointerCancel={() => release(b)} onLostPointerCapture={() => release(b)}
    onClick={e => { if (e.detail === 0) { press(b); window.setTimeout(() => release(b), 120); } }}
  >{labels[b] || b}</button>;
  return <div className="switch-controller" aria-label="Switch 手柄操作层">
    <div className="switch-shoulders"><div>{button('ZL')}{button('L')}</div><span>roomforone</span><div>{button('R')}{button('ZR')}</div></div>
    <div className="switch-main">
      <div className="switch-dpad">{button('UP', 'up')}{button('LEFT', 'left')}{button('RIGHT', 'right')}{button('DOWN', 'down')}</div>
      <div className="switch-center"><div>{button('−')}{button('+')}</div>{button('Home')}<small>{props.paused ? '已暂停' : props.playing ? '正在接落叶' : 'A 开始 · B 返回'}</small></div>
      <div className="switch-face">{button('X', 'up')}{button('Y', 'left')}{button('A', 'right')}{button('B', 'down')}</div>
    </div>
  </div>;
};
