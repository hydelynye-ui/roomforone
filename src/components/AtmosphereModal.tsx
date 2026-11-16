import React from 'react';
import { 
  X, 
  Sun, 
  CloudRain, 
  Snowflake, 
  Wind, 
  Moon, 
  Volume2, 
  VolumeX, 
  Lightbulb, 
  Columns3,
  Sliders
} from 'lucide-react';
import { WeatherPreset, RoomState } from '../types';

interface AtmosphereModalProps {
  roomState: RoomState;
  onSetWeather: (preset: WeatherPreset) => void;
  onToggleWindow: () => void;
  onToggleLamp: () => void;
  onToggleMute: () => void;
  onUpdateVolume: (type: 'weather' | 'ambient', val: number) => void;
  onClose: () => void;
}

export const AtmosphereModal: React.FC<AtmosphereModalProps> = ({
  roomState,
  onSetWeather,
  onToggleWindow,
  onToggleLamp,
  onToggleMute,
  onUpdateVolume,
  onClose,
}) => {
  const presets: { id: WeatherPreset; label: string; desc: string; icon: React.ReactNode }[] = [
    { id: 'sunny', label: '晴日下午', desc: '柔和日光斜射、轻柔鸟鸣与微风', icon: <Sun className="w-4 h-4 text-amber-500" /> },
    { id: 'rain', label: '安静雨天', desc: '阴天与窗玻璃雨迹、低沉雨声', icon: <CloudRain className="w-4 h-4 text-blue-400" /> },
    { id: 'snow', label: '冬日落雪', desc: '窗外漫天白雪、开窗有轻盈雪花', icon: <Snowflake className="w-4 h-4 text-sky-300" /> },
    { id: 'autumn', label: '清爽秋日', desc: '金色夕照斜射、落叶飞舞沙沙声', icon: <Wind className="w-4 h-4 text-orange-400" /> },
    { id: 'night', label: '暖灯夜晚', desc: '静谧夜色、台灯暖光与屏幕蓝晕', icon: <Moon className="w-4 h-4 text-indigo-400" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-lg bg-[#FAF7F0] border border-[#C9A47E]/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#C9A47E]/20">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C9A47E]" />
            <h3 className="text-sm font-bold text-[#34312E]">
              空间氛围与环境音调节
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="关闭氛围面板"
            className="p-1.5 rounded-full hover:bg-[#EFE8DC] text-[#34312E]/70 hover:text-[#34312E] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Weather presets */}
          <div>
            <label className="text-xs font-semibold text-[#34312E]/70 block mb-2.5 uppercase tracking-wider">
              天气预设 (Weather Presets)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {presets.map((p) => {
                const isActive = roomState.weather === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => onSetWeather(p.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                      isActive
                        ? 'bg-[#C9A47E]/15 border-[#C9A47E] shadow-xs'
                        : 'bg-white/60 border-[#C9A47E]/20 hover:bg-white hover:border-[#C9A47E]/40'
                    }`}
                  >
                    <div className="mt-0.5">{p.icon}</div>
                    <div>
                      <div className="text-xs font-bold text-[#34312E]">{p.label}</div>
                      <div className="text-[11px] text-[#34312E]/60 mt-0.5">{p.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Room Switches (Window & Lamp) */}
          <div>
            <label className="text-xs font-semibold text-[#34312E]/70 block mb-2.5 uppercase tracking-wider">
              房间互动开关
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onToggleWindow}
                className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  roomState.windowOpen
                    ? 'bg-[#91A58C]/15 border-[#91A58C] text-[#34312E]'
                    : 'bg-white/60 border-[#C9A47E]/20 text-[#34312E]/70'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Columns3 className="w-4 h-4 text-[#91A58C]" />
                  <span className="text-xs font-semibold">窗户状态</span>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#FAF7F0] border border-[#C9A47E]/20 font-medium">
                  {roomState.windowOpen ? '已打开' : '已关闭'}
                </span>
              </button>

              <button
                onClick={onToggleLamp}
                className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  roomState.lampOn
                    ? 'bg-amber-100/50 border-amber-400 text-[#34312E]'
                    : 'bg-white/60 border-[#C9A47E]/20 text-[#34312E]/70'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-semibold">台灯照明</span>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#FAF7F0] border border-[#C9A47E]/20 font-medium">
                  {roomState.lampOn ? '亮起中' : '已熄灭'}
                </span>
              </button>
            </div>
            <p className="text-[11px] text-[#34312E]/50 mt-1.5">
              提示：窗户关闭时，外部天气声会自动衰减并滤波变闷；开窗时雨雪和风声更清透。
            </p>
          </div>

          {/* Sound Controls (Procedural Web Audio) */}
          <div className="p-4 rounded-2xl bg-[#EFE8DC]/50 border border-[#C9A47E]/25 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#C98464]" />
                <span className="text-xs font-bold text-[#34312E]">声音混音器</span>
              </div>
              <button
                onClick={onToggleMute}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all ${
                  roomState.masterMute
                    ? 'bg-[#FAF7F0] border border-[#C9A47E]/30 text-[#34312E]/70'
                    : 'bg-[#91A58C] text-white shadow-xs'
                }`}
              >
                {roomState.masterMute ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{roomState.masterMute ? '开启声音' : '静音总控'}</span>
              </button>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <div className="flex justify-between text-[11px] text-[#34312E]/80 mb-1">
                  <span>天气声音量 (雨声/风声/落雪)</span>
                  <span>{Math.round(roomState.volumeWeather * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={roomState.volumeWeather}
                  onChange={(e) => onUpdateVolume('weather', parseFloat(e.target.value))}
                  disabled={roomState.masterMute}
                  className="w-full accent-[#C98464] cursor-pointer disabled:opacity-40"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-[#34312E]/80 mb-1">
                  <span>室内氛围音量 (鸟鸣/Lo-Fi底噪)</span>
                  <span>{Math.round(roomState.volumeAmbient * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={roomState.volumeAmbient}
                  onChange={(e) => onUpdateVolume('ambient', parseFloat(e.target.value))}
                  disabled={roomState.masterMute}
                  className="w-full accent-[#91A58C] cursor-pointer disabled:opacity-40"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
