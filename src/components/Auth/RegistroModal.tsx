import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, CheckCircle2, ShieldCheck, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { authService } from '../../services/authService';
import confetti from 'canvas-confetti';

export const RegistroModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { cambiarUsuarioActivo } = useApp();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activoPrincipal, setActivoPrincipal] = useState('EUR/USD (Forex)');

  const [cargando, setCargando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmacionEnviada, setConfirmacionEnviada] = useState(false);
  const [correoEnviadoA, setCorreoEnviadoA] = useState('');

  const handleInscribirse = async (e: React.FormEvent) => {
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
        setConfirmacionEnviada(true);
      } else if (res.usuario) {
        cambiarUsuarioActivo(res.usuario);
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 },
        });
        onClose();
      }
    } else {
      setErrorMsg(res.mensaje || 'Error al procesar el registro.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="raxen-card w-full max-w-lg p-6 sm:p-8 relative bg-white space-y-6 shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-black flex items-center justify-center mx-auto shadow-md border border-slate-200">
            <img
              src="/raxen-logo.png"
              alt="Raxen Capital"
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-2xl font-black text-gray-900">
            {confirmacionEnviada ? 'Confirma tu Correo' : 'Crear Cuenta en la Comunidad'}
          </h2>
          <p className="text-xs text-slate-700 font-bold bg-slate-100 py-1 px-3 rounded-full inline-block border border-slate-200">
            Formación en Price Action, gestión de riesgo y clases en vivo.
          </p>
        </div>

        {confirmacionEnviada ? (
          <div className="space-y-4 text-center py-2 animate-in fade-in">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Mail className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="font-black text-base text-gray-900">
                ¡Revisa tu Correo Electrónico!
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed max-w-sm mx-auto">
                Hemos enviado un correo de confirmación a <strong className="text-gray-900">{correoEnviadoA}</strong>.
                Haz clic en el enlace para activar tu cuenta e ingresar de inmediato.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-700 font-medium">
              Si no lo encuentras en unos segundos, revisa tu carpeta de spam o correo no deseado.
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-gray-900 text-white font-bold text-xs hover:bg-black transition-all"
            >
              Entendido
            </button>
          </div>
        ) : (
          <>
            {/* Error Banner */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Signup Form */}
            <form onSubmit={handleInscribirse} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-gray-700 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  placeholder="Ej: Daniel Gómez"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium placeholder-gray-400 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium placeholder-gray-400 focus:bg-white focus:outline-none focus:border-blue-500"
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
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium placeholder-gray-400 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Activo Principal que Operas</label>
                <select
                  value={activoPrincipal}
                  onChange={(e) => setActivoPrincipal(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium"
                >
                  <option value="EUR/USD (Forex)">EUR/USD (Forex)</option>
                  <option value="Nasdaq 100 / US100">Nasdaq 100 (Índices)</option>
                  <option value="Bitcoin / BTCUSDT">Bitcoin / Crypto</option>
                  <option value="Oro / XAUUSD">Oro / XAUUSD</option>
                  <option value="GBP/JPY">GBP/JPY</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center gap-2 text-gray-700 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Cuenta oficial con confirmación a tu email y +50 XP de bienvenida.</span>
              </div>

              <button
                type="submit"
                disabled={cargando}
                className="w-full py-3.5 rounded-xl bg-gray-900 text-white font-black text-sm shadow-md hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {cargando ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creando tu cuenta...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Crear Cuenta & Unirme</span>
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
