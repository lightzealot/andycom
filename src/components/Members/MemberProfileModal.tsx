import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X, Flame, Calendar, Zap, Crown,
  Upload, Edit, Check, Loader2, CheckCircle, Link,
  Lock, KeyRound, Shield, Eye, EyeOff, CheckCircle2, AlertCircle,
  LogOut,
} from 'lucide-react';
import { uploadFile } from '../../services/storageService';
import { dbService } from '../../services/dbService';
import { authService } from '../../services/authService';
import { formatearFechaRegistro } from '../../utils/dateFormatter';

export const MemberProfileModal: React.FC = () => {
  const {
    usuarioPerfilModal,
    setUsuarioPerfilModal,
    usuarioActual,
    cambiarUsuarioActivo,
    setMiembros,
    miembros,
    comunidad,
    cerrarSesion,
    preguntasRegistro,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [seccionModal, setSeccionModal] = useState<'perfil' | 'seguridad'>('perfil');
  const [modoEdicion, setModoEdicion] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [guardadoOk, setGuardadoOk] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null);

  // ── Campos de Seguridad / Cambio de Clave ──
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cambiandoPassword, setCambiandoPassword] = useState(false);
  const [exitoPassword, setExitoPassword] = useState<string | null>(null);
  const [errorPassword, setErrorPassword] = useState<string | null>(null);

  // ── Campos editables del perfil ──
  const [nombre, setNombre] = useState('');
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [twitter, setTwitter] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [respuesta1, setRespuesta1] = useState('');
  const [respuesta2, setRespuesta2] = useState('');

  // Sincronizar campos con el usuario actual del modal
  useEffect(() => {
    if (!usuarioPerfilModal) return;
    const live = miembros.find((m) => m.id === usuarioPerfilModal.id);
    const target = live || usuarioPerfilModal;
    setNombre(target.nombre || '');
    setNickname(target.nickname || '');
    setBio(target.bio || '');
    setAvatarPreview(target.avatar || '');
    setTwitter(target.enlaces?.twitter || '');
    setLinkedin(target.enlaces?.linkedin || '');
    setRespuesta1(target.respuestasOnboarding?.respuesta1 || '');
    setRespuesta2(target.respuestasOnboarding?.respuesta2 || '');
    setModoEdicion(false);
    setGuardadoOk(false);
    setSeccionModal('perfil');
    setNuevaPassword('');
    setConfirmarPassword('');
    setExitoPassword(null);
    setErrorPassword(null);
  }, [usuarioPerfilModal?.id]);

  // ── Regla de hooks: retorno condicional SIEMPRE después de todos los hooks ──
  if (!usuarioPerfilModal) return null;

  const miembroEnVivo = miembros.find((m) => m.id === usuarioPerfilModal.id);
  const esMiPerfil = usuarioActual?.id === usuarioPerfilModal.id;
  const u = miembroEnVivo ? { ...usuarioPerfilModal, ...miembroEnVivo } : (esMiPerfil ? usuarioActual : usuarioPerfilModal);

  // ── Subida de avatar ──
  const handleFileUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    setGuardando(true);
    setGuardadoOk(false);
    try {
      const { url: avatarUrl } = await uploadFile(file, 'avatars');

      setAvatarPreview(avatarUrl);

      const usuarioActualizado = { ...usuarioActual, ...u, avatar: avatarUrl };
      cambiarUsuarioActivo(usuarioActualizado);
      setUsuarioPerfilModal(usuarioActualizado);
      setMiembros((prev: any[]) =>
        prev.map((m: any) => (m.id === usuarioActualizado.id ? usuarioActualizado : m))
      );

      await dbService.guardarPerfil(usuarioActualizado);

      setGuardadoOk(true);
      setTimeout(() => setGuardadoOk(false), 3000);
    } catch (err) {
      console.warn('[Avatar] Error al subir imagen:', err);
    } finally {
      setGuardando(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ── Guardar perfil completo ──
  const handleGuardarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setErrorGuardado(null);

    const nicknameFinal = nickname.trim()
      ? (nickname.trim().startsWith('@') ? nickname.trim() : `@${nickname.trim()}`)
      : u.nickname;

    const respuestasActualizadas = {
      pregunta1: preguntasRegistro?.pregunta1 || u.respuestasOnboarding?.pregunta1 || '¿Cuál es tu nivel de experiencia en trading?',
      respuesta1: respuesta1.trim(),
      pregunta2: preguntasRegistro?.pregunta2 || u.respuestasOnboarding?.pregunta2 || '¿Cuál es tu principal objetivo en la comunidad?',
      respuesta2: respuesta2.trim(),
    };

    const bioFinal = bio.trim();

    const actualizado = {
      ...usuarioActual,
      ...u,
      nombre: nombre.trim() || u.nombre,
      nickname: nicknameFinal,
      bio: bioFinal,
      avatar: avatarPreview || u.avatar,
      respuestasOnboarding: respuestasActualizadas,
      enlaces: {
        twitter: twitter.trim(),
        linkedin: linkedin.trim(),
      },
    };

    setBio(bioFinal);
    setRespuesta1(respuesta1.trim());
    setRespuesta2(respuesta2.trim());
    cambiarUsuarioActivo(actualizado);
    setUsuarioPerfilModal(actualizado);
    setMiembros((prev: any[]) =>
      prev.map((m: any) => (m.id === actualizado.id ? actualizado : m))
    );
    setModoEdicion(false);
    setGuardadoOk(true);
    setTimeout(() => setGuardadoOk(false), 3000);

    const { error, detalle } = await dbService.guardarPerfil(actualizado);
    setGuardando(false);

    if (error) {
      const msg = detalle || (typeof error === 'string' ? error : error?.message || 'Error desconocido');
      setErrorGuardado(`Guardado localmente: ${msg}`);
      setTimeout(() => setErrorGuardado(null), 8000);
    }
  };

  // ── Cambio de Contraseña en Supabase Auth ──
  const handleCambiarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorPassword(null);
    setExitoPassword(null);

    if (!nuevaPassword || nuevaPassword.trim().length < 6) {
      setErrorPassword('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (nuevaPassword !== confirmarPassword) {
      setErrorPassword('Las contraseñas no coinciden. Verifícalas e inténtalo de nuevo.');
      return;
    }

    setCambiandoPassword(true);
    try {
      const res = await authService.cambiarPassword(nuevaPassword);
      if (res.exito) {
        setExitoPassword(res.mensaje || '¡Contraseña actualizada exitosamente!');
        setNuevaPassword('');
        setConfirmarPassword('');
      } else {
        setErrorPassword(res.mensaje || 'Error al actualizar la contraseña.');
      }
    } catch (err: any) {
      setErrorPassword(err?.message || 'Error inesperado al cambiar la clave.');
    } finally {
      setCambiandoPassword(false);
    }
  };

  const handleEnviarResetEmail = async () => {
    setErrorPassword(null);
    setExitoPassword(null);
    setCambiandoPassword(true);
    try {
      const email = (usuarioActual as any)?.email || localStorage.getItem('raxen_email_registrado') || '';
      if (!email) {
        setErrorPassword('Ingresa tu nueva contraseña en los campos anteriores para cambiarla directamente.');
        return;
      }
      const res = await authService.recuperarPassword(email);
      if (res.exito) {
        setExitoPassword(res.mensaje);
      } else {
        setErrorPassword(res.mensaje);
      }
    } catch (err: any) {
      setErrorPassword(err?.message || 'Error al enviar correo.');
    } finally {
      setCambiandoPassword(false);
    }
  };

  const avatarSrc = avatarPreview || u.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(u.nombre)}&background=0D0D0D&color=38bdf8&size=128`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="raxen-card w-full max-w-lg p-6 sm:p-8 relative bg-white space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">

        {/* Botón cerrar */}
        <button
          onClick={() => setUsuarioPerfilModal(null)}
          className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ── Pestañas de Perfil / Seguridad / Cerrar Sesión si es mi perfil ── */}
        {esMiPerfil && (
          <div className="flex flex-wrap items-center justify-between gap-2 pr-10">
            <div className="flex items-center gap-1.5 p-1 bg-gray-100/90 rounded-2xl text-xs font-bold">
              <button
                onClick={() => {
                  setSeccionModal('perfil');
                  setModoEdicion(false);
                }}
                className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                  seccionModal === 'perfil'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <span>👤 Mi Perfil</span>
              </button>
              <button
                onClick={() => {
                  setSeccionModal('seguridad');
                  setModoEdicion(false);
                }}
                className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                  seccionModal === 'seguridad'
                    ? 'bg-white text-amber-900 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>🔒 Seguridad</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setUsuarioPerfilModal(null);
                cerrarSesion();
              }}
              className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              title="Cerrar sesión en este dispositivo"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        )}

        {/* ── Vista de Seguridad / Cambio de Clave ── */}
        {esMiPerfil && seccionModal === 'seguridad' ? (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center gap-3 p-3.5 bg-amber-500/10 border border-amber-300/40 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-xs shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-gray-900">Seguridad & Cambio de Contraseña</h3>
                <p className="text-[11px] text-gray-500 font-medium">
                  Actualiza la clave de acceso de tu cuenta de forma segura.
                </p>
              </div>
            </div>

            {/* Mensajes de feedback */}
            {exitoPassword && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{exitoPassword}</span>
              </div>
            )}

            {errorPassword && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorPassword}</span>
              </div>
            )}

            <form onSubmit={handleCambiarPassword} className="space-y-3 text-xs font-bold">
              <div>
                <label className="block text-gray-700 mb-1">Nueva Contraseña</label>
                <div className="relative">
                  <input
                    type={mostrarPassword ? 'text' : 'password'}
                    value={nuevaPassword}
                    onChange={(e) => setNuevaPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:outline-none focus:bg-white focus:border-amber-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  >
                    {mostrarPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Confirmar Nueva Contraseña</label>
                <input
                  type={mostrarPassword ? 'text' : 'password'}
                  value={confirmarPassword}
                  onChange={(e) => setConfirmarPassword(e.target.value)}
                  placeholder="Repite la nueva contraseña"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:outline-none focus:bg-white focus:border-amber-500"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[11px] text-gray-500 space-y-1">
                <div className="flex items-center gap-1.5 font-medium">
                  <Shield className="w-3.5 h-3.5 text-amber-500" />
                  <span>Tu clave se encripta de forma segura con cifrado de nivel bancario.</span>
                </div>
                <div className="text-[10px] text-gray-400">
                  • Longitud mínima: 6 caracteres.<br />
                  • Te recomendamos incluir letras mayúsculas, números y símbolos.
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleEnviarResetEmail}
                  disabled={cambiandoPassword}
                  className="text-xs text-amber-700 hover:text-amber-900 font-bold underline"
                >
                  ¿Prefieres recibir un enlace por email?
                </button>

                <button
                  type="submit"
                  disabled={cambiandoPassword || !nuevaPassword}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 transition-all"
                >
                  {cambiandoPassword ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Actualizando...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Actualizar Contraseña</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            {/* ── Cabecera del perfil ── */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">

              {/* Avatar con overlay de subida */}
              <div className="relative group shrink-0">
                <img
                  src={avatarSrc}
                  alt={u.nombre}
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.nombre)}&background=0D0D0D&color=38bdf8&size=128`;
                  }}
                  className="w-20 h-20 rounded-full object-cover ring-2 ring-gray-300 shadow-sm bg-gray-100"
                />

                {esMiPerfil && (
                  <>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUploadAvatar}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={guardando}
                      className="absolute inset-0 rounded-full bg-black/65 text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[10px] font-bold transition-opacity disabled:cursor-wait"
                    >
                      {guardando
                        ? <Loader2 className="w-4 h-4 mb-0.5 animate-spin" />
                        : guardadoOk
                          ? <CheckCircle className="w-4 h-4 mb-0.5 text-emerald-400" />
                          : <Upload className="w-4 h-4 mb-0.5" />
                      }
                      <span>{guardando ? 'Guardando...' : guardadoOk ? '¡Listo!' : 'Cambiar'}</span>
                    </button>
                  </>
                )}

                {u.rol === 'Admin' && (
                  <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-amber-400 text-black shadow-sm">
                    <Crown className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>

              {/* Info del usuario */}
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-xl font-black text-gray-900 truncate">{u.nombre}</h2>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${
                    u.rol === 'Admin'
                      ? 'bg-amber-100 text-amber-900 border-amber-200'
                      : u.rol === 'Moderador'
                        ? 'bg-blue-100 text-blue-900 border-blue-200'
                        : 'bg-gray-100 text-gray-700 border-gray-200'
                  }`}>
                    {u.rol}
                  </span>
                </div>

                <div className="text-xs text-gray-500 font-medium">{u.nickname || `@${u.nombre.toLowerCase().replace(/\s+/g, '')}`}</div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs font-bold pt-1">
                  <span className="flex items-center gap-1 text-blue-700">
                    <Zap className="w-3.5 h-3.5 fill-blue-600 text-blue-600" />
                    Nivel {u.nivel} · {u.xp} XP
                  </span>
                  <span className="text-gray-300">|</span>
                  <span className="flex items-center gap-1 text-orange-700">
                    <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-600" />
                    {u.rachaDias} días racha
                  </span>
                </div>
              </div>
            </div>

            {/* ── Formulario de edición de Perfil ── */}
            {modoEdicion ? (
              <form onSubmit={handleGuardarPerfil} className="space-y-3 text-xs font-bold border-t border-gray-100 pt-4">
                <div>
                  <label className="block text-gray-700 mb-1">Nombre completo</label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">Nickname / Nombre de usuario (@usuario)</label>
                  <input
                    type="text"
                    value={nickname}
                    placeholder="@pepetrader"
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">Biografía · Activos que operas</label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Trader de Forex, índices, cripto..."
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:outline-none focus:border-blue-400"
                  />
                </div>

                {/* Preguntas de bienvenida editables */}
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2.5">
                  <div className="text-[11px] font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span>📋</span>
                    <span>Preguntas de Bienvenida</span>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1 text-[11px] font-bold">
                      {u.respuestasOnboarding?.pregunta1 || '1. ¿Cuál es tu nivel de experiencia en trading?'}
                    </label>
                    <input
                      type="text"
                      value={respuesta1}
                      onChange={(e) => setRespuesta1(e.target.value)}
                      placeholder="Tu nivel de experiencia..."
                      className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-xl text-gray-900 font-medium focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1 text-[11px] font-bold">
                      {u.respuestasOnboarding?.pregunta2 || '2. ¿Cuál es tu principal objetivo en la comunidad?'}
                    </label>
                    <input
                      type="text"
                      value={respuesta2}
                      onChange={(e) => setRespuesta2(e.target.value)}
                      placeholder="Tu objetivo principal..."
                      className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-xl text-gray-900 font-medium focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-gray-700 mb-1">Twitter / X</label>
                    <input
                      type="text"
                      placeholder="@usuario"
                      value={twitter}
                      onChange={(e) => setTwitter(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:outline-none focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">LinkedIn</label>
                    <input
                      type="text"
                      placeholder="linkedin.com/in/..."
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:outline-none focus:border-blue-400"
                    />
                  </div>
                </div>

                {/* Error de guardado */}
                {errorGuardado && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                    ⚠️ {errorGuardado}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setModoEdicion(false)}
                    className="px-4 py-2 text-gray-500 hover:text-gray-900 font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={guardando}
                    className="px-5 py-2 rounded-xl bg-gray-900 text-white font-bold hover:bg-black flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    {guardando
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : guardadoOk
                        ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        : <Check className="w-3.5 h-3.5" />
                    }
                    <span>{guardando ? 'Guardando...' : guardadoOk ? '¡Guardado!' : 'Guardar cambios'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <>
                {/* Biografía */}
                {u.bio && (
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-700 leading-relaxed font-normal">
                    {u.bio}
                  </div>
                )}

                {/* Respuestas de Bienvenida / Onboarding visibles para todos */}
                {u.respuestasOnboarding && (u.respuestasOnboarding.respuesta1 || u.respuestasOnboarding.respuesta2) && (
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
                    <div className="text-[11px] font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span>📋</span>
                      <span>Respuestas de Bienvenida & Perfil</span>
                    </div>

                    {u.respuestasOnboarding.respuesta1 && (
                      <div className="space-y-1">
                        <div className="text-[11px] font-bold text-slate-700">
                          {u.respuestasOnboarding.pregunta1 || '1. Nivel de experiencia en trading:'}
                        </div>
                        <div className="text-xs text-slate-900 font-medium bg-white/90 p-2.5 rounded-xl border border-amber-100 shadow-2xs">
                          {u.respuestasOnboarding.respuesta1}
                        </div>
                      </div>
                    )}

                    {u.respuestasOnboarding.respuesta2 && (
                      <div className="space-y-1">
                        <div className="text-[11px] font-bold text-slate-700">
                          {u.respuestasOnboarding.pregunta2 || '2. Objetivo principal en la comunidad:'}
                        </div>
                        <div className="text-xs text-slate-900 font-medium bg-white/90 p-2.5 rounded-xl border border-amber-100 shadow-2xs">
                          {u.respuestasOnboarding.respuesta2}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Links sociales */}
                {(u.enlaces?.twitter || u.enlaces?.linkedin) && (
                  <div className="flex flex-wrap gap-3">
                    {u.enlaces.twitter && (
                      <a
                        href={u.enlaces.twitter.startsWith('http') ? u.enlaces.twitter : `https://twitter.com/${u.enlaces.twitter.replace('@', '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        <Link className="w-3.5 h-3.5" />
                        <span>{u.enlaces.twitter}</span>
                      </a>
                    )}
                  </div>
                )}

                {/* Acciones y fecha */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatearFechaRegistro(u.fechaRegistro)}</span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {esMiPerfil ? (
                      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => {
                            setNombre(u.nombre || '');
                            setNickname(u.nickname || '');
                            setBio(u.bio || '');
                            setAvatarPreview(u.avatar || '');
                            setRespuesta1(u.respuestasOnboarding?.respuesta1 || '');
                            setRespuesta2(u.respuestasOnboarding?.respuesta2 || '');
                            setTwitter(u.enlaces?.twitter || '');
                            setLinkedin(u.enlaces?.linkedin || '');
                            setModoEdicion(true);
                          }}
                          className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-gray-100 border border-gray-200 text-gray-800 font-bold text-xs hover:bg-gray-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          Editar Datos
                        </button>
                        <button
                          onClick={() => setSeccionModal('seguridad')}
                          className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-bold text-xs hover:bg-amber-100 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Lock className="w-3.5 h-3.5 text-amber-600" />
                          Seguridad
                        </button>
                        <button
                          onClick={() => {
                            setUsuarioPerfilModal(null);
                            cerrarSesion();
                          }}
                          className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 font-bold text-xs hover:bg-red-100 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                          title="Cerrar sesión"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Cerrar sesión
                        </button>
                      </div>
                    ) : (
                      <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs">
                        Miembro de {comunidad.nombre}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};
