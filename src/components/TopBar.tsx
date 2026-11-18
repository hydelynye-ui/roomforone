import React from 'react';
import { Cloud, CloudRain, Maximize2, Minimize2, Moon, Snowflake, Sun, Volume2, VolumeX, Wind, SlidersHorizontal } from 'lucide-react';
import type { CityConfig, RoomState } from '../types';

interface TopBarProps {
  roomState: RoomState;
  onToggleMute: () => void;
  onOpenEnvironment: () => void;
  onOpenCityPicker: () => void;
  timeLabel: string;
  timePhase: string;
  city: CityConfig;
  isRefreshingWeather: boolean;
  zenMode: boolean;
  onToggleZenMode: () => void;
}

const weatherIcon = (weather: RoomState['weather']) => {
  if (weather === 'rain') return <CloudRain size={14} />;
  if (weather === 'snow') return <Snowflake size={14} />;
  if (weather === 'autumn') return <Wind size={14} />;
  if (weather === 'night') return <Moon size={14} />;
  if (weather === 'cloudy') return <Cloud size={14} />;
  return <Sun size={14} />;
};
const weatherName = (weather: RoomState['weather']) => ({
  sunny: 'Clear', cloudy: 'Cloudy', rain: 'Rain', snow: 'Snow', autumn: 'Windy', night: 'Night',
})[weather];

export const TopBar: React.FC<TopBarProps> = ({
  roomState, onToggleMute, onOpenEnvironment, onOpenCityPicker,
  timeLabel, timePhase, city, isRefreshingWeather, zenMode, onToggleZenMode,
}) => {
  const temperature = roomState.actualWeather?.temperature;
  return (
    <header className="room-topbar">
      <div className="room-brand">
        <span className="room-brand-symbol" />
        <span className="room-brand-name">roomforone</span>
      </div>
      <div className="room-topbar-right">
        <button className="room-time-button" onClick={onOpenCityPicker} title="Change city">
          <span className="room-time-city">{roomState.city ? city.name : 'Choose your city'} <i>·</i> {timePhase}</span>
          <span className="room-time-value">{timeLabel}</span>
        </button>
        <span className="room-weather-status" title={roomState.weatherMode === 'live' ? 'Live weather' : 'Weather preview'}>
          <span className={`live-indicator ${isRefreshingWeather ? 'is-refreshing' : ''} ${roomState.weatherMode === 'manual' ? 'is-manual' : ''}`} />
          {weatherIcon(roomState.weather)}
          <span>{weatherName(roomState.weather)}{temperature === undefined ? '' : ` · ${temperature}°`}{roomState.weatherMode === 'manual' ? ' · Preview' : ' · Live'}</span>
        </span>
        <button className="room-icon-action" onClick={onOpenEnvironment} aria-label="Environment settings" title="Environment settings"><SlidersHorizontal size={16} /></button>
        <button className={`room-icon-action room-sound-action ${roomState.masterMute ? '' : 'is-playing'}`} onClick={onToggleMute} aria-label={roomState.masterMute ? 'Enable room sound' : 'Mute room sound'} title={roomState.masterMute ? 'Enable room sound' : 'Mute room sound'}>
          {roomState.masterMute ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
        <button className="room-icon-action room-zen-action" onClick={onToggleZenMode} aria-label={zenMode ? 'Exit immersive view' : 'Enter immersive view'} title={zenMode ? 'Exit immersive view' : 'Enter immersive view'}>
          {zenMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>
    </header>
  );
};
