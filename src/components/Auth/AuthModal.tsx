import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, LogIn, UserPlus, Shield, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export const AuthModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { usuarioActual, miembros, cambiarUsuarioActivo, registrarNuevoMiembro, comunidad } = useApp();
  const [modo, setModo] = useState<'login' | 'registro' | 'perfil'>('login');

  // Formulario de Registro
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activoPrincipal, setActivoPrincipal] = useState('EUR/USD (Forex)');

  // Formulario de Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const handleRegistro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !email.trim()) return;

    registrarNuevoMiembro({
      nombre: nombre.trim(),
      email: email.trim(),
      activoPrincipal,
      bio: `Trader enfocado en ${activoPrincipal}.`,
    });

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.5 },
    });

    onClose();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const encontrado = miembros.find(
      (m) => m.nickname.toLowerCase().includes(loginEmail.toLowerCase()) || m.nombre.toLowerCase().includes(loginEmail.toLowerCase())
    );

    if (encontrado) {
      cambiarUsuarioActivo(encontrado);
      alert(`¡Bienvenido de nuevo, ${encontrado.nombre}!`);
      onClose();
    } else {
      alert('Usuario autenticado con éxito.');
      onClose();
    }
  };

  const handleSeleccionarAdmin = (u: any) => {
    cambiarUsuarioActivo(u);
    confetti({ particleCount: 50, spread: 60 });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="skool-card w-full max-w-lg p-6 sm:p-8 relative bg-white space-y-6 shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-black text-sky-400 flex items-center justify-center mx-auto text-2xl font-black shadow-sm">
            R
          </div>
          <h2 className="text-2xl font-black text-gray-900">
            {modo === 'login' && 'Iniciar Sesión en ' + comunidad.nombre}
            {modo === 'registro' && 'Crear Cuenta Gratuita en ' + comunidad.nombre}
            {modo === 'perfil' && 'Tu Perfil de Trader'}
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            Acceso 100% gratuito a la comunidad de trading, lecciones del aula y salas en vivo.
          </p>
        </div>

        {/* Mode Switcher Buttons */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-gray-100 border border-gray-200">
          <button
            onClick={() => setModo('login')}
            className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              modo === 'login'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" /> Iniciar Sesión
          </button>
          <button
            onClick={() => setModo('registro')}
            className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              modo === 'registro'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" /> Registrarme Gratis (+50 XP)
          </button>
        </div>

        {/* Quick Profile Switcher (Admin vs Student) */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="text-[11px] font-black text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-blue-600" /> Acceso Rápido de Prueba:
          </div>
          <div className="grid grid-cols-2 gap-2">
            {miembros.slice(0, 2).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => handleSeleccionarAdmin(m)}
                className={`p-2 rounded-xl border text-left text-xs font-bold transition-all flex items-center gap-2 ${
                  usuarioActual.id === m.id
                    ? 'bg-blue-50 border-blue-300 text-blue-900'
                    : 'bg-white border-gray-200 text-gray-800 hover:border-gray-300'
                }`}
              >
                <img src={m.avatar} alt={m.nombre} className="w-6 h-6 rounded-full object-cover" />
                <div className="truncate">
                  <div className="truncate text-[11px]">{m.nombre}</div>
                  <div className="text-[9px] text-gray-400 font-normal">{m.rol} (N{m.nivel})</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* LOGIN FORM */}
        {modo === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4 text-xs font-bold">
            <div>
              <label className="block text-gray-700 mb-1">Correo Electrónico o Usuario</label>
              <input
                type="text"
                placeholder="andres@raxencapital.com o tu usuario"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gray-900 text-white font-black text-xs hover:bg-black transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" /> Entrar a la Plataforma
            </button>
          </form>
        )}

        {/* SIGNUP FORM */}
        {modo === 'registro' && (
          <form onSubmit={handleRegistro} className="space-y-4 text-xs font-bold">
            <div>
              <label className="block text-gray-700 mb-1">Nombre Completo</label>
              <input
                type="text"
                placeholder="Ej: Daniel Gómez"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-700 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  placeholder="daniel@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Contraseña</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Activo Principal que Operas</label>
              <select
                value={activoPrincipal}
                onChange={(e) => setActivoPrincipal(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium"
              >
                <option value="EUR/USD (Forex)">EUR/USD (Forex)</option>
                <option value="Nasdaq 100 / US100">Nasdaq 100 / US100 (Índices)</option>
                <option value="Bitcoin / BTCUSDT">Bitcoin / Crypto</option>
                <option value="Oro / XAUUSD">Oro / XAUUSD</option>
                <option value="GBP/JPY">GBP/JPY</option>
              </select>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-900 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Ganas +50 XP de bienvenida y acceso 100% gratuito al Aula.</span>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-black text-xs hover:bg-blue-700 transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" /> Crear Perfil & Empezar Gratis
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
