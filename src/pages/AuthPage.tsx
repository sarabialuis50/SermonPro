import React, { useState } from "react";
import { BookOpen, Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

type AuthView = "login" | "register" | "forgot";

interface AuthPageProps {
  onBack: () => void;
}

export default function AuthPage({ onBack }: AuthPageProps) {
  const { signIn, signUp, resetPassword } = useAuth();
  const [view, setView] = useState<AuthView>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resetForm = () => {
    setError(null);
    setSuccessMessage(null);
    setPassword("");
    setConfirmPassword("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Por favor completa todos los campos."); return; }
    setLoading(true);
    setError(null);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      if (error.message.includes("Invalid login")) setError("Correo o contraseña incorrectos.");
      else if (error.message.includes("Email not confirmed")) setError("Confirma tu correo electrónico antes de iniciar sesión.");
      else setError(error.message);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) { setError("Por favor completa todos los campos."); return; }
    if (password.length < 8) { setError("La contraseña debe tener mínimo 8 caracteres."); return; }
    if (password !== confirmPassword) { setError("Las contraseñas no coinciden."); return; }
    setLoading(true);
    setError(null);
    const { error } = await signUp(email, password);
    setLoading(false);
    if (error) {
      if (error.message.includes("already registered")) setError("Este correo ya está registrado. Intenta iniciar sesión.");
      else setError(error.message);
    } else {
      setSuccessMessage("¡Cuenta creada! Revisa tu correo electrónico para confirmar tu cuenta antes de iniciar sesión.");
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError("Ingresa tu correo electrónico."); return; }
    setLoading(true);
    setError(null);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) setError(error.message);
    else setSuccessMessage("Te enviamos un enlace para restablecer tu contraseña. Revisa tu correo.");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
      {/* Background geometric grid */}
      <div className="absolute inset-0 geometric-grid opacity-30 pointer-events-none" />

      {/* Amber glow top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <nav className="relative z-10 border-b-2 border-slate-900 bg-white px-6 py-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 text-sm font-bold uppercase tracking-wider cursor-pointer transition-colors"
          id="auth-back-btn"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver al inicio</span>
        </button>
        <div className="flex items-center space-x-2">
          <div className="flex h-9 w-9 items-center justify-center bg-amber-500 border-2 border-slate-900 text-lg">
            ✝️
          </div>
          <span className="font-serif text-base font-black tracking-tight text-slate-950">SermonPro</span>
        </div>
      </nav>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md">

          {/* Card */}
          <div className="bg-white border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] overflow-hidden">

            {/* Amber top stripe */}
            <div className="h-1.5 w-full bg-amber-500" />

            {/* Tabs (Login / Register) */}
            {view !== "forgot" && (
              <div className="flex border-b-2 border-slate-900">
                <button
                  onClick={() => { setView("login"); resetForm(); }}
                  className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer ${
                    view === "login"
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-500 hover:bg-slate-50"
                  }`}
                  id="auth-login-tab"
                >
                  Iniciar Sesión
                </button>
                <button
                  onClick={() => { setView("register"); resetForm(); }}
                  className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer border-l-2 border-slate-900 ${
                    view === "register"
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-500 hover:bg-slate-50"
                  }`}
                  id="auth-register-tab"
                >
                  Crear Cuenta
                </button>
              </div>
            )}

            <div className="p-8">
              {/* Title */}
              <div className="mb-6">
                <h1 className="font-serif text-2xl font-black text-slate-950">
                  {view === "login" && "Bienvenido de vuelta"}
                  {view === "register" && "Comienza gratis hoy"}
                  {view === "forgot" && "Recuperar contraseña"}
                </h1>
                <p className="text-slate-500 text-sm mt-1 font-sans">
                  {view === "login" && "Ingresa a tu cuenta de SermonPro"}
                  {view === "register" && "Crea tu cuenta en menos de 1 minuto"}
                  {view === "forgot" && "Te enviaremos un enlace a tu correo"}
                </p>
              </div>

              {/* Success message */}
              {successMessage && (
                <div className="flex items-start space-x-2.5 p-4 bg-emerald-50 border-2 border-emerald-700 mb-5">
                  <CheckCircle className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
                  <p className="text-sm text-emerald-800 font-sans leading-snug">{successMessage}</p>
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="flex items-start space-x-2.5 p-4 bg-red-50 border-2 border-red-700 mb-5">
                  <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 font-sans leading-snug">{error}</p>
                </div>
              )}

              {/* LOGIN FORM */}
              {view === "login" && !successMessage && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 font-mono">
                      Correo Electrónico
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="pastor@iglesia.com"
                        className="w-full rounded-none border-2 border-slate-900 pl-9 pr-4 py-3 text-sm outline-none focus:border-amber-500 transition-colors dark:bg-white"
                        id="auth-email-input"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 font-mono">
                      Contraseña
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Tu contraseña"
                        className="w-full rounded-none border-2 border-slate-900 pl-9 pr-10 py-3 text-sm outline-none focus:border-amber-500 transition-colors"
                        id="auth-password-input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => { setView("forgot"); resetForm(); }}
                      className="text-xs text-amber-600 hover:text-amber-700 font-bold cursor-pointer uppercase tracking-wide"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 font-black text-sm uppercase tracking-widest border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center space-x-2"
                    id="auth-login-submit"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    <span>{loading ? "Ingresando..." : "Ingresar al Púlpito"}</span>
                  </button>
                </form>
              )}

              {/* REGISTER FORM */}
              {view === "register" && !successMessage && (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 font-mono">
                      Correo Electrónico
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="pastor@iglesia.com"
                        className="w-full rounded-none border-2 border-slate-900 pl-9 pr-4 py-3 text-sm outline-none focus:border-amber-500 transition-colors"
                        id="auth-register-email"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 font-mono">
                      Contraseña
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mínimo 8 caracteres"
                        className="w-full rounded-none border-2 border-slate-900 pl-9 pr-10 py-3 text-sm outline-none focus:border-amber-500 transition-colors"
                        id="auth-register-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 font-mono">
                      Confirmar Contraseña
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repite tu contraseña"
                        className="w-full rounded-none border-2 border-slate-900 pl-9 pr-4 py-3 text-sm outline-none focus:border-amber-500 transition-colors"
                        id="auth-register-confirm"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Al registrarte aceptas que tus datos son usados únicamente para brindar el servicio de SermonPro.
                  </p>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 font-black text-sm uppercase tracking-widest border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center space-x-2"
                    id="auth-register-submit"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    <span>{loading ? "Creando cuenta..." : "Crear Cuenta Gratis"}</span>
                  </button>
                </form>
              )}

              {/* FORGOT PASSWORD FORM */}
              {view === "forgot" && !successMessage && (
                <form onSubmit={handleForgot} className="space-y-4">
                  <button
                    type="button"
                    onClick={() => { setView("login"); resetForm(); }}
                    className="flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-700 cursor-pointer mb-2 font-bold uppercase tracking-wide"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Volver al login</span>
                  </button>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 font-mono">
                      Tu Correo Electrónico
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="pastor@iglesia.com"
                        className="w-full rounded-none border-2 border-slate-900 pl-9 pr-4 py-3 text-sm outline-none focus:border-amber-500 transition-colors"
                        id="auth-forgot-email"
                        autoFocus
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-black text-sm uppercase tracking-widest border-2 border-slate-900 transition-all cursor-pointer flex items-center justify-center space-x-2"
                    id="auth-forgot-submit"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    <span>{loading ? "Enviando..." : "Enviar Enlace de Recuperación"}</span>
                  </button>
                </form>
              )}

              {/* Bible verse footer */}
              <div className="mt-8 pt-5 border-t border-slate-200 flex items-start space-x-2.5">
                <BookOpen className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-400 italic font-serif leading-relaxed">
                  "Todo lo puedo en Cristo que me fortalece." — Filipenses 4:13
                </p>
              </div>
            </div>
          </div>

          {/* Free plan note */}
          <p className="text-center text-xs text-slate-400 mt-4 font-mono">
            Plan gratuito incluye hasta 4 sermones. Sin tarjeta de crédito.
          </p>
        </div>
      </div>
    </div>
  );
}
