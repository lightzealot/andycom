import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  Video,
  Plus,
  Check,
  X,
  Trash2,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Sparkles,
} from 'lucide-react';
import type { Evento } from '../../types';

export const CalendarView: React.FC = () => {
  const { eventos, toggleRSVPEvento, crearNuevoEvento, eliminarEvento, usuarioActual, modoVistaAdmin } = useApp();
  const esAdmin = Boolean(modoVistaAdmin || usuarioActual?.rol === 'Admin');

  // State
  const [vista, setVista] = useState<'mes' | 'agenda'>('mes');
  const [fechaActual, setFechaActual] = useState(new Date());
  const [eventoSeleccionado, setEventoSeleccionado] = useState<Evento | null>(null);
  const [eventoEditando, setEventoEditando] = useState<Evento | null>(null);
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);

  // Create form state
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().slice(0, 16));
  const [duracion, setDuracion] = useState('60 min');
  const [tipo, setTipo] = useState('Llamada en Vivo');
  const [linkReunion, setLinkReunion] = useState('https://zoom.us/j/andyontrade-live');

  // Month navigation
  const mesActual = fechaActual.getMonth();
  const anioActual = fechaActual.getFullYear();

  const mesesNombres = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const diasSemana = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];

  const irAlMesAnterior = () => {
    setFechaActual(new Date(anioActual, mesActual - 1, 1));
  };

  const irAlMesSiguiente = () => {
    setFechaActual(new Date(anioActual, mesActual + 1, 1));
  };

  const irAHoy = () => {
    setFechaActual(new Date());
  };

  // Days grid generation
  const primerDiaMes = new Date(anioActual, mesActual, 1);
  const ultimoDiaMes = new Date(anioActual, mesActual + 1, 0);

  // Day of week for 1st day (0 = Sunday in JS, so convert to Monday = 0)
  let diaInicioSemana = primerDiaMes.getDay() - 1;
  if (diaInicioSemana === -1) diaInicioSemana = 6;

  const totalDiasMes = ultimoDiaMes.getDate();
  const diasMesAnteriorTotal = new Date(anioActual, mesActual, 0).getDate();

  interface DiaCalendario {
    dia: number;
    mes: number;
    anio: number;
    esMesActual: boolean;
    esHoy: boolean;
    fechaIso: string;
    eventos: Evento[];
  }

  const hoyDate = new Date();
  const hoyStr = `${hoyDate.getFullYear()}-${String(hoyDate.getMonth() + 1).padStart(2, '0')}-${String(hoyDate.getDate()).padStart(2, '0')}`;

  const diasGrid: DiaCalendario[] = [];

  // Previous month trailing days
  for (let i = diaInicioSemana - 1; i >= 0; i--) {
    const diaNum = diasMesAnteriorTotal - i;
    const mesNum = mesActual === 0 ? 11 : mesActual - 1;
    const anioNum = mesActual === 0 ? anioActual - 1 : anioActual;
    const fechaIso = `${anioNum}-${String(mesNum + 1).padStart(2, '0')}-${String(diaNum).padStart(2, '0')}`;
    const eventosDia = eventos.filter((e) => e.fechaInicio.startsWith(fechaIso));
    diasGrid.push({
      dia: diaNum,
      mes: mesNum,
      anio: anioNum,
      esMesActual: false,
      esHoy: fechaIso === hoyStr,
      fechaIso,
      eventos: eventosDia,
    });
  }

  // Current month days
  for (let diaNum = 1; diaNum <= totalDiasMes; diaNum++) {
    const fechaIso = `${anioActual}-${String(mesActual + 1).padStart(2, '0')}-${String(diaNum).padStart(2, '0')}`;
    const eventosDia = eventos.filter((e) => e.fechaInicio.startsWith(fechaIso));
    diasGrid.push({
      dia: diaNum,
      mes: mesActual,
      anio: anioActual,
      esMesActual: true,
      esHoy: fechaIso === hoyStr,
      fechaIso,
      eventos: eventosDia,
    });
  }

  // Next month leading days to complete full grid (multiples of 7)
  const celdasRestantes = (7 - (diasGrid.length % 7)) % 7;
  for (let diaNum = 1; diaNum <= celdasRestantes; diaNum++) {
    const mesNum = mesActual === 11 ? 0 : mesActual + 1;
    const anioNum = mesActual === 11 ? anioActual + 1 : anioActual;
    const fechaIso = `${anioNum}-${String(mesNum + 1).padStart(2, '0')}-${String(diaNum).padStart(2, '0')}`;
    const eventosDia = eventos.filter((e) => e.fechaInicio.startsWith(fechaIso));
    diasGrid.push({
      dia: diaNum,
      mes: mesNum,
      anio: anioNum,
      esMesActual: false,
      esHoy: fechaIso === hoyStr,
      fechaIso,
      eventos: eventosDia,
    });
  }

  // Handle Event Creation
  const handleCrearEvento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!esAdmin) {
      alert('Solo los administradores tienen permisos para programar o iniciar transmisiones en vivo.');
      return;
    }
    if (!titulo.trim()) return;

    const payloadBase = {
      titulo,
      descripcion,
      fechaInicio: new Date(fechaInicio).toISOString(),
      duracion,
      tipo,
      linkReunion,
      banner: '/raxen-banner.png',
    };

    try {
      if (eventoEditando) {
        await crearNuevoEvento({
          ...payloadBase,
          id: eventoEditando.id,
          anfitrion: eventoEditando.anfitrion,
          rsvpUsuarios: eventoEditando.rsvpUsuarios,
        });
        setEventoEditando(null);
      } else {
        await crearNuevoEvento(payloadBase);
      }
    } catch (err: any) {
      alert(`No se pudo guardar el evento globalmente: ${err?.message || 'Error desconocido'}`);
      return;
    }

    setModalCrearAbierto(false);
    setTitulo('');
    setDescripcion('');
  };

  const abrirModalEdicionEvento = (evento: Evento) => {
    setEventoEditando(evento);
    setTitulo(evento.titulo || '');
    setDescripcion(evento.descripcion || '');
    setFechaInicio(new Date(evento.fechaInicio).toISOString().slice(0, 16));
    setDuracion(evento.duracion || '60 min');
    setTipo(evento.tipo || 'Llamada en Vivo');
    setLinkReunion(evento.linkReunion || 'https://zoom.us/j/andyontrade-live');
    setEventoSeleccionado(null);
    setModalCrearAbierto(true);
  };

  const abrirModalProgramarEnDia = (fechaIso: string) => {
    if (!esAdmin) return;
    setFechaInicio(`${fechaIso}T09:30`);
    setModalCrearAbierto(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 animate-in fade-in">
      
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-slate-200 bg-gradient-to-r from-amber-500/10 via-slate-50 to-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 shadow-xs">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
            <CalendarIcon className="w-3.5 h-3.5" /> Calendario Mensual de Sesiones
          </div>
          <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Llamadas de Trading en Vivo & Backtesting
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            {esAdmin
              ? 'Panel de Administrador: Programa, transmite y gestiona las sesiones mensuales de trading.'
              : 'Consulta la programación mensual. Haz clic en cualquier sesión para confirmar tu asistencia (+15 XP).'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
          {/* Switch View Buttons */}
          <div className="flex items-center p-1 rounded-2xl bg-gray-100 border border-gray-200">
            <button
              onClick={() => setVista('mes')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                vista === 'mes'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Mensual</span>
            </button>
            <button
              onClick={() => setVista('agenda')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                vista === 'agenda'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Agenda</span>
            </button>
          </div>

          {/* Admin Schedule Button */}
          {esAdmin && (
            <button
              onClick={() => {
                setFechaInicio(new Date().toISOString().slice(0, 16));
                setModalCrearAbierto(true);
              }}
              className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-md hover:bg-amber-400 transition-all shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Programar Llamada (Admin)</span>
              <span className="sm:hidden">Programar (Admin)</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── VISTA MENSUAL (CALENDARIO DE PARED) ─── */}
      {vista === 'mes' && (
        <div className="space-y-4">
          
          {/* Month Navigation Toolbar */}
          <div className="flex items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-white border border-gray-200 shadow-xs">
            <div className="flex items-center gap-2 sm:gap-3">
              <h2 className="text-base sm:text-xl font-black text-gray-900 capitalize tracking-tight">
                {mesesNombres[mesActual]} {anioActual}
              </h2>
              <button
                onClick={irAHoy}
                className="px-2.5 sm:px-3 py-1 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition-colors cursor-pointer"
              >
                Hoy
              </button>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={irAlMesAnterior}
                className="p-1.5 sm:p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all cursor-pointer"
                title="Mes anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={irAlMesSiguiente}
                className="p-1.5 sm:p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all cursor-pointer"
                title="Mes siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Grid Container */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
            
            {/* Days of week header */}
            <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50/80 text-center">
              {diasSemana.map((dia, idx) => (
                <div
                  key={dia}
                  className={`py-2 sm:py-3 text-[10px] sm:text-[11px] font-black tracking-wider ${
                    idx >= 5 ? 'text-gray-400' : 'text-gray-700'
                  }`}
                >
                  {dia}
                </div>
              ))}
            </div>

            {/* Month Day Cells */}
            <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-gray-100">
              {diasGrid.map((diaItem, idx) => {
                const tieneEventos = diaItem.eventos.length > 0;

                return (
                  <div
                    key={`${diaItem.fechaIso}-${idx}`}
                    onClick={() => {
                      if (tieneEventos) {
                        setEventoSeleccionado(diaItem.eventos[0]);
                      } else if (esAdmin) {
                        abrirModalProgramarEnDia(diaItem.fechaIso);
                      }
                    }}
                    className={`min-h-[64px] sm:min-h-[120px] p-1 sm:p-2.5 transition-colors flex flex-col justify-between ${
                      !diaItem.esMesActual
                        ? 'bg-gray-50/50 text-gray-300'
                        : diaItem.esHoy
                        ? 'bg-amber-50/40 text-gray-900'
                        : 'bg-white text-gray-800 hover:bg-gray-50/80'
                    } ${tieneEventos || esAdmin ? 'cursor-pointer' : ''}`}
                  >
                    {/* Day number & today marker */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[11px] sm:text-xs font-bold w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full ${
                          diaItem.esHoy
                            ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                            : diaItem.esMesActual
                            ? 'text-gray-800'
                            : 'text-gray-400'
                        }`}
                      >
                        {diaItem.dia}
                      </span>

                      {/* Small badge if admin can add */}
                      {esAdmin && diaItem.esMesActual && !tieneEventos && (
                        <span className="hidden sm:inline opacity-0 hover:opacity-100 text-[10px] text-gray-400 hover:text-amber-600 transition-opacity font-bold">
                          +
                        </span>
                      )}
                    </div>

                    {/* Mobile event indicator (compact dot & count) */}
                    {tieneEventos && (
                      <div className="sm:hidden flex items-center justify-center gap-1 my-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500 shadow-xs animate-pulse" />
                        {diaItem.eventos.length > 1 && (
                          <span className="text-[9px] font-black text-amber-800">+{diaItem.eventos.length - 1}</span>
                        )}
                      </div>
                    )}

                    {/* Desktop Events pills inside the day */}
                    <div className="hidden sm:block space-y-1 mt-1 flex-1 overflow-hidden">
                      {diaItem.eventos.map((ev) => {
                        const hora = new Date(ev.fechaInicio).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit',
                        });

                        return (
                          <div
                            key={ev.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setEventoSeleccionado(ev);
                            }}
                            className="p-1.5 rounded-xl text-[10px] sm:text-xs font-bold leading-tight transition-all truncate shadow-2xs border bg-slate-900 text-white hover:bg-black border-slate-800 flex items-center gap-1"
                            title={`${ev.titulo} (${hora} EST)`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 animate-pulse" />
                            <span className="text-amber-400 text-[9px] shrink-0">{hora}</span>
                            <span className="truncate">{ev.titulo}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── VISTA AGENDA / PRÓXIMAS SESIONES ─── */}
      {vista === 'agenda' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {eventos.map((evento) => {
            const yaInscrito = evento.rsvpUsuarios.includes(usuarioActual.id);
            const fecha = new Date(evento.fechaInicio).toLocaleDateString('es-ES', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            });
            const hora = new Date(evento.fechaInicio).toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={evento.id}
                className="glass-panel rounded-3xl overflow-hidden border border-slate-200 flex flex-col justify-between shadow-xs bg-white"
              >
                <div>
                  <div className="relative aspect-21/9 overflow-hidden">
                    <img
                      src={evento.banner}
                      alt={evento.titulo}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-slate-900/90 text-white text-xs font-black flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span>{evento.tipo}</span>
                    </div>

                    {/* Botón de eliminar evento exclusivo para Admin */}
                    {esAdmin && (
                      <button
                        onClick={() => {
                          if (confirm('¿Eliminar esta sesión del calendario?')) {
                            eliminarEvento(evento.id);
                          }
                        }}
                        className="absolute top-3 right-3 p-2 rounded-xl bg-black/70 text-white hover:bg-red-600 transition-all"
                        title="Eliminar sesión (Admin)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <CalendarIcon className="w-4 h-4 text-amber-600" />
                        <span className="capitalize">{fecha}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span>{hora} EST ({evento.duracion})</span>
                      </div>
                    </div>

                    <h3 className="font-black text-base text-slate-900 leading-snug">
                      {evento.titulo}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {evento.descripcion}
                    </p>

                    <div className="flex items-center gap-2 pt-2 text-xs font-bold text-slate-700">
                      <Users className="w-4 h-4 text-slate-500" />
                      <span>{evento.rsvpUsuarios.length} Traders confirmados</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 flex items-center gap-3">
                  <button
                    onClick={() => toggleRSVPEvento(evento.id)}
                    className={`flex-1 py-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
                      yaInscrito
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-amber-500 text-slate-950 shadow-xs hover:bg-amber-400'
                    }`}
                  >
                    {yaInscrito ? (
                      <>
                        <Check className="w-4 h-4" /> Asistencia Confirmada (+15 XP)
                      </>
                    ) : (
                      'Confirmar Asistencia (RSVP)'
                    )}
                  </button>

                  {/* Botón de Transmitir en Vivo EXCLUSIVO para el Administrador */}
                  {esAdmin && (
                    <a
                      href={evento.linkReunion}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-3 rounded-2xl bg-gray-900 text-white hover:bg-black transition-all font-bold text-xs flex items-center gap-1.5 shadow-sm shrink-0"
                      title="Iniciar como Administrador / Host"
                    >
                      <Video className="w-4 h-4 text-amber-400" />
                      <span>Transmitir (Admin)</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── MODAL DETALLE DE SESIÓN EN VIVO ─── */}
      {eventoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 relative bg-white space-y-5">
            
            {/* Close Button */}
            <button
              onClick={() => setEventoSeleccionado(null)}
              className="absolute top-6 right-6 p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Event Header Banner */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 text-white text-xs font-black">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span>{eventoSeleccionado.tipo}</span>
              </div>
              <h2 className="text-xl font-black text-gray-900 leading-snug">
                {eventoSeleccionado.titulo}
              </h2>
            </div>

            {/* Date & Time Info */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 grid grid-cols-2 gap-3 text-xs font-bold text-gray-700">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-amber-600" />
                <span>
                  {new Date(eventoSeleccionado.fechaInicio).toLocaleDateString('es-ES', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>
                  {new Date(eventoSeleccionado.fechaInicio).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  EST ({eventoSeleccionado.duracion})
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-gray-600 leading-relaxed font-normal">
              {eventoSeleccionado.descripcion}
            </p>

            {/* Confirmed Traders */}
            <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
              <Users className="w-4 h-4 text-gray-500" />
              <span>{eventoSeleccionado.rsvpUsuarios.length} Traders confirmados para esta sesión</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => toggleRSVPEvento(eventoSeleccionado.id)}
                className={`flex-1 py-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
                  eventoSeleccionado.rsvpUsuarios.includes(usuarioActual.id)
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-amber-500 text-slate-950 shadow-xs hover:bg-amber-400'
                }`}
              >
                {eventoSeleccionado.rsvpUsuarios.includes(usuarioActual.id) ? (
                  <>
                    <Check className="w-4 h-4" /> Asistencia Confirmada (+15 XP)
                  </>
                ) : (
                  'Confirmar Asistencia (RSVP)'
                )}
              </button>

              {/* Botón de Transmitir si es Admin */}
              {esAdmin && (
                <a
                  href={eventoSeleccionado.linkReunion}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-3 rounded-2xl bg-gray-900 text-white hover:bg-black transition-all font-bold text-xs flex items-center gap-1.5 shadow-sm"
                  title="Abrir sala de Zoom / Meet como Anfitrión"
                >
                  <Video className="w-4 h-4 text-amber-400" />
                  <span>Transmitir (Admin)</span>
                </a>
              )}

              {esAdmin && (
                <button
                  onClick={() => abrirModalEdicionEvento(eventoSeleccionado)}
                  className="px-4 py-3 rounded-2xl bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 transition-all font-bold text-xs"
                  title="Editar sesión"
                >
                  Editar
                </button>
              )}

              {esAdmin && (
                <button
                  onClick={() => {
                    if (confirm('¿Eliminar esta sesión del calendario?')) {
                      eliminarEvento(eventoSeleccionado.id);
                      setEventoSeleccionado(null);
                    }
                  }}
                  className="px-4 py-3 rounded-2xl bg-red-600 text-white hover:bg-red-700 transition-all font-bold text-xs"
                  title="Eliminar sesión"
                >
                  Eliminar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL CREAR EVENTO (ADMIN ONLY) ─── */}
      {modalCrearAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 relative bg-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Programar Nueva Sesión en Vivo</span>
              </h2>
              <button
                onClick={() => setModalCrearAbierto(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCrearEvento} className="mt-4 space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-700 mb-1">Título de la Sesión</label>
                <input
                  type="text"
                  placeholder="Ej: Trading en Vivo - Apertura New York & London..."
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Descripción de la Estrategia o Tema</label>
                <textarea
                  rows={3}
                  placeholder="Explicación de los activos a operar (EUR/USD, Nasdaq, Gold)..."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">Fecha y Hora (EST)</label>
                  <input
                    type="datetime-local"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Tipo de Sesión</label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                  >
                    <option value="Llamada en Vivo">🔴 Llamada en Vivo</option>
                    <option value="Backtesting">📊 Sesión de Backtesting</option>
                    <option value="Q&A en Directo">💬 Preguntas & Respuestas</option>
                    <option value="Masterclass">🎓 Masterclass Especial</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">Duración</label>
                  <input
                    type="text"
                    value={duracion}
                    onChange={(e) => setDuracion(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Enlace de Zoom o Meet</label>
                  <input
                    type="url"
                    value={linkReunion}
                    onChange={(e) => setLinkReunion(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalCrearAbierto(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black shadow-xs hover:bg-amber-400 transition-all"
                >
                  {eventoEditando ? 'Guardar Cambios' : 'Publicar en el Calendario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
