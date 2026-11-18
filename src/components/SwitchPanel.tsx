import React, { useState } from 'react';
import { Gamepad2, X } from 'lucide-react';

type ButtonId = 'A' | 'B' | 'X' | 'Y' | 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'L' | 'R' | 'ZL' | 'ZR' | 'PLUS' | 'MINUS' | 'HOME';

const buttons: { id: ButtonId; label: string; className: string }[] = [
  { id: 'ZL', label: 'ZL', className: 'switch-trigger shoulder left' },
  { id: 'L', label: 'L', className: 'switch-trigger shoulder left' },
  { id: 'R', label: 'R', className: 'switch-trigger shoulder right' },
  { id: 'ZR', label: 'ZR', className: 'switch-trigger shoulder right' },
  { id: 'UP', label: '↑', className: 'switch-trigger dpad up' },
  { id: 'LEFT', label: '←', className: 'switch-trigger dpad left' },
  { id: 'RIGHT', label: '→', className: 'switch-trigger dpad right' },
  { id: 'DOWN', label: '↓', className: 'switch-trigger dpad down' },
  { id: 'Y', label: 'Y', className: 'switch-trigger face top' },
  { id: 'X', label: 'X', className: 'switch-trigger face left' },
  { id: 'B', label: 'B', className: 'switch-trigger face right' },
  { id: 'A', label: 'A', className: 'switch-trigger face bottom' },
  { id: 'MINUS', label: '−', className: 'switch-trigger utility minus' },
  { id: 'PLUS', label: '+', className: 'switch-trigger utility plus' },
  { id: 'HOME', label: '⌂', className: 'switch-trigger utility home' },
];

interface Props { onClose: () => void }

export const SwitchPanel: React.FC<Props> = ({ onClose }) => {
  const [pressed, setPressed] = useState<ButtonId | null>(null);
  const [lastPressed, setLastPressed] = useState('—');
  const press = (id: ButtonId) => { setPressed(id); setLastPressed(id === 'HOME' ? 'Home' : id); };
  const release = () => setPressed(null);

  return (
    <div className="switch-panel-overlay" role="presentation" onClick={onClose}>
      <section className="switch-panel" role="dialog" aria-modal="true" aria-label="Switch controller" onClick={event => event.stopPropagation()}>
        <header className="switch-panel-header">
          <div><span className="switch-panel-mark"><Gamepad2 size={17} /></span><div><strong>Switch Controller</strong><small>Pick it up. Press a button. Let it go.</small></div></div>
          <button onClick={onClose} aria-label="Close controller panel"><X size={18} /></button>
        </header>
        <div className="switch-panel-body">
          <div className="switch-device">
            <div className="switch-rail left"><span /><span /><span /></div>
            <div className="switch-device-center"><span className="switch-screen"><i /><b>roomforone</b><small>take a little break</small></span></div>
            <div className="switch-rail right"><span /><span /><span /></div>
            {buttons.map(button => <button
              key={button.id}
              type="button"
              className={button.className + ' button-' + button.id.toLowerCase() + (pressed === button.id ? ' is-pressed' : '')}
              aria-label={button.id}
              aria-pressed={pressed === button.id}
              onPointerDown={event => { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); press(button.id); }}
              onPointerUp={release}
              onPointerCancel={release}
              onLostPointerCapture={release}
              onKeyDown={event => { if ((event.key === 'Enter' || event.key === ' ') && !event.repeat) press(button.id); }}
              onKeyUp={release}
              onClick={() => setLastPressed(button.id === 'HOME' ? 'Home' : button.id)}
            >{button.label}</button>)}
          </div>
          <div className="switch-panel-feedback"><span>LAST PRESSED</span><strong>{lastPressed}</strong><small>Each control responds independently. No game is launched.</small></div>
        </div>
      </section>
    </div>
  );
};
