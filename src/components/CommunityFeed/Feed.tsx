import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { CategoriaPost } from '../../types';
import { PostCard } from './PostCard';
import { CreatePostModal } from './CreatePostModal';
import { Video, SlidersHorizontal } from 'lucide-react';

export const Feed: React.FC = () => {
  const {
    posts,
    categoriaSeleccionada,
    setCategoriaSeleccionada,
    busqueda,
    usuarioActual,
    comunidad,
    setTabActual,
  } = useApp();

  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);

  const categorias: { id: CategoriaPost; label: string }[] = [
    { id: 'Todos', label: 'Todos' },
    { id: 'General', label: '🟢 General' },
    { id: 'Empieza aquí', label: '📌 Empieza aquí' },
    { id: 'Anuncios', label: '📢 Anuncios' },
    { id: 'Presentaciones', label: '👏 Presentaciones' },
  ];

  const postsFiltrados = posts.filter((p) => {
    const coincideCategoria =
      categoriaSeleccionada === 'Todos' || p.categoria === categoriaSeleccionada;

    const query = busqueda.toLowerCase().trim();
    const coincideBusqueda =
      !query ||
      p.titulo.toLowerCase().includes(query) ||
      p.contenido.toLowerCase().includes(query);

    return coincideCategoria && coincideBusqueda;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left / Main Feed Column (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Top Write Box ("Escribe algo") */}
          <div
            onClick={() => setModalCrearAbierto(true)}
            className="raxen-card p-4 flex items-center justify-between gap-4 cursor-pointer hover:border-gray-300 transition-all"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="relative">
                <img
                  src={usuarioActual.avatar}
                  alt={usuarioActual.nombre}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-black flex items-center justify-center border border-white">
                  {usuarioActual.nivel}
                </span>
              </div>
              <span className="text-gray-400 text-sm font-normal">Escribe algo...</span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setTabActual('calendario');
              }}
              className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 flex items-center gap-1.5 transition-all"
            >
              <Video className="w-4 h-4 text-gray-500" />
              <span>Transmitir en vivo</span>
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-1">
            <div className="flex items-center space-x-2">
              {categorias.map((cat) => {
                const activo = categoriaSeleccionada === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategoriaSeleccionada(cat.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                      activo
                        ? 'bg-gray-700 text-white shadow-xs'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
              <button
                onClick={() => setCategoriaSeleccionada('Todos')}
                className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-gray-300 text-gray-500 hover:text-gray-900"
              >
                Más...
              </button>
            </div>

            <button className="p-2 text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-200">
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Posts List */}
          <div className="space-y-4">
            {postsFiltrados.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>

        {/* Right Sidebar Column (1 col) - Exact Raxen Capital Card */}
        <div className="space-y-4">
          <div className="raxen-card overflow-hidden">
            
            {/* Raxen Capital Banner */}
            <div className="relative bg-black p-6 text-center text-white overflow-hidden">
              <div className="flex items-center justify-center gap-3 py-4">
                <span className="text-4xl font-black text-sky-500 tracking-tighter">R</span>
                <div className="text-left">
                  <div className="text-xl font-black tracking-wider text-white">RAXEN</div>
                  <div className="text-[9px] text-gray-400 tracking-widest uppercase">CAPITAL</div>
                  <div className="text-[10px] text-sky-400 font-semibold mt-0.5">{comunidad.tagline}</div>
                </div>
              </div>

              <div className="text-[9px] text-gray-400 font-mono tracking-tight">
                {comunidad.subtitulo}
              </div>
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
              <div className="grid grid-cols-3 gap-2 py-3 border-y border-gray-100 text-center">
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

              {/* Creator Circle Avatar */}
              <div className="flex items-center gap-2">
                <img
                  src={comunidad.creador.avatar}
                  alt={comunidad.creador.nombre}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="text-xs font-bold text-gray-900">{comunidad.creador.nombre}</div>
              </div>

              {/* Configuration Button */}
              <button
                onClick={() => setTabActual('configuracion')}
                className="w-full py-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 font-bold text-xs uppercase tracking-wider transition-all"
              >
                CONFIGURACIÓN
              </button>
            </div>
          </div>
        </div>
      </div>

      {modalCrearAbierto && <CreatePostModal onClose={() => setModalCrearAbierto(false)} />}
    </div>
  );
};
