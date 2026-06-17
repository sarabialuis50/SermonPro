import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit3, Play, Clock, Book, AlertCircle, Sun, Moon, LogOut, User } from "lucide-react";
import { Sermon, BibleVerse } from "./types";
import { lookupScriptureAsync } from "./utils";
import SermonEditor from "./components/SermonEditor";
import LiveSermonView from "./components/LiveSermonView";
import BibleModal from "./components/BibleModal";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import { useAuth } from "./contexts/AuthContext";
import { useSermons } from "./hooks/useSermons";

type AppView = "landing" | "auth" | "app" | "demo";

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard component (the original app logic — unchanged)
// ─────────────────────────────────────────────────────────────────────────────
function Dashboard({ isDemo, onExitDemo }: { isDemo?: boolean, onExitDemo?: () => void }) {
  const { user, signOut } = useAuth();
  const { sermons, loading: sermonsLoading, fetchSermons, saveSermon, deleteSermon, createSermon } = useSermons(isDemo ? "demo_user" : user?.id, isDemo);

  const [selectedSermonId, setSelectedSermonId] = useState<string | null>(null);
  const [isPreaching, setIsPreaching] = useState(false);
  const [activeBibleVerse, setActiveBibleVerse] = useState<BibleVerse | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [currentTimeStr, setCurrentTimeStr] = useState("");
  const [showFastSermonCreate, setShowFastSermonCreate] = useState(false);
  const [fastTitle, setFastTitle] = useState("");
  const [fastDuration, setFastDuration] = useState("40");

  // Load theme and api key from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("pulpit_theme");
    if (savedTheme === "dark") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Fetch sermons when user is ready
  useEffect(() => {
    if (user?.id) fetchSermons();
  }, [user?.id, fetchSermons]);

  // Clock runner
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("pulpit_theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleCreateSermon = (title: string, duration: number) => {
    const newSermon: Sermon = {
      id: "sermon_" + Date.now(),
      title: title || "Nuevo Mensaje Homilético",
      theme: "Tema de predicación cotidiana",
      mainPassage: "Juan 3:16",
      durationMinutes: duration || 40,
      notes: "Escribe aquí recordatorios generales rápidos, llamados y momentos de oración...",
      sections: [
        {
          id: "sec_init_1",
          title: "1. Introducción y Saludo",
          durationMinutes: Math.round(duration * 0.15) || 5,
          content: "Da la bienvenida al pueblo de Dios, introduce el pasaje de hoy y comparte la visión primaria...",
        },
        {
          id: "sec_init_2",
          title: "2. Cuerpo y Temario Histórico",
          durationMinutes: Math.round(duration * 0.70) || 30,
          content: "Analiza el contexto, discute las ideas centrales e interpela a los oyentes...",
        },
        {
          id: "sec_init_3",
          title: "3. Conclusión y Oración Final",
          durationMinutes: Math.round(duration * 0.15) || 5,
          content: "Realiza el llamado final, invita a la congregación a postrarse y cierra con gratitud profunda...",
        },
      ],
    };
    createSermon(newSermon);
    setSelectedSermonId(newSermon.id);
    setShowFastSermonCreate(false);
    setFastTitle("");
  };

  const handleDeleteSermon = (sermonId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const confirmed = window.confirm("¿Seguro que deseas eliminar este sermón para siempre?");
    if (confirmed) {
      deleteSermon(sermonId);
      if (selectedSermonId === sermonId) setSelectedSermonId(null);
    }
  };

  const handleUpdateActiveSermon = (updatedSermon: Sermon) => {
    saveSermon(updatedSermon);
  };

  const activeSermon = sermons.find((s) => s.id === selectedSermonId);

  const handleTriggerBibleLookup = async (query: string, version?: string) => {
    const activeVersion = version || activeSermon?.bibleVersion || "RVR1960";
    const verse = await lookupScriptureAsync(query, activeVersion);
    setActiveBibleVerse(verse);
  };

  const handleSignOut = async () => {
    const confirmed = window.confirm("¿Cerrar sesión?");
    if (confirmed) {
      await signOut();
    }
  };

  // ── LIVE PREACHING MODE ──────────────────────────────────────────────────
  if (isPreaching && activeSermon) {
    return (
      <div className={theme === "dark" ? "dark bg-slate-900" : "bg-slate-50"}>
        <LiveSermonView
          sermon={activeSermon}
          onExit={() => setIsPreaching(false)}
          onLookupBible={handleTriggerBibleLookup}
          activeBibleVerse={activeBibleVerse}
          onCloseBible={() => setActiveBibleVerse(null)}
          isProUser={!isDemo}
        />
      </div>
    );
  }

  // ── DASHBOARD ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-200 bg-slate-50 dark:bg-zinc-950 dark:text-neutral-50 pb-16">
      {/* Demo Banner */}
      {isDemo && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-center text-[10px] sm:text-xs font-black uppercase tracking-widest relative z-20 shadow-[0_2px_0_rgba(15,23,42,1)] border-b-2 border-slate-900">
          ⚠️ Estás en modo demostración. Los cambios se guardan temporalmente en tu navegador.
        </div>
      )}

      {/* Background grid removed */}

      {/* Global Navigation */}
      <header className="relative z-10 border-b-4 border-slate-900 bg-white dark:bg-zinc-900 dark:border-zinc-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setSelectedSermonId(null)}>
            <div className="flex h-11 w-11 items-center justify-center bg-amber-500 text-slate-950 border-2 border-slate-900 shadow-geometric font-bold text-xl select-none">
              ✝️
            </div>
            <div>
              <h1 className="font-serif text-lg font-black tracking-tight text-slate-950 dark:text-stone-100 flex items-center">
                SERMONPRO
                <span className="ml-2 bg-slate-900 text-white dark:bg-zinc-800 dark:text-amber-400 font-mono text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-widest">
                  Púlpit-Ready
                </span>
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Orden, Tiempos y Enfoque Homilético
              </p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-3">
            {/* Clock */}
            <div className="hidden md:flex items-center space-x-2 bg-slate-100 dark:bg-zinc-805 px-3 py-1.5 border border-slate-900/30 font-mono text-xs text-slate-900 dark:text-slate-300 font-bold select-none">
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span>Hora Local: {currentTimeStr || "Cargando..."}</span>
            </div>

            {/* User pill */}
            <div className="hidden md:flex items-center space-x-1.5 bg-slate-100 dark:bg-zinc-800 px-2.5 py-1.5 border border-slate-900/20 font-mono text-[10px] text-slate-600 dark:text-slate-300 font-bold select-none">
              <User className="h-3.5 w-3.5 text-slate-400" />
              <span className="max-w-[120px] truncate">{isDemo ? "Pastor Invitado" : user?.email?.split("@")[0]}</span>
            </div>

            {/* Dark mode */}
            <button
              onClick={toggleTheme}
              className="p-2 border-2 border-slate-900 bg-white hover:bg-slate-50 dark:bg-zinc-900 w-10 h-10 flex items-center justify-center cursor-pointer transition-colors"
              title="Cambiar tema"
            >
              {theme === "light" ? <Moon className="h-4 w-4 text-slate-900" /> : <Sun className="h-4 w-4 text-amber-400" />}
            </button>

            {/* Sign out */}
            {isDemo ? (
              <button
                onClick={onExitDemo}
                className="p-2 px-3 border-2 border-slate-900 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 h-10 flex items-center justify-center cursor-pointer transition-colors text-white font-bold text-[10px] uppercase tracking-wider"
                title="Salir del Demo"
              >
                Salir
              </button>
            ) : (
              <button
                onClick={handleSignOut}
                className="p-2 border-2 border-slate-900 bg-white hover:bg-red-50 dark:bg-zinc-900 w-10 h-10 flex items-center justify-center cursor-pointer transition-colors text-slate-500 hover:text-red-600"
                title="Cerrar sesión"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10 max-w-7xl mx-auto px-4 pt-8 w-full sm:px-6 lg:px-8">

        {/* Context nav */}
        {selectedSermonId ? (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 bg-white border-2 border-slate-900 p-4 shadow-geometric dark:bg-zinc-900 dark:border-zinc-800">
            <div className="flex items-center space-x-2.5">
              <button
                onClick={() => setSelectedSermonId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold uppercase tracking-widest border-2 border-slate-900 cursor-pointer"
                id="back-to-dashboard-btn"
              >
                ← Volver al Tablero
              </button>
              <span className="hidden sm:inline text-slate-300">/</span>
              <span className="font-serif italic text-sm text-slate-600 dark:text-stone-400 truncate max-w-xs md:max-w-md font-bold">
                Editando: "{activeSermon?.title}"
              </span>
            </div>
            <button
              onClick={() => setIsPreaching(true)}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-widest border-2 border-slate-900 shadow-geometric cursor-pointer flex items-center justify-center space-x-2 animate-pulse"
            >
              <Play className="h-4 w-4 shrink-0" />
              <span>Subir al Púlpito (En Vivo)</span>
            </button>
          </div>
        ) : (
          <div className="mb-10 text-center sm:text-left sm:flex sm:items-center sm:justify-between gap-6 border-b-2 border-slate-200/60 pb-8 dark:border-zinc-800">
            <div>
              <h2 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-slate-950 dark:text-white">
                Archivos de Predicación
              </h2>
              <p className="text-sm text-slate-600 dark:text-stone-400 mt-1.5 font-sans">
                Organice el discurso bíblico de cada domingo, asigne minutos rigurosos por secciones y vigile sus tiempos sagrados.
              </p>
            </div>
            <button
              onClick={() => setShowFastSermonCreate(true)}
              className="mt-4 sm:mt-0 inline-flex items-center space-x-2 bg-slate-900 text-white hover:bg-slate-800 px-5 py-3 border-2 border-slate-900 shadow-geometric font-bold text-xs uppercase tracking-widest cursor-pointer shrink-0 transition-transform hover:-translate-y-0.5 active:translate-y-0"
              id="new-sermon-trigger-btn"
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo Sermón</span>
            </button>
          </div>
        )}

        {/* Editor or Dashboard Grid */}
        {selectedSermonId && activeSermon ? (
          <SermonEditor
            sermon={activeSermon}
            onChange={handleUpdateActiveSermon}
            onStartPreaching={() => setIsPreaching(true)}
            isProUser={!isDemo}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="dashboard-sermons-grid">

            {/* Create new card */}
            {showFastSermonCreate ? (
              <div className="bg-white border-2 border-slate-900 p-6 shadow-geometric-lg flex flex-col justify-between dark:bg-zinc-900 dark:border-zinc-700">
                <div>
                  <h3 className="font-serif text-lg font-bold text-slate-950 dark:text-stone-100 border-b border-slate-200 pb-2 mb-4 dark:border-zinc-800 uppercase tracking-wide text-xs">
                    Crear Nuevo Bosquejo
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 font-mono">
                        Título del Sermón
                      </label>
                      <input
                        type="text"
                        value={fastTitle}
                        onChange={(e) => setFastTitle(e.target.value)}
                        placeholder="Ej. El Fruto del Espíritu"
                        className="w-full rounded-none border-2 border-slate-900 px-3 py-2 text-xs outline-none focus:bg-amber-50/15 dark:bg-zinc-950 dark:text-white"
                        autoFocus
                        onKeyDown={(e) => e.key === "Enter" && handleCreateSermon(fastTitle, parseInt(fastDuration, 10))}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 font-mono">
                        Tiempo Meta (Minutos)
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                        <select
                          value={fastDuration}
                          onChange={(e) => setFastDuration(e.target.value)}
                          className="w-full rounded-none border-2 border-slate-900 pl-9 pr-2 py-2 text-xs bg-white focus:outline-none dark:bg-zinc-950 dark:text-white"
                        >
                          <option value="20">20 Minutos (Homilía Breve)</option>
                          <option value="30">30 Minutos (Sermón Estándar)</option>
                          <option value="40">40 Minutos (Sermón Tradicional)</option>
                          <option value="50">50 Minutos (Enseñanza Extensa)</option>
                          <option value="60">60 Minutos (Conferencia / Clase)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  <button
                    onClick={() => handleCreateSermon(fastTitle, parseInt(fastDuration, 10))}
                    className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold uppercase tracking-wider border-2 border-slate-900 cursor-pointer shadow-geometric"
                  >
                    Establecer
                  </button>
                  <button
                    onClick={() => { setShowFastSermonCreate(false); setFastTitle(""); }}
                    className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider border-2 border-slate-900 cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowFastSermonCreate(true)}
                className="group border-2 border-dashed border-slate-900 hover:border-solid hover:bg-amber-50/10 p-8 h-64 text-center flex flex-col justify-center items-center transition-all cursor-pointer dark:border-zinc-700 dark:hover:bg-zinc-900/30"
                id="fast-add-card-btn"
              >
                <div className="p-3 bg-slate-100 text-slate-900 rounded-none border border-slate-900/30 group-hover:scale-105 transition-transform mb-3 dark:bg-zinc-800 dark:text-amber-400">
                  <Plus className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-lg font-bold text-slate-950 group-hover:text-amber-500 dark:text-stone-100">
                  Componer Desde Cero
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs leading-normal">
                  Incorpore un sermón en blanco con subdivisiones automáticas calculadas de introducción, temario y conclusión.
                </p>
              </button>
            )}

            {/* Loading state */}
            {sermonsLoading && (
              <div className="col-span-full flex items-center justify-center py-12">
                <div className="flex items-center space-x-3 text-slate-500">
                  <div className="h-5 w-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-mono uppercase tracking-wider">Cargando sermones...</span>
                </div>
              </div>
            )}

            {/* Sermon cards */}
            {!sermonsLoading && sermons.map((s) => {
              const totalSecsSectionsSum = s.sections.reduce((ac, se) => ac + (se.durationMinutes || 0), 0);
              const balanced = totalSecsSectionsSum === s.durationMinutes;
              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedSermonId(s.id)}
                  className="bg-white border-2 border-slate-900 p-6 shadow-geometric hover:shadow-geometric-lg hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all flex flex-col justify-between h-64 cursor-pointer relative dark:bg-zinc-900 dark:border-zinc-800"
                  id={`sermon-card-item-${s.id}`}
                >
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-2 font-mono text-[9px] uppercase font-bold text-slate-400">
                      <span className="flex items-center">
                        <Book className="h-3 w-3 mr-1" />
                        {s.mainPassage || "Sin pasaje base"}
                      </span>
                      <span className="flex items-center text-slate-900 dark:text-slate-200">
                        <Clock className="h-3 w-3 mr-1" />
                        {s.durationMinutes} min
                      </span>
                    </div>
                    <h3 className="font-serif text-lg font-black text-slate-950 tracking-tight leading-snug line-clamp-2 dark:text-stone-100">
                      {s.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1.5 leading-normal line-clamp-3 italic">
                      {s.theme || "(Sin tema descrito)"}
                    </p>
                  </div>
                  <div className="border-t border-slate-150 pt-3 dark:border-zinc-800 flex justify-between items-center mt-3 select-none">
                    {balanced ? (
                      <span className="inline-flex items-center text-[10px] uppercase font-bold tracking-tight text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5">
                        • Balanced
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[10px] uppercase font-bold tracking-tight text-amber-700 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5">
                        <AlertCircle className="h-3.5 w-3.5 mr-1" />
                        Ajustar Minutos
                      </span>
                    )}
                    <div className="flex space-x-1.5 shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedSermonId(s.id); }}
                        className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-950 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                        title="Modificar estructura"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteSermon(s.id, e)}
                        className="p-1 px-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-slate-950 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                        title="Eliminar del archivo"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Empty state */}
            {!sermonsLoading && sermons.length === 0 && !showFastSermonCreate && (
              <div className="col-span-full py-16 text-center">
                <div className="text-4xl mb-4">✝️</div>
                <p className="font-serif text-xl font-bold text-slate-700 dark:text-slate-300">
                  Bienvenido a SermonPro
                </p>
                <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
                  Crea tu primer sermón haciendo clic en "Nuevo Sermón" o en la tarjeta de la izquierda.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bible Modal */}
      {activeBibleVerse && (
        <BibleModal
          verse={activeBibleVerse}
          onClose={() => setActiveBibleVerse(null)}
          isProUser={!isDemo}
        />
      )}

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root App — Router
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const { user, loading } = useAuth();
  const [view, setView] = useState<AppView>("landing");

  // If user is authenticated, always show the app
  useEffect(() => {
    if (!loading && user) {
      setView("app");
    } else if (!loading && !user && view === "app") {
      setView("landing");
    }
  }, [user, loading]);

  // Loading splash while Supabase checks the session
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">✝️</div>
          <div className="h-6 w-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-mono text-slate-400 uppercase tracking-wider">Cargando SermonPro...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Dashboard />;
  }

  if (view === "demo") {
    return <Dashboard isDemo={true} onExitDemo={() => setView("landing")} />;
  }

  if (view === "auth") {
    return <AuthPage onBack={() => setView("landing")} />;
  }

  return <LandingPage onGoToAuth={() => setView("auth")} onStartDemo={() => setView("demo")} />;
}
