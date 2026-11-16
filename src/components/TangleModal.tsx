import React, { useMemo, useState } from 'react';
import { Lightbulb, Plus, Trash2, X } from 'lucide-react';

import type { TangleNote } from '../types';
interface TangleModalProps {
  onClose: () => void;
  notes: TangleNote[];
  onNotes: (notes: TangleNote[]) => void;
  onEdit: () => void;
}

export const TangleModal: React.FC<TangleModalProps> = ({ onClose, notes, onNotes, onEdit }) => {
  const [draft, setDraft] = useState('');
  const sortedNotes = useMemo(
    () => [...notes].sort((a, b) => b.createdAt - a.createdAt),
    [notes],
  );

  const addNote = () => {
    const text = draft.trim();
    if (!text) return;
    onNotes([
      ...notes,
      { id: `tangle-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, text, createdAt: Date.now() },
    ]);
    setDraft('');
  };

  const removeNote = (id: string) => {
    onNotes(notes.filter((note) => note.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg bg-[#FAF7F0] border border-[#C9A47E]/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#C9A47E]/20">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#91A58C]" />
            <div>
              <h3 className="text-sm font-bold text-[#34312E]">Tangle · 随手记录</h3>
              <p className="text-[10px] text-[#34312E]/55 mt-0.5">把脑海里绕来绕去的线索先放在桌面上</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="关闭随手记录"
            className="p-1.5 rounded-full hover:bg-[#EFE8DC] text-[#34312E]/70 hover:text-[#34312E] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto"><button className="soft-button w-full" onClick={onEdit}>编辑 Tangle · 回到房间拖动连接段</button>
          <div className="p-4 rounded-2xl bg-[#EFE8DC]/55 border border-[#C9A47E]/20">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-[#C98464]" />
              <span className="text-xs font-semibold text-[#34312E]">现在想到什么？</span>
            </div>
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') addNote();
              }}
              rows={3}
              maxLength={280}
              placeholder="一句灵感、一个问题，或者下一步想做的小事……"
              className="w-full resize-none rounded-xl border border-[#C9A47E]/25 bg-white/80 px-3 py-2.5 text-xs text-[#34312E] placeholder:text-[#34312E]/35 focus:outline-none focus:border-[#C98464]"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[10px] text-[#34312E]/45">仅保存在当前设备 · {draft.length}/280</span>
              <button
                onClick={addNote}
                disabled={!draft.trim()}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#91A58C] px-3 py-1.5 text-[11px] font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                留在桌面
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {sortedNotes.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#C9A47E]/30 px-4 py-6 text-center text-xs text-[#34312E]/50">
                还没有随手记录，先留下第一条吧。
              </div>
            ) : sortedNotes.map((note) => (
              <div key={note.id} className="group flex items-start gap-3 rounded-2xl border border-[#C9A47E]/20 bg-white/70 px-4 py-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C98464]" />
                <p className="min-w-0 flex-1 whitespace-pre-wrap text-xs leading-relaxed text-[#34312E]/85">{note.text}</p>
                <button
                  onClick={() => removeNote(note.id)}
                  aria-label="删除记录"
                  className="shrink-0 rounded-lg p-1 text-[#34312E]/30 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[#C9A47E]/15 bg-[#FAF7F0] px-6 py-2.5 text-[11px] text-[#34312E]/55">
          <span>按 Ctrl/⌘ + Enter 快速保存</span>
          <button onClick={onClose} className="font-medium text-[#C98464] hover:underline cursor-pointer">返回房间</button>
        </div>
      </div>
    </div>
  );
};
