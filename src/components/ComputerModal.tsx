import React, { useMemo, useState } from 'react';
import {
  ArrowLeft, Clapperboard, Disc3, Film, Infinity, Music2, NotebookPen,
  Plus, Volume2, VolumeX, X, Minus, Trash2,
} from 'lucide-react';
import type { AudioTrack, MovieEntry, RoomState } from '../types';
import { DrawingModal } from './DrawingModal';

type AppId = 'notes' | 'music' | 'canvas' | 'movie-book';

interface ComputerModalProps {
  onClose: () => void;
  roomState: RoomState;
  onUpdateTrack: (track: AudioTrack, value: number) => void;
  onMasterVolume: (value: number) => void;
  onToggleMute: () => void;
  onUpdateNotes: (value: string) => void;
  onUpdateMovies: (entries: MovieEntry[]) => void;
}

const apps: { id: AppId; name: string; description: string; icon: React.ReactNode; tone: string }[] = [
  { id: 'notes', name: 'Notes', description: 'A place for passing thoughts', icon: <NotebookPen size={22} />, tone: 'sage' },
  { id: 'music', name: 'Music', description: 'Small sounds for the room', icon: <Music2 size={22} />, tone: 'clay' },
  { id: 'canvas', name: 'Infinite Canvas', description: 'Draw, collect and connect ideas', icon: <Infinity size={24} />, tone: 'blue' },
  { id: 'movie-book', name: 'Movie Book', description: 'Keep a little record of what you watch', icon: <Film size={22} />, tone: 'ochre' },
];

const trackNames: Record<AudioTrack, string> = {
  rain: 'Rain',
  wind: 'Wind',
  birds: 'Birdsong',
  lofi: 'Lo-fi',
};

const appTitles: Record<AppId, string> = {
  notes: 'Notes',
  music: 'Music',
  canvas: 'Infinite Canvas',
  'movie-book': 'Movie Book',
};

export const ComputerModal: React.FC<ComputerModalProps> = ({
  onClose, roomState, onUpdateTrack, onMasterVolume, onToggleMute, onUpdateNotes, onUpdateMovies,
}) => {
  const [activeApp, setActiveApp] = useState<AppId | null>(null);
  const [movieTitle, setMovieTitle] = useState('');
  const [movieYear, setMovieYear] = useState('');
  const [movieNote, setMovieNote] = useState('');
  const [showCanvas, setShowCanvas] = useState(false);
  const movies = useMemo(() => [...roomState.movieEntries].sort((a, b) => b.createdAt - a.createdAt), [roomState.movieEntries]);

  const addMovie = () => {
    const title = movieTitle.trim();
    if (!title) return;
    const year = Number(movieYear);
    const entry: MovieEntry = {
      id: `movie-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title,
      ...(Number.isInteger(year) && year >= 1888 && year <= 2200 ? { year } : {}),
      note: movieNote.trim().slice(0, 1200),
      createdAt: Date.now(),
    };
    onUpdateMovies([entry, ...roomState.movieEntries].slice(0, 200));
    setMovieTitle('');
    setMovieYear('');
    setMovieNote('');
  };

  const removeMovie = (id: string) => onUpdateMovies(roomState.movieEntries.filter(movie => movie.id !== id));

  const openApp = (id: AppId) => {
    if (id === 'canvas') {
      setActiveApp('canvas');
      setShowCanvas(true);
      return;
    }
    setActiveApp(id);
  };

  const renderApp = () => {
    if (!activeApp) return null;
    if (activeApp === 'notes') return (
      <div className="computer-notes">
        <div className="computer-app-intro"><span>PERSONAL NOTES</span><p>Catch a thought before it disappears.</p></div>
        <textarea
          aria-label="Notes"
          value={roomState.notesText}
          onChange={event => onUpdateNotes(event.target.value)}
          placeholder="Start anywhere…"
          maxLength={20000}
          spellCheck
        />
        <div className="computer-app-foot"><span>Saved automatically on this device</span><span>{roomState.notesText.length.toLocaleString()} / 20,000</span></div>
      </div>
    );
    if (activeApp === 'music') return (
      <div className="computer-music">
        <div className="computer-app-intro"><span>ROOM SOUND</span><p>Let a little atmosphere stay in the background.</p></div>
        <div className="computer-now-playing">
          <div className="computer-record"><Disc3 size={30} strokeWidth={1.2} /></div>
          <div><strong>Room Tones</strong><small>Rain · Wind · Birds · Lo-fi</small></div>
          <button className="computer-round-action" onClick={onToggleMute} aria-label={roomState.masterMute ? 'Enable sound' : 'Mute sound'}>
            {roomState.masterMute ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>
        <label className="computer-volume"><span>Master volume</span><b>{Math.round(roomState.masterVolume * 100)}%</b><input type="range" min="0" max="1" step="0.01" value={roomState.masterVolume} onChange={event => onMasterVolume(Number(event.target.value))} /></label>
        <div className="computer-track-list">
          {(Object.keys(trackNames) as AudioTrack[]).map(track => {
            const value = roomState.audioTracks[track];
            return <div className="computer-track" key={track}>
              <span className={value > 0 ? 'computer-track-dot is-on' : 'computer-track-dot'} />
              <div><strong>{trackNames[track]}</strong><small>{value > 0 ? 'On' : 'Off'}</small></div>
              <input aria-label={trackNames[track] + ' volume'} type="range" min="0" max="1" step="0.01" value={value} onChange={event => onUpdateTrack(track, Number(event.target.value))} />
              <b>{Math.round(value * 100)}%</b>
            </div>;
          })}
        </div>
        <p className="computer-app-foot">Sound starts only after you choose to turn it on. Current room weather: {roomState.weather}.</p>
      </div>
    );
    if (activeApp === 'movie-book') return (
      <div className="computer-moviebook">
        <div className="computer-app-intro"><span>A SMALL FILM DIARY</span><p>Films worth keeping a note of.</p></div>
        <form className="computer-movie-form" onSubmit={event => { event.preventDefault(); addMovie(); }}>
          <label><span>Film title</span><input value={movieTitle} onChange={event => setMovieTitle(event.target.value)} placeholder="What did you watch?" maxLength={120} required /></label>
          <label className="computer-year-field"><span>Year</span><input value={movieYear} onChange={event => setMovieYear(event.target.value.replace(/[^0-9]/g, '').slice(0, 4))} placeholder="2026" inputMode="numeric" /></label>
          <label className="computer-note-field"><span>A note to remember</span><textarea value={movieNote} onChange={event => setMovieNote(event.target.value)} placeholder="A scene, a line, a feeling…" maxLength={1200} rows={2} /></label>
          <button type="submit" disabled={!movieTitle.trim()}><Plus size={15} /> Add to book</button>
        </form>
        <div className="computer-movie-grid">
          {movies.map((movie, index) => <article className={`computer-movie-card tone-${index % 4}`} key={movie.id}>
            <div className="computer-movie-cover"><span>ROOMFORONE FILM BOOK</span><Clapperboard size={26} strokeWidth={1.2} /><strong>{movie.title}</strong><small>{movie.year || 'A film to remember'}</small></div>
            <div className="computer-movie-caption"><p>{movie.note || 'No note yet.'}</p><button onClick={() => removeMovie(movie.id)} aria-label={`Remove ${movie.title}`}><Trash2 size={14} /></button></div>
          </article>)}
          {!movies.length && <div className="computer-empty-book"><Film size={22} /><p>Your first film can live here.</p></div>}
        </div>
      </div>
    );
    return (
      <div className="computer-canvas-launch">
        <div className="computer-canvas-symbol"><Infinity size={44} strokeWidth={1.1} /></div>
        <h3>Infinite Canvas</h3>
        <p>A quiet place to sketch, move things around and leave ideas unfinished.</p>
        <button onClick={() => setShowCanvas(true)}>Open canvas <ArrowLeft size={14} className="rotate-180" /></button>
      </div>
    );
  };

  return (
    <div className="computer-overlay" role="presentation" onClick={onClose}>
      <section className="computer-shell" role="dialog" aria-modal="true" aria-label="roomforone desktop" onClick={event => event.stopPropagation()}>
        <header className="computer-menubar">
          <div className="computer-brand"><span className="computer-brand-mark" /> <strong>roomforone</strong></div>
          <div className="computer-menu-center">{activeApp ? appTitles[activeApp] : 'Your little desktop'}</div>
          <div className="computer-menu-actions">
            <span className="computer-device-status"><i /> LOCAL SPACE</span>
            <button onClick={onClose} aria-label="Exit computer"><X size={17} /></button>
          </div>
        </header>
        <div className="computer-desktop">
          {!activeApp ? (
            <div className="computer-welcome">
              <div className="computer-welcome-copy"><span>ROOMFORONE / DESKTOP</span><h2>A little space<br />for your thoughts.</h2><p>Open something. Stay a while.</p></div>
              <div className="computer-app-grid">
                {apps.map(app => <button key={app.id} className="computer-app-tile" onClick={() => openApp(app.id)}>
                  <span className={`computer-app-icon tone-${app.tone}`}>{app.icon}</span>
                  <strong>{app.name}</strong><small>{app.description}</small>
                </button>)}
              </div>
            </div>
          ) : (
            <section className="computer-window" aria-label={appTitles[activeApp]}>
              <header className="computer-window-title">
                <div><span className="computer-window-dot" /><strong>{appTitles[activeApp]}</strong></div>
                <div className="computer-window-controls">
                  <button onClick={() => setActiveApp(null)} aria-label="Minimize window"><Minus size={15} /></button>
                  <button onClick={() => setActiveApp(null)} aria-label="Close window"><X size={15} /></button>
                </div>
              </header>
              <div className="computer-window-content">{renderApp()}</div>
            </section>
          )}
          <nav className="computer-dock" aria-label="Desktop applications">
            {apps.map(app => <button key={app.id} className={activeApp === app.id ? 'is-active' : ''} onClick={() => activeApp === app.id ? setActiveApp(null) : openApp(app.id)} title={app.name} aria-label={app.name}>
              {app.icon}<span />
            </button>)}
            <i className="computer-dock-divider" />
            <button onClick={onClose} title="Return to room" aria-label="Return to room"><ArrowLeft size={18} /></button>
          </nav>
        </div>
      </section>
      {showCanvas && <DrawingModal onClose={() => { setShowCanvas(false); setActiveApp(null); }} />}
    </div>
  );
};
