import React, { useEffect, useRef, useState } from 'react';
import { BarChart3 } from 'lucide-react';

interface TradingViewWidgetProps {
  defaultSymbol?: string;
}

export const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ defaultSymbol = 'FX:EURUSD' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [simbolo, setSimbolo] = useState(defaultSymbol);

  const paresDisponibles = [
    { label: 'EUR/USD (Forex)', val: 'FX:EURUSD' },
    { label: 'Nasdaq 100 (Índices)', val: 'NASDAQ:NDX' },
    { label: 'Bitcoin (Crypto)', val: 'BINANCE:BTCUSDT' },
    { label: 'Oro / XAUUSD', val: 'OANDA:XAUUSD' },
    { label: 'GBP/JPY', val: 'FX:GBPJPY' },
  ];

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (window.TradingView && containerRef.current) {
        new window.TradingView.widget({
          autosize: true,
          symbol: simbolo,
          interval: '15',
          timezone: 'America/New_York',
          theme: 'light',
          style: '1',
          locale: 'es',
          toolbar_bg: '#f8fafc',
          enable_publishing: false,
          hide_top_toolbar: false,
          allow_symbol_change: true,
          container_id: 'tradingview_widget_container',
        });
      }
    };

    containerRef.current.appendChild(script);
  }, [simbolo]);

  return (
    <div className="glass-panel rounded-3xl p-6 border border-slate-200 bg-white shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center font-bold">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
              Gráfico en Vivo de TradingView (Price Action)
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">Analiza velas japonesas, rupturas y liquidez en tiempo real.</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar">
          {paresDisponibles.map((p) => (
            <button
              key={p.val}
              onClick={() => setSimbolo(p.val)}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                simbolo === p.val
                  ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                  : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-video min-h-[420px] bg-white">
        <div id="tradingview_widget_container" className="w-full h-full" />
        <div ref={containerRef} />
      </div>
    </div>
  );
};

declare global {
  interface Window {
    TradingView: any;
  }
}
