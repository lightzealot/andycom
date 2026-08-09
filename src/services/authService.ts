import { supabase } from '../lib/supabaseClient';
import type { Usuario } from '../types';
import { parseBioEnvelope, buildBioEnvelope } from './dbService';
import { mapearPerfilAUsuario } from '../utils/userHelper';

export interface AuthResponse {
  exito: boolean;
  mensaje?: string;
  usuario?: Usuario;
  requiereConfirmacionEmail?: boolean;
}

const REDIRECT_URL = 'https://comunidad.raxen.capital';

/** Genera un avatar con iniciales usando ui-avatars.com (sin dependencias externas) */
const avatarPorIniciales = (nombre: string): string => {
  const encodedName = encodeURIComponent(nombre.trim() || 'U');
  return `https://ui-avatars.com/api/?name=${encodedName}&background=0D0D0D&color=38bdf8&size=128&font-size=0.45&bold=true`;
};

/** Formatea la fecha de hoy en español */
const fechaHoy = (): string => {
  return new Date().toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const authService = {
  // 1. Registro real en Supabase Auth
  async registrar(
    email: string,
    password: string,
    nombre: string,
    activoPrincipal: string,
    respuestasOnboarding?: {
      pregunta1?: string;
      respuesta1?: string;
      pregunta2?: string;
      respuesta2?: string;
    }
  ): Promise<AuthResponse> {
    if (!supabase) {
      return {
        exito: false,
        mensaje: 'El servicio de autenticación no está disponible en este momento.',
      };
    }

    try {
      const redirectTarget = window.location.origin.includes('localhost')
        ? window.location.origin
        : REDIRECT_URL;

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: {
            nombre: nombre.trim(),
            activo_principal: activoPrincipal,
          },
          emailRedirectTo: redirectTarget,
        },
      });

      if (error) {
        return { exito: false, mensaje: error.message };
      }

      if (!data.user) {
        return { exito: false, mensaje: 'No se pudo crear la cuenta en este momento.' };
      }

      const id = data.user.id;
      const nombreLimpio = nombre.trim();
      const fechaRegistro = fechaHoy();

      let bioTextoBase = activoPrincipal ? `Trading en ${activoPrincipal}.` : '';
      if (respuestasOnboarding?.respuesta1) {
        bioTextoBase += ` | Exp: ${respuestasOnboarding.respuesta1}`;
      }

      const envelopeBio = buildBioEnvelope(
        bioTextoBase,
        [],
        0,
        1,
        [],
        [],
        avatarPorIniciales(nombreLimpio),
        undefined,
        undefined,
        `@${nombreLimpio.toLowerCase().replace(/\s+/g, '')}`,
        'Miembro',
        undefined,
        undefined,
        respuestasOnboarding
      );

      const nuevoPerfil: Usuario = {
        id,
        nombre: nombreLimpio,
        nickname: `@${nombreLimpio.toLowerCase().replace(/\s+/g, '')}`,
        // Avatar generado con las iniciales del nombre — sin fotos fake
        avatar: avatarPorIniciales(nombreLimpio),
        nivel: 1,
        xp: 0,
        rachaDias: 0,
        rol: 'Miembro',
        bio: bioTextoBase,
        respuestasOnboarding,
        fechaRegistro,
        insignias: [],
        publicacionesCount: 0,
        comentariosCount: 0,
      };

      // Guardar el perfil en la tabla 'profiles' de Supabase
      try {
        await supabase.from('profiles').upsert({
          id,
          email: email.trim(),
          nombre: nuevoPerfil.nombre,
          nickname: nuevoPerfil.nickname,
          avatar: nuevoPerfil.avatar,
          nivel: 1,
          xp: 0,
          rol: 'Miembro',
          bio: envelopeBio,
          fecha_registro: fechaRegistro,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      } catch (dbErr) {
        console.warn('Error guardando perfil en base de datos:', dbErr);
      }

      // Si data.session es null, Supabase requiere confirmación de email
      const requiereConfirmacion = !data.session;

      return {
        exito: true,
        usuario: nuevoPerfil,
        requiereConfirmacionEmail: requiereConfirmacion,
        mensaje: requiereConfirmacion
          ? 'Hemos enviado un correo de confirmación a tu email. Revisa también tu carpeta de Spam.'
          : `¡Bienvenido a Raxen Capital, ${nombreLimpio}!`,
      };
    } catch (err: any) {
      return { exito: false, mensaje: err.message || 'Error en el servidor de autenticación.' };
    }
  },

  // 2. Inicio de sesión real
  async iniciarSesion(email: string, password: string): Promise<AuthResponse> {
    if (!supabase) {
      return {
        exito: false,
        mensaje: 'El servicio de autenticación no está disponible.',
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        if (error.message.toLowerCase().includes('email not confirmed')) {
          return {
            exito: false,
            requiereConfirmacionEmail: true,
            mensaje: 'Tu correo aún no ha sido confirmado. Revisa tu bandeja de entrada/spam o haz clic en "Reenviar correo".',
          };
        }
        if (error.message.toLowerCase().includes('invalid login credentials')) {
          return {
            exito: false,
            mensaje: 'Credenciales inválidas. Por favor verifica tu correo y contraseña.',
          };
        }
        return { exito: false, mensaje: error.message };
      }

      if (!data.user) {
        return { exito: false, mensaje: 'No se encontró la información del usuario.' };
      }

      // Cargar el perfil real del usuario desde Supabase
      const usuario = await this.obtenerPerfil(data.user.id, data.user);

      return {
        exito: true,
        usuario,
        mensaje: `¡Bienvenido de nuevo, ${usuario.nombre}!`,
      };
    } catch (err: any) {
      return { exito: false, mensaje: err.message || 'Error al iniciar sesión.' };
    }
  },

  // 3. Obtener perfil real desde Supabase (sin datos fake)
  async obtenerPerfil(userId: string, authUser?: any): Promise<Usuario> {
    if (!supabase) {
      return this.crearPerfilFallback(userId, authUser);
    }

    try {
      // 1. Obtener todos los admin overrides desde Supabase profiles.bio
      const adminOverrides: Record<string, any> = {};
      try {
        const overridesLocalesStr = localStorage.getItem('raxen_admin_member_overrides');
        if (overridesLocalesStr) {
          Object.assign(adminOverrides, JSON.parse(overridesLocalesStr));
        }

        const { data: allProfilesWithBio } = await supabase.from('profiles').select('bio');
        if (allProfilesWithBio) {
          for (const p of allProfilesWithBio) {
            const env = parseBioEnvelope(p.bio);
            if (env.memberOverrides) {
              Object.assign(adminOverrides, env.memberOverrides);
            }
          }
        }
      } catch (_) {}

      // 2. Obtener el perfil del usuario autenticado
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profile) {
        const usuarioMapeado = mapearPerfilAUsuario(profile, adminOverrides);

        // Si es admin principal, asegurar su nombre
        const esAdminPrincipal =
          usuarioMapeado.id === '155d43f8-9a80-4e5e-8713-3fc52708c1d0' ||
          usuarioMapeado.id === 'admin' ||
          authUser?.email?.toLowerCase().includes('andyontrade') ||
          authUser?.email?.toLowerCase().includes('agomez87@gmail.com');

        if (esAdminPrincipal) {
          usuarioMapeado.rol = 'Admin';
          const authNombre = authUser?.user_metadata?.nombre || authUser?.user_metadata?.full_name;
          usuarioMapeado.nombre = authNombre && authNombre !== 'Trader' && authNombre !== 'Miembro' ? authNombre : 'Andy On Trade';
          usuarioMapeado.nickname = '@andyontrade';
        }

        // Insignias automáticas según XP
        const insignias: any[] = [];
        if (usuarioMapeado.xp >= 15) {
          insignias.push({
            id: 'primer-aporte',
            nombre: 'Primer Aporte',
            descripcion: 'Publicaste en la comunidad',
            icono: '✍️',
            color: 'bg-blue-500',
          });
        }
        if (usuarioMapeado.nivel >= 2) {
          insignias.push({
            id: 'trader-activo',
            nombre: 'Trader Activo',
            descripcion: 'Alcanzaste Nivel 2',
            icono: '🥉',
            color: 'bg-amber-500',
          });
        }
        if (usuarioMapeado.nivel >= 3) {
          insignias.push({
            id: 'backtester-pro',
            nombre: 'Backtester Pro',
            descripcion: 'Alcanzaste Nivel 3',
            icono: '🥈',
            color: 'bg-slate-400',
          });
        }
        if (usuarioMapeado.nivel >= 4) {
          insignias.push({
            id: 'analista-avanzado',
            nombre: 'Analista Avanzado',
            descripcion: 'Alcanzaste Nivel 4',
            icono: '🥇',
            color: 'bg-yellow-500',
          });
        }
        if (usuarioMapeado.nivel >= 5) {
          insignias.push({
            id: 'trader-fondeado',
            nombre: 'Trader Fondeado',
            descripcion: 'Trader Pro Fondeado',
            icono: '💎',
            color: 'bg-sky-500',
          });
        }
        usuarioMapeado.insignias = insignias;

        return usuarioMapeado;
      }
    } catch (err) {
      console.warn('No se pudo obtener el perfil de Supabase:', err);
    }

    // Si no existe perfil aún, crearlo automáticamente
    const nuevoPerfil = this.crearPerfilFallback(userId, authUser);

    // Intentar crear el perfil en BD si no existe
    if (supabase) {
      try {
        await supabase.from('profiles').upsert({
          id: userId,
          nombre: nuevoPerfil.nombre,
          nickname: nuevoPerfil.nickname,
          avatar: nuevoPerfil.avatar,
          nivel: 1,
          xp: 0,
          rol: 'Miembro',
          bio: '',
          fecha_registro: fechaHoy(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      } catch (_) {}
    }

    return nuevoPerfil;
  },

  crearPerfilFallback(userId: string, authUser?: any): Usuario {
    const nombre = authUser?.user_metadata?.nombre || authUser?.email?.split('@')[0] || 'Trader';
    return {
      id: userId,
      nombre,
      nickname: `@${nombre.toLowerCase().replace(/\s+/g, '')}`,
      avatar: avatarPorIniciales(nombre),
      nivel: 1,
      xp: 0,
      rachaDias: 0,
      rol: 'Miembro',
      bio: '',
      fechaRegistro: fechaHoy(),
      insignias: [],
      publicacionesCount: 0,
      comentariosCount: 0,
    };
  },

  // 4. Cerrar sesión en Supabase
  async cerrarSesion(): Promise<void> {
    if (supabase) {
      await supabase.auth.signOut();
    }
  },

  // 5. Reenviar email de confirmación
  async reenviarConfirmacion(email: string): Promise<{ exito: boolean; mensaje: string }> {
    if (!supabase) return { exito: false, mensaje: 'El servicio de correo no está disponible.' };
    try {
      const redirectTarget = window.location.origin.includes('localhost')
        ? window.location.origin
        : REDIRECT_URL;

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
        options: {
          emailRedirectTo: redirectTarget,
        },
      });
      if (error) return { exito: false, mensaje: error.message };
      return { exito: true, mensaje: '¡Correo de verificación reenviado! Revisa tu bandeja de entrada o spam.' };
    } catch (err: any) {
      return { exito: false, mensaje: err.message || 'Error al reenviar el correo.' };
    }
  },

  // 6. Restablecer contraseña (¿Olvidó su contraseña?)
  async recuperarPassword(email: string): Promise<{ exito: boolean; mensaje: string }> {
    if (!supabase) return { exito: false, mensaje: 'El servicio de recuperación no está disponible.' };
    try {
      const redirectTarget = window.location.origin.includes('localhost')
        ? window.location.origin
        : REDIRECT_URL;

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectTarget,
      });

      if (error) return { exito: false, mensaje: error.message };
      return {
        exito: true,
        mensaje: 'Te hemos enviado un correo con las instrucciones para restablecer tu contraseña. Revisa también tu carpeta de Spam.',
      };
    } catch (err: any) {
      return { exito: false, mensaje: err.message || 'Error al procesar la recuperación de contraseña.' };
    }
  },

  // 7. Cambiar contraseña del usuario actualmente autenticado (Perfil > Seguridad)
  async cambiarPassword(nuevaPassword: string): Promise<{ exito: boolean; mensaje: string }> {
    if (!supabase) return { exito: false, mensaje: 'El servicio de autenticación no está disponible.' };
    if (!nuevaPassword || nuevaPassword.trim().length < 6) {
      return { exito: false, mensaje: 'La contraseña debe tener al menos 6 caracteres.' };
    }
    try {
      const { error } = await supabase.auth.updateUser({
        password: nuevaPassword.trim(),
      });

      if (error) {
        return { exito: false, mensaje: error.message };
      }

      return {
        exito: true,
        mensaje: '¡Tu contraseña ha sido actualizada exitosamente! Tu cuenta ahora está protegida con tu nueva clave.',
      };
    } catch (err: any) {
      return { exito: false, mensaje: err?.message || 'Error inesperado al actualizar la contraseña.' };
    }
  },
};
