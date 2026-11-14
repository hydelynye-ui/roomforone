import React, { useState, useEffect, useCallback } from 'react';
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

import { WeatherPreset, ModalType, RoomState, MoodAIRecommendation } from './types';
import { loadRoomState, saveRoomState } from './services/storage';
import { audioEngine } from './services/audioEngine';

export const App: React.FC = () => {
  const [roomState, setRoomState] = useState<RoomState>(loadRoomState);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [zenMode, setZenMode] = useState<boolean>(false);

  // Sync audio engine on state changes
  useEffect(() => {
    audioEngine.updatePreset(
      roomState.weather,
      roomState.windowOpen,
      roomState.volumeWeather,
      roomState.volumeAmbient
    );
  }, [roomState.weather, roomState.windowOpen, roomState.volumeWeather, roomState.volumeAmbient]);

  // Handle master mute toggle
  const handleToggleMute = useCallback(() => {
    setRoomState((prev) => {
      const nextMute = !prev.masterMute;
      audioEngine.setMute(nextMute);
      saveRoomState({ masterMute: nextMute });
      return { ...prev, masterMute: nextMute };
    });
  }, []);

  // Weather switch
  const handleSetWeather = useCallback((preset: WeatherPreset) => {
    setRoomState((prev) => {
      saveRoomState({ weather: preset });
      return { ...prev, weather: preset };
    });
  }, []);

  // Window toggle
  const handleToggleWindow = useCallback(() => {
    setRoomState((prev) => {
      const nextOpen = !prev.windowOpen;
      saveRoomState({ windowOpen: nextOpen });
      return { ...prev, windowOpen: nextOpen };
    });
  }, []);

  // Lamp toggle
  const handleToggleLamp = useCallback(() => {
    setRoomState((prev) => {
      const nextLamp = !prev.lampOn;
      saveRoomState({ lampOn: nextLamp });
      return { ...prev, lampOn: nextLamp };
    });
  }, []);

  // Volume slider update
  const handleUpdateVolume = useCallback((type: 'weather' | 'ambient', val: number) => {
    setRoomState((prev) => {
      const updates = type === 'weather' ? { volumeWeather: val } : { volumeAmbient: val };
      saveRoomState(updates);
      return { ...prev, ...updates };
    });
  }, []);

  // AI Mood recommendation application
  const handleApplyMoodAI = useCallback((rec: MoodAIRecommendation) => {
    setRoomState((prev) => {
      const next: RoomState = {
        ...prev,
        weather: rec.weather,
        windowOpen: rec.windowOpen,
        lampOn: rec.lampOn,
        volumeWeather: rec.volumeWeather,
        volumeAmbient: rec.volumeAmbient,
        stickyNote: rec.roomNote,
      };
      saveRoomState(next);
      return next;
    });
  }, []);

  // Keyboard shortcut ESC to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#EFE8DC] font-sans">
      {/* 1. Header TopBar */}
      <TopBar
        roomState={roomState}
        onSetWeather={handleSetWeather}
        onToggleMute={handleToggleMute}
        onOpenMoodAI={() => setActiveModal('mood-ai')}
        zenMode={zenMode}
        onToggleZenMode={() => setZenMode(!zenMode)}
      />

      {/* 2. Main 3D Room Experience */}
      <main className="w-full h-full">
        <Room3D
          weather={roomState.weather}
          windowOpen={roomState.windowOpen}
          lampOn={roomState.lampOn}
          onSelectModal={setActiveModal}
          onToggleWindow={handleToggleWindow}
          onToggleLamp={handleToggleLamp}
        />
      </main>

      {/* 3. Side Bento Cards (Hidden in Zen Mode) */}
      {!zenMode && (
        <BentoCards
          stickyNote={roomState.stickyNote}
          onOpenModal={setActiveModal}
          onOpenMoodAI={() => setActiveModal('mood-ai')}
        />
      )}

      {/* 4. Bottom Floating Dock (Hidden in Zen Mode) */}
      {!zenMode && (
        <FloatingDock
          activeModal={activeModal}
          onSelectModal={setActiveModal}
        />
      )}

      {/* 5. Modals */}
      {activeModal === 'computer' && (
        <ComputerModal onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'drawing' && (
        <DrawingModal onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'game' && (
        <GameModal onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'diy' && (
        <DIYModal onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'atmosphere' && (
        <AtmosphereModal
          roomState={roomState}
          onSetWeather={handleSetWeather}
          onToggleWindow={handleToggleWindow}
          onToggleLamp={handleToggleLamp}
          onToggleMute={handleToggleMute}
          onUpdateVolume={handleUpdateVolume}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'mood-ai' && (
        <MoodAIModal
          onApplyRecommendation={handleApplyMoodAI}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === 'about' && (
        <AboutModal onClose={() => setActiveModal(null)} />
      )}
    </div>
  );
};
