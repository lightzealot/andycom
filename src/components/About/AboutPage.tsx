import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Trophy, BookOpen, Calendar as CalendarIcon, Users, Check, HelpCircle, Sparkles } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { comunidad, setTabActual } = useApp();
  const [faqAbierto, setFaqAbierto] = useState<number | null>(0);

  const faqs = [
    {
      q: '¿La comunidad AndyOnTrade - Raxen Capital es gratuita?',
      a: 'Sí, el acceso a la comunidad, las publicaciones del feed, las clases grabadas del Aula y las sesiones en vivo es 100% gratuito para todos los miembros registrados.',
    },
    {
      q: '¿Cómo me ayuda la comunidad a superar pruebas de fondeo?',
      a: 'Enseñamos un sistema de Price Action sin indicadores, centrado en zonas de oferta/demanda y liquidez institucional. Te proporcionamos la bitácora de riesgo y el plan exacto para no violar el drawdown máximo diario de empresas de fondeo.',
    },
    {
      q: '¿Cuándo son las sesiones de Trading en Vivo con Andres Gomez?',
      a: 'Nos conectamos en vivo durante la apertura de la bolsa de Nueva York (09:15 AM EST) para analizar Bitcoin, Criptomonedas, EUR/USD y Nasdaq.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Hero Banner */}
      <div className="skool-card p-8 sm:p-12 text-center space-y-6 relative overflow-hidden bg-white">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Membresía 100% Gratuita
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
            <div className="text-2xl font-black text-blue-700">100%</div>
            <div className="text-xs text-gray-500 font-bold">Gratuito</div>
          </div>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="skool-card p-6 space-y-3 bg-white">
          <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-800 flex items-center justify-center font-bold">
            <Trophy className="w-5 h-5 text-amber-600" />
          </div>
          <h3 className="font-extrabold text-base text-gray-900">Gamificación & Puntos XP</h3>
          <p className="text-xs text-gray-600 leading-relaxed font-normal">
            Acumula XP compartiendo tus análisis y bitácoras en el feed.
          </p>
        </div>

        <div className="skool-card p-6 space-y-3 bg-white">
          <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-800 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="font-extrabold text-base text-gray-900">Aula Práctica Gratuita</h3>
          <p className="text-xs text-gray-600 leading-relaxed font-normal">
            Módulos prácticos de estructura de mercado, gestión de riesgo y psicotrading.
          </p>
        </div>

        <div className="skool-card p-6 space-y-3 bg-white">
          <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-800 flex items-center justify-center font-bold">
            <CalendarIcon className="w-5 h-5 text-emerald-600" />
          </div>
          <h3 className="font-extrabold text-base text-gray-900">Operativa en Vivo</h3>
          <p className="text-xs text-gray-600 leading-relaxed font-normal">
            Sesiones en vivo para analizar criptomonedas y forex con Andres Gomez.
          </p>
        </div>

        <div className="skool-card p-6 space-y-3 bg-white">
          <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-800 flex items-center justify-center font-bold">
            <Users className="w-5 h-5 text-sky-600" />
          </div>
          <h3 className="font-extrabold text-base text-gray-900">Comunidad de Traders</h3>
          <p className="text-xs text-gray-600 leading-relaxed font-normal">
            Traders enfocados en operar con criterio y sin señales mágicas.
          </p>
        </div>
      </div>

      {/* Free Access Guarantee Card */}
      <div className="skool-card p-8 bg-white max-w-2xl mx-auto text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto text-xl font-bold">
          <Check className="w-6 h-6 text-emerald-700" />
        </div>
        <h2 className="text-xl font-black text-gray-900">Acceso 100% Libre & Sin Cobros</h2>
        <p className="text-xs text-gray-600 leading-relaxed font-normal">
          Todo el contenido del feed, videos del Aula, eventos del calendario y tabla de clasificación están abiertos a todos los miembros que se registren en la plataforma.
        </p>
      </div>

      {/* FAQs Section */}
      <div className="skool-card p-8 space-y-6 max-w-3xl mx-auto bg-white">
        <h2 className="text-xl font-black text-gray-900 text-center flex items-center justify-center gap-2">
          <HelpCircle className="w-5 h-5 text-gray-600" /> Preguntas Frecuentes
        </h2>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              onClick={() => setFaqAbierto(faqAbierto === idx ? null : idx)}
              className="p-4 rounded-xl bg-gray-50 border border-gray-200 cursor-pointer transition-all hover:border-gray-300"
            >
              <div className="font-bold text-sm text-gray-900 flex items-center justify-between">
                <span>{faq.q}</span>
                <span className="text-gray-500 font-mono">{faqAbierto === idx ? '−' : '+'}</span>
              </div>
              {faqAbierto === idx && (
                <p className="text-xs text-gray-600 mt-2 leading-relaxed pt-2 border-t border-gray-200 font-normal">
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
