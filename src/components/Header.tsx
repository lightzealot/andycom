import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { TabType } from '../types';
import { RegistroModal } from './Auth/RegistroModal';
import {
  MessageSquare,
  Bell,
  Flame,
  Search,
  Trophy,
  BookOpen,
  Users,
  Calendar as CalendarIcon,
  Info,
  ShieldCheck,
  Zap,
  CheckCheck,
  X,
  ToggleLeft,
  ToggleRight,
  UserPlus,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    tabActual,
    setTabActual,
    usuarioActual,
    comunidad,
    niveles,
    busqueda,
    setBusqueda,
    notificaciones,
    marcarNotificacionesLeidas,
    dmDrawerAbierto,
    setDmDrawerAbierto,
    setUsuarioPerfilModal,
    modoVistaAdmin,
    setModoVistaAdmin,
    modalRegistroAbierto,
    setModalRegistroAbierto,
  } = useApp();

  const [notifMenuAbierto, setNotifMenuAbierto] = useState(false);

  const nivelActualInfo = niveles.find((n) => n.nivel === usuarioActual.nivel) || niveles[0];
  const siguienteNivelInfo = niveles.find((n) => n.nivel === usuarioActual.nivel + 1);
  
  const xpBase = nivelActualInfo.xpRequerido;
  const xpMeta = siguienteNivelInfo ? siguienteNivelInfo.xpRequerido : xpBase + 5000;
  const xpEnNivel = usuarioActual.xp - xpBase;
  const xpRequeridoEnNivel = xpMeta - xpBase;
  const porcentajeXP = Math.min(100, Math.max(0, Math.round((xpEnNivel / xpRequeridoEnNivel) * 100)));

  const notificacionesNoLeidas = notificaciones.filter((n) => !n.leida).length;

  const pestañas: { id: TabType; label: string; icono: React.ReactNode }[] = [
    { id: 'comunidad', label: 'Comunidad', icono: <MessageSquare className="w-4 h-4" /> },
    { id: 'classroom', label: 'Classroom', icono: <BookOpen className="w-4 h-4" /> },
    { id: 'calendario', label: 'Calendario', icono: <CalendarIcon className="w-4 h-4" /> },
    { id: 'leaderboard', label: 'Leaderboard', icono: <Trophy className="w-4 h-4" /> },
    { id: 'miembros', label: 'Miembros', icono: <Users className="w-4 h-4" /> },
    { id: 'about', label: 'Acerca de', icono: <Info className="w-4 h-4" /> },
    ...(modoVistaAdmin
      ? [{ id: 'admin' as TabType, label: 'Admin Studio', icono: <ShieldCheck className="w-4 h-4" /> }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-xl font-bold text-slate-950 shadow-md">
              {comunidad.logo}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg text-slate-900 tracking-tight">{comunidad.nombre}</span>
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  {modoVistaAdmin ? 'Admin' : 'Alumno N1'}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium hidden sm:block truncate max-w-xs">{comunidad.tagline}</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar publicaciones, análisis, lecciones..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-slate-100 border border-slate-200 rounded-full text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all font-medium"
              />
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            
            {/* Join / Signup Button */}
            <button
              onClick={() => setModalRegistroAbierto(true)}
              className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-xs hover:scale-105 transition-all"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Inscribirse (+50 XP)</span>
            </button>

            {/* View Mode Switcher */}
            <button
              onClick={() => setModoVistaAdmin(!modoVistaAdmin)}
              title="Alternar entre modo Admin y modo Alumno"
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black transition-all border ${
                modoVistaAdmin
                  ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                  : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
              }`}
            >
              {modoVistaAdmin ? (
                <>
                  <ToggleRight className="w-4 h-4" />
                  <span>Modo Admin</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-4 h-4" />
                  <span>Modo Alumno</span>
                </>
              )}
            </button>

            {/* Streak */}
            <div
              title={`¡${usuarioActual.rachaDias} días seguidos en la comunidad!`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-black shadow-xs"
            >
              <Flame className="w-4 h-4 fill-orange-500 text-orange-600" />
              <span>{usuarioActual.rachaDias} d</span>
            </div>

            {/* XP progress */}
            <div
              onClick={() => setTabActual('leaderboard')}
              className="hidden lg:flex items-center gap-3 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-400 cursor-pointer transition-all shadow-xs"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 text-xs font-black flex items-center justify-center">
                  N{usuarioActual.nivel}
                </span>
                <div className="text-left">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-600">
                    {nivelActualInfo.nombre}
                  </div>
                  <div className="text-xs font-black text-amber-700 flex items-center gap-1">
                    <Zap className="w-3 h-3 fill-amber-500 text-amber-600" />
                    <span>{usuarioActual.xp} XP</span>
                  </div>
                </div>
              </div>

              <div className="w-20">
                <div className="flex justify-between text-[10px] text-slate-600 font-bold mb-0.5">
                  <span>{porcentajeXP}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${porcentajeXP}%` }}
                  />
                </div>
              </div>
            </div>

            {/* DMs */}
            <button
              onClick={() => setDmDrawerAbierto(!dmDrawerAbierto)}
              className="relative p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200 transition-all"
              title="Mensajes Directos"
            >
              <MessageSquare className="w-5 h-5" />
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotifMenuAbierto(!notifMenuAbierto)}
                className="relative p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200 transition-all"
                title="Notificaciones"
              >
                <Bell className="w-5 h-5" />
                {notificacionesNoLeidas > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center shadow-xs">
                    {notificacionesNoLeidas}
                  </span>
                )}
              </button>

              {notifMenuAbierto && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl p-4 border border-slate-200 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                      <Bell className="w-4 h-4 text-amber-600" /> Notificaciones
                    </h3>
                    <div className="flex items-center gap-2">
                      {notificacionesNoLeidas > 0 && (
                        <button
                          onClick={marcarNotificacionesLeidas}
                          className="text-xs text-amber-700 font-bold hover:underline flex items-center gap-1"
                        >
                          <CheckCheck className="w-3.5 h-3.5" /> Leer todas
                        </button>
                      )}
                      <button
                        onClick={() => setNotifMenuAbierto(false)}
                        className="text-slate-400 hover:text-slate-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2 max-h-80 overflow-y-auto pr-1">
                    {notificaciones.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-4">No tienes notificaciones por el momento.</p>
                    ) : (
                      notificaciones.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            if (notif.enlaceTab) setTabActual(notif.enlaceTab);
                            setNotifMenuAbierto(false);
                          }}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                            notif.leida
                              ? 'bg-slate-50 border-slate-200 text-slate-600'
                              : 'bg-amber-50/80 border-amber-200 text-slate-900 font-semibold'
                          } hover:border-amber-400`}
                        >
                          <div className="font-bold text-slate-900 mb-0.5">{notif.titulo}</div>
                          <p className="text-slate-700 leading-relaxed mb-1">{notif.mensaje}</p>
                          <span className="text-[10px] text-slate-400 font-mono">{notif.fecha}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar Button */}
            <button
              onClick={() => setUsuarioPerfilModal(usuarioActual)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200"
            >
              <img
                src={usuarioActual.avatar}
                alt={usuarioActual.nombre}
                className="w-9 h-9 rounded-xl object-cover ring-2 ring-amber-500/60"
              />
            </button>
          </div>
        </div>

        {/* Main Tabs Navigation Bar */}
        <nav className="flex items-center space-x-1 overflow-x-auto py-2 border-t border-slate-100 no-scrollbar">
          {pestañas.map((tab) => {
            const activo = tabActual === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setTabActual(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                  activo
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.icono}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Registration / Signup Modal */}
      {modalRegistroAbierto && <RegistroModal onClose={() => setModalRegistroAbierto(false)} />}
    </header>
  );
};
