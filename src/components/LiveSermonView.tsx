import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, BookOpen, VolumeX, Volume2, X, ZoomIn, ZoomOut, Maximize2, Minimize2, Quote, Clipboard, Check, AlertCircle, StickyNote } from "lucide-react";
import { Sermon, SermonSection, BibleVerse } from "../types";
import { BIBLE_VERSIONS, BIBLE_REGEX_STR } from "../utils";
import BibleModal from "./BibleModal";
import NoteModal from "./NoteModal";

interface LiveSermonViewProps {
  sermon: Sermon;
  onExit: () => void;
  onLookupBible: (query: string, version?: string) => void;
  activeBibleVerse: BibleVerse | null;
  onCloseBible: () => void;
  isProUser?: boolean;
}

export default function LiveSermonView({ 
  sermon, 
  onExit, 
  onLookupBible,
  activeBibleVerse,
  onCloseBible,
  isProUser = true
}: LiveSermonViewProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  
  // Timers
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [sectionSeconds, setSectionSeconds] = useState(0);
  
  // Custom states
  const [textScale, setTextScale] = useState(1.0); // Font size multiplier: 1, 1.25, 1.5, 1.75, 2
  const [vibrateOnEnd, setVibrateOnEnd] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [bibleCopied, setBibleCopied] = useState(false);
  const [lastBibleQuery, setLastBibleQuery] = useState<string | null>(null);
  const [currentBibleVersion, setCurrentBibleVersion] = useState(sermon.bibleVersion || "RVR1960");
  const [activeNoteContent, setActiveNoteContent] = useState<string | null>(null);
  const timerRef = useRef<any>(null);
  const audioCtxRef = useRef<any>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleCopyBibleText = () => {
    if (activeBibleVerse) {
      navigator.clipboard.writeText(`"${activeBibleVerse.text}" (${activeBibleVerse.book} ${activeBibleVerse.chapter}:${activeBibleVerse.verse})`);
      setBibleCopied(true);
      setTimeout(() => setBibleCopied(false), 2000);
    }
  };

  const handleBibleLookup = (query: string) => {
    setLastBibleQuery(query);
    onLookupBible(query, currentBibleVersion);
  };

  const handleVersionChange = (newVersion: string) => {
    setCurrentBibleVersion(newVersion);
    if (lastBibleQuery) {
      onLookupBible(lastBibleQuery, newVersion);
    }
  };

  // Grab active section
  const activeSection: SermonSection | undefined = sermon.sections[currentSectionIndex];
  
  // Calculate section total target seconds
  const currentSectionTargetSeconds = (activeSection?.durationMinutes || 0) * 60;
  // Calculate grand total sermon budget seconds
  const sermonTotalBudgetSeconds = sermon.durationMinutes * 60;

  // Track ticking
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setTotalSeconds((prev) => prev + 1);
        setSectionSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  const playBeep = () => {
    try {
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === "suspended") ctx.resume();
      
      const playSingleBeep = (timeOffset: number) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime + timeOffset); // A5 note
        
        gainNode.gain.setValueAtTime(1.0, ctx.currentTime + timeOffset); // 100% volume
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + timeOffset + 0.3);
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.start(ctx.currentTime + timeOffset);
        osc.stop(ctx.currentTime + timeOffset + 0.3);
      };

      // Play 3 consecutive beeps
      playSingleBeep(0);
      playSingleBeep(0.4);
      playSingleBeep(0.8);
      
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  };

  const initAudio = () => {
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          audioCtxRef.current = new AudioContextClass();
          // Unlock audio on iOS by playing a silent sound
          const osc = audioCtxRef.current.createOscillator();
          const gain = audioCtxRef.current.createGain();
          gain.gain.value = 0;
          osc.connect(gain);
          gain.connect(audioCtxRef.current.destination);
          osc.start();
          osc.stop(audioCtxRef.current.currentTime + 0.001);
        }
      } else if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }
    } catch (e) {
      console.error("Audio init failed", e);
    }
  };

  // Vibrate / alert on section completion
  useEffect(() => {
    if (sectionSeconds === currentSectionTargetSeconds && currentSectionTargetSeconds > 0) {
      if (vibrateOnEnd) {
        if ("vibrate" in navigator) {
          navigator.vibrate([200, 100, 200]);
        }
        playBeep();
      }
    }
  }, [sectionSeconds, currentSectionTargetSeconds, vibrateOnEnd]);

  // Navigate sections
  const handlePrevSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex((prev) => prev - 1);
      setSectionSeconds(0);
    }
  };

  const handleNextSection = () => {
    if (currentSectionIndex < sermon.sections.length - 1) {
      setCurrentSectionIndex((prev) => prev + 1);
      setSectionSeconds(0);
    }
  };

  // Reset timers
  const handleResetTimers = () => {
    const confirmReset = window.confirm("¿Deseas reiniciar los cronómetros de predicación?");
    if (confirmReset) {
      setTotalSeconds(0);
      setSectionSeconds(0);
    }
  };

  // Toggle full screen container mode
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Format seconds to h:mm:ss or mm:ss
  const formatTime = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    
    const mStr = m < 10 && h > 0 ? `0${m}` : `${m}`;
    const sStr = s < 10 ? `0${s}` : `${s}`;
    
    if (h > 0) {
      return `${h}:${mStr}:${sStr}`;
    }
    return `${mStr}:${sStr}`;
  };

  // Parser: scans text segments and dynamically extracts Bible book citation formulas and Note citations
  const parseReferences = (text: string) => {
    if (!text) return "";
    
    interface ParseMatch {
      index: number;
      length: number;
      type: "bible" | "note";
      text: string;
      noteText?: string;
    }

    const matches: ParseMatch[] = [];

    // 1. Find Bible matches
    const bibleRegex = new RegExp(BIBLE_REGEX_STR, "g");
    let match: RegExpExecArray | null;
    while ((match = bibleRegex.exec(text)) !== null) {
      matches.push({
        index: match.index,
        length: match[0].length,
        type: "bible",
        text: match[0]
      });
    }

    // 2. Find Note matches
    const noteRegex = /\[Nota:\s*([^\]]+)\]/gi;
    while ((match = noteRegex.exec(text)) !== null) {
      matches.push({
        index: match.index,
        length: match[0].length,
        type: "note",
        text: match[0],
        noteText: match[1]
      });
    }

    // 3. Filter out Bible matches that fall inside Note matches
    const noteRanges = matches.filter(m => m.type === "note").map(m => ({ start: m.index, end: m.index + m.length }));
    const filteredMatches = matches.filter(m => {
      if (m.type === "bible") {
        const isInsideNote = noteRanges.some(r => m.index >= r.start && m.index < r.end);
        return !isInsideNote;
      }
      return true;
    });

    // 4. Sort matches by index
    filteredMatches.sort((a, b) => a.index - b.index);

    // 5. Build elements
    const partsArray: React.ReactNode[] = [];
    let lastIndex = 0;

    filteredMatches.forEach((m, idx) => {
      if (m.index > lastIndex) {
        partsArray.push(text.substring(lastIndex, m.index));
      }

      if (m.type === "bible") {
        partsArray.push(
          <button
            key={`bible-${m.index}-${idx}`}
            onClick={() => handleBibleLookup(m.text)}
            className="px-1.5 py-0.5 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 text-slate-900 dark:text-amber-300 font-serif font-bold italic border-b-2 border-slate-900 dark:border-amber-500 mx-1 cursor-pointer transition-all inline-flex items-center align-baseline text-[0.85em] select-text"
            title={`Consultar versículo: ${m.text}`}
          >
            <BookOpen className="h-3.5 w-3.5 mr-1 text-amber-600 dark:text-amber-400 inline shrink-0" />
            {m.text}
          </button>
        );
      } else if (m.type === "note") {
        partsArray.push(
          <button
            key={`note-${m.index}-${idx}`}
            onClick={() => setActiveNoteContent(m.noteText || "")}
            className="px-1.5 py-0.5 bg-sky-100 hover:bg-sky-200 dark:bg-sky-950/50 dark:hover:bg-sky-900/60 text-slate-900 dark:text-sky-300 font-sans font-bold border-b-2 border-slate-900 dark:border-sky-500 mx-1 cursor-pointer transition-all inline-flex items-center align-baseline text-[0.85em] select-text"
            title="Ver Nota"
          >
            <StickyNote className="h-3.5 w-3.5 mr-1 text-sky-600 dark:text-sky-400 inline shrink-0" />
            Nota
          </button>
        );
      }

      lastIndex = m.index + m.length;
    });

    if (lastIndex < text.length) {
      partsArray.push(text.substring(lastIndex));
    }

    return partsArray.length > 0 ? partsArray : text;
  };

  // Calculate percentage of bounds
  const getSectionTimeProgressPercent = () => {
    if (currentSectionTargetSeconds === 0) return 0;
    return Math.min(100, (sectionSeconds / currentSectionTargetSeconds) * 100);
  };

  const getSermonTimeProgressPercent = () => {
    if (sermonTotalBudgetSeconds === 0) return 0;
    return Math.min(100, (totalSeconds / sermonTotalBudgetSeconds) * 100);
  };

  // Colors for warnings
  const isSectionOvertime = sectionSeconds > currentSectionTargetSeconds && currentSectionTargetSeconds > 0;
  const isSermonOvertime = totalSeconds > sermonTotalBudgetSeconds && sermonTotalBudgetSeconds > 0;

  return (
    <div 
      ref={containerRef}
      className="h-screen w-screen overflow-hidden bg-slate-900 text-slate-50 flex flex-col relative font-sans selection:bg-amber-500/30"
      id="live-preaching-cockpit"
    >
      {/* 1. Header Control HUD Bar */}
      <nav className="bg-slate-950 border-b-2 border-slate-800 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 select-none">
        <div className="flex items-center space-x-3.5">
          <div className="h-4 w-4 rounded-full bg-red-600 animate-pulse" />
          <div>
            <h1 className="text-sm font-bold uppercase tracking-widest text-slate-400 font-mono">
              En el Púlpito • Modo en Vivo
            </h1>
            <p className="text-base font-serif font-bold text-white truncate max-w-xs sm:max-w-md">
              {sermon.title}
            </p>
          </div>
        </div>

        {/* Adjust font HUD, full screen toggler, and mute buzz toggler */}
        <div className="flex items-center space-x-2">
          {/* Zoom Controls */}
          <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 rounded-none p-1">
            <button
              onClick={() => setTextScale((prev) => Math.max(0.75, prev - 0.25))}
              className="p-1 px-2.5 hover:bg-slate-800 text-slate-300 font-bold font-mono text-sm cursor-pointer"
              title="Reducir fuente de notas"
            >
              <ZoomOut className="h-4.5 w-4.5" />
            </button>
            <span className="text-xs font-mono font-semibold px-2 text-slate-400">
              {textScale * 100}%
            </span>
            <button
              onClick={() => setTextScale((prev) => Math.min(2.5, prev + 0.25))}
              className="p-1 px-2.5 hover:bg-slate-800 text-slate-300 font-bold font-mono text-sm cursor-pointer"
              title="Agrandar fuente de notas"
            >
              <ZoomIn className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Vibrate toggler */}
          <button
            onClick={() => {
              initAudio();
              setVibrateOnEnd(!vibrateOnEnd);
            }}
            className={`p-2.5 border border-slate-800 text-xs font-bold font-mono uppercase cursor-pointer ${
              vibrateOnEnd ? "bg-amber-500 text-slate-950" : "bg-slate-900 text-slate-400"
            }`}
            title="Vibrar/Alerta táctil en fin de sección"
          >
            {vibrateOnEnd ? <Volume2 className="h-4.5 w-4.5" /> : <VolumeX className="h-4.5 w-4.5" />}
          </button>

          {/* Full Screen */}
          <button
            onClick={toggleFullScreen}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 cursor-pointer"
            title="Modo Pantalla Completa"
          >
            {isFullscreen ? <Minimize2 className="h-4.5 w-4.5" /> : <Maximize2 className="h-4.5 w-4.5" />}
          </button>

          {/* Emergency close exit */}
          <button
            onClick={onExit}
            className="p-2.5 bg-red-950 hover:bg-red-900 border-2 border-red-800 text-red-200 cursor-pointer font-bold font-mono text-xs uppercase tracking-widest pl-3 pr-3 flex items-center space-x-1"
            title="Salir del púlpito"
            id="pulpit-hud-exit-btn"
          >
            <X className="h-4 w-4" />
            <span className="hidden sm:inline">Terminar</span>
          </button>
        </div>
      </nav>

      {/* 2. Main Cockpit panel */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* Left Side: Massive Timers and Section status columns */}
        <section className="lg:col-span-5 bg-slate-950 p-4 flex flex-col justify-between border-r-2 border-slate-800 overflow-y-auto">
          
          {/* Active section header box */}
          <div className="space-y-3">
            <div className="bg-slate-900 border-2 border-slate-800 p-3 relative overflow-hidden">
              <div className="absolute top-0 left-0 bottom-0 bg-amber-500/10 pointer-events-none" style={{ width: `${getSectionTimeProgressPercent()}%` }} />
              <div className="flex items-center justify-between font-mono text-[9px] sm:text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                <span>Bloque actual ({currentSectionIndex + 1} de {sermon.sections.length})</span>
                <span>Asignado: {activeSection?.durationMinutes || 0} min</span>
              </div>
              <h2 className="text-base sm:text-xl font-serif font-bold text-white relative z-10 dark:text-amber-400">
                {activeSection?.title || "Sin sección activa"}
              </h2>
            </div>

            {/* Time progress indicators */}
            <div className="grid grid-cols-2 gap-3">
              
              {/* CURRENT BLOCK TIMER CARD */}
              <div className={`p-3 border-2 flex flex-col justify-between ${
                isSectionOvertime ? "border-red-600 bg-red-950/25" : "border-slate-800 bg-slate-900"
              }`}>
                <div>
                  <span className="text-[9px] uppercase font-bold tracking-widest font-mono text-slate-400 truncate block">
                    Cronómetro del Bloque
                  </span>
                  <div className={`text-3xl sm:text-5xl font-mono font-bold tracking-tight mt-0.5 ${isSectionOvertime ? "text-red-500 animate-pulse" : "text-white"}`}>
                    {formatTime(sectionSeconds)}
                  </div>
                </div>
                <div className="mt-1.5">
                  <div className="w-full bg-slate-850 h-1.5">
                    <div 
                      className={`h-full transition-all duration-300 ${isSectionOvertime ? "bg-red-600" : "bg-amber-500"}`}
                      style={{ width: `${getSectionTimeProgressPercent()}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[9px] font-mono mt-0.5 text-slate-500 font-bold">
                    <span>Target: {formatTime(currentSectionTargetSeconds)}</span>
                    <span className={isSectionOvertime ? "text-red-400" : "text-amber-500"}>
                      {getSectionTimeProgressPercent().toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* SERMON GRAND TOTAL TIMER CARD */}
              <div className={`p-3 border-2 flex flex-col justify-between ${
                isSermonOvertime ? "border-red-600 bg-red-950/25" : "border-slate-800 bg-slate-900"
              }`}>
                <div>
                  <span className="text-[9px] uppercase font-bold tracking-widest font-mono text-slate-400 truncate block">
                    Tiempo Total
                  </span>
                  <div className={`text-3xl sm:text-5xl font-mono font-bold tracking-tight mt-0.5 ${isSermonOvertime ? "text-red-500 animate-pulse" : "text-emerald-400"}`}>
                    {formatTime(totalSeconds)}
                  </div>
                </div>
                <div className="mt-1.5">
                  <div className="w-full bg-slate-850 h-1.5">
                    <div 
                      className={`h-full transition-all duration-300 ${isSermonOvertime ? "bg-red-600" : "bg-emerald-500"}`}
                      style={{ width: `${getSermonTimeProgressPercent()}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[9px] font-mono mt-0.5 text-slate-500 font-bold">
                    <span>Límite: {sermon.durationMinutes} min</span>
                    <span className={isSermonOvertime ? "text-red-400" : "text-emerald-400"}>
                      {getSermonTimeProgressPercent().toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Timeline segments checklist preview */}
          <div className="flex-1 my-3 overflow-y-auto min-h-[90px] max-h-[16vh] sm:max-h-[22vh] border border-slate-800 p-2 space-y-1 bg-slate-900/40">
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-550 font-mono block mb-1">
              Siguiente en el Bosquejo
            </span>
            {sermon.sections.map((sec, i) => {
              const isCurrent = i === currentSectionIndex;
              const isPast = i < currentSectionIndex;
              return (
                <button
                  key={sec.id}
                  onClick={() => {
                    setCurrentSectionIndex(i);
                    setSectionSeconds(0);
                  }}
                  className={`w-full text-left p-2 border transition-all cursor-pointer flex items-center justify-between text-xs font-mono uppercase tracking-wider ${
                    isCurrent 
                      ? "border-amber-500 text-amber-400 bg-amber-500/10 font-bold"
                      : isPast
                        ? "border-slate-850 text-slate-650 bg-slate-950 line-through"
                        : "border-slate-800 text-slate-400 hover:bg-slate-800/40"
                  }`}
                >
                  <span className="truncate pr-4 flex items-center">
                    <span className="inline-block mr-2 text-[10px] font-bold text-slate-500">#{i + 1}</span>
                    <span className="truncate">{sec.title}</span>
                  </span>
                  <span className="shrink-0 text-slate-500 font-bold">
                    {sec.durationMinutes} min
                  </span>
                </button>
              );
            })}
          </div>

          {/* Master ticking controllers */}
          <div className="space-y-2.5">
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  initAudio();
                  setIsPlaying(!isPlaying);
                }}
                className={`py-2.5 border-2 border-slate-905 font-bold uppercase tracking-widest text-[11px] flex items-center justify-center space-x-1.5 cursor-pointer transition-all ${
                  isPlaying 
                    ? "bg-amber-500 text-slate-950 font-black hover:bg-amber-400 shadow-[2px_2px_0px_white]"
                    : "bg-emerald-600 text-white font-black hover:bg-emerald-500 shadow-[2px_2px_0px_white]"
                }`}
                title={isPlaying ? "Pausar el tiempo" : "Puntos listos, Play"}
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-4 w-4 shrink-0" />
                    <span>PAUSAR</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 shrink-0" />
                    <span>REANUDAR</span>
                  </>
                )}
              </button>

              <button
                onClick={handleResetTimers}
                className="py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold uppercase tracking-widest text-[11px] border-2 border-slate-800 flex items-center justify-center space-x-1 cursor-pointer shadow-[2px_2px_0px_black]"
                title="Reiniciar a cero todos los cronómetros"
              >
                <RotateCcw className="h-3.5 w-3.5 shrink-0" />
                <span>REINICIAR</span>
              </button>

              <div className="flex bg-slate-950 border border-slate-800 p-0.5">
                <button
                  onClick={handlePrevSection}
                  disabled={currentSectionIndex === 0}
                  className={`flex-1 flex justify-center items-center py-1.5 text-slate-300 hover:bg-slate-900 border-r border-slate-800 ${
                    currentSectionIndex === 0 ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
                  }`}
                  title="Bloque anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={handleNextSection}
                  disabled={currentSectionIndex === sermon.sections.length - 1}
                  className={`flex-1 flex justify-center items-center py-1.5 text-slate-300 hover:bg-slate-900 ${
                    currentSectionIndex === sermon.sections.length - 1 ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
                  }`}
                  title="Bloque siguiente"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <p className="text-[9px] text-center font-mono text-slate-500 font-bold select-none">
              ⏱️ TIEMPO EN VIVO • AUTO-BALANCEADO AUTOMÁTICAMENTE
            </p>
          </div>

        </section>

        {/* Right Side Container: Split between notes and Bible resource panel */}
        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-12 overflow-hidden bg-slate-900/90">
          {/* Sermon Notes Column */}
          <main className="p-5 flex flex-col justify-between overflow-y-auto select-all border-r border-slate-800 md:col-span-12">
            
            {/* Notes display board with magnifying controls */}
            <div className="space-y-4">
              <div className="hidden sm:flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 font-mono select-none">
                  Apuntes y Contenido del Discurso
                </span>
                <span className="text-[10px] text-amber-500 font-serif font-bold italic select-none">
                  Haga click en cualquier versículo para verlo en la Biblia
                </span>
              </div>

              {/* Structured textual body */}
              <div 
                className="font-serif leading-relaxed text-slate-250 font-normal focus:outline-hidden"
                style={{ fontSize: `${textScale * 1.1}rem` }}
              >
                {activeSection?.content ? (
                  <div className="space-y-4 whitespace-pre-wrap select-text">
                    {parseReferences(activeSection.content)}
                  </div>
                ) : (
                  <p className="text-slate-500 font-sans italic text-base select-none">
                    (Esta sección no contiene apuntes o notas escritas...)
                  </p>
                )}
              </div>
            </div>

            {/* Footnotes block (Privado notes) */}
            {sermon.notes && (
              <div className="mt-3 p-2 bg-slate-950/60 border border-slate-800 border-l-2 border-l-amber-500/50 text-[10px] text-slate-500 font-sans select-text shrink-0">
                <span className="text-[8px] font-bold uppercase tracking-widest text-slate-600 block mb-0.5 font-mono">
                  Instrucciones Privadas:
                </span>
                <p className="leading-tight whitespace-pre-wrap">{sermon.notes}</p>
              </div>
            )}

          </main>
        </div>

        {/* Bible Modal overlay */}
        {activeBibleVerse && (
          <BibleModal
            verse={activeBibleVerse}
            onClose={onCloseBible}
            currentVersion={currentBibleVersion}
            onVersionChange={handleVersionChange}
            isProUser={isProUser}
          />
        )}

        {/* Note Modal overlay */}
        {activeNoteContent && (
          <NoteModal
            content={activeNoteContent}
            onClose={() => setActiveNoteContent(null)}
          />
        )}

      </div>
    </div>
  );
}
