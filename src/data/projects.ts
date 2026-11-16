import type { ProjectItem } from '../types';
export const projects: ProjectItem[] = [
    {
      id: 'roomforone',
      title: 'roomforone',
      subtitle: '沉浸式低多边形独处数字空间',
      tag: 'Three.js / React 19 / Web Audio',
      description: '一个人的房间。将 3D 物件探索、自适应当季天气、环境音模拟、画板创作与 AI 心情氛围转换融为一体。',
      highlights: ['低多边形开放剖面房间', '环境音与天气程序化联动', '独立命名空间与本地离线存储'],
      link: 'https://github.com/hydelynye-ui/roomforone',
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
