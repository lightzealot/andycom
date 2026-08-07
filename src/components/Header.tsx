import React from 'react';
import { useApp } from '../context/AppContext';
import type { TabType } from '../types';
import { AuthModal } from './Auth/AuthModal';
import { RegistroModal } from './Auth/RegistroModal';
import {
  MessageSquare,
  Bell,
  Search,
  ChevronsUpDown,
  User,
  ToggleLeft,
  ToggleRight,
  LogOut,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    tabActual,
    setTabActual,
    usuarioActual,
    comunidad,
    busqueda,
    setBusqueda,
    dmDrawerAbierto,
    setDmDrawerAbierto,
    setUsuarioPerfilModal,
    modalRegistroAbierto,
    setModalRegistroAbierto,
    modalAuthAbierto,
    setModalAuthAbierto,
    modoVistaAdmin,
    setModoVistaAdmin,
    cerrarSesion,
  } = useApp();

  const pestañas: { id: TabType; label: string }[] = [
    { id: 'comunidad', label: 'Comunidad' },
    { id: 'aula', label: 'Aula' },
    { id: 'calendario', label: 'Calendario' },
    { id: 'miembros', label: 'Miembros' },
    { id: 'clasificacion', label: 'Tablas de clasificación' },
    { id: 'acerca', label: 'Acerca de' },
    { id: 'configuracion', label: 'Configuración (Admin)' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Navbar Row */}
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Community Switcher */}
          <div
            onClick={() => setTabActual('comunidad')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shadow-xs">
              <span className="text-xl font-black text-sky-500 tracking-tighter">R</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base text-gray-900 tracking-tight">
                {comunidad.nombre}
              </span>
              <ChevronsUpDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
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
            
            {/* Quick Admin View Toggle */}
            <button
              onClick={() => setModoVistaAdmin(!modoVistaAdmin)}
              title="Cambiar entre Vista Administrador y Vista Alumno"
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                modoVistaAdmin
                  ? 'bg-blue-50 text-blue-900 border-blue-200'
                  : 'bg-gray-100 text-gray-700 border-gray-200'
              }`}
            >
              {modoVistaAdmin ? (
                <>
                  <ToggleRight className="w-4 h-4 text-blue-600" />
                  <span>👑 Admin Activo</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-4 h-4 text-gray-500" />
                  <span>🎓 Modo Alumno</span>
                </>
              )}
            </button>

            {/* Auth / Account Switcher Button */}
            <button
              onClick={() => setModalAuthAbierto(true)}
              className="px-3.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <User className="w-3.5 h-3.5 text-gray-600" />
              <span>Cuenta</span>
            </button>

            {/* DMs Button */}
            <button
              onClick={() => setDmDrawerAbierto(!dmDrawerAbierto)}
              className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-all"
              title="Mensajes"
            >
              <MessageSquare className="w-5 h-5" />
            </button>

            {/* Notifications Bell with Red Badge "5" */}
            <button
              onClick={() => setTabActual('comunidad')}
              className="relative p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-all"
              title="Notificaciones"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">
                5
              </span>
            </button>

            {/* User Profile Avatar Circle */}
            <button
              onClick={() => setUsuarioPerfilModal(usuarioActual)}
              className="flex items-center gap-1 p-0.5 rounded-full hover:ring-2 hover:ring-gray-300 transition-all"
              title={`${usuarioActual.nombre} (${usuarioActual.rol})`}
            >
              <img
                src={usuarioActual.avatar}
                alt={usuarioActual.nombre}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-gray-300"
              />
            </button>

            {/* Logout / Preview Public Page Button */}
            <button
              onClick={cerrarSesion}
              title="Cerrar sesión y ver la página de vista previa pública"
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded-full transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
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
