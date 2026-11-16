import React from 'react';
import { X, Hammer, Scissors, Sparkles, BookOpen } from 'lucide-react';
import { DIYItem } from '../types';

interface DIYModalProps {
  onClose: () => void;
}

export const DIYModal: React.FC<DIYModalProps> = ({ onClose }) => {
  const diyRecords: DIYItem[] = [
    {
      id: 'oak-monitor-stand',
      title: '橡木双层显示器增高架与收纳抽屉',
      category: '木工手作',
      date: '2026 年秋',
      summary: '用白橡木实木板手工打磨、开榫与涂刷木蜡油制作的桌面增高架，解决线缆杂乱并提升视线舒适度。',
      materials: ['北美白橡木拼板 (厚 18mm)', '天然欧诗木木蜡油', '黄铜拉手', '防滑毛毡脚垫'],
      steps: [
        '下料锯切并试装榫卯结构',
        '自 180 目逐级打磨至 400 目触感温润',
        '双层均匀涂刷植物木蜡油并阴干 48 小时',
        '安装黄铜配件与桌面防刮脚垫',
      ],
      quote: '木头的温度来自双手打磨的每一遍抚触。',
    },
    {
      id: 'mechanical-keyboard',
      title: '客制化 65% 无线双模机械键盘组装',
      category: '电子与硬件',
      date: '2026 年夏',
      summary: '铝合金阳极氧化外壳搭配手润线性轴体与热升华 PBT 键帽，打造最适合深夜编码的沉稳敲击声。',
      materials: ['CNC 阳极氧化铝外壳', 'FR4 定位板与定制 PCB', '手润线性轴 (45g 触发)', '静音夹心棉与轴下垫'],
      steps: [
        'PCB 逐键测试及轴座加固',
        '手工润滑卫星轴假轴与钢丝平衡',
        '分层装配消音材料与定位板',
        '固件烧录与无线低延迟配对调优',
      ],
      quote: '工具顺手了，专注便自然发生。',
    },
    {
      id: 'paper-notebook',
      title: '手工锁线精装裸脊手账本',
      category: '纸品与装订',
      date: '2026 年春',
      summary: '使用 100g 进口道林纸，采用科普特装订法手工缝制，可以 180 度完全平摊，适合钢笔与水彩速写。',
      materials: ['100g 米黄道林纸 (32 开)', '纯棉蜡线与圆头装订针', '荷兰灰板与棉麻装帧布'],
      steps: [
        '纸张折页成贴并打孔预定位',
        '传统科普特锁线手工逐帖缝合',
        '裁切装帧灰板并包裹天然棉麻布',
        '前后环衬压平定型压重一整晚',
      ],
      quote: '在数字时代，把思绪写在真正有质感的纸上格外踏实。',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-2xl max-h-[85vh] bg-[#FAF7F0] border border-[#C9A47E]/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#C9A47E]/20">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#825E3B]" />
            <h3 className="text-sm font-bold text-[#34312E]">
              侧墙洞洞板 · 手作与 DIY 记录
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="关闭手作记录"
            className="p-1.5 rounded-full hover:bg-[#EFE8DC] text-[#34312E]/70 hover:text-[#34312E] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="p-4 rounded-2xl bg-[#EFE8DC]/50 border border-[#C9A47E]/20 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] border border-[#C9A47E]/30 flex items-center justify-center text-[#825E3B]">
              <Hammer className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#34312E]">动手制作，也是沉浸专注的方式</h4>
              <p className="text-[11px] text-[#34312E]/70 mt-0.5">
                这里先放三篇手作示例。真实作品照片、材料和过程待 YY 补充。
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {diyRecords.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-white/70 border border-[#C9A47E]/25 shadow-xs hover:border-[#C98464]/60 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#EFE8DC] text-[#34312E]">
                    示例 · {item.category}
                  </span>
                  <span className="text-[11px] text-[#34312E]/50">{item.date}</span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-[#34312E]">{item.title}</h4>
                  <p className="text-xs text-[#34312E]/75 mt-1 leading-relaxed">
                    {item.summary}
                  </p>
                </div>

                {/* Materials tags */}
                <div className="pt-2 border-t border-[#C9A47E]/15">
                  <div className="text-[11px] font-medium text-[#34312E]/60 mb-1.5 flex items-center gap-1">
                    <Scissors className="w-3 h-3 text-[#C98464]" /> 使用材料
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {item.materials.map((m, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-[#FAF7F0] border border-[#C9A47E]/20 text-[#34312E]/80">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Steps */}
                <div className="bg-[#FAF7F0] p-3 rounded-xl border border-[#C9A47E]/15">
                  <div className="text-[11px] font-medium text-[#34312E]/60 mb-1 flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-[#91A58C]" /> 制作过程
                  </div>
                  <ol className="text-[11px] text-[#34312E]/80 space-y-1 list-decimal list-inside">
                    {item.steps.map((s, idx) => (
                      <li key={idx} className="leading-relaxed">{s}</li>
                    ))}
                  </ol>
                </div>

                <div className="text-[11px] font-serif-sc italic text-[#C98464] flex items-center gap-1 pt-1">
                  <Sparkles className="w-3 h-3 shrink-0" />
                  <span>{item.quote}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
