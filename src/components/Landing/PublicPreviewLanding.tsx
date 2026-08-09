import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Lock,
  Sparkles,
  Users,
  BookOpen,
  Calendar,
  ShieldCheck,
  LogIn,
} from 'lucide-react';
import { AuthModal } from '../Auth/AuthModal';
import { RegistroModal } from '../Auth/RegistroModal';

export const PublicPreviewLanding: React.FC = () => {
  const { comunidad, posts, cursos, eventos, setModalRegistroAbierto, modalRegistroAbierto } = useApp();
  const [modalAuth, setModalAuth] = useState(false);

  // Tarea 1: Dejar SOLO el primer post del admin para la gente que no se ha registrado
  const postAdmin = posts.find((p) => p.fijado || p.autor?.rol === 'Admin') || posts[0] || {
    id: 'post-admin-default',
    titulo: 'Bienvenido - Antes que nada leer esto 🔽',
    contenido: 'Esta comunidad fue creada para quienes quieren aprender a operar, gestionar correctamente el riesgo y dejar de depender de señales.\n\nAquí encontrarás formación paso a paso, clases en vivo, análisis de mercado, herramientas prácticas y una comunidad enfocada en mejorar el proceso, no en presumir resultados.\n\n1. Preséntate en la publicación correspondiente.\n2. Consulta el calendario de actividades.\n\nNo necesitas aprenderlo todo en un día. Avanza en orden, practica y aplica cada concepto.',
    categoria: 'Empieza aquí',
    fecha: 'Reciente',
    autor: {
      nombre: 'Andy On Trade',
      avatar: 'https://pkimwppqoujxbntxdzxu.supabase.co/storage/v1/object/public/community_media/avatars/1786162537763_rzy2ou.png',
    },
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-gray-900 flex flex-col font-sans">
      
      {/* Top Visitor Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-xs flex items-center justify-center bg-black shrink-0">
              <img
                src="/raxen-logo.png"
                alt="Raxen Capital"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="font-extrabold text-base text-gray-900 tracking-tight">
                {comunidad.nombre}
              </div>
              <div className="text-xs text-sky-700 font-mono font-bold hidden sm:block">
                https://comunidad.raxen.capital
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setModalAuth(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all flex items-center gap-1.5"
            >
              <LogIn className="w-4 h-4 text-gray-500" />
              <span>Iniciar Sesión</span>
            </button>

            <button
              onClick={() => setModalRegistroAbierto(true)}
              className="px-5 py-2.5 rounded-xl bg-gray-900 text-white font-black text-xs hover:bg-black transition-all shadow-sm flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Unirse a la Comunidad</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Preview Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1">
        
        {/* Hero Preview Card (Raxen Capital con Portada Oficial Clara) */}
        <div className="raxen-card overflow-hidden bg-white shadow-md border border-gray-200">
          {/* Imagen de Portada Real / Banner Oficial */}
          <div className="relative h-52 sm:h-72 md:h-80 w-full overflow-hidden bg-slate-950">
            <img
              src={comunidad.banner}
              alt={comunidad.nombre}
              onError={(e) => {
                e.currentTarget.src = '/raxen-banner.png';
              }}
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* Información de la Comunidad */}
          <div className="p-6 sm:p-8 space-y-5 text-center">
            <div className="max-w-3xl mx-auto space-y-3">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                {comunidad.nombre}
              </h1>
              <p className="text-xs sm:text-sm text-sky-700 font-mono font-bold">
                https://comunidad.raxen.capital
              </p>
              <p className="text-sm text-gray-600 font-normal leading-relaxed max-w-2xl mx-auto">
                {comunidad.descripcion}
              </p>
            </div>

            {/* Stats pill */}
            <div className="flex flex-wrap items-center justify-center gap-6 py-3 border-y border-gray-100 text-xs font-bold text-gray-700">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-sky-600" />
                <span>{comunidad.totalMiembros} Miembros</span>
              </div>
              <div>•</div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{comunidad.enLinea} En línea</span>
              </div>
              <div>•</div>
              <div>{comunidad.administradores} Administrador</div>
              <div>•</div>
              <div className="text-amber-600 font-black">Acceso Oficial</div>
            </div>

            {/* Big CTA */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setModalRegistroAbierto(true)}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gray-900 text-white font-black text-sm shadow-md hover:bg-black transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <span>UNIRSE A LA COMUNIDAD OFICIAL</span>
              </button>

              <button
                onClick={() => setModalAuth(true)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white border border-gray-300 text-gray-800 font-bold text-xs hover:bg-gray-50 transition-all cursor-pointer"
              >
                Ya tengo cuenta / Iniciar Sesión
              </button>
            </div>
          </div>
        </div>

        {/* 2-Column Preview: Left Teaser Feed, Right Course & Live Access */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Locked Feed Teaser - SOLO 1 POST DEL ADMIN */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
                <span>Publicación Principal del Administrador</span>
                <span className="px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 text-[10px] font-bold">
                  Vista Previa
                </span>
              </h2>
            </div>

            {/* Pinned Admin Post Preview */}
            <div className="raxen-card p-6 relative overflow-hidden bg-white shadow-xs">
              {/* Author row */}
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={postAdmin.autor?.avatar}
                  alt={postAdmin.autor?.nombre}
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(postAdmin.autor?.nombre || 'Trader')}&background=0D0D0D&color=38bdf8&size=128`;
                  }}
                  className="w-9 h-9 rounded-full object-cover ring-1 ring-gray-200"
                />
                <div>
                  <div className="font-bold text-xs text-gray-900">{postAdmin.autor?.nombre}</div>
                  <div className="text-[10px] text-gray-500">{postAdmin.fecha} • {postAdmin.categoria}</div>
                </div>
              </div>

              <h3 className="font-extrabold text-base text-gray-900 mb-2">{postAdmin.titulo}</h3>

              <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                {postAdmin.contenido}
              </p>

              {/* Locked Banner Overlay for non-members */}
              <div className="mt-4 p-4 rounded-xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-black text-amber-400 flex items-center justify-center shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-extrabold text-xs text-gray-900">
                      Contenido exclusivo para miembros de {comunidad.nombre}
                    </div>
                    <div className="text-[11px] text-gray-500 font-medium">
                      Regístrate para acceder al Aula, ver gráficos, videos y participar en las discusiones.
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setModalRegistroAbierto(true)}
                  className="px-4 py-2 rounded-xl bg-gray-900 text-white font-black text-xs hover:bg-black transition-all shrink-0"
                >
                  Unirme ahora
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Classroom & Live Session Teaser (1 col) */}
          <div className="space-y-4">
            
            {/* Classroom Preview Card */}
            <div className="raxen-card p-6 bg-white space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>Aula de Trading</span>
                </div>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Formación Práctica
                </span>
              </div>

              <div className="space-y-3">
                {cursos.map((c) => (
                  <div key={c.id} className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center gap-3">
                    <img
                      src={c.imagen}
                      alt={c.titulo}
                      onError={(e) => {
                        e.currentTarget.src = '/raxen-banner.png';
                      }}
                      className="w-14 h-10 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs text-gray-900 truncate">{c.titulo}</div>
                      <div className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
                        <Lock className="w-3 h-3 text-amber-500" />
                        <span>Nivel {c.nivelRequerido}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Live Call Teaser */}
            <div className="raxen-card p-6 bg-white space-y-3 shadow-xs">
              <div className="flex items-center gap-2 font-extrabold text-sm text-gray-900">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>Próxima Sesión en Vivo</span>
              </div>

              {eventos[0] && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 font-medium space-y-1">
                  <div className="font-bold">{eventos[0].titulo}</div>
                  <div className="text-[11px] text-emerald-800">Duración: {eventos[0].duracion} • Transmisión Abierta</div>
                </div>
              )}

              <button
                onClick={() => setModalRegistroAbierto(true)}
                className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-all shadow-xs"
              >
                Acceder a las Sesiones
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Auth & Registration Modals */}
      {modalAuth && <AuthModal onClose={() => setModalAuth(false)} />}
      {modalRegistroAbierto && <RegistroModal onClose={() => setModalRegistroAbierto(false)} />}
    </div>
  );
};
