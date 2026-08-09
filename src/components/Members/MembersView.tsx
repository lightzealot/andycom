import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Users, Search, Flame } from 'lucide-react';
import { MemberProfileModal } from './MemberProfileModal';

export const MembersView: React.FC = () => {
  const { miembros, usuarioPerfilModal, setUsuarioPerfilModal } = useApp();
  const [filtroRol, setFiltroRol] = useState<string>('Todos');
  const [busquedaMiembro, setBusquedaMiembro] = useState('');

  const roles = ['Todos', 'Admin', 'Moderador', 'VIP', 'Miembro Pro', 'Miembro'];

  const miembrosFiltrados = miembros.filter((m) => {
    const coincideRol = filtroRol === 'Todos' || m.rol === filtroRol;
    const query = busquedaMiembro.toLowerCase().trim();
    const coincideTexto =
      !query ||
      m.nombre.toLowerCase().includes(query) ||
      m.nickname.toLowerCase().includes(query) ||
      m.bio?.toLowerCase().includes(query);

    return coincideRol && coincideTexto;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-8 border border-slate-200 bg-gradient-to-r from-amber-500/10 via-slate-50 to-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-wider">
            <Users className="w-3.5 h-3.5" /> Directorio de Miembros
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Comunidad de Traders andyontrade
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Conecta con otros traders, revisa sus insignias, nivel de experiencia y bitácoras de trading.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center shadow-xs">
          <div className="text-3xl font-black text-amber-700">{miembros.length}</div>
          <div className="text-xs text-slate-600 font-bold">Traders Registrados</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => setFiltroRol(r)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                filtroRol === r
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o activo..."
            value={busquedaMiembro}
            onChange={(e) => setBusquedaMiembro(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 font-medium shadow-xs"
          />
        </div>
      </div>

      {/* Members Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {miembrosFiltrados.map((m) => (
          <div
            key={m.id}
            onClick={() => setUsuarioPerfilModal(m)}
            className="glass-panel rounded-3xl p-6 border border-slate-200 hover:border-amber-400 cursor-pointer transition-all space-y-4 shadow-xs bg-white flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={m.avatar}
                    alt={m.nombre}
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(m.nombre)}&background=0D0D0D&color=38bdf8&size=128`;
                    }}
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-200"
                  />
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">{m.nombre}</h3>
                    <div className="text-xs text-slate-500 font-medium">{m.nickname}</div>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold">
                  {m.rol}
                </span>
              </div>

              {m.bio && (
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">
                  {m.bio}
                </p>
              )}

              {/* Badges preview */}
              {m.insignias && m.insignias.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(m.insignias || []).map((badge) => (
                    <span
                      key={badge.id}
                      className="px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-200 text-[10px] font-bold text-amber-900 flex items-center gap-1"
                    >
                      <span>{badge.icono}</span>
                      <span>{badge.nombre}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                <span className="text-amber-800 font-black">Nivel {m.nivel}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-orange-700">
                  <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-600" /> {m.rachaDias} d
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setUsuarioPerfilModal(m);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-800 hover:bg-amber-500 hover:text-slate-950 text-xs font-bold transition-all shadow-xs"
              >
                Ver Perfil
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Member Profile Drawer Modal */}
      {usuarioPerfilModal && <MemberProfileModal />}
    </div>
  );
};
