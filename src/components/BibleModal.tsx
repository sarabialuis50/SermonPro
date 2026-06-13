import React from "react";
import { BookOpen, Quote, X, Clipboard, Check } from "lucide-react";
import { BibleVerse } from "../types";
import { BIBLE_VERSIONS } from "../utils";

interface BibleModalProps {
  verse: BibleVerse | null;
  onClose: () => void;
  currentVersion?: string;
  onVersionChange?: (version: string) => void;
  isProUser?: boolean;
}

export default function BibleModal({ 
  verse, 
  onClose,
  currentVersion,
  onVersionChange,
  isProUser = true
}: BibleModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!verse) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(`"${verse.text}" (${verse.book} ${verse.chapter}:${verse.verse})`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs select-none"
      id="bible-modal-backdrop"
      onClick={onClose}
    >
      {/* Modal Card */}
      <div 
        className="relative w-full max-w-2xl overflow-hidden bg-white text-slate-900 shadow-geometric-xl dark:bg-zinc-900 dark:text-neutral-100 border-2 border-slate-900 dark:border-zinc-700 transition-all transform scale-100 duration-300 flex flex-col max-h-[85vh]"
        id="bible-modal-content"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Upper Accent Ring/Header decoration */}
        <div className="h-1.5 w-full bg-amber-500" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-900 bg-amber-50/50 p-5 dark:border-zinc-800 dark:bg-zinc-950/40">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center bg-slate-100 text-slate-900 dark:bg-zinc-805 dark:text-amber-400 border border-slate-900/30 animate-pulse">
              <BookOpen className="h-5 w-5" id="bible-modal-book-icon" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-stone-100 select-none">
                {verse.book} {verse.chapter}:{verse.verse}
              </h3>
              <div className="flex items-center text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 select-none mt-0.5">
                <span>Sagrada Escritura •</span>
                {onVersionChange ? (
                  <select
                    value={currentVersion || BIBLE_VERSIONS.find(v => v.name === verse.version || v.id === verse.version)?.id || "RVR1960"}
                    onChange={(e) => onVersionChange(e.target.value)}
                    className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 bg-transparent outline-hidden cursor-pointer hover:text-slate-900 dark:hover:text-zinc-200 border-none p-0 ml-1 inline-block"
                  >
                    {BIBLE_VERSIONS.map((v) => (
                      <option key={v.id} value={v.id} className="bg-white text-slate-900 dark:bg-zinc-950 dark:text-white">
                        {v.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="ml-1">{verse.version}</span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors focus:outline-hidden focus:ring-2 focus:ring-slate-900"
            id="bible-modal-close-btn"
            title="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-8 py-10 font-serif leading-relaxed text-lg relative bg-white dark:bg-zinc-900">
          <Quote className="absolute top-4 left-4 h-12 w-12 text-slate-100 dark:text-zinc-800 pointer-events-none" />
          
          <div className="relative z-10 font-serif text-slate-800 dark:text-stone-200 max-w-xl mx-auto space-y-4 text-center">
            {!isProUser ? (
              <div className="flex flex-col items-center justify-center space-y-4 py-6 font-sans">
                <div className="h-16 w-16 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-2">
                  <span className="text-2xl">🔒</span>
                </div>
                <h4 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Función Pro Exclusiva</h4>
                <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-sm">
                  La visualización de versículos bíblicos impulsada por IA directamente en el púlpito está reservada para los planes Pastor Pro e Iglesia.
                </p>
                <a 
                  href="/#pricing" 
                  onClick={onClose}
                  className="mt-4 px-6 py-3 bg-amber-500 text-slate-950 font-bold uppercase tracking-widest text-[10px] border-2 border-slate-900 shadow-[2px_2px_0_0_rgba(15,23,42,1)] inline-block transition-transform hover:-translate-y-0.5"
                >
                  Actualizar Plan
                </a>
              </div>
            ) : (
              <>
                <span className="text-4xl font-bold font-serif text-amber-500/70 mr-1 select-none">
                  «
                </span>
                <p className="inline text-xl sm:text-2xl font-serif italic leading-relaxed text-slate-700 dark:text-stone-300 selection:bg-amber-200 dark:selection:bg-amber-900/60">
                  {verse.text}
                </p>
                <span className="text-4xl font-bold font-serif text-amber-500/70 ml-1 select-none">
                  »
                </span>
              </>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-900 bg-slate-50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-500 dark:text-zinc-400 select-none">
          <div className="flex items-center space-x-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            <span className="font-mono text-[10px] tracking-tight uppercase">Referencia Bíblica • Sin salir del púlpito</span>
          </div>
          <div className="flex gap-2">
            {isProUser && (
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold uppercase tracking-widest border border-slate-950 cursor-pointer flex items-center space-x-1"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Clipboard className="h-3.5 w-3.5" />}
                <span>{copied ? "Copiado" : "Copiar"}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-widest cursor-pointer"
              id="bible-modal-got-it-btn"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
