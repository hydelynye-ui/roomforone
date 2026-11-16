import React from 'react';
import { 
  Sun, 
  CloudRain, 
  Snowflake, 
  Wind, 
  Moon, 
  Volume2, 
  VolumeX, 
  Sparkles,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { CityConfig, WeatherPreset, RoomState } from '../types';

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
    { id: 'sunny', label: '晴日下午', icon: <Sun className="w-3.5 h-3.5 text-amber-500" /> },
    { id: 'rain', label: '安静雨天', icon: <CloudRain className="w-3.5 h-3.5 text-blue-400" /> },
    { id: 'snow', label: '冬日落雪', icon: <Snowflake className="w-3.5 h-3.5 text-sky-300" /> },
    { id: 'autumn', label: '清爽秋日', icon: <Wind className="w-3.5 h-3.5 text-orange-400" /> },
    { id: 'night', label: '暖灯夜晚', icon: <Moon className="w-3.5 h-3.5 text-indigo-400" /> },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-30 h-14 px-4 md:px-6 flex items-center justify-between pointer-events-none select-none">
      {/* Brand title and local time */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#FAF7F0] border border-[#C9A47E]/30 flex items-center justify-center shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C98464]" />
          </div>
          <div>
            <h1 className="text-sm md:text-base font-bold tracking-tight text-[#34312E] leading-none">
              roomforone
            </h1>
            <p className="text-[10px] md:text-xs text-[#34312E]/60 mt-0.5 font-serif-sc">
              给自己留一点空间
            </p>
          </div>
        </div>
        <button onClick={onOpenCityPicker} className="hidden sm:block text-left rounded-xl px-3 py-1.5 transition hover:bg-[#FAF7F0]/70" title="Change city">
          <div className="text-[10px] uppercase tracking-[.18em] text-[#34312E]/45">{city.name} · {timePhase}</div>
          <div className="text-sm font-semibold tracking-tight text-[#34312E] tabular-nums">{timeLabel}</div>
        </button>
      </div>

      {/* Center Weather Quick Toggles */}
      <div className="hidden lg:flex items-center gap-1.5 p-1 rounded-full bg-[#FAF7F0]/85 backdrop-blur-md border border-[#C9A47E]/30 shadow-sm pointer-events-auto">
        <button
          onClick={onUseLiveWeather}
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-[11px] transition-all ${roomState.weatherMode !== 'manual' ? 'bg-[#91A58C] text-white' : 'text-[#34312E]/55 hover:bg-[#EFE8DC]'}`}
          title="Use current weather"
        >
          <span className={`h-1.5 w-1.5 rounded-full ${isRefreshingWeather ? 'animate-ping bg-white' : 'bg-current'}`} />
          Live
        </button>
        {presets.map((p) => {
          const isActive = roomState.weather === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onSetWeather(p.id)}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-[#C9A47E] text-white shadow-xs font-medium'
                  : 'text-[#34312E]/70 hover:bg-[#EFE8DC]/60 hover:text-[#34312E]'
              }`}
            >
              {p.icon}
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* Mood AI Button */}
        <button
          onClick={onOpenMoodAI}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF7F0]/90 backdrop-blur-md border border-[#C9A47E]/30 text-xs font-medium text-[#34312E] shadow-sm hover:border-[#C98464] hover:bg-[#FAF7F0] transition-all cursor-pointer"
          title="今天想待在什么样的房间？"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#C98464] animate-pulse" />
          <span className="hidden sm:inline">心情氛围</span>
        </button>

        <button onClick={onOpenCityPicker} className="hidden md:flex items-center rounded-full border border-[#C9A47E]/30 bg-[#FAF7F0]/80 px-3 py-1.5 text-[11px] text-[#34312E]/70 shadow-sm transition hover:bg-white">
          {city.name}
        </button>

        {/* Master Sound Button */}
        <button
          onClick={onToggleMute}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium backdrop-blur-md transition-all shadow-sm cursor-pointer ${
            roomState.masterMute
              ? 'bg-[#FAF7F0]/80 border-[#C9A47E]/30 text-[#34312E]/60 hover:text-[#34312E]'
              : 'bg-[#91A58C] border-[#91A58C] text-white shadow-xs'
          }`}
          title={roomState.masterMute ? '开启环境音' : '静音'}
        >
          {roomState.masterMute ? (
            <>
              <VolumeX className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">静音中</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5 animate-pulse" />
              <span className="hidden sm:inline">声音开启</span>
            </>
          )}
        </button>

        {/* Zen Mode Toggle */}
        <button
          onClick={onToggleZenMode}
          className="p-2 rounded-full bg-[#FAF7F0]/80 backdrop-blur-md border border-[#C9A47E]/30 text-[#34312E]/70 hover:text-[#34312E] shadow-sm transition-all cursor-pointer"
          title={zenMode ? '退出沉浸模式' : '沉浸全屏视角'}
        >
          {zenMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    </header>
  );
};
