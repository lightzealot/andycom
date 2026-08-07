import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, Flame, MessageSquare, ExternalLink, Calendar, Zap, Crown } from 'lucide-react';

export const MemberProfileModal: React.FC = () => {
  const { usuarioPerfilModal, setUsuarioPerfilModal, setUsuarioChatActivo, setDmDrawerAbierto } = useApp();

  if (!usuarioPerfilModal) return null;

  const u = usuarioPerfilModal;

  const handleEnviarMensaje = () => {
    setUsuarioChatActivo(u);
    setUsuarioPerfilModal(null);
    setDmDrawerAbierto(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="glass-panel w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 relative bg-white space-y-6">
        
        {/* Close Button */}
        <button
          onClick={() => setUsuarioPerfilModal(null)}
          className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Profile Card Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          <div className="relative">
            <img
              src={u.avatar}
              alt={u.nombre}
              className="w-20 h-20 rounded-3xl object-cover ring-4 ring-amber-400 shadow-md"
            />
            {u.rol === 'Admin' && (
              <span className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-amber-500 text-slate-950 shadow-xs">
                <Crown className="w-4 h-4" />
              </span>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-black text-slate-900">{u.nombre}</h2>
              <span className="px-2.5 py-0.5 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold">
                {u.rol}
              </span>
            </div>
            <div className="text-xs text-slate-500 font-medium">{u.nickname}</div>
            <div className="flex items-center justify-center sm:justify-start gap-3 text-xs text-slate-600 font-bold pt-1">
              <span className="flex items-center gap-1 text-amber-800">
                <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-600" /> Nivel {u.nivel} ({u.xp} XP)
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-orange-700">
                <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-600" /> {u.rachaDias} d racha
              </span>
            </div>
          </div>
        </div>

        {/* Bio */}
        {u.bio && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed font-normal">
            {u.bio}
          </div>
        )}

        {/* Badges Earned */}
        {u.insignias && u.insignias.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Insignias Desbloqueadas ({u.insignias.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {u.insignias.map((badge) => (
                <div
                  key={badge.id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3"
                >
                  <span className="text-2xl">{badge.icono}</span>
                  <div>
                    <div className="font-bold text-xs text-slate-900">{badge.nombre}</div>
                    <div className="text-[10px] text-slate-500 leading-tight font-medium">{badge.descripcion}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button & Social Links */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
            <Calendar className="w-3.5 h-3.5" />
            <span>Miembro desde {u.fechaRegistro}</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {u.enlaces?.twitter && (
              <a
                href={u.enlaces.twitter}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200 transition-all font-bold text-xs flex items-center gap-1"
                title="Twitter"
              >
                <span>X</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            {u.enlaces?.linkedin && (
              <a
                href={u.enlaces.linkedin}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200 transition-all font-bold text-xs flex items-center gap-1"
                title="LinkedIn"
              >
                <span>in</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            <button
              onClick={handleEnviarMensaje}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-xs hover:bg-amber-400 transition-all"
            >
              <MessageSquare className="w-4 h-4" /> Enviar Mensaje Directo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
