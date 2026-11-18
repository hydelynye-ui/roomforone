import React, { lazy, Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { Room3D } from './components/Room3D';
import { TopBar } from './components/TopBar';
import type { AudioTrack, CanvasNote, CityConfig, ModalType, MoodAIRecommendation, MovieEntry, ObjectId, ObjectPose, RoomState, Vec3, WeatherPreset } from './types';
import { loadRoomState, saveRoomState } from './services/storage';
import { audioEngine } from './services/audioEngine';
import { CityPicker } from './components/CityPicker';
import { DEFAULT_CITY, fetchWeather, getLocalHour, getTimeLabel, getTimePhase } from './services/weatherService';
const ComputerModal = lazy(() => import('./components/ComputerModal').then(m => ({ default: m.ComputerModal })));
const DrawingModal = lazy(() => import('./components/DrawingModal').then(m => ({ default: m.DrawingModal })));
const DIYModal = lazy(() => import('./components/DIYModal').then(m => ({ default: m.DIYModal })));
const AtmosphereModal = lazy(() => import('./components/AtmosphereModal').then(m => ({ default: m.AtmosphereModal })));
const MoodAIModal = lazy(() => import('./components/MoodAIModal').then(m => ({ default: m.MoodAIModal })));
const AboutModal = lazy(() => import('./components/AboutModal').then(m => ({ default: m.AboutModal })));
const TangleModal = lazy(() => import('./components/TangleModal').then(m => ({ default: m.TangleModal })));
const HeadphonesModal = lazy(() => import('./components/HeadphonesModal').then(m => ({ default: m.HeadphonesModal })));
const SwitchPanel = lazy(() => import('./components/SwitchPanel').then(m => ({ default: m.SwitchPanel })));

export const App: React.FC = () => {
  const [roomState, setRoomState] = useState<RoomState>(loadRoomState);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [zenMode, setZenMode] = useState(false);
  const [editTarget, setEditTarget] = useState<ObjectId | null>(null);
  const [notice, setNotice] = useState('');
  const [showCityPicker, setShowCityPicker] = useState(() => !loadRoomState().city);
  const [now, setNow] = useState(() => new Date());
  const [isRefreshingWeather, setIsRefreshingWeather] = useState(false);
  const selectedCity = roomState.city ?? DEFAULT_CITY;
  const timeLabel = roomState.city ? getTimeLabel(selectedCity, now) : '--:--';
  const timePhase = roomState.city ? getTimePhase(selectedCity, now) : 'Demo Environment';
  const timeOfDay = getLocalHour(selectedCity, now);
  const revision = useRef(0), stateRef = useRef(roomState), modalRef = useRef<HTMLDivElement>(null);
  stateRef.current = roomState;
  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(interval);
  }, []);

  const commit = useCallback((patch: Partial<RoomState> | ((s: RoomState) => Partial<RoomState>), manual = true) => {
    const previous = stateRef.current;
    const next = { ...previous, ...(typeof patch === 'function' ? patch(previous) : patch) };
    stateRef.current = next; setRoomState(next);
    if (!saveRoomState(next)) setNotice('This device could not save your changes. Please export important canvas work.');
    if (manual) revision.current++;
  }, []);
  const refreshWeather = useCallback(async (city: CityConfig) => {
    setIsRefreshingWeather(true);
    try {
      const snapshot = await fetchWeather(city);
      commit((previous) => ({
        city,
        actualWeather: snapshot,
        weather: previous.weatherMode === 'manual' ? previous.weather : snapshot.preset,
      }), false);
    } catch (error) {
      console.warn('[roomforone] Live weather refresh failed; preserving the last successful snapshot.', error);
      setNotice('Live weather is temporarily unavailable. Your saved room conditions are unchanged.');
    } finally {
      setIsRefreshingWeather(false);
    }
  }, [commit]);

  useEffect(() => {
    if (!roomState.city) return;
    void refreshWeather(roomState.city);
    const interval = window.setInterval(() => void refreshWeather(roomState.city as CityConfig), 15 * 60 * 1000);
    return () => window.clearInterval(interval);
  }, [roomState.city?.id, refreshWeather]);

  const handleSelectCity = useCallback((city: CityConfig | null) => {
    setShowCityPicker(false);
    if (!city) {
      setNotice('Demo environment · choose a city whenever you want to sync live weather.');
      return;
    }
    commit({ city, weatherMode: 'live' });
    void refreshWeather(city);
  }, [commit, refreshWeather]);

  const handleUseLiveWeather = useCallback(() => {
    commit((previous) => ({
      weatherMode: 'live',
      weather: previous.actualWeather?.preset ?? previous.weather,
    }));
  }, [commit]);

  useEffect(() => { audioEngine.update(roomState); }, [roomState.weather, roomState.windowOpen, roomState.audioTracks, roomState.masterVolume]);
  const soundPending = useRef(false);
  const toggleMute = useCallback(async () => {
    if (soundPending.current) return;
    soundPending.current = true;
    try {
      const muted = await audioEngine.setMute(!stateRef.current.masterMute);
      commit({ masterMute: muted });
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Audio is temporarily unavailable.'); }
    finally { soundPending.current = false; }
  }, [commit]);
  const setWeather = useCallback((weather: WeatherPreset) => commit({ weather, weatherMode: 'manual' }), [commit]);
  const toggleWindow = useCallback(() => commit(s => ({ windowOpen: !s.windowOpen })), [commit]);
  const toggleLamp = useCallback(() => commit(s => ({ lampOn: !s.lampOn })), [commit]);
  const updateLegacyVolume = useCallback((kind: 'weather' | 'ambient', value: number) => commit(s => kind === 'weather'
    ? { volumeWeather: value, audioTracks: { ...s.audioTracks, rain: value, wind: value * 0.7 } }
    : { volumeAmbient: value, audioTracks: { ...s.audioTracks, birds: value, lofi: value * 0.4 } }), [commit]);
  const updateTrack = useCallback((track: AudioTrack, value: number) => commit(s => ({ audioTracks: { ...s.audioTracks, [track]: value } })), [commit]);
  const updateNotes = useCallback((notesText: string) => commit({ notesText }, false), [commit]);
  const updateMovies = useCallback((movieEntries: MovieEntry[]) => commit({ movieEntries }, false), [commit]);
  const updateCanvasNotes = useCallback((canvasNotes: CanvasNote[]) => commit({ canvasNotes }, false), [commit]);
  const updatePose = useCallback((id: ObjectId, pose: ObjectPose) => commit(s => ({ objectPoses: { ...s.objectPoses, [id]: pose } }), false), [commit]);
  const updateNodes = useCallback((nodes: Vec3[]) => commit({ tangleNodes: nodes }, false), [commit]);
  const updateRotation = useCallback((roomRotation: number) => commit({ roomRotation }, false), [commit]);
  const close = useCallback(() => setActiveModal(null), []);
  const applyMood = useCallback((rec: MoodAIRecommendation, expectedRevision: number) => {
    if (revision.current !== expectedRevision) { setNotice('The room has changed. Generate a new suggestion before applying it.'); return; }
    commit(s => ({ weather: rec.weather, weatherMode: 'manual', lampOn: rec.lampOn, stickyNote: rec.roomNote,
      volumeWeather: rec.volumeWeather, volumeAmbient: rec.volumeAmbient,
      audioTracks: { ...s.audioTracks, rain: rec.volumeWeather, wind: rec.volumeWeather * 0.65, birds: rec.volumeAmbient, lofi: rec.volumeAmbient * 0.4 },
    }));
    // Keep the user's explicit window and mute choices.
    close();
  }, [commit, close]);

  useEffect(() => {
    if (!activeModal) return;
    const opener = document.activeElement as HTMLElement | null;
    const dialog = modalRef.current;
    dialog?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      if (e.key !== 'Tab' || !dialog) return;
      const list = [...dialog.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],textarea,input,select,[tabindex="0"]')].filter(el => el.getClientRects().length);
      const first = list[0], last = list[list.length - 1];
      if (!first) { e.preventDefault(); dialog.focus(); }
      else if (e.shiftKey && (document.activeElement === first || document.activeElement === dialog)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (document.activeElement === last || document.activeElement === dialog)) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    const oldOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = oldOverflow; opener?.focus(); };
  }, [activeModal, close]);

  return <div className={'room-app' + (zenMode ? ' zen-mode' : '')}>
    <div inert={!!activeModal}><TopBar
      roomState={roomState}
      onSetWeather={setWeather}
      onUseLiveWeather={handleUseLiveWeather}
      onToggleMute={toggleMute}
      onOpenEnvironment={() => setActiveModal('atmosphere')}
      onOpenCityPicker={() => setShowCityPicker(true)}
      timeLabel={timeLabel}
      timePhase={timePhase}
      city={selectedCity}
      isRefreshingWeather={isRefreshingWeather}
      zenMode={zenMode}
      onToggleZenMode={() => { setZenMode(z => !z); close(); }}
    /></div>
    <main className="workspace" inert={!!activeModal}>
      <Room3D state={roomState} timeOfDay={timeOfDay} blocked={!!activeModal} editTarget={editTarget} onEditEnd={() => setEditTarget(null)} onSelectModal={setActiveModal} onToggleWindow={toggleWindow} onToggleLamp={toggleLamp} onPose={updatePose} onTangle={updateNodes} onRotation={updateRotation} />
    </main>
    {showCityPicker && <CityPicker onSelect={handleSelectCity} />}
    {notice && <div role="status" className="room-notice">{notice}<button aria-label="Dismiss notice" onClick={() => setNotice('')}>×</button></div>}
    {activeModal && <div ref={modalRef} role="dialog" aria-modal="true" aria-label="Room content panel" tabIndex={-1} data-modal-host>
      <Suspense fallback={<div className="modal-loading">Opening…<button onClick={close}>Return to room</button></div>}>
        {activeModal === 'computer' && <ComputerModal onClose={close} roomState={roomState} onUpdateTrack={updateTrack} onMasterVolume={masterVolume => commit({ masterVolume }, false)} onToggleMute={toggleMute} onUpdateNotes={updateNotes} onUpdateMovies={updateMovies} onUpdateCanvasNotes={updateCanvasNotes} />}
        {activeModal === 'drawing' && <DrawingModal onClose={close} />}
        {activeModal === 'switch' && <SwitchPanel onClose={close} />}
        {activeModal === 'diy' && <DIYModal onClose={close} />}
        {activeModal === 'about' && <AboutModal onClose={close} />}
        {activeModal === 'tangle' && <TangleModal onClose={close} notes={roomState.tangleNotes} onNotes={tangleNotes => commit({ tangleNotes }, false)} onEdit={() => { setEditTarget('tangle'); close(); }} />}
        {activeModal === 'headphones' && <HeadphonesModal roomState={roomState} onToggleMute={toggleMute} onUpdateTrack={updateTrack} onMasterVolume={masterVolume => commit({ masterVolume })} onSetWeather={setWeather} onClose={close} />}
        {activeModal === 'atmosphere' && <AtmosphereModal roomState={roomState} onSetWeather={setWeather} onToggleWindow={toggleWindow} onToggleLamp={toggleLamp} onToggleMute={toggleMute} onUpdateVolume={updateLegacyVolume} onClose={close} />}
        {activeModal === 'mood-ai' && <MoodAIModal sceneRevision={sceneRevision} onApplyRecommendation={applyMood} onClose={close} />}
      </Suspense>
    </div>}
  </div>;
};
