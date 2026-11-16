import React from 'react';
import { Sparkles, ArrowUpRight, Compass, Palette, Gamepad2, Hammer, Lightbulb, Headphones } from 'lucide-react';
import { projects } from '../data/projects';
import { ModalType } from '../types';

interface BentoCardsProps {
  stickyNote: string;
  onOpenModal: (modal: ModalType) => void;
  onOpenMoodAI: () => void;
}

export const BentoCards: React.FC<BentoCardsProps> = ({
  stickyNote,
  onOpenModal,
  onOpenMoodAI,
}) => {
  return (
    <div className="bento-sidebar">
      {/* 1. Mood Sticky Note Card (便签) */}
      <button type="button"
        onClick={onOpenMoodAI}
        className="paper-card p-4 rounded-2xl bg-[#FAF7F0] border border-[#C9A47E]/30 cursor-pointer hover:border-[#C98464]/60 transition-all duration-200 relative group overflow-hidden text-left"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#C98464]" />
            <span className="text-[11px] font-semibold tracking-wider text-[#34312E]/70 uppercase">
              桌角便签 · AI 心情
            </span>
          </div>
          <Sparkles className="w-3.5 h-3.5 text-[#C98464] opacity-70 group-hover:opacity-100 transition-opacity" />
        </div>
        <p className="font-serif-sc text-sm text-[#34312E] leading-relaxed italic pr-2">
          {stickyNote}
        </p>
        <div className="mt-3 text-[10px] text-[#C98464] flex items-center gap-1 font-medium">
          <span>点击写下今天的心情，让房间改变氛围</span>
          <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </button>

      {/* 2. Room Identity & Introduction Bento */}
      <div className="paper-card p-4 rounded-2xl bg-[#FAF7F0] border border-[#C9A47E]/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-[#EFE8DC] border border-[#C9A47E]/30 flex items-center justify-center font-bold text-sm text-[#C98464]">
            YY
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#34312E]">YY 的自留地</h3>
            <p className="text-[11px] text-[#34312E]/60">做喜欢的事 · 留一点空白</p>
          </div>
        </div>
        <p className="text-xs text-[#34312E]/80 leading-relaxed mb-3">
          这是一个属于一个人的低多边形沉浸房间。你可以转动视角，点开电脑逛逛作品，或者在画板涂鸦几笔。
        </p>
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#C9A47E]/15">
          <button
            onClick={() => onOpenModal('computer')}
            className="flex items-center gap-1.5 p-2 rounded-xl bg-[#EFE8DC]/60 hover:bg-[#EFE8DC] text-[11px] text-[#34312E] font-medium transition-all text-left cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-[#C9A47E]" />
            <span>个人作品集</span>
          </button>
          <button
            onClick={() => onOpenModal('drawing')}
            className="flex items-center gap-1.5 p-2 rounded-xl bg-[#EFE8DC]/60 hover:bg-[#EFE8DC] text-[11px] text-[#34312E] font-medium transition-all text-left cursor-pointer"
          >
            <Palette className="w-3.5 h-3.5 text-[#91A58C]" />
            <span>涂鸦画板</span>
          </button>
          <button
            onClick={() => onOpenModal('game')}
            className="flex items-center gap-1.5 p-2 rounded-xl bg-[#EFE8DC]/60 hover:bg-[#EFE8DC] text-[11px] text-[#34312E] font-medium transition-all text-left cursor-pointer"
          >
            <Gamepad2 className="w-3.5 h-3.5 text-[#C98464]" />
            <span>接落叶游戏</span>
          </button>
          <button
            onClick={() => onOpenModal('diy')}
            className="flex items-center gap-1.5 p-2 rounded-xl bg-[#EFE8DC]/60 hover:bg-[#EFE8DC] text-[11px] text-[#34312E] font-medium transition-all text-left cursor-pointer"
          >
            <Hammer className="w-3.5 h-3.5 text-[#825E3B]" />
            <span>手作记录</span>
          </button>
          <button
            onClick={() => onOpenModal('tangle')}
            className="flex items-center gap-1.5 p-2 rounded-xl bg-[#EFE8DC]/60 hover:bg-[#EFE8DC] text-[11px] text-[#34312E] font-medium transition-all text-left cursor-pointer"
          >
            <Lightbulb className="w-3.5 h-3.5 text-[#C98464]" />
            <span>随手灵感</span>
          </button>
          <button
            onClick={() => onOpenModal('headphones')}
            className="flex items-center gap-1.5 p-2 rounded-xl bg-[#EFE8DC]/60 hover:bg-[#EFE8DC] text-[11px] text-[#34312E] font-medium transition-all text-left cursor-pointer"
          >
            <Headphones className="w-3.5 h-3.5 text-[#34312E]/70" />
            <span>声音入口</span>
          </button>
        </div>
      </div>
      <button className="paper-card rounded-2xl p-4 text-left recent-card" onClick={() => onOpenModal('computer')}>
        <span className="eyebrow">ON MY DESK / 正在做</span><h3 className="text-sm font-semibold mt-2">{projects[0].title} <span className="float-right">↗</span></h3>
        <p className="text-xs text-[#34312E]/60 mt-2 leading-relaxed">{projects[0].subtitle}</p>
        <div className="project-thumbnail"><span /><span /><span /></div>
      </button>
    </div>
  );
};
