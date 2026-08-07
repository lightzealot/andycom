import { supabase } from '../lib/supabaseClient';
import type { Usuario } from '../types';

export interface AuthResultado {
  exito: boolean;
  mensaje?: string;
  usuario?: Usuario;
  requiereConfirmacionEmail?: boolean;
}

export const authService = {
  // 1. Registro real con envío de correo de confirmación de Supabase
  async registrarUsuario(
    email: string,
    password: string,
    nombre: string,
    activoPrincipal: string,
    bio?: string
  ): Promise<AuthResultado> {
    if (!supabase) {
      return { exito: false, mensaje: 'Cliente de Supabase no configurado.' };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: {
            nombre: nombre.trim(),
            activo_principal: activoPrincipal,
            bio: bio || `Trader enfocado en ${activoPrincipal}.`,
          },
        },
      });

      if (error) {
        return { exito: false, mensaje: error.message };
      }

      if (!data.user) {
        return { exito: false, mensaje: 'No se pudo crear el usuario.' };
      }

      const id = data.user.id;
      const nuevoPerfil: Usuario = {
        id,
        nombre: nombre.trim(),
        nickname: `@${nombre.trim().toLowerCase().replace(/\s+/g, '')}`,
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250`,
        nivel: 1,
        xp: 50,
        rachaDias: 1,
        rol: 'Miembro',
        bio: bio || `Trader enfocado en ${activoPrincipal}.`,
        fechaRegistro: 'Hoy',
        insignias: [],
        publicacionesCount: 0,
        comentariosCount: 0,
      };

      // Guardar el perfil en la tabla de profiles de Supabase
      await supabase.from('profiles').upsert({
        id,
        nombre: nuevoPerfil.nombre,
        nickname: nuevoPerfil.nickname,
        avatar: nuevoPerfil.avatar,
        nivel: 1,
        xp: 50,
        rol: 'Miembro',
        bio: nuevoPerfil.bio,
        fecha_registro: 'Hoy',
        updated_at: new Date().toISOString(),
      });

      // Si data.session es null, significa que Supabase requiere confirmación de email
      const requiereConfirmacion = !data.session;

      return {
        exito: true,
        usuario: nuevoPerfil,
        requiereConfirmacionEmail: requiereConfirmacion,
        mensaje: requiereConfirmacion
          ? 'Te hemos enviado un correo de confirmación. Por favor revisa tu bandeja de entrada o spam para activar tu cuenta.'
          : '¡Cuenta creada y confirmada exitosamente!',
      };
    } catch (err: any) {
      return { exito: false, mensaje: err.message || 'Error en el servidor.' };
    }
  },

  // 2. Inicio de sesión real con Supabase
  async iniciarSesion(email: string, password: string): Promise<AuthResultado> {
    if (!supabase) {
      return { exito: false, mensaje: 'Cliente de Supabase no configurado.' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          return {
            exito: false,
            requiereConfirmacionEmail: true,
            mensaje: 'Tu correo aún no ha sido confirmado. Revisa tu bandeja de entrada o solicita un nuevo enlace.',
          };
        }
        return { exito: false, mensaje: error.message };
      }

      if (!data.user) {
        return { exito: false, mensaje: 'Usuario no encontrado.' };
      }

      // Obtener el perfil real desde la tabla profiles
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      let usuarioLogueado: Usuario;
      if (profileData) {
        usuarioLogueado = {
          id: profileData.id,
          nombre: profileData.nombre || data.user.email?.split('@')[0] || 'Miembro',
          nickname: profileData.nickname || `@${data.user.email?.split('@')[0]}`,
          avatar: profileData.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250`,
          nivel: profileData.nivel || 1,
          xp: profileData.xp || 50,
          rachaDias: 1,
          rol: (profileData.rol as any) || 'Miembro',
          bio: profileData.bio || '',
          fechaRegistro: profileData.fecha_registro || 'Hoy',
          insignias: [],
          publicacionesCount: 0,
          comentariosCount: 0,
        };
      } else {
        usuarioLogueado = {
          id: data.user.id,
          nombre: data.user.user_metadata?.nombre || data.user.email?.split('@')[0] || 'Miembro',
          nickname: `@${data.user.email?.split('@')[0]}`,
          avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250`,
          nivel: 1,
          xp: 50,
          rachaDias: 1,
          rol: data.user.email?.includes('admin') || data.user.email?.includes('andres') ? 'Admin' : 'Miembro',
          fechaRegistro: 'Hoy',
          insignias: [],
          publicacionesCount: 0,
          comentariosCount: 0,
        };
      }

      return {
        exito: true,
        usuario: usuarioLogueado,
        mensaje: `¡Bienvenido ${usuarioLogueado.nombre}!`,
      };
    } catch (err: any) {
      return { exito: false, mensaje: err.message || 'Error al iniciar sesión.' };
    }
  },

  // 3. Cerrar sesión
  async cerrarSesion() {
    if (supabase) {
      await supabase.auth.signOut();
    }
  },

  // 4. Reenviar correo de confirmación
  async reenviarConfirmacion(email: string): Promise<{ exito: boolean; mensaje: string }> {
    if (!supabase) return { exito: false, mensaje: 'Sin conexión a Supabase.' };
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
      });
      if (error) return { exito: false, mensaje: error.message };
      return { exito: true, mensaje: 'Correo de verificación reenviado exitosamente.' };
    } catch (err: any) {
      return { exito: false, mensaje: err.message || 'Error al reenviar.' };
    }
  },
};
