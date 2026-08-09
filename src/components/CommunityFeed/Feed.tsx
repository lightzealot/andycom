import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { CategoriaPost } from '../../types';
import { PostCard } from './PostCard';
import { CreatePostModal } from './CreatePostModal';
import { CategoryManagerModal } from './CategoryManagerModal';
import { Video, SlidersHorizontal } from 'lucide-react';

export const Feed: React.FC = () => {
  const {
    posts,
    categoriaSeleccionada,
    setCategoriaSeleccionada,
    categoriasLista,
    busqueda,
    usuarioActual,
    comunidad,
    setTabActual,
  } = useApp();

  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [modalGestionarCategorias, setModalGestionarCategorias] = useState(false);

  // Helper para asignar emojis y badges estilizados
  const getCategoryIcon = (nombre: string) => {
    const n = nombre.toLowerCase();
    if (n === 'todos') return '✨';
    if (n.includes('general')) return '💬';
    if (n.includes('empieza') || n.includes('inicio') || n.includes('bienvenid')) return '📌';
    if (n.includes('análisis') || n.includes('mercado') || n.includes('trading')) return '📈';
    if (n.includes('anuncio') || n.includes('noticia')) return '📢';
    if (n.includes('presentaci')) return '👏';
    if (n.includes('crypto') || n.includes('bitcoin') || n.includes('btc')) return '₿';
    if (n.includes('forex') || n.includes('divisas')) return '💱';
    if (n.includes('psicolog') || n.includes('mente')) return '🧠';
    if (n.includes('resultado') || n.includes('ganancia') || n.includes('profit')) return '🏆';
    if (n.includes('duda') || n.includes('pregunta')) return '❓';
    return '🏷️';
  };

  const todasLasCategorias = ['Todos', ...categoriasLista];

  const postsFiltrados = posts.filter((p) => {
    const coincideCategoria =
      categoriaSeleccionada === 'Todos' ||
      p.categoria === categoriaSeleccionada ||
      (!p.categoria && categoriaSeleccionada === 'General');

    const query = busqueda.toLowerCase().trim();
    const coincideBusqueda =
      !query ||
      p.titulo.toLowerCase().includes(query) ||
      p.contenido.toLowerCase().includes(query) ||
      p.autor?.nombre?.toLowerCase().includes(query);

    return coincideCategoria && coincideBusqueda;
  });

  // ORDENAMIENTO EN EL FEED:
  // 1. Posts fijados (p.fijado === true) SIEMPRE ARRIBA DE TODO.
  // 2. Posts nuevos SIEMPRE ARRIBA de los más antiguos.
  const postsOrdenados = [...postsFiltrados].sort((a, b) => {
    if (a.fijado && !b.fijado) return -1;
    if (!a.fijado && b.fijado) return 1;
    return 0; // mantener orden de llegada / más reciente primero
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left / Main Feed Column (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Top Write Box ("Escribe algo") */}
          <div
            onClick={() => setModalCrearAbierto(true)}
            className="raxen-card p-4 flex items-center justify-between gap-4 cursor-pointer hover:border-gray-300 transition-all bg-white"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="relative">
                <img
                  src={usuarioActual.avatar}
                  alt={usuarioActual.nombre}
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(usuarioActual.nombre)}&background=0D0D0D&color=38bdf8&size=128`;
                  }}
                  className="w-10 h-10 rounded-full object-cover ring-1 ring-gray-200"
                />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-black flex items-center justify-center border border-white">
                  {usuarioActual.nivel}
                </span>
              </div>
              <span className="text-gray-400 text-sm font-normal">Escribe algo o arrastra una imagen/video...</span>
            </div>

            {/* Solo los administradores pueden ver el botón de transmitir en vivo */}
            {usuarioActual.rol === 'Admin' ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setTabActual('calendario');
                }}
                className="px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 text-xs font-bold hover:bg-amber-100 flex items-center gap-1.5 transition-all"
              >
                <Video className="w-4 h-4 text-amber-600" />
                <span>Transmitir en vivo (Admin)</span>
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setModalCrearAbierto(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-black flex items-center gap-1.5 transition-all shadow-xs"
              >
                <span>✍️ Crear Publicación</span>
              </button>
            )}
          </div>

          {/* Category Filter Pills Bar with Flex Wrap (Salto de línea automático) */}
          <div className="flex flex-wrap items-center gap-2 py-1">
            {todasLasCategorias.map((catNombre) => {
              const activo = categoriaSeleccionada === catNombre;
              const count =
                catNombre === 'Todos'
                  ? posts.length
                  : posts.filter((p) => p.categoria === catNombre || (!p.categoria && catNombre === 'General')).length;

              return (
                <button
                  key={catNombre}
                  onClick={() => setCategoriaSeleccionada(catNombre as CategoriaPost)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer ${
                    activo
                      ? 'bg-gray-900 text-white ring-1 ring-gray-900'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <span>{getCategoryIcon(catNombre)}</span>
                  <span>{catNombre}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                      activo ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}

            {/* Admin Category Manager Trigger */}
            {usuarioActual.rol === 'Admin' && (
              <button
                onClick={() => setModalGestionarCategorias(true)}
                className="px-3 py-1.5 rounded-full border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                title="Administrar categorías del feed (Crear o Eliminar)"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" />
                <span>Gestionar</span>
              </button>
            )}
          </div>

          {/* Posts List */}
          <div className="space-y-4">
            {postsOrdenados.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>

        {/* Right Sidebar Column (1 col) - Exact Raxen Capital Card */}
        <div className="space-y-4">
          <div className="raxen-card overflow-hidden bg-white">
            
            {/* Raxen Capital Banner Image */}
            <div className="relative h-44 sm:h-48 overflow-hidden bg-slate-950">
              <img
                src={comunidad.banner}
                alt={comunidad.nombre}
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=1200';
                }}
                className="w-full h-full object-cover object-center"
              />
            </div>

            {/* Community Info Body */}
            <div className="p-6 space-y-4">
              <div>
                <h2 className="font-extrabold text-base text-gray-900 leading-tight">
                  {comunidad.nombre}
                </h2>
                <div className="text-xs text-sky-700 font-mono font-bold mt-0.5">comunidad.raxen.capital</div>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed font-normal">
                {comunidad.descripcion}
              </p>

              {/* Members Metrics Stats Row */}
              <div className="grid grid-cols-3 gap-2 py-3 border-t border-gray-100 text-center">
                <div>
                  <div className="text-lg font-extrabold text-gray-900">{comunidad.totalMiembros}</div>
                  <div className="text-[11px] text-gray-500 font-medium">Miembros</div>
                </div>
                <div>
                  <div className="text-lg font-extrabold text-gray-900">{comunidad.enLinea}</div>
                  <div className="text-[11px] text-gray-500 font-medium">En línea</div>
                </div>
                <div>
                  <div className="text-lg font-extrabold text-gray-900">{comunidad.administradores}</div>
                  <div className="text-[11px] text-gray-500 font-medium">Administrador</div>
                </div>
              </div>

              {/* Configuration Button ONLY for Admins */}
              {usuarioActual.rol === 'Admin' && (
                <button
                  onClick={() => setTabActual('configuracion')}
                  className="w-full py-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 font-bold text-xs uppercase tracking-wider transition-all"
                >
                  CONFIGURACIÓN (ADMIN)
                </button>
              )}
            </div>
          </div>

          {/* Gamification & Quests Widget */}
          <div className="raxen-card p-5 bg-white space-y-4 border border-amber-200/60 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚡</span>
                <h3 className="font-extrabold text-sm text-gray-900">Tu Nivel & Gamificación</h3>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-xs font-black">
                Nivel {usuarioActual.nivel}
              </span>
            </div>

            {/* XP Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-gray-600">
                <span>{usuarioActual.xp} XP Acumulados</span>
                <span>
                  {(() => {
                    const metas = [0, 100, 250, 500, 1000, 2000, 3500, 5000, 7500, 10000];
                    return `Meta: ${metas[usuarioActual.nivel] || 100} XP`;
                  })()}
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden">
                {(() => {
                  const metas = [0, 100, 250, 500, 1000, 2000, 3500, 5000, 7500, 10000];
                  const metaActual = metas[usuarioActual.nivel] || 100;
                  const metaPrevia = metas[usuarioActual.nivel - 1] || 0;
                  const pct = Math.min(100, Math.max(5, Math.round(((usuarioActual.xp - metaPrevia) / (metaActual - metaPrevia)) * 100)));
                  return (
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  );
                })()}
              </div>
            </div>

            {/* Badges */}
            {usuarioActual.insignias && usuarioActual.insignias.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Insignias Ganadas</div>
                <div className="flex flex-wrap gap-1.5">
                  {(usuarioActual.insignias || []).map((insignia, idx) => {
                    const id = typeof insignia === 'string' ? insignia : (insignia.id || `ins-${idx}`);
                    const label = typeof insignia === 'string' ? insignia : `${insignia.icono || '🏅'} ${insignia.nombre}`;
                    return (
                      <span
                        key={id}
                        className="px-2 py-0.5 rounded-full bg-slate-900 text-amber-300 text-[10px] font-bold shadow-2xs"
                      >
                        {label}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Daily Quests to earn XP */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Misiones para ganar XP</div>
              <div className="space-y-1.5 text-xs text-gray-700">
                <div
                  onClick={() => setModalCrearAbierto(true)}
                  className="p-2 rounded-xl bg-gray-50 hover:bg-amber-50/60 border border-gray-200/70 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-1.5 font-medium">
                    <span>✍️</span>
                    <span>Publicar un análisis en el Feed</span>
                  </div>
                  <span className="font-black text-amber-600 text-[11px]">+15 XP</span>
                </div>

                <div
                  onClick={() => setTabActual('aula')}
                  className="p-2 rounded-xl bg-gray-50 hover:bg-amber-50/60 border border-gray-200/70 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-1.5 font-medium">
                    <span>🎓</span>
                    <span>Completar lección en el Aula</span>
                  </div>
                  <span className="font-black text-amber-600 text-[11px]">+25 XP</span>
                </div>

                <div
                  onClick={() => setTabActual('calendario')}
                  className="p-2 rounded-xl bg-gray-50 hover:bg-amber-50/60 border border-gray-200/70 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-1.5 font-medium">
                    <span>🔴</span>
                    <span>Confirmar asistencia a sesión en vivo</span>
                  </div>
                  <span className="font-black text-amber-600 text-[11px]">+15 XP</span>
                </div>
              </div>

              <button
                onClick={() => setTabActual('clasificacion')}
                className="w-full mt-2 py-2 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>🏆 Ver Tabla de Clasificación</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {modalCrearAbierto && <CreatePostModal onClose={() => setModalCrearAbierto(false)} />}
      {modalGestionarCategorias && (
        <CategoryManagerModal onClose={() => setModalGestionarCategorias(false)} />
      )}
    </div>
  );
};
