import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { CategoriaPost } from '../../types';
import { PostCard } from './PostCard';
import { CreatePostModal } from './CreatePostModal';
import { TradingViewWidget } from '../Trading/TradingViewWidget';
import {
  Trophy,
  Calendar as CalendarIcon,
  Zap,
  Users,
  Plus,
  ArrowRight,
  TrendingUp,
  BarChart3,
} from 'lucide-react';

export const Feed: React.FC = () => {
  const {
    posts,
    categoriaSeleccionada,
    setCategoriaSeleccionada,
    busqueda,
    usuarioActual,
    comunidad,
    niveles,
    eventos,
    miembros,
    setTabActual,
    setUsuarioPerfilModal,
  } = useApp();

  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [mostrarGrafico, setMostrarGrafico] = useState(false);

  const categorias: CategoriaPost[] = [
    'Todos',
    'Anuncios',
    'General',
    'Preguntas y Respuestas',
    'Victorias',
    'Recursos',
    'Feedback',
  ];

  const postsFiltrados = posts.filter((p) => {
    const coincideCategoria =
      categoriaSeleccionada === 'Todos' || p.categoria === categoriaSeleccionada;

    const query = busqueda.toLowerCase().trim();
    const coincideBusqueda =
      !query ||
      p.titulo.toLowerCase().includes(query) ||
      p.contenido.toLowerCase().includes(query) ||
      p.autor.nombre.toLowerCase().includes(query);

    return coincideCategoria && coincideBusqueda;
  });

  const nivelActualInfo = niveles.find((n) => n.nivel === usuarioActual.nivel) || niveles[0];
  const siguienteNivelInfo = niveles.find((n) => n.nivel === usuarioActual.nivel + 1);

  const topMiembros = [...miembros].sort((a, b) => b.xp - a.xp).slice(0, 3);
  const proximoEvento = eventos[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Category Pills & Live Chart Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaSeleccionada(cat)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                categoriaSeleccionada === cat
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <button
          onClick={() => setMostrarGrafico(!mostrarGrafico)}
          className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all border ${
            mostrarGrafico
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
              : 'bg-white border-slate-200 text-emerald-700 hover:bg-emerald-50'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>{mostrarGrafico ? 'Ocultar Gráfico' : 'Ver Gráfico TradingView'}</span>
        </button>
      </div>

      {/* Interactive Candlestick Chart View */}
      {mostrarGrafico && <TradingViewWidget defaultSymbol="FX:EURUSD" />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Feed Column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick Post Prompt Card */}
          <div
            onClick={() => setModalCrearAbierto(true)}
            className="glass-panel rounded-3xl p-4 border border-slate-200 hover:border-amber-400 cursor-pointer transition-all flex items-center gap-4 group shadow-xs"
          >
            <img
              src={usuarioActual.avatar}
              alt={usuarioActual.nombre}
              className="w-10 h-10 rounded-2xl object-cover ring-2 ring-amber-400"
            />
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-500 group-hover:border-slate-300 transition-all flex items-center justify-between">
              <span className="font-medium">¿Qué trade o análisis estás viendo hoy, {usuarioActual.nombre.split(' ')[0]}?</span>
              <span className="px-2.5 py-1 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Publicar (+15 XP)
              </span>
            </div>
          </div>

          {/* Posts List */}
          <div className="space-y-6">
            {postsFiltrados.length === 0 ? (
              <div className="glass-panel rounded-3xl p-12 text-center border border-slate-200">
                <p className="text-sm font-semibold text-slate-600">No se encontraron análisis en esta categoría.</p>
                <button
                  onClick={() => {
                    setCategoriaSeleccionada('Todos');
                    setModalCrearAbierto(true);
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-xs"
                >
                  Sé el primero en publicar un análisis
                </button>
              </div>
            ) : (
              postsFiltrados.map((post) => <PostCard key={post.id} post={post} />)
            )}
          </div>
        </div>

        {/* Right Sidebar Column (1 col) */}
        <div className="space-y-6">
          
          {/* Community Stats Widget */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-200 shadow-xs">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-600" /> Traders en la Comunidad
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-2xl font-black text-slate-900">{comunidad.totalMiembros}</div>
                <div className="text-xs text-slate-600 font-semibold mt-0.5">Traders Totales</div>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                <div className="text-2xl font-black text-emerald-800 flex items-center gap-1">
                  <span>{comunidad.miembrosActivosHoy}</span>
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="text-xs text-emerald-700 font-semibold mt-0.5">Operando Hoy</div>
              </div>
            </div>
          </div>

          {/* Your Level & Perks Widget */}
          <div className="glass-panel rounded-3xl p-6 border border-emerald-200 bg-gradient-to-b from-emerald-50/50 to-white relative overflow-hidden shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-sm">
                  N{usuarioActual.nivel}
                </span>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">{nivelActualInfo.nombre}</h4>
                  <p className="text-xs text-emerald-700 font-bold">{usuarioActual.xp} Puntos XP</p>
                </div>
              </div>
              <Zap className="w-5 h-5 text-emerald-600 animate-pulse" />
            </div>

            {siguienteNivelInfo && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="text-xs font-bold text-slate-600 mb-1">
                  Próximo Desbloqueo (Nivel {siguienteNivelInfo.nivel}: {siguienteNivelInfo.nombre})
                </div>
                <ul className="space-y-1">
                  {siguienteNivelInfo.beneficios.map((b, i) => (
                    <li key={i} className="text-xs text-slate-700 font-medium flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Leaderboard Top Contributors Preview */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-200 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-600" /> Top Traders del Mes
              </h3>
              <button
                onClick={() => setTabActual('leaderboard')}
                className="text-xs font-black text-amber-700 hover:underline flex items-center gap-1"
              >
                Ver todo <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {topMiembros.map((m, idx) => (
                <div
                  key={m.id}
                  onClick={() => setUsuarioPerfilModal(m)}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-black text-xs text-slate-500 w-4 text-center">#{idx + 1}</span>
                    <img
                      src={m.avatar}
                      alt={m.nombre}
                      className="w-8 h-8 rounded-xl object-cover ring-1 ring-slate-200"
                    />
                    <div>
                      <div className="font-bold text-xs text-slate-900">{m.nombre}</div>
                      <div className="text-[10px] text-amber-800 font-bold">Nivel {m.nivel}</div>
                    </div>
                  </div>
                  <div className="text-xs font-black text-slate-800">{m.xp} XP</div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Event Preview */}
          {proximoEvento && (
            <div className="glass-panel rounded-3xl p-6 border border-slate-200 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-amber-600" /> Próxima Sesión en Vivo
                </h3>
              </div>
              <div className="rounded-2xl overflow-hidden border border-slate-200">
                <img
                  src={proximoEvento.banner}
                  alt={proximoEvento.titulo}
                  className="w-full h-28 object-cover"
                />
              </div>
              <h4 className="font-extrabold text-xs text-slate-900 leading-snug">{proximoEvento.titulo}</h4>
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{proximoEvento.descripcion}</p>
              <button
                onClick={() => setTabActual('calendario')}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all shadow-xs"
              >
                Ver en Calendario & RSVP
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create Post Modal */}
      {modalCrearAbierto && <CreatePostModal onClose={() => setModalCrearAbierto(false)} />}
    </div>
  );
};
