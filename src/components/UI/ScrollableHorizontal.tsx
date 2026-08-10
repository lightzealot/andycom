import React, { useRef, useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  className?: string;
  gradientColor?: string; // Tailwind class e.g. 'from-white' or 'from-slate-50'
  showArrows?: boolean;
}

export const ScrollableHorizontal: React.FC<Props> = ({
  children,
  className = '',
  gradientColor = 'from-white',
  showArrows = true,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const hasOverflow = el.scrollWidth > el.clientWidth + 4;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(hasOverflow && el.scrollLeft < el.scrollWidth - el.clientWidth - 6);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
    }
    const timeout = setTimeout(checkScroll, 120);
    return () => {
      window.removeEventListener('resize', checkScroll);
      if (el) el.removeEventListener('scroll', checkScroll);
      clearTimeout(timeout);
    };
  }, [children]);

  const scrollByAmount = (amount: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group w-full">
      {/* Indicador izquierdo cuando hay contenido a la izquierda */}
      {canScrollLeft && (
        <div className={`absolute left-0 top-0 bottom-0 w-8 z-10 pointer-events-none bg-gradient-to-r ${gradientColor} dark:from-slate-900 to-transparent flex items-center justify-start pl-0.5`}>
          {showArrows && (
            <button
              type="button"
              onClick={() => scrollByAmount(-140)}
              className="pointer-events-auto p-1 rounded-full bg-white/95 text-slate-700 shadow-md border border-slate-200 hover:bg-slate-900 hover:text-white transition-all transform -translate-x-1 cursor-pointer"
              title="Desplazar a la izquierda"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Contenedor desplazable */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className={`overflow-x-auto no-scrollbar scroll-smooth flex items-center ${className}`}
      >
        {children}
      </div>

      {/* Indicador derecho animado cuando se puede deslizar a la derecha */}
      {canScrollRight && (
        <div className={`absolute right-0 top-0 bottom-0 w-10 z-10 pointer-events-none bg-gradient-to-l ${gradientColor} dark:from-slate-900 via-white/80 dark:via-slate-900/80 to-transparent flex items-center justify-end pr-0.5`}>
          {showArrows && (
            <button
              type="button"
              onClick={() => scrollByAmount(140)}
              className="pointer-events-auto p-1 rounded-full bg-white/95 text-slate-800 shadow-md border border-slate-200 hover:bg-slate-900 hover:text-white transition-all transform translate-x-1 cursor-pointer"
              title="Deslizar a la derecha"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
