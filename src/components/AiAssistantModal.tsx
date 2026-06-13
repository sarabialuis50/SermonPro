import React, { useState } from "react";
import { X, Sparkles, AlertCircle, Loader2, Wand2, Check } from "lucide-react";
import { generateSermonContentAsync } from "../utils";

interface AiAssistantModalProps {
  isProUser: boolean;
  sectionId: string;
  sectionName: string;
  currentContent: string;
  sermonTitle: string;
  sermonTheme: string;
  onClose: () => void;
  onInsert: (newContent: string, mode: "append" | "replace") => void;
}

export default function AiAssistantModal({
  isProUser,
  sectionId,
  sectionName,
  currentContent,
  sermonTitle,
  sermonTheme,
  onClose,
  onInsert
}: AiAssistantModalProps) {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedText, setGeneratedText] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const text = await generateSermonContentAsync(prompt, {
        title: sermonTitle,
        theme: sermonTheme,
        sectionName,
        currentContent
      });
      setGeneratedText(text);
    } catch (err: any) {
      setError(err.message || "Error al comunicarse con la Inteligencia Artificial.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm select-none p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full sm:max-w-2xl overflow-hidden bg-white shadow-geometric-xl dark:bg-zinc-900 border-2 border-slate-900 dark:border-zinc-700 flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '90dvh' }}
      >
        <div className="h-1.5 w-full bg-amber-500 shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-900 bg-slate-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/40 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center bg-slate-100 text-slate-900 dark:bg-zinc-800 dark:text-amber-400 border border-slate-900/30 shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-sans text-base font-bold text-slate-900 dark:text-stone-100 truncate">
                Asistente Homilético IA
              </h3>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 truncate">
                Bloque: {sectionName || "Sin Título"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-500 dark:hover:bg-zinc-800 transition-colors rounded-full shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 bg-white dark:bg-zinc-900">
          {!isProUser ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-10 text-center">
              <div className="h-16 w-16 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-2 border border-slate-200 dark:border-zinc-700">
                <span className="text-3xl">🤖</span>
              </div>
              <h4 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Función Pro Exclusiva</h4>
              <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-md">
                El Asistente Homilético de Inteligencia Artificial está disponible únicamente para los planes <strong>Pastor Pro</strong> e <strong>Iglesia</strong>.
              </p>
              <a
                href="/#pricing"
                onClick={onClose}
                className="mt-4 px-8 py-4 bg-amber-500 text-slate-950 font-bold uppercase tracking-widest text-xs border-2 border-slate-900 shadow-[4px_4px_0_0_rgba(15,23,42,1)] inline-block transition-transform hover:-translate-y-0.5"
              >
                Actualizar Plan
              </a>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Prompt Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
                  ¿En qué te puede ayudar la IA?
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ej. Dame 3 puntos clave para desarrollar esta introducción sobre la fe inquebrantable..."
                  className="w-full h-28 rounded-none border-2 border-slate-900 p-4 text-sm outline-hidden focus:bg-amber-50/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white resize-none"
                  disabled={isLoading}
                />
                <button
                  onClick={handleGenerate}
                  disabled={isLoading || !prompt.trim()}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white disabled:bg-slate-400 text-xs font-bold uppercase tracking-widest flex items-center justify-center space-x-2 transition-colors"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                  <span>{isLoading ? "Generando..." : "Generar"}</span>
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border-2 border-red-900 text-red-900 flex items-start space-x-3 dark:bg-red-950/30 dark:border-red-800 dark:text-red-300">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Generated Result */}
              {generatedText && !isLoading && (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
                    Sugerencia Generada
                  </label>
                  <div className="border-2 border-slate-900 bg-amber-50/30 dark:border-zinc-700 dark:bg-zinc-950/50 p-4">
                    <p className="whitespace-pre-wrap text-sm text-slate-800 dark:text-zinc-300 leading-relaxed font-serif">
                      {generatedText}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-1"
                    style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
                  >
                    <button
                      onClick={() => onInsert(generatedText, "append")}
                      className="flex-1 sm:flex-none px-4 py-3 sm:py-2 border-2 border-slate-900 hover:bg-slate-50 text-slate-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center space-x-1"
                    >
                      <PlusIcon className="h-4 w-4" />
                      <span>Añadir al final</span>
                    </button>
                    <button
                      onClick={() => onInsert(generatedText, "replace")}
                      className="flex-1 sm:flex-none px-4 py-3 sm:py-2 bg-amber-500 hover:bg-amber-400 border-2 border-slate-900 text-slate-900 text-xs font-bold uppercase tracking-wider shadow-[2px_2px_0_0_rgba(15,23,42,1)] flex items-center justify-center space-x-1"
                    >
                      <Check className="h-4 w-4" />
                      <span>Reemplazar Bloque</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
