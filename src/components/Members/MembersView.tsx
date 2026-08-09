import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Users, Search, Flame, Crown, Shield, Star, Zap, UserCheck } from 'lucide-react';
import { MemberProfileModal } from './MemberProfileModal';
import type { Usuario, RolUsuario } from '../../types';

export const MembersView: React.FC = () => {
  const { miembros, usuarioPerfilModal, setUsuarioPerfilModal } = useApp();
  const [filtroRol, setFiltroRol] = useState<string>('Todos');
  const [busquedaMiembro, setBusquedaMiembro] = useState('');

  // Grupos de la base de datos
  const admins = miembros.filter((m) => m.rol === 'Admin');
  const moderadores = miembros.filter((m) => m.rol === 'Moderador');
  const vips = miembros.filter((m) => m.rol === 'VIP');
  const pros = miembros.filter((m) => m.rol === 'Miembro Pro');
  const miembrosGenerales = miembros.filter(
    (m) => m.rol === 'Miembro' || (!['Admin', 'Moderador', 'VIP', 'Miembro Pro'].includes(m.rol))
  );

  // Lista dinámica de pestañas de roles existentes
  const tabsRoles = [
    { id: 'Todos', label: 'Todos', count: miembros.length },
    { id: 'Admin', label: '👑 Administradores', count: admins.length },
    ...(moderadores.length > 0 ? [{ id: 'Moderador', label: '🛡️ Moderadores', count: moderadores.length }] : []),
    ...(vips.length > 0 ? [{ id: 'VIP', label: '⭐ VIP', count: vips.length }] : []),
    ...(pros.length > 0 ? [{ id: 'Miembro Pro', label: '⚡ Pro', count: pros.length }] : []),
    { id: 'Miembro', label: '👥 Miembros', count: miembrosGenerales.length },
  ];

  const filtrarLista = (lista: Usuario[]) => {
    const query = busquedaMiembro.toLowerCase().trim();
    if (!query) return lista;
    return lista.filter(
      (m) =>
        m.nombre.toLowerCase().includes(query) ||
        m.nickname.toLowerCase().includes(query) ||
        m.bio?.toLowerCase().includes(query)
    );
  };

  const badgeRol = (rol: RolUsuario) => {
    switch (rol) {
      case 'Admin':
        return (
          <span className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-extrabold flex items-center gap-1 shadow-2xs">
            <Crown className="w-3 h-3 text-amber-600 fill-amber-500" />
            <span>Admin</span>
          </span>
        );
      case 'Moderador':
        return (
          <span className="px-2.5 py-1 rounded-xl bg-purple-100 text-purple-900 border border-purple-300 text-[11px] font-extrabold flex items-center gap-1 shadow-2xs">
            <Shield className="w-3 h-3 text-purple-600" />
            <span>Moderador</span>
          </span>
        );
      case 'VIP':
        return (
          <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 text-[11px] font-extrabold flex items-center gap-1 shadow-2xs">
            <Star className="w-3 h-3 text-emerald-600 fill-emerald-500" />
            <span>VIP</span>
          </span>
        );
      case 'Miembro Pro':
        return (
          <span className="px-2.5 py-1 rounded-xl bg-blue-100 text-blue-900 border border-blue-300 text-[11px] font-extrabold flex items-center gap-1 shadow-2xs">
            <Zap className="w-3 h-3 text-blue-600 fill-blue-500" />
            <span>Pro</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-bold flex items-center gap-1 shadow-2xs">
            <UserCheck className="w-3 h-3 text-slate-500" />
            <span>Miembro</span>
          </span>
        );
    }
  };

  const renderCardMiembro = (m: Usuario) => {
    const esAdmin = m.rol === 'Admin';

    return (
      <div
        key={m.id}
        onClick={() => setUsuarioPerfilModal(m)}
        className={`glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 border transition-all space-y-3 sm:space-y-4 shadow-xs flex flex-col justify-between cursor-pointer ${
          esAdmin
            ? 'border-amber-300 bg-gradient-to-b from-amber-500/5 via-white to-white hover:border-amber-500 hover:shadow-md'
            : 'border-slate-200 bg-white hover:border-slate-400 hover:shadow-sm'
        }`}
      >
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="relative shrink-0">
                <img
                  src={m.avatar}
                  alt={m.nombre}
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(m.nombre)}&background=0D0D0D&color=38bdf8&size=128`;
                  }}
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl object-cover ring-2 ${
                    esAdmin ? 'ring-amber-400' : 'ring-slate-200'
                  }`}
                />
                {esAdmin && (
                  <div className="absolute -top-1.5 -right-1.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-xs">
                    <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-slate-950" />
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <h3 className="font-extrabold text-sm text-slate-900 truncate flex items-center gap-1.5">
                  <span>{m.nombre}</span>
                </h3>
                <div className="text-xs text-slate-500 font-medium truncate">{m.nickname}</div>
              </div>
            </div>

            <div className="shrink-0">{badgeRol(m.rol)}</div>
          </div>

          {m.bio ? (
            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">
              {m.bio}
            </p>
          ) : (
            <p className="text-xs text-slate-400 italic">Sin biografía</p>
          )}

          {/* Insignias */}
          {m.insignias && m.insignias.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {m.insignias.map((badge) => (
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

        <div className="pt-3 sm:pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 text-xs font-bold text-slate-600">
            <span className="text-amber-800 font-black text-[11px] sm:text-xs">Nv. {m.nivel}</span>
            <span>•</span>
            <span className="text-slate-500 font-medium text-[11px] sm:text-xs">{m.xp} XP</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-orange-700 text-[11px] sm:text-xs">
              <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-orange-500 text-orange-600" /> {m.rachaDias}d
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setUsuarioPerfilModal(m);
            }}
            className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer ${
              esAdmin
                ? 'bg-amber-400 text-slate-950 hover:bg-amber-500 font-black'
                : 'bg-slate-100 text-slate-800 hover:bg-slate-900 hover:text-white'
            }`}
          >
            Ver Perfil
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 animate-in fade-in">
      
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-slate-200 bg-gradient-to-r from-amber-500/10 via-slate-50 to-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 shadow-xs">
        <div className="space-y-1.5 sm:space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
            <Users className="w-3.5 h-3.5" /> Directorio de Miembros
          </div>
          <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Comunidad de Traders AndyOnTrade
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Conecta con administradores, moderadores y traders de la comunidad, revisa sus niveles y bitácoras.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto">
          <div className="flex-1 md:flex-initial p-3 sm:p-4 rounded-2xl bg-white border border-amber-200 text-center shadow-xs">
            <div className="text-xl sm:text-2xl font-black text-amber-700">{admins.length}</div>
            <div className="text-[10px] sm:text-[11px] text-slate-600 font-bold">👑 Admin</div>
          </div>
          <div className="flex-1 md:flex-initial p-3 sm:p-4 rounded-2xl bg-white border border-slate-200 text-center shadow-xs">
            <div className="text-xl sm:text-2xl font-black text-slate-900">{miembros.length}</div>
            <div className="text-[10px] sm:text-[11px] text-slate-600 font-bold">👥 Miembros</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-1">
          {tabsRoles.map((t) => (
            <button
              key={t.id}
              onClick={() => setFiltroRol(t.id)}
              className={`px-3 sm:px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                filtroRol === t.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>{t.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  filtroRol === t.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o nickname..."
            value={busquedaMiembro}
            onChange={(e) => setBusquedaMiembro(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 font-medium shadow-xs"
          />
        </div>
      </div>

      {/* Members Directory Views */}
      {filtroRol === 'Todos' ? (
        <div className="space-y-8">
          {/* SECCIÓN 1: ADMINISTRADORES */}
          {filtrarLista(admins).length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-amber-200">
                <Crown className="w-5 h-5 text-amber-500 fill-amber-400" />
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  Administradores ({filtrarLista(admins).length})
                </h2>
                <span className="text-xs text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  Líderes de la Comunidad
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtrarLista(admins).map(renderCardMiembro)}
              </div>
            </div>
          )}

          {/* SECCIÓN 2: MODERADORES */}
          {filtrarLista(moderadores).length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-purple-200">
                <Shield className="w-5 h-5 text-purple-600" />
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  Moderadores ({filtrarLista(moderadores).length})
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtrarLista(moderadores).map(renderCardMiembro)}
              </div>
            </div>
          )}

          {/* SECCIÓN 3: MIEMBROS VIP / PRO */}
          {[...filtrarLista(vips), ...filtrarLista(pros)].length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-emerald-200">
                <Star className="w-5 h-5 text-emerald-600 fill-emerald-500" />
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  Miembros VIP & Pro ({[...filtrarLista(vips), ...filtrarLista(pros)].length})
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...filtrarLista(vips), ...filtrarLista(pros)].map(renderCardMiembro)}
              </div>
            </div>
          )}

          {/* SECCIÓN 4: MIEMBROS DE LA COMUNIDAD */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <Users className="w-5 h-5 text-slate-700" />
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Miembros de la Comunidad ({filtrarLista(miembrosGenerales).length})
              </h2>
            </div>

            {filtrarLista(miembrosGenerales).length === 0 ? (
              <div className="text-center py-10 bg-white rounded-3xl border border-slate-200 p-6 space-y-2">
                <p className="text-xs text-slate-500 font-medium">No se encontraron miembros con esta búsqueda.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtrarLista(miembrosGenerales).map(renderCardMiembro)}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* VISTA FILTRADA POR ROL ESPECÍFICO */
        <div className="space-y-4">
          {(() => {
            const listaFiltrada = filtrarLista(miembros.filter((m) => m.rol === filtroRol));

            if (listaFiltrada.length === 0) {
              return (
                <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-xl">
                    👥
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900">No hay usuarios en este grupo</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Selecciona otra pestaña o añade miembros a este rol desde el Panel de Administración.
                  </p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {listaFiltrada.map(renderCardMiembro)}
              </div>
            );
          })()}
        </div>
      )}

      {/* Member Profile Drawer Modal */}
      {usuarioPerfilModal && <MemberProfileModal />}
    </div>
  );
};

