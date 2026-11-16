import React from 'react';
import { X, ExternalLink, Code2, Sparkles, FolderGit2 } from 'lucide-react';
import { projects } from '../data/projects';

interface ComputerModalProps {
  onClose: () => void;
}

export const ComputerModal: React.FC<ComputerModalProps> = ({ onClose }) => {


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-3xl max-h-[85vh] bg-[#FAF7F0] border border-[#C9A47E]/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#C9A47E]/20 bg-[#FAF7F0]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#C98464]" />
            <div className="w-3 h-3 rounded-full bg-[#C9A47E]" />
            <div className="w-3 h-3 rounded-full bg-[#91A58C]" />
            <span className="ml-2 text-xs font-semibold text-[#34312E]/70 uppercase tracking-wider">
              桌面电脑 · 作品集与项目 (Bento Grid)
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="关闭作品面板"
            className="p-1.5 rounded-full hover:bg-[#EFE8DC] text-[#34312E]/70 hover:text-[#34312E] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="p-4 rounded-2xl bg-[#EFE8DC]/50 border border-[#C9A47E]/20 flex items-start justify-between">
            <div>
              <h2 className="text-base font-bold text-[#34312E]">欢迎来到 YY 的作品台</h2>
              <p className="text-xs text-[#34312E]/70 mt-1 leading-relaxed">
                在这里可以浏览当前进行中与已完成的项目。所有数据在当前浏览器本地完全独立隔离。
              </p>
            </div>
            <Code2 className="w-5 h-5 text-[#C98464] shrink-0 mt-1" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="p-5 rounded-2xl bg-white/70 border border-[#C9A47E]/25 hover:border-[#C98464]/60 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#EFE8DC] text-[#34312E]/80">
                      {proj.tag}
                    </span>
                    <FolderGit2 className="w-4 h-4 text-[#C9A47E] group-hover:text-[#C98464] transition-colors" />
                  </div>
                  <h3 className="text-sm font-bold text-[#34312E]">{proj.title}</h3>
                  <p className="text-xs text-[#C98464] font-medium mt-0.5">{proj.subtitle}</p>
                  <p className="text-xs text-[#34312E]/70 mt-2 leading-relaxed">
                    {proj.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {proj.highlights.map((h, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAF7F0] border border-[#C9A47E]/20 text-[#34312E]/70">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#C9A47E]/15 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-[#34312E]/50 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#91A58C]" /> 活跃维护
                  </span>
                  {(proj.demoUrl || proj.link) && (
                    <a
                      href={proj.demoUrl || proj.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#C98464] hover:underline flex items-center gap-1 font-medium"
                    >
                      {proj.demoUrl ? '访问演示' : '查看项目'} <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
