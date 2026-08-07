import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Trophy, BookOpen, Calendar as CalendarIcon, Users, Check, HelpCircle, TrendingUp } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { comunidad, setTabActual } = useApp();
  const [faqAbierto, setFaqAbierto] = useState<number | null>(0);

  const faqs = [
    {
      q: '¿Cómo me ayuda andyontrade a superar pruebas de fondeo?',
      a: 'Enseñamos un sistema de Price Action sin indicadores, centrado en zonas de oferta/demanda y liquidez institucional. Te proporcionamos la bitácora de riesgo y el plan exacto para no violar el drawdown máximo diario de empresas como FTMO.',
    },
    {
      q: '¿Cuándo son las sesiones de Trading en Vivo con Andy?',
      a: 'Nos conectamos en vivo todos los días de operativa durante la apertura de la bolsa de Nueva York (09:15 AM EST). Analizamos EUR/USD, Nasdaq y Bitcoin en directo.',
    },
    {
      q: '¿Cómo funciona el sistema de niveles XP para Traders?',
      a: 'Acumulas puntos XP compartiendo tus análisis de gráficos en el feed (+15 XP), comentando en la comunidad (+10 XP) y completando las lecciones del Classroom (+25 XP). Al subir de nivel desbloqueas salas VIP y canales de análisis de Andy.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-emerald-500/30 bg-gradient-to-b from-emerald-500/10 via-slate-900 to-slate-950 text-center space-y-6 relative overflow-hidden shadow-2xl">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <TrendingUp className="w-4 h-4" /> {comunidad.tagline}
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-tight">
          La Comunidad de Trading donde Aprendes Price Action, Operas en Vivo y Fondeas tu Cuenta
        </h1>

        <p className="text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          {comunidad.descripcion}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={() => setTabActual('comunidad')}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 hover:scale-105 transition-all"
          >
            Ver Análisis en el Feed
          </button>
          <button
            onClick={() => setTabActual('classroom')}
            className="px-8 py-4 rounded-2xl bg-slate-900 border border-slate-800 text-white font-bold text-sm hover:border-slate-700 transition-all"
          >
            Explorar Cursos de Trading
          </button>
        </div>

        <div className="pt-8 flex items-center justify-center gap-8 border-t border-slate-800/80">
          <div>
            <div className="text-2xl font-black text-white">{comunidad.totalMiembros}+</div>
            <div className="text-xs text-slate-400">Traders Activos</div>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div>
            <div className="text-2xl font-black text-emerald-400">890</div>
            <div className="text-xs text-slate-400">Operando Hoy</div>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div>
            <div className="text-2xl font-black text-amber-400">100%</div>
            <div className="text-xs text-slate-400">Price Action Puro</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <Trophy className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-white">Gamificación para Traders</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Acumula XP compartiendo tus gráficos y bitácora. Sube en la tabla de clasificación.
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-white">Classroom de Fondeo</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Módulos prácticos de estructura de mercado, zonas de liquidez y gestión de riesgo.
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-400 flex items-center justify-center">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-white">Trading en Vivo de NY</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Sesiones diarias en la apertura de New York para analizar activos en tiempo real con Andy.
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-white">Comunidad de Apoyo</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Revisión de bitácoras, corrección de errores emocionales y feedback constante.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold text-white">Planes de Membresía andyontrade</h2>
          <p className="text-xs text-slate-400">Únete hoy y transforma tu operativa de trading.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="glass-panel rounded-3xl p-8 border border-slate-800 space-y-6 relative flex flex-col justify-between">
            <div className="space-y-4">
              <span className="px-3 py-1 rounded-xl bg-slate-900 text-slate-300 text-xs font-bold">
                Pase Mensual Trader
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">$49</span>
                <span className="text-slate-400 text-xs">/mes</span>
              </div>
              <p className="text-xs text-slate-400">Acceso a las sesiones diarias en vivo y feed general.</p>
              <ul className="space-y-2 pt-4 border-t border-slate-800 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" /> Trading en vivo en Apertura de NY
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" /> Cursos de Price Action Nivel 1-3
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" /> Feed de análisis y bitácoras
                </li>
              </ul>
            </div>
            <button className="w-full py-3 rounded-2xl bg-slate-900 border border-slate-800 text-white font-bold text-xs hover:border-slate-700">
              Unirme por $49/mes
            </button>
          </div>

          <div className="glass-panel rounded-3xl p-8 border-2 border-amber-500 space-y-6 relative flex flex-col justify-between shadow-2xl glow-amber">
            <div className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase">
              Recomendado Fondeo
            </div>
            <div className="space-y-4">
              <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-400 text-xs font-bold">
                Pase Anual Trader VIP
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">$399</span>
                <span className="text-slate-400 text-xs">/año (Ahorras 35%)</span>
              </div>
              <p className="text-xs text-slate-400">Para quienes buscan fondearse con $100K+ en empresas de fondeo.</p>
              <ul className="space-y-2 pt-4 border-t border-slate-800 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400" /> Todos los beneficios del plan mensual
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400" /> Cursos de Fondeo Institucional & ICT
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400" /> Canal VIP de Análisis Diarios de Andy
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400" /> Insignia de Trader VIP en el perfil
                </li>
              </ul>
            </div>
            <button className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 hover:opacity-90">
              Unirme al Pase Anual VIP
            </button>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-3xl p-8 border border-slate-800 space-y-6 max-w-3xl mx-auto">
        <h2 className="text-xl font-extrabold text-white text-center flex items-center justify-center gap-2">
          <HelpCircle className="w-5 h-5 text-amber-400" /> Preguntas Frecuentes de Traders
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              onClick={() => setFaqAbierto(faqAbierto === idx ? null : idx)}
              className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 cursor-pointer transition-all"
            >
              <div className="font-bold text-sm text-white flex items-center justify-between">
                <span>{faq.q}</span>
                <span className="text-amber-400 font-mono">{faqAbierto === idx ? '−' : '+'}</span>
              </div>
              {faqAbierto === idx && (
                <p className="text-xs text-slate-300 mt-2 leading-relaxed pt-2 border-t border-slate-800">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
