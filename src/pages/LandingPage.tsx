import React, { useState, useEffect } from "react";
import {
  BookOpen, Clock, Mic2, CheckCircle, ChevronRight, Star, Menu, X,
  Play, Zap, Shield, Users, ArrowRight, Quote
} from "lucide-react";

interface LandingPageProps {
  onGoToAuth: () => void;
  onStartDemo: () => void;
}

const TESTIMONIALS = [
  {
    name: "Pr. Carlos Mendoza",
    church: "Iglesia Bautista Central, Bogotá",
    avatar: "CM",
    color: "bg-amber-500",
    text: "SermonPro transformó completamente mi preparación. Ahora llego al púlpito con estructura clara y cada sección cronometrada. Mis feligreses notan la diferencia.",
    rating: 5,
  },
  {
    name: "Pr. Andrés Suárez",
    church: "Centro Cristiano Ágape, Medellín",
    avatar: "AS",
    color: "bg-sky-500",
    text: "La búsqueda bíblica en tiempo real durante el sermón es increíble. Puedo consultar cualquier versículo en RVR, NVI o LBLA sin salir de la pantalla del púlpito.",
    rating: 5,
  },
  {
    name: "Pr. Roberto Vargas",
    church: "Comunidad Fe y Vida, Cali",
    avatar: "RV",
    color: "bg-emerald-500",
    text: "El modo en vivo con cronómetro me ayuda a respetar el tiempo de los hermanos. En 3 meses, mis sermones mejoraron notablemente en claridad y profundidad.",
    rating: 5,
  },
];

const FEATURES = [
  {
    icon: BookOpen,
    color: "text-amber-500",
    bg: "bg-amber-500/10 border-amber-500/30",
    title: "Constructor Bíblico Asistido",
    desc: "Selecciona cualquier libro, capítulo y versículo de los 66 libros de la Biblia. Las citas se insertan automáticamente como etiquetas clicables en tus notas.",
  },
  {
    icon: Clock,
    color: "text-sky-500",
    bg: "bg-sky-500/10 border-sky-500/30",
    title: "Cronómetro del Púlpito",
    desc: "Modo en vivo a pantalla completa con cronómetros por sección. Alertas visuales cuando el tiempo se agota. Diseñado para predicar sin mirar el celular.",
  },
  {
    icon: Mic2,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10 border-emerald-500/30",
    title: "Búsqueda Bíblica con IA",
    desc: "Consulta versículos al instante durante la predicación. Compatible con RVR1960, NVI, LBLA y más. Impulsado por Google Gemini.",
  },
  {
    icon: Zap,
    color: "text-violet-500",
    bg: "bg-violet-500/10 border-violet-500/30",
    title: "Notas Adhesivas Privadas",
    desc: "Agrega recordatorios secretos dentro del texto: cuándo pedir música, momentos de oración, o indicaciones especiales. Solo tú las ves.",
  },
  {
    icon: Shield,
    color: "text-rose-500",
    bg: "bg-rose-500/10 border-rose-500/30",
    title: "Datos en la Nube",
    desc: "Tus sermones sincronizados en tiempo real. Accede desde cualquier dispositivo. Tus predicaciones nunca se pierden.",
  },
  {
    icon: Users,
    color: "text-orange-500",
    bg: "bg-orange-500/10 border-orange-500/30",
    title: "Balance Homilétiico Automático",
    desc: "El sistema sugiere distribución de tiempos según estructura homiléctica: 15% Introducción, 70% Temario, 15% Conclusión.",
  },
];

const PLANS = [
  {
    name: "Pastor Free",
    price: "0",
    currency: "",
    period: "",
    description: "Para pastores que están comenzando",
    color: "border-slate-200",
    headerBg: "bg-slate-50",
    ctaClass: "bg-slate-900 hover:bg-slate-800 text-white border-slate-900",
    badge: null,
    features: [
      "Hasta 4 sermones guardados",
      "Cronómetro del púlpito",
      "Notas adhesivas privadas",
      "Modo en vivo básico",
    ],
    disabled: ["Búsqueda bíblica IA", "Sincronización multi-dispositivo", "Soporte prioritario"],
  },
  {
    name: "Pastor Pro",
    price: "60.000",
    currency: "COP",
    period: "/mes",
    description: "Para el pastor que toma en serio su ministerio",
    color: "border-amber-500",
    headerBg: "bg-amber-500",
    ctaClass: "bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-500 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]",
    badge: "⭐ Más Popular",
    features: [
      "Sermones ilimitados",
      "Todo lo del plan Gratis",
      "Búsqueda bíblica con IA",
      "Sincronización multi-dispositivo",
      "Historial de predicaciones",
      "Exportar sermón (PDF / texto)",
      "Soporte por WhatsApp",
    ],
    disabled: [],
  },
  {
    name: "Iglesia",
    price: "180.000",
    currency: "COP",
    period: "/mes",
    description: "Para equipos pastorales y ministerios",
    color: "border-slate-900",
    headerBg: "bg-slate-900",
    ctaClass: "bg-slate-900 hover:bg-slate-800 text-white border-slate-900",
    badge: null,
    features: [
      "Todo lo de Pastor Pro",
      "Hasta 4 cuentas de pastores",
      "Panel de administrador",
      "Biblioteca compartida de sermones",
      "Reportes de predicación",
      "Soporte prioritario dedicado",
      "Onboarding personalizado",
    ],
    disabled: [],
  },
];

const STATS = [
  { value: "2,000+", label: "Pastores activos" },
  { value: "15,000+", label: "Sermones creados" },
  { value: "12", label: "Países" },
  { value: "4.9★", label: "Calificación promedio" },
];

export default function LandingPage({ onGoToAuth, onStartDemo }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hero demo cycle animation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSection((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans overflow-x-hidden" id="landing-page">

      {/* ─── NAVBAR ─────────────────────────────────────────── */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white border-b-2 border-slate-900 shadow-sm"
            : "bg-transparent border-b-2 border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center bg-amber-500 border-2 border-slate-900 text-lg select-none shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
              ✝️
            </div>
            <span className="font-serif text-lg font-black tracking-tight text-slate-950">SermonPro</span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-sm font-bold text-slate-600 hover:text-slate-900 uppercase tracking-wide transition-colors">Funciones</a>
            <a href="#pricing" className="text-sm font-bold text-slate-600 hover:text-slate-900 uppercase tracking-wide transition-colors">Precios</a>
            <a href="#testimonials" className="text-sm font-bold text-slate-600 hover:text-slate-900 uppercase tracking-wide transition-colors">Testimonios</a>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={onGoToAuth}
              className="text-sm font-bold text-slate-700 hover:text-slate-900 uppercase tracking-wide cursor-pointer transition-colors"
              id="nav-login-btn"
            >
              Iniciar Sesión
            </button>
            <button
              onClick={onGoToAuth}
              className="flex items-center space-x-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-widest border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
              id="nav-signup-btn"
            >
              <span>Registrarse</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 border-2 border-slate-900 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b-2 border-slate-900 px-4 pb-4 space-y-3">
            <a href="#features" className="block text-sm font-bold uppercase tracking-wide text-slate-700 py-2">Funciones</a>
            <a href="#pricing" className="block text-sm font-bold uppercase tracking-wide text-slate-700 py-2">Precios</a>
            <a href="#testimonials" className="block text-sm font-bold uppercase tracking-wide text-slate-700 py-2">Testimonios</a>
            <button onClick={onGoToAuth} className="block text-sm font-bold uppercase tracking-wide text-slate-700 py-2 text-left w-full">
              Iniciar Sesión
            </button>
            <button onClick={onGoToAuth} className="w-full py-3 bg-amber-500 text-slate-950 font-black text-sm uppercase tracking-widest border-2 border-slate-900 cursor-pointer">
              Registrarse
            </button>
          </div>
        )}
      </nav>

      {/* ─── HERO SECTION ───────────────────────────────────── */}
      <section className="relative pt-16 lg:pt-10 pb-16 overflow-hidden" id="hero-section">
        {/* Background grid */}
        <div className="absolute inset-0 geometric-grid opacity-40 pointer-events-none" />

        {/* Amber glow */}
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-14">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left: Copy */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 mb-6">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700">
                  ✦ Plataforma homilética profesional
                </span>
              </div>

              <h1 className="font-serif text-4xl sm:text-[2.4rem] lg:text-5xl font-black leading-tight tracking-tight text-slate-950 mb-6 whitespace-normal sm:whitespace-nowrap">
                Predica con{" "}
                <span className="relative">
                  <span className="text-amber-500">orden.</span>
                </span>
                <br className="hidden sm:block" />
                <span className="sm:hidden"> </span>
                Impacta con{" "}
                <span className="text-amber-500">propósito.</span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 font-sans leading-relaxed mb-8 max-w-lg">
                La plataforma profesional que los pastores necesitaban para <strong>estructurar, cronometrar y ejecutar</strong> cada sermón con excelencia bíblica.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 mb-10 w-full sm:w-auto">
                <button
                  onClick={onGoToAuth}
                  className="flex items-center justify-center space-x-2 px-5 py-3.5 sm:px-7 sm:py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-widest border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] hover:shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer w-full sm:w-auto"
                  id="hero-cta-btn"
                >
                  <span>Comenzar Gratis</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={onStartDemo}
                  className="flex items-center justify-center space-x-2 px-5 py-3.5 sm:px-7 sm:py-4 bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs sm:text-sm uppercase tracking-widest border-2 border-slate-900 cursor-pointer transition-colors w-full sm:w-auto"
                  id="hero-demo-btn"
                >
                  <Play className="h-4 w-4" />
                  <span>Ver Funciones (Demo)</span>
                </button>
              </div>

              {/* Social proof mini */}
              <div className="flex items-center space-x-3">
                <div className="flex -space-x-2">
                  {["CM", "AS", "RV"].map((initials, i) => (
                    <div
                      key={i}
                      className={`h-8 w-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black text-white ${
                        i === 0 ? "bg-amber-500" : i === 1 ? "bg-sky-500" : "bg-emerald-500"
                      }`}
                    >
                      {initials}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex space-x-0.5">
                    {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />)}
                  </div>
                  <p className="text-xs text-slate-500 font-sans mt-0.5">
                    <strong>2,000+ pastores</strong> confían en SermonPro
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Dashboard Mockup */}
            <div className="relative hidden lg:block">
              <div className="relative">
                {/* Outer shadow frame */}
                <div className="absolute inset-0 bg-slate-900 translate-x-4 translate-y-4 rounded-none" />

                {/* App mockup card */}
                <div className="relative bg-white border-2 border-slate-900 overflow-hidden">
                  {/* Fake browser bar */}
                  <div className="bg-slate-900 px-4 py-2.5 flex items-center space-x-2">
                    <div className="flex space-x-1.5">
                      <div className="h-3 w-3 rounded-full bg-red-500" />
                      <div className="h-3 w-3 rounded-full bg-amber-500" />
                      <div className="h-3 w-3 rounded-full bg-emerald-500" />
                    </div>
                    <div className="flex-1 bg-slate-800 rounded px-3 py-1 text-[10px] text-slate-400 font-mono">
                      sermonpro.app/dashboard
                    </div>
                  </div>

                  {/* App header */}
                  <div className="border-b-2 border-slate-900 bg-white px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="h-7 w-7 bg-amber-500 border border-slate-900 text-center text-sm flex items-center justify-center">✝️</div>
                      <div>
                        <div className="text-[11px] font-black tracking-tight">SERMON TIMER</div>
                        <div className="text-[8px] text-slate-400 uppercase tracking-widest font-mono">Orden y Enfoque</div>
                      </div>
                    </div>
                    <div className="text-[10px] font-mono bg-slate-100 border border-slate-200 px-2 py-1 text-slate-600">
                      ⏱ 10:24:37
                    </div>
                  </div>

                  {/* App body */}
                  <div className="p-4 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-base font-serif font-black text-slate-900">Archivos de Predicación</div>
                        <div className="text-[10px] text-slate-500">Organice y cronometrice sus sermones</div>
                      </div>
                      <div className="bg-slate-900 text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-1.5 border border-slate-900 flex items-center space-x-1">
                        <span>+ Nuevo</span>
                      </div>
                    </div>

                    {/* Sermon cards grid */}
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { title: "La vida después de la muerte", passage: "Juan 3:16", mins: 60, balanced: true, active: activeSection === 0 },
                        { title: "Tiempos con Dios", passage: "Sal 23:1", mins: 30, balanced: true, active: activeSection === 1 },
                        { title: "Fe que mueve montañas", passage: "Mat 17:20", mins: 45, balanced: false, active: activeSection === 2 },
                        { title: "El amor de Cristo", passage: "Jn 15:13", mins: 35, balanced: true, active: false },
                      ].map((sermon, i) => (
                        <div
                          key={i}
                          className={`bg-white border-2 p-3 transition-all duration-500 ${
                            sermon.active ? "border-amber-500 shadow-[3px_3px_0px_0px_rgba(245,158,11,0.5)]" : "border-slate-200"
                          }`}
                        >
                          <div className="text-[8px] font-bold text-slate-400 font-mono uppercase mb-1 flex justify-between">
                            <span>{sermon.passage}</span>
                            <span>{sermon.mins} min</span>
                          </div>
                          <div className="text-[11px] font-serif font-bold text-slate-900 leading-tight line-clamp-2 mb-2">
                            {sermon.title}
                          </div>
                          <div className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 inline-block ${
                            sermon.balanced ? "text-emerald-700 bg-emerald-50" : "text-amber-700 bg-amber-50"
                          }`}>
                            {sermon.balanced ? "● Balanced" : "⚠ Ajustar"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-6 bg-amber-500 border-2 border-slate-900 px-4 py-2 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-950">⚡ Modo Púlpito</div>
                <div className="text-[9px] text-slate-800 font-mono">Pantalla completa en vivo</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 lg:mt-0">
          <div className="border-2 border-slate-900 bg-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
            <div className="grid grid-cols-2 md:grid-cols-4">
              {STATS.map((stat, i) => (
                <div
                  key={i}
                  className={`py-6 px-4 text-center ${i % 2 === 0 ? "border-r-2 border-slate-700" : ""} md:border-r-2 md:last:border-r-0`}
                >
                  <div className="font-mono text-2xl font-black text-amber-400">{stat.value}</div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-bold mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES SECTION ───────────────────────────────── */}
      <section id="features" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 geometric-grid opacity-20 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-slate-100 border border-slate-300 mb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Funcionalidades</span>
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl font-black tracking-tight text-slate-950 mb-4">
              Todo lo que un pastor<br />necesita en un lugar
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Diseñado por personas que entienden el ministerio. Cada función existe para potenciar tu predicación.
            </p>
          </div>

          {/* Features grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <div
                key={i}
                className="bg-white border-2 border-slate-900 p-6 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all group"
                id={`feature-card-${i}`}
              >
                <div className={`inline-flex items-center justify-center h-12 w-12 border-2 border-slate-900 ${feature.bg} mb-5 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`h-5 w-5 ${feature.color}`} />
                </div>
                <h3 className="font-serif text-lg font-bold text-slate-950 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ───────────────────────────────────── */}
      <section id="testimonials" className="py-24 relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-slate-900 border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] py-20 px-6 sm:px-12 overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute inset-0" style={{
                backgroundImage: "linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)",
                backgroundSize: "30px 30px"
              }} />
            </div>

            <div className="relative z-10">
              <div className="text-center mb-16">
                <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-white/10 border border-white/20 mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Testimonios</span>
                </div>
                <h2 className="font-serif text-4xl sm:text-5xl font-black tracking-tight text-white mb-4">
                  Lo que dicen nuestros pastores
                </h2>
                <p className="text-slate-400 text-lg">
                  Más de 2,000 predicadores ya confían en SermonPro para sus mensajes dominicales.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {TESTIMONIALS.map((t, i) => (
                  <div
                    key={i}
                    className="bg-white/5 border-2 border-white/10 hover:border-amber-500/50 p-7 transition-all"
                    id={`testimonial-card-${i}`}
                  >
                    <Quote className="h-8 w-8 text-amber-500/40 mb-4" />
                    <p className="text-slate-300 leading-relaxed text-sm mb-6 italic">"{t.text}"</p>
                    <div className="flex items-center space-x-3">
                      <div className={`h-10 w-10 rounded-none border-2 border-white/20 ${t.color} flex items-center justify-center text-xs font-black text-white`}>
                        {t.avatar}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{t.name}</div>
                        <div className="text-slate-500 text-xs">{t.church}</div>
                      </div>
                    </div>
                    <div className="flex space-x-0.5 mt-4">
                      {[...Array(t.rating)].map((_, j) => (
                        <Star key={j} className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRICING SECTION ────────────────────────────────── */}
      <section id="pricing" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 geometric-grid opacity-20 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-slate-100 border border-slate-300 mb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Planes y Precios</span>
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl font-black tracking-tight text-slate-950 mb-4">
              Comienza gratis,<br />crece cuando quieras
            </h2>
            <p className="text-slate-600 text-lg max-w-xl mx-auto">
              Sin contratos. Sin tarjeta de crédito para el plan gratuito. Cancela cuando quieras.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {PLANS.map((plan, i) => (
              <div
                key={i}
                className={`border-2 ${plan.color} overflow-hidden flex flex-col relative ${
                  i === 1 ? "shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]" : "shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]"
                }`}
                id={`pricing-plan-${i}`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute top-4 right-4 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest px-2 py-1">
                    {plan.badge}
                  </div>
                )}

                {/* Header */}
                <div className={`${plan.headerBg} p-6 border-b-2 ${plan.color}`}>
                  <div className={`text-xs font-black uppercase tracking-widest mb-1 ${i === 2 ? "text-slate-400" : i === 1 ? "text-slate-950" : "text-slate-500"}`}>
                    {plan.name}
                  </div>
                  <div className={`flex items-baseline space-x-1 ${i === 2 ? "text-white" : i === 1 ? "text-slate-950" : "text-slate-900"}`}>
                    <span className="font-serif text-4xl font-black">
                      {plan.price === "0" ? "Free" : `$${plan.price}`}
                    </span>
                    {plan.currency && (
                      <span className="text-sm font-bold opacity-70">{plan.currency}{plan.period}</span>
                    )}
                  </div>
                  <p className={`text-xs mt-1 ${i === 2 ? "text-slate-400" : i === 1 ? "text-slate-800" : "text-slate-500"}`}>
                    {plan.description}
                  </p>
                </div>

                {/* Features */}
                <div className="p-6 flex-1 bg-white">
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-start space-x-2.5">
                        <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-700">{f}</span>
                      </li>
                    ))}
                    {plan.disabled.map((f, j) => (
                      <li key={j} className="flex items-start space-x-2.5 opacity-40">
                        <div className="h-4 w-4 border border-slate-300 shrink-0 mt-0.5 rounded-full" />
                        <span className="text-sm text-slate-500 line-through">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={onGoToAuth}
                    className={`w-full py-3 text-xs font-black uppercase tracking-widest border-2 border-slate-900 cursor-pointer flex items-center justify-center space-x-2 transition-all hover:opacity-90 ${plan.ctaClass}`}
                    id={`pricing-cta-${i}`}
                  >
                    <span>{plan.price === "0" ? "Crear cuenta gratis" : "Comenzar prueba"}</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-slate-400 mt-8 font-mono">
            Precios en pesos colombianos (COP). Pagos procesados de forma segura.
          </p>
        </div>
      </section>

      {/* ─── FINAL CTA ──────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-slate-900 border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] py-20 px-6 sm:px-12 text-center overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-4xl mx-auto">
              <div className="text-5xl mb-6">✝️</div>
              <h2 className="font-serif text-4xl sm:text-5xl font-black text-white mb-6 leading-tight">
                Tu congregación merece<br />
                <span className="text-amber-400">tu mejor sermón.</span>
              </h2>
              <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">
                Únete a los más de 2,000 pastores que ya predican con más orden, claridad y profundidad usando SermonPro.
              </p>
              <button
                onClick={onGoToAuth}
                className="inline-flex items-center space-x-2 px-10 py-5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm uppercase tracking-widest border-2 border-white/20 shadow-[6px_6px_0px_0px_rgba(245,158,11,0.3)] hover:shadow-[3px_3px_0px_0px_rgba(245,158,11,0.3)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
                id="final-cta-btn"
              >
                <span>Crear Mi Cuenta Gratis</span>
                <ArrowRight className="h-5 w-5" />
              </button>
              <p className="text-slate-500 text-xs mt-4 font-mono">
                Sin tarjeta de crédito • 4 sermones gratis • Cancela cuando quieras
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─────────────────────────────────────────── */}
      <footer className="bg-slate-950 border-t-2 border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2.5 mb-4">
                <div className="flex h-8 w-8 items-center justify-center bg-amber-500 border border-amber-600 text-base">✝️</div>
                <span className="font-serif text-lg font-black text-white">SermonPro</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                La plataforma homiléctica que ayuda a pastores a predicar con orden, claridad y propósito bíblico.
              </p>
              <p className="text-slate-600 text-xs mt-4 font-mono italic">
                "La fe viene por el oír, y el oír, por la palabra de Dios." — Romanos 10:17
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 font-mono">Producto</h4>
              <ul className="space-y-2">
                {["Funciones", "Precios", "Testimonios"].map((link) => (
                  <li key={link}>
                    <a href={`#${link.toLowerCase()}`} className="text-sm text-slate-500 hover:text-white transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 font-mono">Cuenta</h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={onGoToAuth} className="text-sm text-slate-500 hover:text-white transition-colors cursor-pointer">
                    Iniciar Sesión
                  </button>
                </li>
                <li>
                  <button onClick={onGoToAuth} className="text-sm text-slate-500 hover:text-white transition-colors cursor-pointer">
                    Crear Cuenta
                  </button>
                </li>
                <li>
                  <a 
                    href="https://wa.me/573017810256" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sm text-slate-500 hover:text-emerald-400 transition-colors cursor-pointer"
                  >
                    Contacto (WhatsApp)
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-slate-600 text-xs font-mono">
              © {new Date().getFullYear()} SermonPro. Hecho con ✝️ para el ministerio.
            </p>
            <div className="flex space-x-5">
              <a href="#" className="text-slate-600 hover:text-slate-400 text-xs font-mono transition-colors">Privacidad</a>
              <a href="#" className="text-slate-600 hover:text-slate-400 text-xs font-mono transition-colors">Términos</a>
              <a href="https://wa.me/573017810256" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-emerald-500 text-xs font-mono transition-colors">Contacto</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
