import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Flame, MessageSquare, Calendar, Zap, Crown, Upload, Edit, Check, Loader2 } from 'lucide-react';
import { isImageFile, readFileAsDataURL } from '../../utils/fileUploader';
import { dbService } from '../../services/dbService';

export const MemberProfileModal: React.FC = () => {
  const {
    usuarioPerfilModal,
    setUsuarioPerfilModal,
    usuarioActual,
    cambiarUsuarioActivo,
    setUsuarioChatActivo,
    setDmDrawerAbierto,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // Edit fields
  const [nombre, setNombre] = useState(usuarioPerfilModal?.nombre || '');
  const [bio, setBio] = useState(usuarioPerfilModal?.bio || '');
  const [avatar, setAvatar] = useState(usuarioPerfilModal?.avatar || '');
  const [twitter, setTwitter] = useState(usuarioPerfilModal?.enlaces?.twitter || '');
  const [linkedin, setLinkedin] = useState(usuarioPerfilModal?.enlaces?.linkedin || '');

  if (!usuarioPerfilModal) return null;

  const u = usuarioPerfilModal;
  const esMiPerfil = usuarioActual.id === u.id;

  const handleFileUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !isImageFile(file)) return;

    setGuardando(true);
    try {
      // 1. Convertir inmediatamente a Data URL para visualización en 0ms
      const dataUrl = await readFileAsDataURL(file);
      setAvatar(dataUrl);

      const usuarioActualizado = { ...usuarioActual, avatar: dataUrl };
      if (esMiPerfil) {
        cambiarUsuarioActivo(usuarioActualizado);
      }
      setUsuarioPerfilModal(usuarioActualizado);

      // 2. Guardar en base de datos Supabase
      await dbService.guardarPerfil(usuarioActualizado);

      // 3. Subir archivo a Supabase Storage
      const urlStorage = await dbService.subirArchivo(file, 'avatars');
      if (urlStorage) {
        const conStorageUrl = { ...usuarioActualizado, avatar: urlStorage };
        if (esMiPerfil) cambiarUsuarioActivo(conStorageUrl);
        setUsuarioPerfilModal(conStorageUrl);
        await dbService.guardarPerfil(conStorageUrl);
      }
    } catch (err) {
      console.warn('Error al cargar la imagen de perfil:', err);
    } finally {
      setGuardando(false);
    }
  };

  const handleGuardarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    const actualizado = {
      ...u,
      nombre: nombre.trim() || u.nombre,
      bio: bio.trim(),
      avatar: avatar || u.avatar,
      enlaces: {
        twitter: twitter.trim(),
        linkedin: linkedin.trim(),
      },
    };

    if (esMiPerfil) {
      cambiarUsuarioActivo(actualizado);
    }
    setUsuarioPerfilModal(actualizado);
    await dbService.guardarPerfil(actualizado);
    setModoEdicion(false);
    setGuardando(false);
  };

  const handleEnviarMensaje = () => {
    setUsuarioChatActivo(u);
    setUsuarioPerfilModal(null);
    setDmDrawerAbierto(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="raxen-card w-full max-w-lg p-6 sm:p-8 relative bg-white space-y-6 shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={() => setUsuarioPerfilModal(null)}
          className="absolute top-6 right-6 p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Profile Card Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          
          {/* Avatar with File Upload Overlay */}
          <div className="relative group">
            <img
              src={avatar || u.avatar}
              alt={u.nombre}
              className="w-20 h-20 rounded-full object-cover ring-2 ring-gray-300 shadow-sm"
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
                  className="absolute inset-0 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[10px] font-bold transition-all"
                  title="Subir foto desde tu dispositivo"
                >
                  <Upload className="w-4 h-4 mb-0.5" />
                  <span>{guardando ? 'Subiendo...' : 'Subir Foto'}</span>
                </button>
              </>
            )}

            {u.rol === 'Admin' && (
              <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-amber-400 text-black shadow-xs">
                <Crown className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-black text-gray-900 truncate">{u.nombre}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-800 text-xs font-bold border border-gray-200">
                {u.rol}
              </span>
            </div>
            <div className="text-xs text-gray-500 font-medium">{u.nickname}</div>
            
            <div className="flex items-center justify-center sm:justify-start gap-3 text-xs text-gray-700 font-bold pt-1">
              <span className="flex items-center gap-1 text-blue-700">
                <Zap className="w-3.5 h-3.5 fill-blue-600 text-blue-600" /> Nivel {u.nivel} ({u.xp} XP)
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-orange-700">
                <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-600" /> {u.rachaDias} d racha
              </span>
            </div>
          </div>
        </div>

        {/* PROFILE EDIT FORM */}
        {modoEdicion ? (
          <form onSubmit={handleGuardarPerfil} className="space-y-3 text-xs font-bold border-t border-gray-100 pt-3">
            <div>
              <label className="block text-gray-700 mb-1">Nombre Completo</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Biografía & Activos que operas</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Trader de Forex, índices, criptomonedas..."
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-gray-700 mb-1">Twitter / X</label>
                <input
                  type="url"
                  placeholder="https://twitter.com/..."
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">LinkedIn</label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/..."
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium"
                />
              </div>
            </div>

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
                {guardando ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                <span>Guardar en Supabase</span>
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* Bio Display */}
            {u.bio && (
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-700 leading-relaxed font-normal">
                {u.bio}
              </div>
            )}

            {/* Action Buttons & Socials */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                <Calendar className="w-3.5 h-3.5" />
                <span>{u.fechaRegistro}</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {esMiPerfil ? (
                  <button
                    onClick={() => setModoEdicion(true)}
                    className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-gray-100 border border-gray-200 text-gray-800 font-bold text-xs hover:bg-gray-200 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Edit className="w-3.5 h-3.5" /> Editar Mi Perfil
                  </button>
                ) : (
                  <button
                    onClick={handleEnviarMensaje}
                    className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gray-900 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-black transition-all shadow-sm"
                  >
                    <MessageSquare className="w-4 h-4" /> Mensaje Directo
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
