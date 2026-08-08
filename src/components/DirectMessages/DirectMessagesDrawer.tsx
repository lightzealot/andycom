import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Send, MessageSquare } from 'lucide-react';

export const DirectMessagesDrawer: React.FC = () => {
  const {
    dmDrawerAbierto,
    setDmDrawerAbierto,
    usuarioChatActivo,
    setUsuarioChatActivo,
    miembros,
    usuarioActual,
    mensajesDirectos,
    enviarMensajeDirecto,
  } = useApp();

  const [texto, setTexto] = useState('');

  if (!dmDrawerAbierto) return null;

  const otrosMiembros = miembros.filter((m) => m.id !== usuarioActual.id);
  const chatActivo = usuarioChatActivo || otrosMiembros[0];

  const mensajesFiltrados = mensajesDirectos.filter(
    (msg) =>
      (msg.remitenteId === usuarioActual.id && msg.destinatarioId === chatActivo?.id) ||
      (msg.remitenteId === chatActivo?.id && msg.destinatarioId === usuarioActual.id)
  );

  const handleEnviar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!texto.trim() || !chatActivo) return;
    enviarMensajeDirecto(chatActivo.id, texto.trim());
    setTexto('');
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-amber-600" />
          <h2 className="font-black text-sm text-slate-900">Mensajes Directos</h2>
        </div>
        <button
          onClick={() => setDmDrawerAbierto(false)}
          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-200 transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Member Selector Row */}
      <div className="p-3 border-b border-slate-100 flex items-center space-x-3 overflow-x-auto no-scrollbar bg-slate-50/50">
        {otrosMiembros.map((m) => {
          const esActivo = chatActivo?.id === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setUsuarioChatActivo(m)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all ${
                esActivo
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <img
                src={m.avatar}
                alt={m.nombre}
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(m.nombre)}&background=0D0D0D&color=38bdf8&size=128`;
                }}
                className="w-5 h-5 rounded-full object-cover"
              />
              <span>{m.nombre.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Messages List Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {mensajesFiltrados.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs font-medium">
            No hay mensajes aún con {chatActivo?.nombre}. ¡Sé el primero en saludar!
          </div>
        ) : (
          mensajesFiltrados.map((m) => {
            const esMio = m.remitenteId === usuarioActual.id;
            return (
              <div key={m.id} className={`flex flex-col ${esMio ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed font-normal shadow-xs ${
                    esMio
                      ? 'bg-amber-500 text-slate-950 font-medium rounded-br-xs'
                      : 'bg-slate-100 border border-slate-200 text-slate-900 rounded-bl-xs'
                  }`}
                >
                  {m.texto}
                </div>
                <span className="text-[9px] text-slate-400 mt-1 font-mono">{m.timestamp}</span>
              </div>
            );
          })
        )}
      </div>

      {/* Message Input */}
      <form onSubmit={handleEnviar} className="p-4 border-t border-slate-200 flex gap-2 bg-slate-50">
        <input
          type="text"
          placeholder={`Escribe a ${chatActivo?.nombre || 'Trader'} (+5 XP)...`}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 font-medium"
        />
        <button
          type="submit"
          className="px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black hover:bg-amber-400 transition-all shadow-xs"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
