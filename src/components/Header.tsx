import React from 'react';
import { useApp } from '../context/AppContext';
import type { TabType } from '../types';
import { AuthModal } from './Auth/AuthModal';
import { RegistroModal } from './Auth/RegistroModal';
import { NotificationsPopover } from './UI/NotificationsPopover';
import {
  Search,
  User,
  LogOut,
  Sparkles,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    tabActual,
    setTabActual,
    usuarioActual,
    comunidad,
    busqueda,
    setBusqueda,
    setUsuarioPerfilModal,
    modalRegistroAbierto,
    setModalRegistroAbierto,
    modalAuthAbierto,
    setModalAuthAbierto,
    cerrarSesion,
  } = useApp();

  const pestañas: { id: TabType; label: string }[] = [
    { id: 'comunidad', label: 'Comunidad' },
    { id: 'aula', label: 'Aula' },
    { id: 'calendario', label: 'Calendario' },
    { id: 'miembros', label: 'Miembros' },
    { id: 'clasificacion', label: 'Tablas de clasificación' },
    { id: 'acerca', label: 'Acerca de' },
    ...(usuarioActual?.rol === 'Admin' ? [{ id: 'configuracion' as TabType, label: 'Configuración (Admin)' }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Navbar Row */}
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Community Name (Static Title, without up/down arrows) */}
          <div
            onClick={() => setTabActual('comunidad')}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-xs flex items-center justify-center bg-black shrink-0">
              <img
                src="/raxen-logo.png"
                alt="Raxen Capital"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base text-gray-900 tracking-tight">
                {comunidad.nombre}
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg hidden sm:block">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar en la comunidad..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-transparent rounded-full text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-gray-300 focus:ring-1 focus:ring-gray-300 transition-all font-normal"
              />
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            
            {usuarioActual ? (
              <>
                {/* Gamification Level & XP Progress Indicator */}
                <div
                  onClick={() => setTabActual('clasificacion')}
                  className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-400/30 hover:bg-amber-500/20 transition-all cursor-pointer group"
                  title={`Nivel ${usuarioActual.nivel} • ${usuarioActual.xp} XP acumulados. Haz clic para ver el Ranking`}
                >
                  <div className="flex items-center gap-1 text-xs font-black text-amber-700">
                    <span>⚡ Nv. {usuarioActual.nivel}</span>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <div className="w-16 h-1.5 rounded-full bg-amber-200 overflow-hidden">
                      {(() => {
                        const metas = [0, 100, 250, 500, 1000, 2000, 3500, 5000, 7500, 10000];
                        const metaActual = metas[usuarioActual.nivel] || 100;
                        const metaPrevia = metas[usuarioActual.nivel - 1] || 0;
                        const pct = Math.min(100, Math.max(5, Math.round(((usuarioActual.xp - metaPrevia) / (metaActual - metaPrevia)) * 100)));
                        return (
                          <div
                            className="h-full bg-amber-500 transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        );
                      })()}
                    </div>
                    <span className="text-[9px] font-mono font-bold text-amber-800 leading-none">
                      {usuarioActual.xp} XP
                    </span>
                  </div>

                  {/* Daily Streak */}
                  <div className="flex items-center gap-0.5 text-xs font-bold text-orange-600 pl-1 border-l border-amber-300/60">
                    <span>🔥</span>
                    <span className="text-[11px] font-black">{usuarioActual.rachaDias || 1}d</span>
                  </div>
                </div>

                {/* Notifications Dropdown Popover */}
                <NotificationsPopover />

                {/* User Profile Avatar */}
                <button
                  onClick={() => setUsuarioPerfilModal(usuarioActual)}
                  className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-gray-300 transition-all"
                  title={`${usuarioActual.nombre} (${usuarioActual.rol})`}
                >
                  <img
                    src={usuarioActual.avatar}
                    alt={usuarioActual.nombre}
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(usuarioActual.nombre)}&background=0D0D0D&color=38bdf8&size=128`;
                    }}
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-gray-300"
                  />
                  <span className="text-xs font-bold text-gray-800 hidden md:inline">
                    {usuarioActual.nombre}
                  </span>
                </button>

                {/* Logout Button */}
                <button
                  onClick={cerrarSesion}
                  title="Cerrar sesión"
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded-full transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setModalAuthAbierto(true)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-100 transition-all"
                >
                  <User className="w-3.5 h-3.5 inline mr-1" />
                  Iniciar Sesión
                </button>
                <button
                  onClick={() => setModalRegistroAbierto(true)}
                  className="px-4 py-2 rounded-xl bg-gray-900 text-white text-xs font-black hover:bg-black transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Unirse a la Comunidad
                </button>
              </>
            )}
          </div>
        </div>

        {/* Sub-Navigation Tabs Row */}
        <nav className="flex items-center space-x-8 overflow-x-auto no-scrollbar -mb-px">
          {pestañas.map((tab) => {
            const activo = tabActual === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setTabActual(tab.id)}
                className={`py-3 text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${
                  activo
                    ? 'border-gray-900 text-gray-900 font-extrabold'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Auth Modal */}
      {modalAuthAbierto && <AuthModal onClose={() => setModalAuthAbierto(false)} />}

      {/* Registration Modal */}
      {modalRegistroAbierto && <RegistroModal onClose={() => setModalRegistroAbierto(false)} />}
    </header>
  );
};
