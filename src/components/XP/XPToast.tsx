import React from 'react';
import { useApp } from '../../context/AppContext';

export const XPToast: React.FC = () => {
  const { ultimoXPGanado, usuarioActual } = useApp();

  if (!ultimoXPGanado) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300 pointer-events-none">
      <div className="skool-card p-4 bg-gray-900 text-white shadow-2xl border border-gray-700 rounded-2xl flex items-center gap-3 max-w-sm">
        <div className="w-10 h-10 rounded-xl bg-amber-400 text-black flex items-center justify-center font-black text-base shadow-xs shrink-0">
          ⚡
        </div>

        <div>
          <div className="font-extrabold text-xs text-amber-300 flex items-center gap-1">
            <span>+{ultimoXPGanado.cantidad} XP Ganados</span>
          </div>
          <div className="text-xs text-gray-200 font-medium leading-snug">
            {ultimoXPGanado.razon}
          </div>
          <div className="text-[10px] text-gray-400 font-mono mt-0.5">
            Total: {usuarioActual.xp} XP • Nivel {usuarioActual.nivel}
          </div>
        </div>
      </div>
    </div>
  );
};
