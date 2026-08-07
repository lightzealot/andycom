import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export const RegistroModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { registrarNuevoMiembro, comunidad } = useApp();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [activoPrincipal, setActivoPrincipal] = useState('EUR/USD (Forex)');
  const [plan, setPlan] = useState<'mensual' | 'anual'>('mensual');
  const [bio, setBio] = useState('');

  const handleInscribirse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !email.trim()) return;

    registrarNuevoMiembro({
      nombre: nombre.trim(),
      email: email.trim(),
      activoPrincipal,
      plan,
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
      <div className="glass-panel w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 relative bg-white space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center mx-auto text-xl font-bold shadow-xs">
            📈
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            Inscripción a {comunidad.nombre}
          </h2>
          <p className="text-xs text-slate-600 font-medium">
            Únete a la comunidad de Price Action, opera en vivo en New York y pasa tus cuentas de fondeo.
          </p>
        </div>

        {/* Plan Selector Toggle */}
        <div className="grid grid-cols-2 gap-3 p-1 rounded-2xl bg-slate-100 border border-slate-200">
          <button
            type="button"
            onClick={() => setPlan('mensual')}
            className={`py-2.5 rounded-xl text-xs font-black transition-all flex flex-col items-center ${
              plan === 'mensual'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Pase Mensual</span>
            <span className="text-[10px] text-amber-800 font-bold">$49 USD / mes</span>
          </button>

          <button
            type="button"
            onClick={() => setPlan('anual')}
            className={`py-2.5 rounded-xl text-xs font-black transition-all flex flex-col items-center relative ${
              plan === 'anual'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center gap-1">
              Pase Anual VIP <Sparkles className="w-3 h-3 text-amber-600" />
            </span>
            <span className="text-[10px] text-amber-800 font-bold">$399 USD / año (-35%)</span>
          </button>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleInscribirse} className="space-y-4 text-xs font-bold">
          <div>
            <label className="block text-slate-700 mb-1">Nombre Completo</label>
            <input
              type="text"
              placeholder="Ej: Daniel Gómez"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-1">Correo Electrónico</label>
            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 mb-1">Activo Principal que Operas</label>
              <select
                value={activoPrincipal}
                onChange={(e) => setActivoPrincipal(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
              >
                <option value="EUR/USD (Forex)">EUR/USD (Forex)</option>
                <option value="Nasdaq 100 / US100">Nasdaq 100 (Índices)</option>
                <option value="Bitcoin / BTCUSDT">Bitcoin / Crypto</option>
                <option value="Oro / XAUUSD">Oro / XAUUSD</option>
                <option value="GBP/JPY">GBP/JPY</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 mb-1">Nivel de Experiencia</label>
              <select className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium">
                <option value="novato">Comenzando desde 0</option>
                <option value="intermedio">En Reto de Fondeo (FTMO)</option>
                <option value="avanzado">Trader Rentable / Fondeado</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 mb-1">Meta Principal en el Trading (Opcional)</label>
            <input
              type="text"
              placeholder="Ej: Pasar cuenta de fondeo de $100K y operar en vivo con Andy"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium placeholder-slate-400"
            />
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-900 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Acceso inmediato al Classroom, llamadas en vivo de NY y +50 XP de bienvenida.</span>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-sm shadow-md hover:opacity-95 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" /> Completar Inscripción & Entrar a {comunidad.nombre}
          </button>
        </form>
      </div>
    </div>
  );
};
