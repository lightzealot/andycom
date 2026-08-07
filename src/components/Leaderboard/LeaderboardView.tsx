import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Trophy, Flame, Zap, Award, Lock, CheckCircle2 } from 'lucide-react';

export const LeaderboardView: React.FC = () => {
  const { usuarioActual, niveles, miembros, setUsuarioPerfilModal } = useApp();
  const [filtroTiempo, setFiltroTiempo] = useState<'7dias' | '30dias' | 'historico'>('30dias');

  const miembrosOrdenados = [...miembros].sort((a, b) => b.xp - a.xp);
  
  const podio1 = miembrosOrdenados[0];
  const podio2 = miembrosOrdenados[1];
  const podio3 = miembrosOrdenados[2];

  const miPosicion = miembrosOrdenados.findIndex((m) => m.id === usuarioActual.id) + 1;

  const nivelActualInfo = niveles.find((n) => n.nivel === usuarioActual.nivel) || niveles[0];
  const siguienteNivelInfo = niveles.find((n) => n.nivel === usuarioActual.nivel + 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <Trophy className="w-7 h-7 text-amber-400" /> Tabla de Clasificación & Niveles
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Gana XP interactuando en la comunidad, publicando contenido de valor y completando lecciones.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
          {(['7dias', '30dias', 'historico'] as const).map((filtro) => {
            const labels = { '7dias': 'Últimos 7 Días', '30dias': 'Últimos 30 Días', historico: 'Histórico' };
            const activo = filtroTiempo === filtro;
            return (
              <button
                key={filtro}
                onClick={() => setFiltroTiempo(filtro)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activo
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {labels[filtro]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="glass-panel rounded-3xl p-6 border border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-950 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <img
            src={usuarioActual.avatar}
            alt={usuarioActual.nombre}
            className="w-16 h-16 rounded-2xl object-cover ring-4 ring-amber-500/60"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-white">{usuarioActual.nombre}</span>
              <span className="px-2.5 py-0.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs">
                Posición #{miPosicion}
              </span>
            </div>
            <p className="text-xs text-amber-400 font-bold mt-0.5">
              Nivel {usuarioActual.nivel}: {nivelActualInfo.nombre}
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
              <span className="flex items-center gap-1 font-bold text-amber-400">
                <Zap className="w-3.5 h-3.5 fill-current" /> {usuarioActual.xp} XP acumulados
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-bold text-orange-400">
                <Flame className="w-3.5 h-3.5 fill-current" /> Racha {usuarioActual.rachaDias} días
              </span>
            </div>
          </div>
        </div>

        {siguienteNivelInfo && (
          <div className="w-full md:w-80 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-slate-400">Próximo Nivel: {siguienteNivelInfo.nombre}</span>
              <span className="text-amber-400">{siguienteNivelInfo.xpRequerido} XP</span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-300"
                style={{
                  width: `${Math.min(100, (usuarioActual.xp / siguienteNivelInfo.xpRequerido) * 100)}%`,
                }}
              />
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Beneficio: {siguienteNivelInfo.beneficios[0]}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {podio2 && (
          <div
            onClick={() => setUsuarioPerfilModal(podio2)}
            className="glass-panel rounded-3xl p-6 border border-slate-700 bg-slate-900/80 text-center flex flex-col items-center justify-between cursor-pointer hover:border-slate-500 transition-all md:translate-y-4 shadow-xl"
          >
            <div className="relative mb-3">
              <img
                src={podio2.avatar}
                alt={podio2.nombre}
                className="w-20 h-20 rounded-full object-cover ring-4 ring-slate-400"
              />
              <span className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-slate-300 text-slate-950 font-black text-sm flex items-center justify-center border-2 border-slate-950">
                🥈 2
              </span>
            </div>
            <h3 className="font-extrabold text-base text-white">{podio2.nombre}</h3>
            <span className="text-xs text-slate-400 font-mono mt-0.5">{podio2.nickname}</span>
            <div className="mt-3 px-3 py-1 rounded-xl bg-slate-800 text-amber-400 font-bold text-xs">
              {podio2.xp} XP • Nivel {podio2.nivel}
            </div>
          </div>
        )}

        {podio1 && (
          <div
            onClick={() => setUsuarioPerfilModal(podio1)}
            className="glass-panel rounded-3xl p-8 border-2 border-amber-500 bg-gradient-to-b from-amber-500/20 via-slate-900 to-slate-950 text-center flex flex-col items-center justify-between cursor-pointer hover:scale-105 transition-all shadow-2xl glow-amber relative"
          >
            <div className="absolute -top-4 px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-lg">
              👑 Creador #1
            </div>
            <div className="relative mb-3 mt-2">
              <img
                src={podio1.avatar}
                alt={podio1.nombre}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-amber-400 shadow-xl"
              />
              <span className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-amber-400 text-slate-950 font-black text-base flex items-center justify-center border-2 border-slate-950">
                🥇 1
              </span>
            </div>
            <h3 className="font-extrabold text-lg text-white">{podio1.nombre}</h3>
            <span className="text-xs text-slate-400 font-mono mt-0.5">{podio1.nickname}</span>
            <div className="mt-4 px-4 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-sm shadow-md">
              {podio1.xp} XP • Nivel {podio1.nivel}
            </div>
          </div>
        )}

        {podio3 && (
          <div
            onClick={() => setUsuarioPerfilModal(podio3)}
            className="glass-panel rounded-3xl p-6 border border-amber-700/60 bg-slate-900/80 text-center flex flex-col items-center justify-between cursor-pointer hover:border-amber-600 transition-all md:translate-y-8 shadow-xl"
          >
            <div className="relative mb-3">
              <img
                src={podio3.avatar}
                alt={podio3.nombre}
                className="w-20 h-20 rounded-full object-cover ring-4 ring-amber-700"
              />
              <span className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-amber-700 text-white font-black text-sm flex items-center justify-center border-2 border-slate-950">
                🥉 3
              </span>
            </div>
            <h3 className="font-extrabold text-base text-white">{podio3.nombre}</h3>
            <span className="text-xs text-slate-400 font-mono mt-0.5">{podio3.nickname}</span>
            <div className="mt-3 px-3 py-1 rounded-xl bg-slate-800 text-amber-400 font-bold text-xs">
              {podio3.xp} XP • Nivel {podio3.nivel}
            </div>
          </div>
        )}
      </div>

      <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" /> Mapa de Niveles & Beneficios Desbloqueables
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-3">
          {niveles.map((n) => {
            const alcanzado = usuarioActual.nivel >= n.nivel;
            return (
              <div
                key={n.nivel}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col justify-between ${
                  alcanzado
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-500'
                }`}
              >
                <div>
                  <div className="flex items-center justify-center mb-1">
                    {alcanzado ? (
                      <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Lock className="w-4 h-4 text-slate-600" />
                    )}
                  </div>
                  <div className="font-black text-xs text-white">Nivel {n.nivel}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{n.xpRequerido} XP</div>
                </div>
                <div className="text-[10px] text-slate-300 font-semibold mt-2 line-clamp-2">
                  {n.nombre}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-white uppercase tracking-wider">
          Ranking General de Miembros ({miembrosOrdenados.length})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Posición</th>
                <th className="py-3 px-4">Miembro</th>
                <th className="py-3 px-4">Nivel</th>
                <th className="py-3 px-4">Publicaciones</th>
                <th className="py-3 px-4">Racha 🔥</th>
                <th className="py-3 px-4 text-right">Puntos XP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {miembrosOrdenados.map((m, idx) => {
                const esYo = m.id === usuarioActual.id;
                return (
                  <tr
                    key={m.id}
                    onClick={() => setUsuarioPerfilModal(m)}
                    className={`hover:bg-slate-900/80 cursor-pointer text-xs transition-colors ${
                      esYo ? 'bg-amber-500/10 font-bold' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <span
                        className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center ${
                          idx === 0
                            ? 'bg-amber-500 text-slate-950'
                            : idx === 1
                            ? 'bg-slate-300 text-slate-950'
                            : idx === 2
                            ? 'bg-amber-700 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        #{idx + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={m.avatar}
                          alt={m.nombre}
                          className="w-8 h-8 rounded-xl object-cover"
                        />
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            {m.nombre}
                            {esYo && <span className="text-[10px] text-amber-400">(Tú)</span>}
                          </div>
                          <div className="text-[10px] text-slate-400">{m.nickname}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                        Nivel {m.nivel}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{m.publicacionesCount} posts</td>
                    <td className="py-3 px-4 text-orange-400 font-bold">{m.rachaDias} días</td>
                    <td className="py-3 px-4 text-right font-black text-amber-400 text-sm">
                      {m.xp} XP
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
