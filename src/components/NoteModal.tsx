import React from "react";
import { StickyNote, X, Clipboard, Check } from "lucide-react";

interface NoteModalProps {
  content: string | null;
  onClose: () => void;
}

export default function NoteModal({ content, onClose }: NoteModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!content) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs select-none p-4"
      id="note-modal-backdrop"
      onClick={onClose}
    >
      {/* Modal Card */}
      <div
        className="relative w-full sm:max-w-2xl overflow-hidden bg-white text-slate-900 shadow-geometric-xl dark:bg-zinc-900 dark:text-neutral-100 border-2 border-slate-900 dark:border-zinc-700 transition-all flex flex-col"
        id="note-modal-content"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '90dvh' }}
      >
        {/* Upper Accent Ring/Header decoration */}
        <div className="h-1.5 w-full bg-sky-500 shrink-0 hidden sm:block" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-900 bg-sky-50/50 px-5 py-4 dark:border-zinc-800 dark:bg-zinc-950/40 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center bg-slate-105 text-slate-900 dark:bg-zinc-805 dark:text-sky-450 border border-slate-900/30 shrink-0">
              <StickyNote className="h-4 w-4 text-sky-600 dark:text-sky-400" id="note-modal-icon" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-stone-100 select-none">
                Nota del Predicador
              </h3>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 select-none mt-0.5">
                Apunte Personal • Sin salir del púlpito
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors focus:outline-hidden rounded-full shrink-0"
            id="note-modal-close-btn"
            title="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 leading-relaxed text-base relative bg-white dark:bg-zinc-900">
          <StickyNote className="absolute top-4 left-4 h-10 w-10 text-slate-100 dark:text-zinc-800 pointer-events-none opacity-40" />
          <div className="relative z-10 font-sans text-slate-800 dark:text-stone-200">
            <p className="whitespace-pre-wrap font-sans text-sm sm:text-xl leading-relaxed text-slate-700 dark:text-stone-300 selection:bg-sky-200 dark:selection:bg-sky-900/60">
              {content}
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className="border-t border-slate-900 bg-slate-50 px-5 py-4 dark:border-zinc-800 dark:bg-zinc-950/40 flex items-center justify-between gap-3 text-xs text-slate-500 dark:text-zinc-400 select-none shrink-0"
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          <div className="hidden sm:flex items-center space-x-2">
            <span className="inline-block h-2 w-2 rounded-full bg-sky-500" />
            <span className="font-mono text-[10px] tracking-tight uppercase">Nota Adhesiva • Apoyo Personal</span>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopy}
              className="flex-1 sm:flex-none px-4 py-3 sm:py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold uppercase tracking-widest border border-slate-950 cursor-pointer flex items-center justify-center space-x-1"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Clipboard className="h-3.5 w-3.5" />}
              <span>{copied ? "Copiado" : "Copiar"}</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-3 sm:py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-widest cursor-pointer"
              id="note-modal-got-it-btn"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
