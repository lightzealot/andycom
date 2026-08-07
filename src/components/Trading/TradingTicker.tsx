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
    <div className="bg-slate-950 border-b border-slate-800/80 overflow-hidden py-1.5 px-4 text-xs select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Market Status Badge */}
        <div className="flex items-center gap-2 whitespace-nowrap pr-3 border-r border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <Flame className="w-3 h-3 text-orange-400" /> Mercado NY Abierto
          </span>
        </div>

        {/* Ticker Slider */}
        <div className="flex items-center space-x-6 overflow-x-auto no-scrollbar py-0.5">
          {TICKERS_MERCADO.map((item) => (
            <div key={item.simbolo} className="flex items-center gap-2 whitespace-nowrap font-mono text-[11px]">
              <span className="font-bold text-white">{item.simbolo}</span>
              <span className="text-slate-400">{item.precio}</span>
              <span
                className={`flex items-center gap-0.5 font-extrabold px-1.5 py-0.2 rounded ${
                  item.esPositivo
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                {item.esPositivo ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                {item.cambio}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
