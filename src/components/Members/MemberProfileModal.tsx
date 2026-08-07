import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, MessageSquare, Zap, Flame, Calendar as CalendarIcon, ExternalLink, Award } from 'lucide-react';

export const MemberProfileModal: React.FC = () => {
  const { usuarioPerfilModal, setUsuarioPerfilModal, setUsuarioChatActivo, setDmDrawerAbierto } = useApp();

  if (!usuarioPerfilModal) return null;

  const handleStartDM = () => {
    setUsuarioChatActivo(usuarioPerfilModal);
    setDmDrawerAbierto(true);
    setUsuarioPerfilModal(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="glass-panel w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-800 relative space-y-6">
        
        {/* Close Button */}
        <button
          onClick={() => setUsuarioPerfilModal(null)}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Profile Header */}
        <div className="flex items-center gap-4">
          <img
            src={usuarioPerfilModal.avatar}
            alt={usuarioPerfilModal.nombre}
            className="w-20 h-20 rounded-3xl object-cover ring-4 ring-amber-500/40 shadow-xl"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-white">{usuarioPerfilModal.nombre}</h2>
              <span className="px-2.5 py-0.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-black">
                Nivel {usuarioPerfilModal.nivel}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{usuarioPerfilModal.nickname}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold">
                {usuarioPerfilModal.rol}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                <CalendarIcon className="w-3.5 h-3.5" /> {usuarioPerfilModal.fechaRegistro}
              </span>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
          {usuarioPerfilModal.bio}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="text-sm font-black text-amber-400 flex items-center justify-center gap-1">
              <Zap className="w-4 h-4" /> {usuarioPerfilModal.xp}
            </div>
            <div className="text-[10px] text-slate-400 uppercase mt-0.5">Puntos XP</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="text-sm font-black text-orange-400 flex items-center justify-center gap-1">
              <Flame className="w-4 h-4" /> {usuarioPerfilModal.rachaDias} d
            </div>
            <div className="text-[10px] text-slate-400 uppercase mt-0.5">Racha Diaria</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="text-sm font-black text-white">{usuarioPerfilModal.publicacionesCount}</div>
            <div className="text-[10px] text-slate-400 uppercase mt-0.5">Publicaciones</div>
          </div>
        </div>

        {/* Earned Badges Showcase */}
        {usuarioPerfilModal.insignias.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" /> Insignias Obtenidas
            </h4>
            <div className="flex flex-wrap gap-2">
              {usuarioPerfilModal.insignias.map((badge) => (
                <div
                  key={badge.id}
                  title={badge.descripcion}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white"
                >
                  <span className="text-base">{badge.icono}</span>
                  <span>{badge.nombre}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Social Links & DM Button */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            {usuarioPerfilModal.enlaces?.twitter && (
              <a
                href={usuarioPerfilModal.enlaces.twitter}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-amber-400 hover:underline flex items-center gap-1"
              >
                Twitter <ExternalLink className="w-3 h-3" />
              </a>
            )}
            {usuarioPerfilModal.enlaces?.linkedin && (
              <a
                href={usuarioPerfilModal.enlaces.linkedin}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-amber-400 hover:underline flex items-center gap-1"
              >
                LinkedIn <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          <button
            onClick={handleStartDM}
            className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-all"
          >
            <MessageSquare className="w-4 h-4" /> Enviar Mensaje Directo
          </button>
        </div>
      </div>
    </div>
  );
};
