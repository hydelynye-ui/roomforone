import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Check, ArrowRight, Loader2 } from 'lucide-react';
import { MoodAIRecommendation } from '../types';
import { analyzeMood } from '../services/aiMoodService';

interface MoodAIModalProps {
  onApplyRecommendation: (rec: MoodAIRecommendation, expectedRevision: number) => void;
  sceneRevision: number;
  onClose: () => void;
}

export const MoodAIModal: React.FC<MoodAIModalProps> = ({
  onApplyRecommendation,
  onClose,
  sceneRevision,
}) => {
  const [inputMood, setInputMood] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<MoodAIRecommendation | null>(null);

  const quickPrompts = [
    '今天有点累，想听雨，但不要太暗',
    '秋天阳光洒在桌上，想安静看会儿书',
    '外面好冷，想在屋里点一盏暖灯看落雪',
    '想专注写代码，需要安静的深夜氛围',
    '心情很轻松，想开着窗吹吹微风听鸟鸣',
  ];

  const requestId = useRef(0), mounted = useRef(true);
  const revisionRef = useRef(sceneRevision); revisionRef.current = sceneRevision;
  const [resultRevision, setResultRevision] = useState(sceneRevision);
  const [error, setError] = useState('');
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; requestId.current++; }; }, []);
  const handleAnalyze = async (text: string) => {
    if (!text.trim()) return;
    const id = ++requestId.current, originalRevision = revisionRef.current;
    setLoading(true); setRecommendation(null); setError('');
    try {
      const rec = await analyzeMood(text);
      if (!mounted.current || id !== requestId.current) return;
      setRecommendation(rec); setResultRevision(originalRevision);
      if (originalRevision !== revisionRef.current) setError('等待时房间已调整，这份建议不会覆盖你的新选择。请重新生成。');
    } catch { if (mounted.current && id === requestId.current) setError('暂时无法生成建议，请重试。房间没有改变。'); }
    finally { if (mounted.current && id === requestId.current) setLoading(false); }
  };
  const handleApply = () => {
    if (!recommendation || loading || resultRevision !== sceneRevision) return;
    onApplyRecommendation(recommendation, resultRevision);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-lg bg-[#FAF7F0] border border-[#C9A47E]/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#C9A47E]/20">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C98464] animate-pulse" />
            <h3 className="text-sm font-bold text-[#34312E]">
              桌角便签 · 把一句话变成房间氛围
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="关闭心情氛围"
            className="p-1.5 rounded-full hover:bg-[#EFE8DC] text-[#34312E]/70 hover:text-[#34312E] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#34312E] block mb-1">
              今天想待在什么样的房间？
            </label>
            <p className="text-[11px] text-[#34312E]/60 mb-2.5">
              输入你此时的心情、疲惫程度或喜欢的景象，本地规则演示会组合天气、暖灯与声音建议；应用前可以先看一眼。
            </p>
            <div className="relative">
              <textarea
                value={inputMood}
                onChange={(e) => { setInputMood(e.target.value); setRecommendation(null); requestId.current++; setLoading(false); }}
                placeholder="例如：今天有点累，想听雨，但不要太暗..."
                rows={3}
                maxLength={500}
                className="w-full p-3.5 rounded-2xl bg-white border border-[#C9A47E]/30 text-xs text-[#34312E] focus:outline-none focus:border-[#C98464] resize-none shadow-inner"
              />
              <button
                onClick={() => handleAnalyze(inputMood)}
                disabled={loading || !inputMood.trim()}
                className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#C98464] hover:bg-[#B36F51] text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-40 cursor-pointer"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>分析心情</span>
              </button>
            </div>
          </div>

          {/* Quick chips */}
          <div>
            <span className="text-[10px] text-[#34312E]/60 block mb-1.5 font-medium">
              推荐灵感：
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputMood(prompt);
                    handleAnalyze(prompt);
                  }}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-[#EFE8DC]/70 hover:bg-[#EFE8DC] border border-[#C9A47E]/20 text-[#34312E]/80 transition-all cursor-pointer text-left"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
          {/* AI Result Card */}
          {recommendation && (
            <div className="p-4 rounded-2xl bg-[#FAF7F0] border-2 border-[#C98464]/30 space-y-3 animate-fade-in shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#C98464] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> 房间氛围调整建议
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#EFE8DC] text-[#34312E]/70">
                  演示模式 · 本地规则
                </span>
              </div>

              <p className="text-xs text-[#34312E]/80 leading-relaxed">
                {recommendation.reason}
              </p>

              {/* Parameter preview badges */}
              <div className="flex flex-wrap gap-2 text-[11px]">
                <span className="px-2.5 py-1 rounded-lg bg-white border border-[#C9A47E]/20 text-[#34312E]">
                  天气: <strong>
                    {recommendation.weather === 'sunny' && '晴日下午'}
                    {recommendation.weather === 'rain' && '安静雨天'}
                    {recommendation.weather === 'snow' && '冬日落雪'}
                    {recommendation.weather === 'autumn' && '清爽秋日'}
                    {recommendation.weather === 'night' && '暖灯夜晚'}
                  </strong>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-[#C9A47E]/20 text-[#34312E]">
                  窗户: <strong>保留你的选择</strong>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-[#C9A47E]/20 text-[#34312E]">
                  台灯: <strong>{recommendation.lampOn ? '点亮暖光' : '自然日光'}</strong>
                </span>
              </div>

              {/* Room sticky note */}
              <div className="p-3 rounded-xl bg-[#FAF7F0] border border-[#C9A47E]/20">
                <span className="text-[10px] text-[#C98464] font-medium block mb-0.5">
                  留给桌角的便签文字：
                </span>
                <p className="font-serif-sc text-xs text-[#34312E] italic">
                  {recommendation.roomNote}
                </p>
              </div>

              <button
                onClick={handleApply}
                disabled={loading || resultRevision !== sceneRevision}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#C98464] hover:bg-[#B36F51] text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>应用此氛围至当前房间</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-2.5 bg-[#FAF7F0] border-t border-[#C9A47E]/15 text-[11px] text-[#34312E]/60 flex items-center justify-between">
          <span>应用建议时，窗户和静音保留你的选择</span>
          <button onClick={onClose} className="hover:underline cursor-pointer">
            取消
          </button>
        </div>
      </div>
    </div>
  );
};
