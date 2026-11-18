import React from 'react';
import {
  Cloud,
  CloudRain,
  Maximize2,
  Minimize2,
  Moon,
  Snowflake,
  Sparkles,
  Sun,
  Volume2,
  VolumeX,
  Wind,
} from 'lucide-react';
import type { CityConfig, RoomState, WeatherPreset } from '../types';

interface TopBarProps {
  roomState: RoomState;
  onSetWeather: (preset: WeatherPreset) => void;
  onUseLiveWeather: () => void;
  onToggleMute: () => void;
  onOpenMoodAI: () => void;
  onOpenCityPicker: () => void;
  timeLabel: string;
  timePhase: string;
  city: CityConfig;
  isRefreshingWeather: boolean;
  zenMode: boolean;
  onToggleZenMode: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  roomState,
  onSetWeather,
  onUseLiveWeather,
  onToggleMute,
  onOpenMoodAI,
  onOpenCityPicker,
  timeLabel,
  timePhase,
  city,
  isRefreshingWeather,
  zenMode,
  onToggleZenMode,
}) => {
  const presets: { id: WeatherPreset; label: string; icon: React.ReactNode }[] = [
    { id: 'sunny', label: 'Clear', icon: <Sun size={14} /> },
    { id: 'cloudy', label: 'Cloudy', icon: <Cloud size={14} /> },
    { id: 'rain', label: 'Rain', icon: <CloudRain size={14} /> },
    { id: 'snow', label: 'Snow', icon: <Snowflake size={14} /> },
    { id: 'autumn', label: 'Wind', icon: <Wind size={14} /> },
  ];

  return (
    <header className="room-topbar">
      <div className="room-brand-cluster">
        <div className="room-brand">
          <span className="room-brand-symbol" />
          <span className="room-brand-name">roomforone</span>
        </div>
        <button className="room-time-button" onClick={onOpenCityPicker} title="Change city">
          <span className="room-time-city">{roomState.city ? city.name : 'Demo Environment'} · {timePhase}</span>
          <span className="room-time-value">{timeLabel}</span>
        </button>
      </div>

      <div className="room-weather-controls" aria-label="Weather preview">
        <button
          className={roomState.weatherMode !== 'manual' ? 'is-active' : ''}
          onClick={onUseLiveWeather}
          title="Use live weather for your selected city"
        >
          <span className={`live-indicator ${isRefreshingWeather ? 'is-refreshing' : ''}`} />
          Live
        </button>
        {presets.map((preset) => (
          <button
            key={preset.id}
            className={roomState.weatherMode === 'manual' && roomState.weather === preset.id ? 'is-active' : ''}
            onClick={() => onSetWeather(preset.id)}
            title={`Preview ${preset.label.toLowerCase()} weather`}
          >
            {preset.icon}
            <span>{preset.label}</span>
          </button>
        ))}
      </div>

      <div className="room-topbar-actions">
        <button className="room-quiet-action" onClick={onOpenMoodAI} title="Set the room atmosphere">
          <Sparkles size={15} />
          <span>Atmosphere</span>
        </button>
        <button
          className={`room-quiet-action room-sound-action ${roomState.masterMute ? '' : 'is-playing'}`}
          onClick={onToggleMute}
          title={roomState.masterMute ? 'Enable room sound' : 'Mute room sound'}
        >
          {roomState.masterMute ? <VolumeX size={15} /> : <Volume2 size={15} />}
          <span>{roomState.masterMute ? 'Sound off' : 'Sound on'}</span>
        </button>
        <button className="room-icon-action" onClick={onToggleZenMode} title={zenMode ? 'Exit immersive view' : 'Enter immersive view'}>
          {zenMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>
    </header>
  );
};
