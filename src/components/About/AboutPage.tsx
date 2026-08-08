import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Trophy, BookOpen, Calendar as CalendarIcon, Users, Check, HelpCircle, Sparkles } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { comunidad, setTabActual } = useApp();
  const [faqAbierto, setFaqAbierto] = useState<number | null>(0);

  const faqs = [
    {
      q: '¿Qué incluye la comunidad AndyOnTrade - Raxen Capital?',
      a: 'El acceso a la comunidad incluye todas las publicaciones y análisis del feed, las clases grabadas del Aula y las sesiones de trading en vivo para miembros registrados.',
    },
    {
      q: '¿Cómo me ayuda la comunidad a mejorar mi operativa y rentabilidad?',
      a: 'Enseñamos un sistema de Price Action sin indicadores, centrado en zonas de oferta/demanda y liquidez institucional. Te proporcionamos la bitácora de trading y el plan de gestión de riesgo estricto para operar con criterio propio y consistencia.',
    },
    {
      q: '¿Cuándo son las sesiones de Trading en Vivo con Andres Gomez?',
      a: 'Nos conectamos en vivo durante la apertura de la bolsa de Nueva York (09:15 AM EST) para analizar Bitcoin, Criptomonedas, EUR/USD y Nasdaq.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Hero Banner */}
      <div className="raxen-card p-8 sm:p-12 text-center space-y-6 relative overflow-hidden bg-white">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-900 text-xs font-black uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-sky-600" /> Comunidad Oficial
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight max-w-4xl mx-auto leading-tight">
          {comunidad.nombre}
        </h1>

        <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed font-normal">
          {comunidad.descripcion}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={() => setTabActual('comunidad')}
            className="px-8 py-3.5 rounded-xl bg-gray-900 text-white font-black text-xs shadow-md hover:bg-black transition-all"
          >
            Ver Análisis en el Feed
          </button>
          <button
            onClick={() => setTabActual('aula')}
            className="px-8 py-3.5 rounded-xl bg-white border border-gray-300 text-gray-900 font-bold text-xs hover:bg-gray-50 transition-all shadow-xs"
          >
            Explorar Cursos en el Aula
          </button>
        </div>

        <div className="pt-6 flex items-center justify-center gap-8 border-t border-gray-100">
          <div>
            <div className="text-2xl font-black text-gray-900">{comunidad.totalMiembros}</div>
            <div className="text-xs text-gray-500 font-bold">Miembros Registrados</div>
          </div>
          <div className="w-px h-8 bg-gray-200" />
          <div>
            <div className="text-2xl font-black text-emerald-700">{comunidad.enLinea}</div>
            <div className="text-xs text-gray-500 font-bold">En Línea</div>
          </div>
          <div className="w-px h-8 bg-gray-200" />
          <div>
            <div className="text-2xl font-black text-sky-700">En Vivo</div>
            <div className="text-xs text-gray-500 font-bold">Sesiones Semanales</div>
          </div>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="raxen-card p-6 space-y-3 bg-white">
          <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-800 flex items-center justify-center font-bold">
            <Trophy className="w-5 h-5 text-amber-600" />
          </div>
          <h3 className="font-extrabold text-base text-gray-900">Gamificación & Puntos XP</h3>
          <p className="text-xs text-gray-600 leading-relaxed font-normal">
            Acumula XP compartiendo tus análisis y bitácoras en el feed.
          </p>
        </div>

        <div className="raxen-card p-6 space-y-3 bg-white">
          <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-800 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="font-extrabold text-base text-gray-900">Aula Práctica</h3>
          <p className="text-xs text-gray-600 leading-relaxed font-normal">
            Módulos prácticos de estructura de mercado, gestión de riesgo y psicotrading.
          </p>
        </div>

        <div className="raxen-card p-6 space-y-3 bg-white">
          <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-800 flex items-center justify-center font-bold">
            <CalendarIcon className="w-5 h-5 text-emerald-600" />
          </div>
          <h3 className="font-extrabold text-base text-gray-900">Operativa en Vivo</h3>
          <p className="text-xs text-gray-600 leading-relaxed font-normal">
            Sesiones interactivas de trading en vivo para analizar el mercado en tiempo real.
          </p>
        </div>

        <div className="raxen-card p-6 space-y-3 bg-white">
          <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-800 flex items-center justify-center font-bold">
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="font-extrabold text-base text-gray-900">Comunidad de Traders</h3>
          <p className="text-xs text-gray-600 leading-relaxed font-normal">
            Comunidad enfocada en el crecimiento colectivo y el debate técnico con criterio.
          </p>
        </div>
      </div>

      {/* Creator & Philosophy Section */}
      <div className="raxen-card p-8 bg-white grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <span className="text-xs font-bold text-sky-700 font-mono uppercase tracking-wider">
            Filosofía AndyOnTrade
          </span>
          <h2 className="text-2xl font-black text-gray-900">
            Menos Ruido. Más Criterio.
          </h2>
          <p className="text-xs text-gray-600 leading-relaxed font-normal">
            En un mundo saturado de señales y promesas irreales, nuestro objetivo es formar operadores independientes.
            Aprenderás a leer la estructura del precio y a ejecutar con una gestión de riesgo estricta.
          </p>

          <div className="space-y-2 pt-2">
            {[
              'Lectura limpia de Price Action sin indicadores redundantes',
              'Gestión de capital y control estricto de riesgo profesional',
              'Comunidad en vivo para despejar dudas técnicas',
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs font-bold text-gray-800">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200 text-center space-y-3">
          <img
            src={comunidad.creador.avatar}
            alt={comunidad.creador.nombre}
            className="w-20 h-20 rounded-full object-cover mx-auto ring-2 ring-gray-300"
          />
          <div>
            <div className="font-black text-base text-gray-900">{comunidad.creador.nombre}</div>
            <div className="text-xs text-gray-500 font-medium">Fundador de Raxen Capital & AndyOnTrade</div>
          </div>
          <p className="text-xs text-gray-600 font-normal leading-relaxed italic">
            "{comunidad.creador.bio}"
          </p>
        </div>
      </div>

      {/* FAQs */}
      <div className="raxen-card p-8 bg-white space-y-4">
        <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-gray-700" />
          <span>Preguntas Frecuentes</span>
        </h2>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-gray-50 border border-gray-200 cursor-pointer transition-all"
              onClick={() => setFaqAbierto(faqAbierto === idx ? null : idx)}
            >
              <div className="font-bold text-xs text-gray-900 flex items-center justify-between">
                <span>{faq.q}</span>
                <span className="text-gray-400">{faqAbierto === idx ? '−' : '+'}</span>
              </div>
              {faqAbierto === idx && (
                <p className="text-xs text-gray-600 mt-2 pt-2 border-t border-gray-200 leading-relaxed font-normal">
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
