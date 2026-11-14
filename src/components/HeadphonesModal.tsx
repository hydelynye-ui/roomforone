import React from 'react';
import { Headphones, Volume2, VolumeX, X } from 'lucide-react';
import { RoomState, WeatherPreset } from '../types';

interface HeadphonesModalProps {
  roomState: RoomState;
  onToggleMute: () => void;
  onUpdateVolume: (type: 'weather' | 'ambient', value: number) => void;
  onSetWeather: (preset: WeatherPreset) => void;
  onClose: () => void;
}

export const HeadphonesModal: React.FC<HeadphonesModalProps> = ({
  roomState,
  onToggleMute,
  onUpdateVolume,
  onSetWeather,
  onClose,
}) => {
  const weatherLabel: Record<WeatherPreset, string> = {
    sunny: '晴日下午',
    rain: '安静雨天',
    snow: '冬日落雪',
    autumn: '清爽秋日',
    night: '暖灯夜晚',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-[#FAF7F0] border border-[#C9A47E]/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#C9A47E]/20">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#34312E] text-[#FAF7F0]">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#34312E]">AirPods Max · 私人听觉入口</h3>
              <p className="text-[10px] text-[#34312E]/55 mt-0.5">把天气声、房间声和一点音乐混在一起</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="关闭声音面板"
            className="p-1.5 rounded-full hover:bg-[#EFE8DC] text-[#34312E]/70 hover:text-[#34312E] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between rounded-2xl border border-[#C9A47E]/20 bg-[#EFE8DC]/55 px-4 py-3">
            <div>
              <p className="text-xs font-semibold text-[#34312E]">环境音总控</p>
              <p className="mt-0.5 text-[11px] text-[#34312E]/55">浏览器只会在你主动点击后开始播放</p>
            </div>
            <button
              onClick={onToggleMute}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors cursor-pointer ${
                roomState.masterMute ? 'bg-white text-[#34312E]/70 border border-[#C9A47E]/25' : 'bg-[#91A58C] text-white'
              }`}
            >
              {roomState.masterMute ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              {roomState.masterMute ? '开启声音' : '正在播放'}
            </button>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-[#34312E]">当前天气声</span>
              <span className="text-[11px] text-[#C98464]">{weatherLabel[roomState.weather]}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(weatherLabel) as WeatherPreset[]).map((preset) => (
                <button
                  key={preset}
                  onClick={() => onSetWeather(preset)}
                  className={`rounded-full border px-2.5 py-1 text-[10px] transition-colors cursor-pointer ${
                    roomState.weather === preset
                      ? 'border-[#C98464] bg-[#C98464] text-white'
                      : 'border-[#C9A47E]/25 bg-white/70 text-[#34312E]/70 hover:border-[#C98464]/60'
                  }`}
                >
                  {weatherLabel[preset]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-[#C9A47E]/20 bg-white/60 p-4">
            <label className="block">
              <span className="mb-1.5 flex justify-between text-[11px] text-[#34312E]/75">
                <span>天气声</span><strong>{Math.round(roomState.volumeWeather * 100)}%</strong>
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={roomState.volumeWeather}
                onChange={(event) => onUpdateVolume('weather', Number(event.target.value))}
                className="w-full accent-[#C98464] cursor-pointer"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 flex justify-between text-[11px] text-[#34312E]/75">
                <span>房间声 / lo-fi 底噪</span><strong>{Math.round(roomState.volumeAmbient * 100)}%</strong>
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={roomState.volumeAmbient}
                onChange={(event) => onUpdateVolume('ambient', Number(event.target.value))}
                className="w-full accent-[#91A58C] cursor-pointer"
              />
            </label>
          </div>

          <p className="text-[11px] leading-relaxed text-[#34312E]/55">
            耳机入口只控制房间自己的声音引擎，不会访问或连接真实蓝牙设备；静音状态、天气和音量会与顶部声音按钮保持同步。
          </p>
        </div>

        <div className="border-t border-[#C9A47E]/15 bg-[#FAF7F0] px-6 py-2.5 text-right text-[11px]">
          <button onClick={onClose} className="font-medium text-[#C98464] hover:underline cursor-pointer">返回房间</button>
        </div>
      </div>
    </div>
  );
};
