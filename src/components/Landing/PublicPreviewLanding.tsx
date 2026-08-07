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

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-gray-900 flex flex-col font-sans">
      
      {/* Top Visitor Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shadow-xs">
              <span className="text-xl font-black text-sky-500 tracking-tighter">R</span>
            </div>
            <div>
              <div className="font-extrabold text-base text-gray-900 tracking-tight">
                {comunidad.nombre}
              </div>
              <div className="text-xs text-gray-500 font-mono hidden sm:block">{comunidad.urlSkool}</div>
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
              <span>Unirse a la comunidad (Gratis)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Preview Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1">
        
        {/* Hero Preview Card (Raxen Capital) */}
        <div className="skool-card overflow-hidden bg-white shadow-sm border border-gray-200">
          <div className="relative bg-black p-8 sm:p-12 text-center text-white">
            <div className="absolute top-4 right-4 px-3 py-1 bg-amber-400 text-black text-[10px] font-black uppercase tracking-wider rounded-md rotate-3 shadow-xs">
              powered by skool
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              <div className="flex items-center justify-center gap-3">
                <span className="text-5xl font-black text-sky-500 tracking-tighter">R</span>
                <div className="text-left">
                  <div className="text-3xl font-black tracking-wider text-white">RAXEN</div>
                  <div className="text-xs text-gray-400 tracking-widest uppercase">CAPITAL</div>
                </div>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                {comunidad.nombre}
              </h1>

              <p className="text-sm sm:text-base text-gray-300 font-medium max-w-2xl mx-auto leading-relaxed">
                {comunidad.descripcion}
              </p>

              {/* Stats pill */}
              <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs font-bold text-gray-300">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-sky-400" />
                  <span>{comunidad.totalMiembros} Miembros</span>
                </div>
                <div>•</div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{comunidad.enLinea} En línea</span>
                </div>
                <div>•</div>
                <div>{comunidad.administradores} Administrador</div>
                <div>•</div>
                <div className="text-amber-400 font-black">100% Gratuito</div>
              </div>

              {/* Big CTA */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => setModalRegistroAbierto(true)}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 text-black font-black text-sm shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>UNIRSE A LA COMUNIDAD (GRATIS)</span>
                </button>

                <button
                  onClick={() => setModalAuth(true)}
                  className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white/10 text-white font-bold text-xs hover:bg-white/20 transition-all border border-white/20"
                >
                  ¿Ya tienes cuenta? Inicia Sesión
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Preview: Left Teaser Feed, Right Course & Live Access */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Locked Feed Teaser (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
                <span>Últimas Publicaciones & Análisis</span>
                <span className="px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 text-[10px] font-bold">
                  Vista Previa
                </span>
              </h2>
            </div>

            {/* Pinned Post Preview with Locked Overlay */}
            {posts.slice(0, 2).map((post, idx) => (
              <div key={post.id} className="skool-card p-6 relative overflow-hidden bg-white">
                
                {/* Author row */}
                <div className="flex items-center gap-3 mb-3">
                  <img src={post.autor.avatar} alt={post.autor.nombre} className="w-9 h-9 rounded-full object-cover ring-1 ring-gray-200" />
                  <div>
                    <div className="font-bold text-xs text-gray-900">{post.autor.nombre}</div>
                    <div className="text-[10px] text-gray-500">{post.fecha} • {post.categoria}</div>
                  </div>
                </div>

                <h3 className="font-extrabold text-base text-gray-900 mb-2">{post.titulo}</h3>

                {idx === 0 ? (
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {post.contenido}
                  </p>
                ) : (
                  <p className="text-xs text-gray-600 line-clamp-1 blur-xs select-none">
                    {post.contenido}
                  </p>
                )}

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
                        Regístrate gratis para ver gráficos, videos y participar en las discusiones.
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setModalRegistroAbierto(true)}
                    className="px-4 py-2 rounded-xl bg-gray-900 text-white font-black text-xs hover:bg-black transition-all shrink-0"
                  >
                    Unirme gratis
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Classroom & Live Session Teaser (1 col) */}
          <div className="space-y-4">
            
            {/* Classroom Preview Card */}
            <div className="skool-card p-6 bg-white space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>Aula de Trading</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Acceso Gratuito
                </span>
              </div>

              <div className="space-y-3">
                {cursos.map((c) => (
                  <div key={c.id} className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center gap-3">
                    <img src={c.imagen} alt={c.titulo} className="w-14 h-10 rounded-lg object-cover" />
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
            <div className="skool-card p-6 bg-white space-y-3">
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
                Unirme gratis para asistir
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
