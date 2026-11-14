import React from 'react';
import { 
  Home, 
  Monitor, 
  Palette, 
  Gamepad2, 
  Hammer, 
  Lightbulb,
  Headphones,
  SlidersHorizontal, 
  Info 
} from 'lucide-react';
import { ModalType } from '../types';

interface FloatingDockProps {
  activeModal: ModalType;
  onSelectModal: (modal: ModalType) => void;
}

export const FloatingDock: React.FC<FloatingDockProps> = ({
  activeModal,
  onSelectModal,
}) => {
  const dockItems: { id: ModalType; label: string; icon: React.ReactNode }[] = [
    { id: null, label: '房间', icon: <Home className="w-4 h-4" /> },
    { id: 'computer', label: '作品', icon: <Monitor className="w-4 h-4" /> },
    { id: 'drawing', label: '画板', icon: <Palette className="w-4 h-4" /> },
    { id: 'game', label: '游戏', icon: <Gamepad2 className="w-4 h-4" /> },
    { id: 'diy', label: '手作', icon: <Hammer className="w-4 h-4" /> },
    { id: 'tangle', label: '灵感', icon: <Lightbulb className="w-4 h-4" /> },
    { id: 'headphones', label: '声音', icon: <Headphones className="w-4 h-4" /> },
    { id: 'atmosphere', label: '氛围', icon: <SlidersHorizontal className="w-4 h-4" /> },
    { id: 'about', label: '关于', icon: <Info className="w-4 h-4" /> },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto select-none">
      <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-[#FAF7F0]/90 backdrop-blur-md border border-[#C9A47E]/30 shadow-lg">
        {dockItems.map((item) => {
          const isActive = activeModal === item.id;
          return (
            <button
              key={item.label}
              onClick={() => onSelectModal(item.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-[#C9A47E] text-white shadow-xs font-medium scale-105'
                  : 'text-[#34312E]/70 hover:bg-[#EFE8DC] hover:text-[#34312E]'
              }`}
              title={item.label}
            >
              {item.icon}
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
