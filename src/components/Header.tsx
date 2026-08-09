import React from 'react';
import { useApp } from '../context/AppContext';
import type { TabType } from '../types';
import { AuthModal } from './Auth/AuthModal';
import { RegistroModal } from './Auth/RegistroModal';
import { NotificationsPopover } from './UI/NotificationsPopover';
import { ScrollableHorizontal } from './UI/ScrollableHorizontal';
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
    ...(usuarioActual?.rol === 'Admin' ? [{ id: 'configuracion' as TabType, label: 'Configuración (Admin)' }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Top Navbar Row */}
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          
          {/* Logo & Community Name */}
          <div
            onClick={() => setTabActual('comunidad')}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none shrink-0"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-2xs flex items-center justify-center bg-black shrink-0">
              <img
                src="/raxen-logo.png"
                alt="Raxen Capital"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-gray-900 tracking-tight truncate max-w-[130px] sm:max-w-none">
                {comunidad.nombre}
              </span>
            </div>
          </div>

          {/* Search Bar (desktop) */}
          <div className="flex-1 max-w-lg hidden md:block">
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
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            
            {usuarioActual ? (
              <>
                {/* Gamification Level & XP Badge (Responsive) */}
                <button
                  onClick={() => setTabActual('clasificacion')}
                  className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-400/30 hover:bg-amber-500/20 transition-all text-xs font-black text-amber-800 shrink-0 cursor-pointer"
                  title={`Nivel ${usuarioActual.nivel} • ${usuarioActual.xp} XP. Ver Tablas de Clasificación`}
                >
                  <span>⚡ Nv. {usuarioActual.nivel}</span>
                  <span className="hidden sm:inline text-[10px] font-mono font-bold text-amber-600">({usuarioActual.xp} XP)</span>
                </button>

                {/* Notifications Dropdown Popover */}
                <NotificationsPopover />

                {/* User Profile Avatar */}
                <button
                  onClick={() => setUsuarioPerfilModal(usuarioActual)}
                  className="flex items-center gap-1.5 p-0.5 sm:p-1 rounded-full hover:ring-2 hover:ring-gray-300 transition-all cursor-pointer shrink-0"
                  title={`${usuarioActual.nombre} (${usuarioActual.rol}) - Ver y editar perfil`}
                >
                  <img
                    src={usuarioActual.avatar}
                    alt={usuarioActual.nombre}
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(usuarioActual.nombre)}&background=0D0D0D&color=38bdf8&size=128`;
                    }}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-1 ring-gray-300"
                  />
                  <span className="text-xs font-bold text-gray-800 hidden lg:inline max-w-[100px] truncate">
                    {usuarioActual.nombre}
                  </span>
                </button>

                {/* Logout Button */}
                <button
                  onClick={cerrarSesion}
                  title="Cerrar sesión"
                  className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded-full transition-all cursor-pointer shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setModalAuthAbierto(true)}
                  className="px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 inline mr-1" />
                  <span>Ingresar</span>
                </button>
                <button
                  onClick={() => setModalRegistroAbierto(true)}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gray-900 text-white text-xs font-black hover:bg-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Unirse a la Comunidad</span>
                  <span className="sm:hidden">Unirme</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Sub-Navigation Tabs Row (Deslizable hacia la derecha con indicador visual) */}
        <ScrollableHorizontal className="space-x-3 sm:space-x-6 lg:space-x-8 -mb-px px-0.5" gradientColor="from-white">
          {pestañas.map((tab) => {
            const activo = tabActual === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setTabActual(tab.id)}
                className={`py-2.5 sm:py-3 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all border-b-2 cursor-pointer shrink-0 ${
                  activo
                    ? 'border-gray-900 text-gray-900 font-extrabold'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </ScrollableHorizontal>
      </div>

      {/* Auth Modal */}
      {modalAuthAbierto && <AuthModal onClose={() => setModalAuthAbierto(false)} />}

      {/* Registration Modal */}
      {modalRegistroAbierto && <RegistroModal onClose={() => setModalRegistroAbierto(false)} />}
    </header>
  );
};
