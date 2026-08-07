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
      <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-slate-200 bg-gradient-to-b from-amber-500/10 via-slate-50 to-white text-center space-y-6 relative overflow-hidden shadow-sm">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black uppercase tracking-wider">
          <TrendingUp className="w-4 h-4" /> {comunidad.tagline}
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
          La Comunidad de Trading donde Aprendes Price Action, Operas en Vivo y Fondeas tu Cuenta
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
          {comunidad.descripcion}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={() => setTabActual('comunidad')}
            className="px-8 py-4 rounded-2xl bg-amber-500 text-slate-950 font-black text-sm shadow-md hover:bg-amber-400 hover:scale-105 transition-all"
          >
            Ver Análisis en el Feed
          </button>
          <button
            onClick={() => setTabActual('aula')}
            className="px-8 py-4 rounded-2xl bg-white border border-slate-300 text-slate-900 font-bold text-sm hover:bg-slate-50 transition-all shadow-xs"
          >
            Explorar Cursos de Trading
          </button>
        </div>

        <div className="pt-8 flex items-center justify-center gap-8 border-t border-slate-200">
          <div>
            <div className="text-2xl font-black text-slate-900">{comunidad.totalMiembros}+</div>
            <div className="text-xs text-slate-500 font-bold">Traders Activos</div>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div>
            <div className="text-2xl font-black text-emerald-700">{comunidad.enLinea}</div>
            <div className="text-xs text-slate-500 font-bold">En Línea Hoy</div>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div>
            <div className="text-2xl font-black text-amber-700">100%</div>
            <div className="text-xs text-slate-500 font-bold">Price Action Puro</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-panel rounded-3xl p-6 border border-slate-200 space-y-3 bg-white shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center">
            <Trophy className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-base text-slate-900">Gamificación para Traders</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            Acumula XP compartiendo tus gráficos y bitácora. Sube en la tabla de clasificación.
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-6 border border-slate-200 space-y-3 bg-white shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-base text-slate-900">Classroom de Fondeo</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            Módulos prácticos de estructura de mercado, zonas de liquidez y gestión de riesgo.
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-6 border border-slate-200 space-y-3 bg-white shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-orange-100 border border-orange-300 text-orange-800 flex items-center justify-center">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-base text-slate-900">Trading en Vivo de NY</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            Sesiones diarias en la apertura de New York para analizar activos en tiempo real con Andy.
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-6 border border-slate-200 space-y-3 bg-white shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-sky-100 border border-sky-300 text-sky-800 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-base text-slate-900">Comunidad de Apoyo</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            Revisión de bitácoras, corrección de errores emocionales y feedback constante.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-slate-900">Planes de Membresía {comunidad.nombre}</h2>
          <p className="text-xs text-slate-600 font-medium">Únete hoy y transforma tu operativa de trading.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="glass-panel rounded-3xl p-8 border border-slate-200 space-y-6 relative flex flex-col justify-between bg-white shadow-xs">
            <div className="space-y-4">
              <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-800 text-xs font-black">
                Pase Mensual Trader
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900">$49</span>
                <span className="text-slate-500 text-xs font-bold">/mes</span>
              </div>
              <p className="text-xs text-slate-600">Acceso a las sesiones diarias en vivo y feed general.</p>
              <ul className="space-y-2 pt-4 border-t border-slate-100 text-xs text-slate-700 font-medium">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" /> Trading en vivo en Apertura de NY
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" /> Cursos de Price Action Nivel 1-3
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" /> Feed de análisis y bitácoras
                </li>
              </ul>
            </div>
            <button className="w-full py-3 rounded-2xl bg-slate-100 border border-slate-200 text-slate-900 font-black text-xs hover:bg-slate-200 transition-all">
              Unirme por $49/mes
            </button>
          </div>

          <div className="glass-panel rounded-3xl p-8 border-2 border-amber-400 space-y-6 relative flex flex-col justify-between bg-gradient-to-b from-amber-50/50 to-white shadow-md">
            <div className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase shadow-xs">
              Recomendado Fondeo
            </div>
            <div className="space-y-4">
              <span className="px-3 py-1 rounded-xl bg-amber-100 text-amber-900 text-xs font-black">
                Pase Anual Trader VIP
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900">$399</span>
                <span className="text-slate-500 text-xs font-bold">/año (Ahorras 35%)</span>
              </div>
              <p className="text-xs text-slate-600 font-medium">Para quienes buscan fondearse con $100K+ en empresas de fondeo.</p>
              <ul className="space-y-2 pt-4 border-t border-slate-200 text-xs text-slate-700 font-medium">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-600" /> Todos los beneficios del plan mensual
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-600" /> Cursos de Fondeo Institucional & ICT
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-600" /> Canal VIP de Análisis Diarios de Andy
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-600" /> Insignia de Trader VIP en el perfil
                </li>
              </ul>
            </div>
            <button className="w-full py-3 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs shadow-md hover:bg-amber-400 transition-all">
              Unirme al Pase Anual VIP
            </button>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-3xl p-8 border border-slate-200 space-y-6 max-w-3xl mx-auto bg-white shadow-xs">
        <h2 className="text-xl font-black text-slate-900 text-center flex items-center justify-center gap-2">
          <HelpCircle className="w-5 h-5 text-amber-600" /> Preguntas Frecuentes de Traders
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              onClick={() => setFaqAbierto(faqAbierto === idx ? null : idx)}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer transition-all hover:border-slate-300"
            >
              <div className="font-extrabold text-sm text-slate-900 flex items-center justify-between">
                <span>{faq.q}</span>
                <span className="text-amber-700 font-mono text-base">{faqAbierto === idx ? '−' : '+'}</span>
              </div>
              {faqAbierto === idx && (
                <p className="text-xs text-slate-600 mt-2 leading-relaxed pt-2 border-t border-slate-200 font-normal">
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
