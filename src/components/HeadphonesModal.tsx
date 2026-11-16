import React from 'react';
import { Headphones, Volume2, VolumeX, X } from 'lucide-react';
import type { AudioTrack, RoomState, WeatherPreset } from '../types';

interface Props {
  roomState: RoomState;
  onToggleMute: () => void;
  onUpdateTrack: (track: AudioTrack, value: number) => void;
  onMasterVolume: (value: number) => void;
  onSetWeather: (weather: WeatherPreset) => void;
  onClose: () => void;
}
const weatherLabels: Record<WeatherPreset, string> = { sunny: '晴日下午', rain: '安静雨天', snow: '冬日落雪', autumn: '清爽秋日', night: '暖灯夜晚' };
const labels: Record<AudioTrack, string> = { rain: '雨声', wind: '风声', birds: '鸟鸣', lofi: 'lo-fi 音乐' };
export const HeadphonesModal: React.FC<Props> = ({ roomState: s, onToggleMute, onUpdateTrack, onMasterVolume, onSetWeather, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
    <div className="w-full max-w-md bg-[#FAF7F0] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
      <header className="modal-header"><Headphones size={20} /><h2>AirPods Max · 声音</h2><button onClick={onClose} aria-label="关闭声音面板"><X size={18} /></button></header>
      <div className="modal-content space-y-5">
        <div className="flex justify-between items-center"><span className="text-sm">留一点声音陪着自己</span><button className="soft-button" onClick={onToggleMute}>{s.masterMute ? <VolumeX size={16} /> : <Volume2 size={16} />}{s.masterMute ? '开启环境音' : '静音'}</button></div>
        <label className="audio-slider"><span>总音量 <b>{Math.round(s.masterVolume * 100)}%</b></span><input aria-label="总音量" type="range" min="0" max="1" step="0.01" value={s.masterVolume} onChange={e => onMasterVolume(+e.target.value)} /></label>
        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(labels) as AudioTrack[]).map(track => <label key={track} className="audio-slider paper-card rounded-xl p-3"><span>{labels[track]}<b>{Math.round(s.audioTracks[track] * 100)}%</b></span><input aria-label={labels[track]} type="range" min="0" max="1" step="0.01" value={s.audioTracks[track]} onChange={e => onUpdateTrack(track, +e.target.value)} /></label>)}
        </div>
        <label className="block text-xs">当前天气<select aria-label="声音面板天气" value={s.weather} onChange={e => onSetWeather(e.target.value as WeatherPreset)} className="mt-2 w-full rounded-xl border border-[#C9A47E]/40 bg-white p-3">{Object.entries(weatherLabels).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
        <p className="text-xs leading-relaxed text-[#34312E]/60">窗户{s.windowOpen ? '已打开，户外声音更清晰' : '已关闭，雨声和风声更轻、更低沉'}。天气决定基础混音，四条滑块可以分别调节；关闭面板不会停止播放。lo-fi 是本项目程序生成的轻和弦与旋律。</p>
        <p className="text-xs text-[#34312E]/50">只控制网页声景，不连接真实蓝牙设备。</p>
      </div>
    </div>
  </div>
);
