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
    miembros,
    setTabActual,
  } = useApp();

  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [modalGestionarCategorias, setModalGestionarCategorias] = useState(false);

  // Helper para renderizar medallas de clasificación (1, 2, 3) y números (4, 5)
  const renderMedallaRango = (pos: number) => {
    if (pos === 1) {
      return (
        <div className="relative flex flex-col items-center justify-center w-6 shrink-0">
          <div className="w-5 h-5 rounded-full bg-[#f6c244] text-white font-black text-[11px] flex items-center justify-center shadow-xs">
            1
          </div>
          <div className="w-2 h-1 bg-[#e0aa26]" style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} />
        </div>
      );
    }
    if (pos === 2) {
      return (
        <div className="relative flex flex-col items-center justify-center w-6 shrink-0">
          <div className="w-5 h-5 rounded-full bg-[#9ca3af] text-white font-black text-[11px] flex items-center justify-center shadow-xs">
            2
          </div>
          <div className="w-2 h-1 bg-[#6b7280]" style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} />
        </div>
      );
    }
    if (pos === 3) {
      return (
        <div className="relative flex flex-col items-center justify-center w-6 shrink-0">
          <div className="w-5 h-5 rounded-full bg-[#c07a4a] text-white font-black text-[11px] flex items-center justify-center shadow-xs">
            3
          </div>
          <div className="w-2 h-1 bg-[#9c5a2c]" style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} />
        </div>
      );
    }
    return (
      <div className="w-6 text-center font-bold text-gray-400 text-xs shrink-0">
        {pos}
      </div>
    );
  };

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
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Left / Main Feed Column (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Top Write Box ("Escribe algo") */}
          <div
            onClick={() => setModalCrearAbierto(true)}
            className="raxen-card p-3 sm:p-4 rounded-2xl sm:rounded-3xl flex items-center justify-between gap-3 sm:gap-4 cursor-pointer hover:border-gray-300 transition-all bg-white"
          >
            <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
              <div className="relative shrink-0">
                <img
                  src={usuarioActual.avatar}
                  alt={usuarioActual.nombre}
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(usuarioActual.nombre)}&background=0D0D0D&color=38bdf8&size=128`;
                  }}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ring-1 ring-gray-200"
                />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-black flex items-center justify-center border border-white">
                  {usuarioActual.nivel}
                </span>
              </div>
              <span className="text-gray-400 text-xs sm:text-sm font-normal truncate">
                Escribe algo o comparte tu análisis...
              </span>
            </div>

            {/* Solo los administradores pueden ver el botón de transmitir en vivo */}
            {usuarioActual.rol === 'Admin' ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setTabActual('calendario');
                }}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 text-xs font-bold hover:bg-amber-100 flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
              >
                <Video className="w-4 h-4 text-amber-600" />
                <span className="hidden sm:inline">Transmitir en vivo (Admin)</span>
                <span className="sm:hidden">En Vivo</span>
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setModalCrearAbierto(true);
                }}
                className="px-3 sm:px-3.5 py-1.5 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-black flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer"
              >
                <span>✍️</span>
                <span className="hidden sm:inline">Crear Publicación</span>
                <span className="sm:hidden">Publicar</span>
              </button>
            )}
          </div>

          {/* Category Filter Pills Bar (Smooth horizontal swipe on mobile, wrap on desktop) */}
          <div className="flex items-center gap-1.5 sm:gap-2 py-1 overflow-x-auto no-scrollbar pb-1 sm:pb-0 sm:flex-wrap">
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
                  className={`px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer shrink-0 ${
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
                className="px-3 py-1.5 rounded-full border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer shrink-0"
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
                  e.currentTarget.src = '/raxen-banner.png';
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

          {/* Clasificación (30 días) Widget - Con datos reales */}
          <div className="raxen-card p-5 bg-white border border-gray-200 shadow-xs rounded-2xl space-y-4">
            <h3 className="font-extrabold text-sm text-gray-900">
              Clasificación (30 días)
            </h3>

            {/* Ranking List Top 5 */}
            <div className="space-y-3">
              {(() => {
                const topMiembros = [...miembros]
                  .sort((a, b) => (b.xp || 0) - (a.xp || 0))
                  .slice(0, 5);

                if (topMiembros.length === 0) {
                  return (
                    <div className="text-center py-4 text-xs text-gray-400">
                      No hay miembros clasificados aún.
                    </div>
                  );
                }

                return topMiembros.map((m, idx) => {
                  const pos = idx + 1;
                  const tieneRacha = (m.rachaDias && m.rachaDias > 1) || (m.xp || 0) > 20;

                  return (
                    <div
                      key={m.id || idx}
                      onClick={() => setTabActual('clasificacion')}
                      className="flex items-center justify-between gap-3 p-1 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      {/* Posición / Medalla */}
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {renderMedallaRango(pos)}

                        {/* Avatar */}
                        <img
                          src={m.avatar}
                          alt={m.nombre}
                          onError={(e) => {
                            e.currentTarget.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(m.nombre)}`;
                          }}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-gray-200 shrink-0"
                        />

                        {/* Nombre + Fuego */}
                        <div className="flex items-center gap-1 min-w-0 flex-1 truncate">
                          <span className="font-medium text-xs text-gray-900 truncate">
                            {m.nombre}
                          </span>
                          {tieneRacha && (
                            <span className="text-xs shrink-0" title="Racha activa">
                              🔥
                            </span>
                          )}
                        </div>
                      </div>

                      {/* XP */}
                      <span className="font-bold text-xs text-blue-600 shrink-0 font-mono">
                        +{m.xp || 0}
                      </span>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Footer Link */}
            <div className="pt-3 border-t border-gray-100 text-center">
              <button
                onClick={() => setTabActual('clasificacion')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
              >
                Ver todas las clasificaciones
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
