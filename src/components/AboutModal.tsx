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
            aria-label="关闭关于页面"
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

          <div className="space-y-3">
            <h4 className="font-bold">这里的东西，可以慢慢摆弄。</h4>
            <p>桌上的电脑、耳机、手柄、台灯和 Tangle 都可以拖动。右键拖动可以旋转；在手机上选择旋转模式。Tangle 的每一个连接段都可以拉动，双指用于转动房间。</p>
            <p>画稿、灵感便签、物件摆放和声音偏好仅保存在当前设备。它们不会自动上传，也不会跨设备同步。清除浏览器数据前，请先导出重要画稿。</p>
            <p>心情氛围目前是本地规则演示，不会把你的心情发送给外部模型；声音需要你主动开启。手作内容暂为明确标注的示例。</p>
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
