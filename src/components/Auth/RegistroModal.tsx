import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export const RegistroModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { registrarNuevoMiembro, comunidad } = useApp();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [activoPrincipal, setActivoPrincipal] = useState('EUR/USD (Forex)');
  const [bio, setBio] = useState('');

  const handleInscribirse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !email.trim()) return;

    registrarNuevoMiembro({
      nombre: nombre.trim(),
      email: email.trim(),
      activoPrincipal,
      bio: bio.trim() || `Trader enfocado en ${activoPrincipal}. Miembro de ${comunidad.nombre}.`,
    });

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5 },
    });

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
            Inscripción Gratuita a {comunidad.nombre}
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            Acceso 100% libre a la formación en Price Action, lecciones del Aula y salas en vivo.
          </p>
        </div>

        {/* Free Banner */}
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-center text-xs font-black text-emerald-900 flex items-center justify-center gap-1.5">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Membresía 100% Gratuita & Acceso Inmediato</span>
        </div>

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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-1">Activo que Operas</label>
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

            <div>
              <label className="block text-gray-700 mb-1">Nivel de Experiencia</label>
              <select className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium">
                <option value="novato">Comenzando desde 0</option>
                <option value="intermedio">En Reto de Fondeo</option>
                <option value="avanzado">Trader Rentable</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Meta Principal en el Trading (Opcional)</label>
            <input
              type="text"
              placeholder="Ej: Operar en vivo con Andres y gestionar el riesgo con criterio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium placeholder-gray-400"
            />
          </div>

          <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center gap-2 text-gray-700 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Acceso total e inmediato al feed, al Aula y +50 XP de bienvenida.</span>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gray-900 text-white font-black text-sm shadow-md hover:bg-black transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Completar Inscripción Gratuita & Entrar</span>
          </button>
        </form>
      </div>
    </div>
  );
};
