import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MemberProfileModal } from './MemberProfileModal';
import { Users, Flame, Zap, MessageSquare } from 'lucide-react';

export const MembersView: React.FC = () => {
  const { miembros, busqueda, setUsuarioPerfilModal, setUsuarioChatActivo, setDmDrawerAbierto } = useApp();
  const [rolFiltro, setRolFiltro] = useState<string>('Todos');

  const roles: string[] = ['Todos', 'Admin', 'Moderador', 'VIP', 'Miembro Pro', 'Miembro'];

  const miembrosFiltrados = miembros.filter((m) => {
    const coincideRol = rolFiltro === 'Todos' || m.rol === rolFiltro;
    const query = busqueda.toLowerCase().trim();
    const coincideBusqueda =
      !query ||
      m.nombre.toLowerCase().includes(query) ||
      m.nickname.toLowerCase().includes(query) ||
      m.bio.toLowerCase().includes(query);

    return coincideRol && coincideBusqueda;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <Users className="w-7 h-7 text-amber-400" /> Directorio de Miembros ({miembros.length})
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Conoce a los creadores, emprendedores y mentores que forman parte de la comunidad.
          </p>
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar">
          {roles.map((rol) => (
            <button
              key={rol}
              onClick={() => setRolFiltro(rol)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                rolFiltro === rol
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              {rol}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {miembrosFiltrados.map((m) => (
          <div
            key={m.id}
            className="glass-panel rounded-3xl p-6 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 shadow-xl"
          >
            <div className="flex items-start gap-4">
              <img
                src={m.avatar}
                alt={m.nombre}
                onClick={() => setUsuarioPerfilModal(m)}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-800 cursor-pointer hover:ring-amber-500 transition-all"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3
                    onClick={() => setUsuarioPerfilModal(m)}
                    className="font-extrabold text-sm text-white truncate cursor-pointer hover:underline"
                  >
                    {m.nombre}
                  </h3>
                </div>
                <div className="text-xs text-slate-400 font-mono truncate">{m.nickname}</div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-black">
                    Nivel {m.nivel}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-slate-900 text-slate-300 text-[10px] font-bold">
                    {m.rol}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{m.bio}</p>

            <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-800">
              <div className="flex items-center gap-3 font-bold">
                <span className="flex items-center gap-1 text-amber-400">
                  <Zap className="w-3.5 h-3.5" /> {m.xp} XP
                </span>
                <span className="flex items-center gap-1 text-orange-400">
                  <Flame className="w-3.5 h-3.5" /> {m.rachaDias} d
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setUsuarioChatActivo(m);
                    setDmDrawerAbierto(true);
                  }}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 transition-all"
                  title="Enviar DM"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setUsuarioPerfilModal(m)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 hover:text-white hover:border-slate-700 transition-all"
                >
                  Ver Perfil
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <MemberProfileModal />
    </div>
  );
};
