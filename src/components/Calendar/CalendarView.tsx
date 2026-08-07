import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Calendar as CalendarIcon, Clock, Video, Users, Plus, CheckCircle, ExternalLink, Sparkles, X } from 'lucide-react';

export const CalendarView: React.FC = () => {
  const { eventos, toggleRSVPEvento, crearNuevoEvento, usuarioActual } = useApp();
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [duracion, setDuracion] = useState('60 min');
  const [tipo, setTipo] = useState<'Llamada en Vivo' | 'Taller' | 'Q&A Mentoría' | 'Masterclass'>('Q&A Mentoría');
  const [linkReunion, setLinkReunion] = useState('https://zoom.us');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !descripcion.trim()) return;

    crearNuevoEvento({
      titulo,
      descripcion,
      duracion,
      tipo,
      linkReunion,
      fechaInicio: new Date(Date.now() + 86400000 * 3).toISOString(),
      banner: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=800',
    });

    setModalCrearAbierto(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <CalendarIcon className="w-7 h-7 text-amber-400" /> Calendario de Eventos en Vivo
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Conéctate a las llamadas semanales, talleres prácticos y mentorías exclusivas de la comunidad.
          </p>
        </div>

        {(usuarioActual.rol === 'Admin' || usuarioActual.rol === 'Moderador') && (
          <button
            onClick={() => setModalCrearAbierto(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 hover:opacity-90 transition-all"
          >
            <Plus className="w-4 h-4" /> Programar Evento
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {eventos.map((evt) => {
          const asiste = evt.rsvpUsuarios.includes(usuarioActual.id);
          const fechaFormateada = new Date(evt.fechaInicio).toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={evt.id}
              className="glass-panel rounded-3xl overflow-hidden border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between shadow-xl"
            >
              <div className="relative h-44 overflow-hidden bg-slate-950">
                <img
                  src={evt.banner}
                  alt={evt.titulo}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 text-amber-400 text-xs font-bold">
                  {evt.tipo}
                </div>
              </div>

              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1">
                    <Clock className="w-4 h-4" />
                    <span>{fechaFormateada} ({evt.duracion})</span>
                  </div>
                  <h3 className="text-lg font-bold text-white leading-snug">{evt.titulo}</h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">{evt.descripcion}</p>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={evt.anfitrion.avatar}
                        alt={evt.anfitrion.nombre}
                        className="w-8 h-8 rounded-xl object-cover"
                      />
                      <div>
                        <div className="text-xs font-bold text-white">{evt.anfitrion.nombre}</div>
                        <div className="text-[10px] text-slate-400">Anfitrión del Evento</div>
                      </div>
                    </div>
                    <div className="text-xs font-bold text-slate-400 flex items-center gap-1">
                      <Users className="w-4 h-4 text-amber-400" />
                      <span>{evt.rsvpUsuarios.length} Asistentes</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleRSVPEvento(evt.id)}
                      className={`flex-1 py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                        asiste
                          ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                          : 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-md shadow-amber-500/20'
                      }`}
                    >
                      {asiste ? (
                        <>
                          <CheckCircle className="w-4 h-4" /> Asistencia Confirmada (+15 XP)
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" /> Confirmar RSVP (+15 XP)
                        </>
                      )}
                    </button>

                    <a
                      href={evt.linkReunion}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 hover:text-white hover:border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <Video className="w-4 h-4 text-amber-400" /> Entrar <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {modalCrearAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-800 relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-base font-bold text-white">Programar Nuevo Evento</h2>
              <button onClick={() => setModalCrearAbierto(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Título del Evento</label>
                <input
                  type="text"
                  placeholder="Ej: Llamada de Q&A en Vivo..."
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Descripción</label>
                <textarea
                  placeholder="Temas a tratar en el evento..."
                  rows={3}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Tipo</label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                  >
                    <option value="Q&A Mentoría">Q&A Mentoría</option>
                    <option value="Taller">Taller</option>
                    <option value="Llamada en Vivo">Llamada en Vivo</option>
                    <option value="Masterclass">Masterclass</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Duración</label>
                  <input
                    type="text"
                    value={duracion}
                    onChange={(e) => setDuracion(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Enlace de Zoom/Meet</label>
                <input
                  type="url"
                  value={linkReunion}
                  onChange={(e) => setLinkReunion(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalCrearAbierto(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
                >
                  Guardar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
