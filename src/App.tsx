import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Room3D } from './components/Room3D';
import { TopBar } from './components/TopBar';
import { BentoCards } from './components/BentoCards';
import { FloatingDock } from './components/FloatingDock';
import { ComputerModal } from './components/ComputerModal';
import { DrawingModal } from './components/DrawingModal';
import { GameModal } from './components/GameModal';
import { DIYModal } from './components/DIYModal';
import { AtmosphereModal } from './components/AtmosphereModal';
import { MoodAIModal } from './components/MoodAIModal';
import { AboutModal } from './components/AboutModal';
import { CityPicker } from './components/CityPicker';

import { CityConfig, WeatherPreset, ModalType, RoomState, MoodAIRecommendation } from './types';
import { loadRoomState, saveRoomState } from './services/storage';
import { audioEngine } from './services/audioEngine';
import { DEFAULT_CITY, fetchWeather, getTimeLabel, getTimePhase } from './services/weatherService';

export const App: React.FC = () => {
  const [roomState, setRoomState] = useState<RoomState>(loadRoomState);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [zenMode, setZenMode] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(!roomState.city);
  const [now, setNow] = useState(() => new Date());
  const [isRefreshingWeather, setIsRefreshingWeather] = useState(false);

  const selectedCity = roomState.city ?? DEFAULT_CITY;
  const timeLabel = useMemo(() => getTimeLabel(selectedCity, now), [selectedCity, now]);
  const timePhase = useMemo(() => getTimePhase(selectedCity, now), [selectedCity, now]);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(interval);
  }, []);

  const refreshWeather = useCallback(async (city: CityConfig) => {
    setIsRefreshingWeather(true);
    try {
      const snapshot = await fetchWeather(city);
      setRoomState((prev) => {
        const next = { ...prev, city, actualWeather: snapshot, weather: prev.weatherMode === 'manual' ? prev.weather : snapshot.preset };
        saveRoomState(next);
        return next;
      });
    } catch (error) {
      console.warn('[roomforone] Weather refresh failed; keeping the last successful state.', error);
    } finally {
      setIsRefreshingWeather(false);
    }
  }, []);

  useEffect(() => {
    if (!roomState.city) return;
    void refreshWeather(roomState.city);
    const interval = window.setInterval(() => void refreshWeather(roomState.city as CityConfig), 15 * 60 * 1000);
    return () => window.clearInterval(interval);
  }, [roomState.city?.id, refreshWeather]);

  useEffect(() => {
    audioEngine.updatePreset(roomState.weather, roomState.windowOpen, roomState.volumeWeather, roomState.volumeAmbient);
  }, [roomState.weather, roomState.windowOpen, roomState.volumeWeather, roomState.volumeAmbient]);

  const handleSelectCity = useCallback((city: CityConfig | null) => {
    const chosen = city ?? DEFAULT_CITY;
    setShowCityPicker(false);
    setRoomState((prev) => {
      const next = { ...prev, city: chosen, weatherMode: 'live' as const };
      saveRoomState(next);
      return next;
    });
    if (city) void refreshWeather(city);
  }, [refreshWeather]);

  const handleToggleMute = useCallback(() => {
    setRoomState((prev) => {
      const nextMute = !prev.masterMute;
      audioEngine.setMute(nextMute);
      saveRoomState({ masterMute: nextMute });
      return { ...prev, masterMute: nextMute };
    });
  }, []);

  const handleSetWeather = useCallback((preset: WeatherPreset) => {
    setRoomState((prev) => {
      const next = { ...prev, weather: preset, weatherMode: 'manual' as const };
      saveRoomState({ weather: preset, weatherMode: 'manual' });
      return next;
    });
  }, []);

  const handleUseLiveWeather = useCallback(() => {
    setRoomState((prev) => {
      const preset = prev.actualWeather?.preset ?? 'sunny';
      const next = { ...prev, weather: preset, weatherMode: 'live' as const };
      saveRoomState({ weather: preset, weatherMode: 'live' });
      return next;
    });
  }, []);

  const handleToggleWindow = useCallback(() => {
    setRoomState((prev) => {
      const nextOpen = !prev.windowOpen;
      saveRoomState({ windowOpen: nextOpen });
      return { ...prev, windowOpen: nextOpen };
    });
  }, []);

  const handleToggleLamp = useCallback(() => {
    setRoomState((prev) => {
      const nextLamp = !prev.lampOn;
      saveRoomState({ lampOn: nextLamp });
      return { ...prev, lampOn: nextLamp };
    });
  }, []);

  const handleUpdateVolume = useCallback((type: 'weather' | 'ambient', val: number) => {
    setRoomState((prev) => {
      const updates = type === 'weather' ? { volumeWeather: val } : { volumeAmbient: val };
      saveRoomState(updates);
      return { ...prev, ...updates };
    });
  }, []);

  const handleApplyMoodAI = useCallback((rec: MoodAIRecommendation) => {
    setRoomState((prev) => {
      const next: RoomState = { ...prev, weather: rec.weather, weatherMode: 'manual', windowOpen: rec.windowOpen, lampOn: rec.lampOn, volumeWeather: rec.volumeWeather, volumeAmbient: rec.volumeAmbient, stickyNote: rec.roomNote };
      saveRoomState(next);
      return next;
    });
  }, []);

  const handleSelectModal = useCallback((modal: ModalType) => setActiveModal(modal), []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveModal(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#efe8dc] font-sans">
      <TopBar
        roomState={roomState}
        onSetWeather={handleSetWeather}
        onUseLiveWeather={handleUseLiveWeather}
        onToggleMute={handleToggleMute}
        onOpenMoodAI={() => setActiveModal('mood-ai')}
        onOpenCityPicker={() => setShowCityPicker(true)}
        timeLabel={timeLabel}
        timePhase={timePhase}
        city={selectedCity}
        isRefreshingWeather={isRefreshingWeather}
        zenMode={zenMode}
        onToggleZenMode={() => setZenMode((value) => !value)}
      />

      <main className="h-full w-full">
        <Room3D
          weather={roomState.weather}
          windowOpen={roomState.windowOpen}
          lampOn={roomState.lampOn}
          computerOpen={activeModal === 'computer'}
          onSelectModal={handleSelectModal}
          onToggleWindow={handleToggleWindow}
          onToggleLamp={handleToggleLamp}
        />
      </main>

      {!zenMode && (
        <BentoCards stickyNote={roomState.stickyNote} onOpenModal={setActiveModal} onOpenMoodAI={() => setActiveModal('mood-ai')} />
      )}

      {!zenMode && <FloatingDock activeModal={activeModal} onSelectModal={setActiveModal} />}

      {activeModal === 'computer' && <ComputerModal city={selectedCity} timeLabel={timeLabel} onClose={() => setActiveModal(null)} />}
      {activeModal === 'drawing' && <DrawingModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'game' && <GameModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'diy' && <DIYModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'atmosphere' && <AtmosphereModal roomState={roomState} onSetWeather={handleSetWeather} onToggleWindow={handleToggleWindow} onToggleLamp={handleToggleLamp} onToggleMute={handleToggleMute} onUpdateVolume={handleUpdateVolume} onClose={() => setActiveModal(null)} />}
      {activeModal === 'mood-ai' && <MoodAIModal onApplyRecommendation={handleApplyMoodAI} onClose={() => setActiveModal(null)} />}
      {activeModal === 'about' && <AboutModal onClose={() => setActiveModal(null)} />}

      {showCityPicker && <CityPicker onSelect={handleSelectCity} />}
    </div>
  );
};
