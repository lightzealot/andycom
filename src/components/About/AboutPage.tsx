import React from 'react';
import { useApp } from '../../context/AppContext';
import { BookOpen, Calendar as CalendarIcon, Users, Check, Sparkles } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { comunidad, setTabActual, miembros, usuarioActual } = useApp();
  const adminReal = miembros.find((m) => m.rol === 'Admin') ||
    (usuarioActual.rol === 'Admin' ? usuarioActual : null) || comunidad.creador;
  const creadorNombre = adminReal?.nombre || 'Administrador';
  const creadorAvatar = adminReal?.avatar || comunidad.logo;
  const creadorBio = adminReal?.bio || 'Creador de la comunidad.';

  const bloques = [
    { icono: <BookOpen className="w-5 h-5" />, titulo: comunidad.nombreAula, texto: comunidad.beneficios[0] || 'Contenido organizado para avanzar a tu ritmo.' },
    { icono: <CalendarIcon className="w-5 h-5" />, titulo: 'Actividades', texto: comunidad.beneficios[1] || 'Encuentros y actividades para participar.' },
    { icono: <Users className="w-5 h-5" />, titulo: comunidad.nombreMiembros, texto: comunidad.beneficios[2] || 'Personas con intereses en común.' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <section className="community-card p-8 sm:p-12 text-center space-y-6 bg-white">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-black uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> {comunidad.tagline}
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight">{comunidad.tituloAcerca}</h1>
        <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">{comunidad.descripcion}</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button onClick={() => setTabActual('comunidad')} style={{ backgroundColor: comunidad.colorPrimario }} className="px-8 py-3.5 rounded-xl text-white font-black text-xs shadow-md">Ir a la comunidad</button>
          <button onClick={() => setTabActual('aula')} className="px-8 py-3.5 rounded-xl bg-white border border-gray-300 text-gray-900 font-bold text-xs">Explorar {comunidad.nombreAula}</button>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {bloques.map((bloque) => (
          <article key={bloque.titulo} className="community-card p-6 space-y-3 bg-white">
            <div style={{ color: comunidad.colorPrimario }} className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">{bloque.icono}</div>
            <h2 className="font-extrabold text-base text-gray-900">{bloque.titulo}</h2>
            <p className="text-xs text-gray-600 leading-relaxed">{bloque.texto}</p>
          </article>
        ))}
      </section>

      <section className="community-card p-8 bg-white grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <span style={{ color: comunidad.colorPrimario }} className="text-xs font-bold uppercase tracking-wider">El propósito de {comunidad.nombre}</span>
          <h2 className="text-2xl font-black text-gray-900">{comunidad.tagline}</h2>
          <p className="text-sm text-gray-600 leading-relaxed">{comunidad.filosofia}</p>
          <div className="space-y-2 pt-2">
            {comunidad.beneficios.map((item) => <div key={item} className="flex items-start gap-2 text-xs font-bold text-gray-800"><Check className="w-4 h-4 text-emerald-600 shrink-0" /><span>{item}</span></div>)}
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200 text-center space-y-3">
          <img src={creadorAvatar} alt={creadorNombre} onError={(e) => { e.currentTarget.src = comunidad.logo; }} className="w-20 h-20 rounded-full object-cover mx-auto ring-2 ring-gray-300 shadow-md" />
          <div><div className="font-black text-base text-gray-900">{creadorNombre}</div><div className="text-xs text-gray-500 font-medium">Creador de {comunidad.nombre}</div></div>
          <p className="text-xs text-gray-600 leading-relaxed">{creadorBio}</p>
        </div>
      </section>
    </div>
  );
};
