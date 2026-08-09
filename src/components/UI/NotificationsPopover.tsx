import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import type { Notificacion } from '../../types';
import {
  Bell,
  CheckCircle2,
  Zap,
  MessageSquare,
  Heart,
  Calendar,
  Sparkles,
} from 'lucide-react';

export const NotificationsPopover: React.FC = () => {
  const { notificaciones, marcarNotificacionesLeidas, setTabActual } = useApp();
  const [abierto, setAbierto] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const noLeidas = notificaciones.filter((n) => !n.leida);
  const conteoNoLeidas = noLeidas.length;

  // Cerrar al hacer clic afuera
  useEffect(() => {
    const handleClickAfuera = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setAbierto(false);
      }
    };
    if (abierto) {
      document.addEventListener('mousedown', handleClickAfuera);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickAfuera);
    };
  }, [abierto]);

  const handleAbrir = () => {
    const nuevoEstado = !abierto;
    setAbierto(nuevoEstado);
    if (nuevoEstado) {
      marcarNotificacionesLeidas();
    }
  };

  const handleClicNotificacion = (notif: Notificacion) => {
    if (notif.enlaceTab) {
      setTabActual(notif.enlaceTab);
    }
    marcarNotificacionesLeidas();
    setAbierto(false);
  };

  const getIcono = (tipo: Notificacion['tipo']) => {
    switch (tipo) {
      case 'nivel_up':
        return (
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4" />
          </div>
        );
      case 'comentario':
        return (
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <MessageSquare className="w-4 h-4" />
          </div>
        );
      case 'like':
        return (
          <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
          </div>
        );
      case 'evento':
        return (
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Trigger Button */}
      <button
        onClick={handleAbrir}
        className={`relative p-2 rounded-full transition-all ${
          abierto
            ? 'bg-slate-100 text-slate-900 shadow-xs'
            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
        }`}
        title="Notificaciones"
      >
        <Bell className="w-5 h-5" />
        {conteoNoLeidas > 0 && (
          <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-blue-600 text-white text-[9px] font-black flex items-center justify-center border border-white animate-pulse">
            {conteoNoLeidas}
          </span>
        )}
      </button>

      {/* Popover Card */}
      {abierto && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-slate-900">Notificaciones</h3>
              {conteoNoLeidas > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-black border border-blue-200">
                  {conteoNoLeidas} nuevas
                </span>
              )}
            </div>

            {notificaciones.length > 0 && (
              <button
                onClick={marcarNotificacionesLeidas}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors"
              >
                Marcar todas leídas
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
            {notificaciones.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                </div>
                <div className="text-xs font-black text-slate-800">Todo al día</div>
                <p className="text-[11px] text-slate-500">
                  No tienes notificaciones pendientes en este momento.
                </p>
              </div>
            ) : (
              notificaciones.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleClicNotificacion(notif)}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer transition-all hover:bg-slate-50 ${
                    !notif.leida ? 'bg-blue-50/40' : 'bg-white'
                  }`}
                >
                  {getIcono(notif.tipo)}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-xs text-slate-900 truncate">
                        {notif.titulo}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                        {notif.fecha}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                      {notif.mensaje}
                    </p>
                  </div>
                  {!notif.leida && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
