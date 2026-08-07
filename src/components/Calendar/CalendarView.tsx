import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Calendar as CalendarIcon, Clock, Users, Video, Plus, Check, X } from 'lucide-react';

export const CalendarView: React.FC = () => {
  const { eventos, toggleRSVPEvento, crearNuevoEvento, usuarioActual, modoVistaAdmin } = useApp();
  const [modalEvento, setModalEvento] = useState(false);

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().slice(0, 16));
  const [duracion, setDuracion] = useState('60 min');
  const [linkReunion, setLinkReunion] = useState('https://zoom.us/j/andyontrade-live');

  const handleCrearEvento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return;

    crearNuevoEvento({
      titulo,
      descripcion,
      fechaInicio: new Date(fechaInicio).toISOString(),
      duracion,
      tipo: 'Llamada en Vivo',
      linkReunion,
      banner: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=800',
    });

    setModalEvento(false);
    setTitulo('');
    setDescripcion('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-8 border border-slate-200 bg-gradient-to-r from-amber-500/10 via-slate-50 to-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-wider">
            <CalendarIcon className="w-3.5 h-3.5" /> Calendario de Sesiones
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Llamadas de Trading en Vivo & Backtesting
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Confirma tu asistencia (RSVP) a las llamadas de la apertura de New York para ganar +15 XP.
          </p>
        </div>

        {modoVistaAdmin && (
          <button
            onClick={() => setModalEvento(true)}
            className="px-5 py-3 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-md hover:bg-amber-400 transition-all"
          >
            <Plus className="w-4 h-4" /> Programar Llamada en Vivo
          </button>
        )}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {eventos.map((evento) => {
          const yaInscrito = evento.rsvpUsuarios.includes(usuarioActual.id);
          const fecha = new Date(evento.fechaInicio).toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          });
          const hora = new Date(evento.fechaInicio).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={evento.id}
              className="glass-panel rounded-3xl overflow-hidden border border-slate-200 flex flex-col justify-between shadow-xs bg-white"
            >
              <div>
                <div className="relative aspect-21/9 overflow-hidden">
                  <img
                    src={evento.banner}
                    alt={evento.titulo}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-slate-900/90 text-white text-xs font-black">
                    {evento.tipo}
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <CalendarIcon className="w-4 h-4 text-amber-600" />
                      <span className="capitalize">{fecha}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>{hora} EST ({evento.duracion})</span>
                    </div>
                  </div>

                  <h3 className="font-black text-base text-slate-900 leading-snug">
                    {evento.titulo}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {evento.descripcion}
                  </p>

                  <div className="flex items-center gap-2 pt-2 text-xs font-bold text-slate-700">
                    <Users className="w-4 h-4 text-slate-500" />
                    <span>{evento.rsvpUsuarios.length} Traders confirmados</span>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 flex items-center gap-3">
                <button
                  onClick={() => toggleRSVPEvento(evento.id)}
                  className={`flex-1 py-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
                    yaInscrito
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-amber-500 text-slate-950 shadow-xs hover:bg-amber-400'
                  }`}
                >
                  {yaInscrito ? (
                    <>
                      <Check className="w-4 h-4" /> Asistencia Confirmada (+15 XP)
                    </>
                  ) : (
                    'Confirmar Asistencia (RSVP)'
                  )}
                </button>

                <a
                  href={evento.linkReunion}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200 transition-all font-bold"
                  title="Abrir sala de Zoom / Meet"
                >
                  <Video className="w-4 h-4" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Event Modal */}
      {modalEvento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200 relative bg-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-base font-black text-slate-900">Programar Nueva Sesión de Trading en Vivo</h2>
              <button onClick={() => setModalEvento(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCrearEvento} className="mt-4 space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-700 mb-1">Título de la Sesión</label>
                <input
                  type="text"
                  placeholder="Ej: Trading en Vivo - Apertura de London..."
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Descripción</label>
                <textarea
                  rows={3}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 mb-1">Fecha y Hora (EST)</label>
                  <input
                    type="datetime-local"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Duración</label>
                  <input
                    type="text"
                    value={duracion}
                    onChange={(e) => setDuracion(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Enlace de Zoom o Google Meet</label>
                <input
                  type="url"
                  value={linkReunion}
                  onChange={(e) => setLinkReunion(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalEvento(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-black shadow-xs"
                >
                  Publicar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
