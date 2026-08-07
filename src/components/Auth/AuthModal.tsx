import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, LogIn, UserPlus, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { authService } from '../../services/authService';
import confetti from 'canvas-confetti';

export const AuthModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { cambiarUsuarioActivo, comunidad } = useApp();
  const [modo, setModo] = useState<'login' | 'registro'>('login');

  // Fields
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activoPrincipal, setActivoPrincipal] = useState('EUR/USD (Forex)');

  // Status states
  const [cargando, setCargando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [correoConfirmacionEnviado, setCorreoConfirmacionEnviado] = useState(false);
  const [correoEnviadoA, setCorreoEnviadoA] = useState('');

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !email.trim() || !password.trim()) return;

    setCargando(true);
    setErrorMsg(null);

    const res = await authService.registrar(
      email.trim(),
      password.trim(),
      nombre.trim(),
      activoPrincipal
    );

    setCargando(false);

    if (res.exito) {
      if (res.requiereConfirmacionEmail) {
        setCorreoEnviadoA(email.trim());
        setCorreoConfirmacionEnviado(true);
      } else if (res.usuario) {
        cambiarUsuarioActivo(res.usuario);
        confetti({ particleCount: 100, spread: 70 });
        onClose();
      }
    } else {
      setErrorMsg(res.mensaje || 'Error al registrar el usuario en Supabase.');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setCargando(true);
    setErrorMsg(null);

    const res = await authService.iniciarSesion(email.trim(), password.trim());
    setCargando(false);

    if (res.exito && res.usuario) {
      cambiarUsuarioActivo(res.usuario);
      confetti({ particleCount: 80, spread: 60 });
      onClose();
    } else {
      if (res.requiereConfirmacionEmail) {
        setCorreoEnviadoA(email.trim());
        setCorreoConfirmacionEnviado(true);
      } else {
        setErrorMsg(res.mensaje || 'Credenciales inválidas o correo no registrado.');
      }
    }
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
            {correoConfirmacionEnviado
              ? 'Verifica tu Correo Electrónico'
              : modo === 'login'
              ? 'Iniciar Sesión en ' + comunidad.nombre
              : 'Crear Cuenta en ' + comunidad.nombre}
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            Autenticación directa en base de datos Supabase con confirmación de correo.
          </p>
        </div>

        {/* EMAIL CONFIRMATION SENT VIEW */}
        {correoConfirmacionEnviado ? (
          <div className="space-y-4 text-center py-2 animate-in fade-in">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Mail className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="font-black text-base text-gray-900">
                ¡Correo de Confirmación Enviado!
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed max-w-sm mx-auto">
                Hemos enviado un enlace de confirmación a <strong className="text-gray-900">{correoEnviadoA}</strong>.
                Por favor revisa tu bandeja de entrada o carpeta de spam para verificar tu cuenta.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-700 font-medium">
              Una vez confirmado tu correo en Supabase, podrás ingresar de inmediato.
            </div>

            <button
              type="button"
              onClick={() => {
                setCorreoConfirmacionEnviado(false);
                setModo('login');
              }}
              className="w-full py-3 rounded-xl bg-gray-900 text-white font-bold text-xs hover:bg-black transition-all"
            >
              Ir a Iniciar Sesión
            </button>
          </div>
        ) : (
          <>
            {/* Mode Switcher Buttons */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-gray-100 border border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setModo('login');
                  setErrorMsg(null);
                }}
                className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  modo === 'login'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" /> Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => {
                  setModo('registro');
                  setErrorMsg(null);
                }}
                className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  modo === 'registro'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" /> Crear Cuenta Gratis
              </button>
            </div>

            {/* Error Message Display */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* LOGIN FORM */}
            {modo === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4 text-xs font-bold">
                <div>
                  <label className="block text-gray-700 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    placeholder="tu@email.com"
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

                <button
                  type="submit"
                  disabled={cargando}
                  className="w-full py-3 rounded-xl bg-gray-900 text-white font-black text-xs hover:bg-black transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {cargando ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verificando con Supabase...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Iniciar Sesión en Supabase</span>
                    </>
                  )}
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
                    <label className="block text-gray-700 mb-1">Contraseña (Mín. 6 caract.)</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      minLength={6}
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

                <button
                  type="submit"
                  disabled={cargando}
                  className="w-full py-3 rounded-xl bg-blue-600 text-white font-black text-xs hover:bg-blue-700 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {cargando ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creando cuenta en Supabase...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Crear Cuenta & Enviar Confirmación</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};
