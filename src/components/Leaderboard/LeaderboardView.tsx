import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Trophy, Flame, Crown } from 'lucide-react';

export const LeaderboardView: React.FC = () => {
  const { miembros, usuarioActual, niveles, setUsuarioPerfilModal } = useApp();
  const [periodo, setPeriodo] = useState<'7dias' | '30dias' | 'historico'>('30dias');

  const miembrosOrdenados = [...miembros].sort((a, b) => b.xp - a.xp);
  const primero = miembrosOrdenados[0];
  const segundo = miembrosOrdenados[1];
  const tercero = miembrosOrdenados[2];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Top Banner */}
      <div className="glass-panel rounded-3xl p-8 border border-slate-200 bg-gradient-to-r from-amber-500/10 via-slate-50 to-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5" /> Tabla de Clasificación
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Tabla de Puntos & Niveles de Traders
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Gana XP compartiendo análisis (+15 XP), comentando (+10 XP) y completando cursos (+25 XP).
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center p-1 rounded-2xl bg-white border border-slate-200 shadow-xs">
          {[
            { id: '7dias', label: '7 Días' },
            { id: '30dias', label: '30 Días' },
            { id: 'historico', label: 'Histórico' },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriodo(p.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                periodo === p.id
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 items-end">
        {segundo && (
          <div
            onClick={() => setUsuarioPerfilModal(segundo)}
            className="glass-panel rounded-3xl p-6 border border-slate-200 text-center space-y-3 cursor-pointer hover:border-slate-400 transition-all order-2 sm:order-1 shadow-xs bg-white"
          >
            <div className="text-xs font-black text-slate-500 uppercase tracking-wider">🥈 2° Lugar</div>
            <div className="relative inline-block">
              <img
                src={segundo.avatar}
                alt={segundo.nombre}
                className="w-16 h-16 rounded-2xl object-cover mx-auto ring-4 ring-slate-300 shadow-md"
              />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900">{segundo.nombre}</h3>
            <div className="text-xs text-amber-800 font-bold">Nivel {segundo.nivel} • {segundo.xp} XP</div>
          </div>
        )}

        {primero && (
          <div
            onClick={() => setUsuarioPerfilModal(primero)}
            className="glass-panel rounded-3xl p-8 border-2 border-amber-400 bg-gradient-to-b from-amber-50 to-white text-center space-y-4 cursor-pointer hover:scale-105 transition-all order-1 sm:order-2 shadow-md relative"
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
              <Crown className="w-3.5 h-3.5 fill-slate-950" /> Líder del Mes
            </div>
            <div className="relative inline-block pt-2">
              <img
                src={primero.avatar}
                alt={primero.nombre}
                className="w-20 h-20 rounded-3xl object-cover mx-auto ring-4 ring-amber-400 shadow-lg"
              />
            </div>
            <h3 className="font-black text-base text-slate-900">{primero.nombre}</h3>
            <div className="text-sm font-black text-amber-800">
              Nivel {primero.nivel} • {primero.xp} XP
            </div>
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-black">
              <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-600" /> {primero.rachaDias} días racha
            </div>
          </div>
        )}

        {tercero && (
          <div
            onClick={() => setUsuarioPerfilModal(tercero)}
            className="glass-panel rounded-3xl p-6 border border-slate-200 text-center space-y-3 cursor-pointer hover:border-slate-400 transition-all order-3 sm:order-3 shadow-xs bg-white"
          >
            <div className="text-xs font-black text-amber-800 uppercase tracking-wider">🥉 3° Lugar</div>
            <div className="relative inline-block">
              <img
                src={tercero.avatar}
                alt={tercero.nombre}
                className="w-16 h-16 rounded-2xl object-cover mx-auto ring-4 ring-amber-200 shadow-md"
              />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900">{tercero.nombre}</h3>
            <div className="text-xs text-amber-800 font-bold">Nivel {tercero.nivel} • {tercero.xp} XP</div>
          </div>
        )}
      </div>

      {/* 9-Level Roadmap Grid */}
      <div className="glass-panel rounded-3xl p-8 border border-slate-200 space-y-6 shadow-xs bg-white">
        <div>
          <h2 className="text-lg font-black text-slate-900">Camino de Niveles & Recompensas</h2>
          <p className="text-xs text-slate-600 font-medium">Desbloquea cursos VIP, canales de análisis de Andy y sesiones privadas.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {niveles.map((n) => {
            const alcanzado = usuarioActual.xp >= n.xpRequerido;
            return (
              <div
                key={n.nivel}
                className={`p-4 rounded-2xl border transition-all ${
                  alcanzado
                    ? 'bg-amber-50/70 border-amber-300 text-slate-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 opacity-60 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-xs">
                    N{n.nivel}
                  </span>
                  <span className="text-xs font-black text-amber-800">{n.xpRequerido} XP</span>
                </div>
                <h4 className="font-extrabold text-sm text-slate-900 mb-1">{n.nombre}</h4>
                <ul className="space-y-1">
                  {n.beneficios.map((b, i) => (
                    <li key={i} className="text-[11px] text-slate-700 flex items-center gap-1 font-medium">
                      <span className="w-1 h-1 rounded-full bg-amber-600" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ranked Members Table */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-200 shadow-xs bg-white">
        <h2 className="text-base font-black text-slate-900 mb-4">Tabla General de Clasificación</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-black uppercase">
                <th className="py-3 px-4">Rango</th>
                <th className="py-3 px-4">Trader</th>
                <th className="py-3 px-4">Rol</th>
                <th className="py-3 px-4">Nivel</th>
                <th className="py-3 px-4 text-right">Puntos XP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {miembrosOrdenados.map((m, idx) => (
                <tr
                  key={m.id}
                  onClick={() => setUsuarioPerfilModal(m)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 font-black text-slate-700">#{idx + 1}</td>
                  <td className="py-3 px-4 flex items-center gap-3">
                    <img src={m.avatar} alt={m.nombre} className="w-8 h-8 rounded-xl object-cover ring-1 ring-slate-200" />
                    <div>
                      <div className="font-bold text-slate-900">{m.nombre}</div>
                      <div className="text-[10px] text-slate-500">{m.nickname}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 font-bold border border-slate-200">
                      {m.rol}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-black text-amber-800">Nivel {m.nivel}</td>
                  <td className="py-3 px-4 text-right font-black text-slate-900">{m.xp} XP</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
