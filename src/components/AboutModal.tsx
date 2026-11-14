import React from 'react';
import { X, ShieldCheck, Heart, Sparkles, Database, Layers } from 'lucide-react';

interface AboutModalProps {
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-lg bg-[#FAF7F0] border border-[#C9A47E]/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#C9A47E]/20">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#91A58C]" />
            <h3 className="text-sm font-bold text-[#34312E]">
              关于 roomforone (一个人的房间)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#EFE8DC] text-[#34312E]/70 hover:text-[#34312E] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-[#34312E]/80 leading-relaxed">
          <div className="p-4 rounded-2xl bg-[#EFE8DC]/50 border border-[#C9A47E]/20">
            <h4 className="text-sm font-bold text-[#34312E] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#C98464]" />
              给自己留一点空间
            </h4>
            <p className="mt-1 text-xs text-[#34312E]/70 leading-relaxed">
              「roomforone」是 YY 自己愿意待着的房间，也欢迎朋友和访客进来逛。它通过物件介绍兴趣与作品，通过天气、光线和声音营造氛围，再用一个可以真正参与的 AI 心情小实验把访客和房间联系起来。
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-[#34312E] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#91A58C]" />
              CloudBase 独立环境与数据隔离规范
            </h5>
            <div className="grid grid-cols-1 gap-2 text-[11px]">
              <div className="p-2.5 rounded-xl bg-white border border-[#C9A47E]/20 flex items-center justify-between">
                <span className="text-[#34312E]/70 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-[#C9A47E]" /> CloudBase 环境 ID
                </span>
                <code className="font-mono bg-[#EFE8DC] px-1.5 py-0.5 rounded text-[#34312E]">applicable-butterfly-d9ac7eb21be</code>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-[#C9A47E]/20 flex items-center justify-between">
                <span className="text-[#34312E]/70 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-[#C9A47E]" /> 部署路径
                </span>
                <code className="font-mono bg-[#EFE8DC] px-1.5 py-0.5 rounded text-[#34312E]">/ (独立根路径)</code>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-[#C9A47E]/20 flex items-center justify-between">
                <span className="text-[#34312E]/70 flex items-center gap-1">
                  <Database className="w-3.5 h-3.5 text-[#C9A47E]" /> 本地 localStorage
                </span>
                <code className="font-mono bg-[#EFE8DC] px-1.5 py-0.5 rounded text-[#34312E]">roomforone-state-v1</code>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-[#C9A47E]/20 flex items-center justify-between">
                <span className="text-[#34312E]/70 flex items-center gap-1">
                  <Database className="w-3.5 h-3.5 text-[#C9A47E]" /> 本地 IndexedDB
                </span>
                <code className="font-mono bg-[#EFE8DC] px-1.5 py-0.5 rounded text-[#34312E]">roomforone-local-v1</code>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-[#C9A47E]/20 flex items-center justify-between">
                <span className="text-[#34312E]/70 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#91A58C]" /> 独立环境物理隔离
                </span>
                <span className="text-[#91A58C] font-semibold">100% 独立环境，与 Focus Space 彻底隔离</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#C9A47E]/15 flex items-center justify-between text-[11px] text-[#34312E]/50">
            <span>版本 v1.0.0 (2026 年 11 月)</span>
            <span className="flex items-center gap-1">
              Crafted with <Heart className="w-3 h-3 text-red-500 fill-current" /> by YY
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
