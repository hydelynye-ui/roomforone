import React from 'react';
import { X, ExternalLink, Code2, Sparkles, FolderGit2 } from 'lucide-react';
import { ProjectItem } from '../types';

interface ComputerModalProps {
  onClose: () => void;
}

export const ComputerModal: React.FC<ComputerModalProps> = ({ onClose }) => {
  const projects: ProjectItem[] = [
    {
      id: 'roomforone',
      title: 'roomforone',
      subtitle: '沉浸式低多边形独处数字空间',
      tag: 'Three.js / React 19 / Web Audio',
      description: '一个人的房间。将 3D 物件探索、自适应当季天气、环境音模拟、画板创作与 AI 心情氛围转换融为一体。',
      highlights: ['低多边形开放剖面房间', '环境音与天气程序化联动', '独立命名空间与本地离线存储'],
      link: 'https://github.com/roomforone',
    },
    {
      id: 'focus-space',
      title: 'Focus Space',
      subtitle: '个人专注数字桌面与生产力系统',
      tag: 'React 19 / TypeScript / IndexedDB',
      description: '集专注计时、任务清单、日程规划与声景于一体的心流空间，支持多时钟视觉与平滑场景切换。',
      highlights: ['多时钟视觉渲染引擎', '防漂移高精度计时', '纯前端本地双重持久化'],
      demoUrl: 'https://focus-space-d5gmg1bimc422765f-1525079590.tcloudbaseapp.com/',
    },
    {
      id: 'pricing-engine',
      title: 'FOMS Hybrid Pricing Engine',
      subtitle: '物流三方费率多维测算与比价模型',
      tag: 'TypeScript / Excel Model / Algorithms',
      description: '支持多承运商尾端分级计费、动态燃油附加费及全量敏感度分析的高性能算费引擎。',
      highlights: ['阶梯重量区间计算', '极速并行算费', '高维度矩阵比价'],
    },
  ];

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
                  {proj.demoUrl && (
                    <a
                      href={proj.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#C98464] hover:underline flex items-center gap-1 font-medium"
                    >
                      访问演示 <ExternalLink className="w-3 h-3" />
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
