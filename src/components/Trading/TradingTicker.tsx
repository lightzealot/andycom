import React from 'react';
import { TrendingUp, TrendingDown, Flame } from 'lucide-react';

interface TickerItem {
  simbolo: string;
  nombre: string;
  precio: string;
  cambio: string;
  esPositivo: boolean;
}

const TICKERS_MERCADO: TickerItem[] = [
  { simbolo: 'EUR/USD', nombre: 'Euro / Dólar', precio: '1.08420', cambio: '+0.45%', esPositivo: true },
  { simbolo: 'NAS100', nombre: 'Nasdaq 100', precio: '19,840.50', cambio: '+1.28%', esPositivo: true },
  { simbolo: 'BTC/USD', nombre: 'Bitcoin', precio: '68,450.00', cambio: '+3.14%', esPositivo: true },
  { simbolo: 'XAU/USD', nombre: 'Oro', precio: '2,415.80', cambio: '+0.82%', esPositivo: true },
  { simbolo: 'GBP/JPY', nombre: 'Libra / Yen', precio: '198.320', cambio: '-0.21%', esPositivo: false },
  { simbolo: 'US30', nombre: 'Dow Jones', precio: '39,120.00', cambio: '+0.65%', esPositivo: true },
  { simbolo: 'ETH/USD', nombre: 'Ethereum', precio: '3,540.20', cambio: '+2.40%', esPositivo: true },
];

export const TradingTicker: React.FC = () => {
  return (
    <div className="bg-white border-b border-slate-200 overflow-hidden py-2 px-4 text-xs select-none shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 whitespace-nowrap pr-3 border-r border-slate-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-[11px] font-extrabold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-500" /> Mercado NY Abierto
          </span>
        </div>

        <div className="flex items-center space-x-6 overflow-x-auto no-scrollbar py-0.5">
          {TICKERS_MERCADO.map((item) => (
            <div key={item.simbolo} className="flex items-center gap-2 whitespace-nowrap font-mono text-xs">
              <span className="font-extrabold text-slate-800">{item.simbolo}</span>
              <span className="text-slate-600 font-semibold">{item.precio}</span>
              <span
                className={`flex items-center gap-0.5 font-black px-1.5 py-0.5 rounded text-[10px] ${
                  item.esPositivo
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                {item.esPositivo ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {item.cambio}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
