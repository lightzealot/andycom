import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Send, MessageSquare, Sparkles } from 'lucide-react';

export const DirectMessagesDrawer: React.FC = () => {
  const {
    dmDrawerAbierto,
    setDmDrawerAbierto,
    mensajesDirectos,
    enviarMensajeDirecto,
    usuarioActual,
    miembros,
    usuarioChatActivo,
    setUsuarioChatActivo,
  } = useApp();

  const [textoMensaje, setTextoMensaje] = useState('');

  if (!dmDrawerAbierto) return null;

  const otrosMiembros = miembros.filter((m) => m.id !== usuarioActual.id);
  const miembroSeleccionado = usuarioChatActivo || otrosMiembros[0];

  const conversación = mensajesDirectos.filter(
    (m) =>
      (m.remitenteId === usuarioActual.id && m.destinatarioId === miembroSeleccionado?.id) ||
      (m.remitenteId === miembroSeleccionado?.id && m.destinatarioId === usuarioActual.id)
  );

  const handleEnviar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textoMensaje.trim() || !miembroSeleccionado) return;

    enviarMensajeDirecto(miembroSeleccionado.id, textoMensaje.trim());
    setTextoMensaje('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md glass-panel border-l border-slate-800 shadow-2xl flex flex-col justify-between">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-400" />
              <h2 className="font-extrabold text-base text-white">Mensajes Directos</h2>
            </div>
            <button
              onClick={() => setDmDrawerAbierto(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-3 bg-slate-950/80 border-b border-slate-800/80">
            <div className="flex space-x-2 overflow-x-auto pb-1 no-scrollbar">
              {otrosMiembros.map((m) => {
                const activo = miembroSeleccionado?.id === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setUsuarioChatActivo(m)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                      activo
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <img src={m.avatar} alt={m.nombre} className="w-5 h-5 rounded-full object-cover" />
                    <span>{m.nombre.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {miembroSeleccionado && (
            <div className="px-4 py-3 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={miembroSeleccionado.avatar}
                    alt={miembroSeleccionado.nombre}
                    className="w-9 h-9 rounded-xl object-cover"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
                </div>
                <div>
                  <div className="font-bold text-xs text-white">{miembroSeleccionado.nombre}</div>
                  <div className="text-[10px] text-amber-400 font-semibold">
                    Nivel {miembroSeleccionado.nivel} • {miembroSeleccionado.rol}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/40">
            {conversación.length === 0 ? (
              <div className="text-center py-12">
                <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-60" />
                <p className="text-xs text-slate-400">
                  Inicia la conversación con {miembroSeleccionado?.nombre.split(' ')[0]}.
                </p>
                <span className="text-[10px] text-slate-500">Ganarás +5 XP por enviar este mensaje</span>
              </div>
            ) : (
              conversación.map((msg) => {
                const esMio = msg.remitenteId === usuarioActual.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${esMio ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                        esMio
                          ? 'bg-amber-500 text-slate-950 font-medium shadow-md shadow-amber-500/10'
                          : 'bg-slate-900 border border-slate-800 text-slate-200'
                      }`}
                    >
                      {msg.texto}
                    </div>
                    <span className="text-[9px] text-slate-500 mt-1 font-mono">{msg.timestamp}</span>
                  </div>
                );
              })
            )}
          </div>

          {miembroSeleccionado && (
            <form onSubmit={handleEnviar} className="p-4 border-t border-slate-800 bg-slate-950">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Mensaje a ${miembroSeleccionado.nombre.split(' ')[0]}... (+5 XP)`}
                  value={textoMensaje}
                  onChange={(e) => setTextoMensaje(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                />
                <button
                  type="submit"
                  disabled={!textoMensaje.trim()}
                  className="p-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 disabled:opacity-40 transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
