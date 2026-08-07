import { supabase } from '../lib/supabaseClient';
import type { Usuario } from '../types';

export interface AuthResponse {
  exito: boolean;
  mensaje?: string;
  usuario?: Usuario;
  requiereConfirmacionEmail?: boolean;
}

export const authService = {
  // 1. Registro real en Supabase Auth con confirmación de correo
  async registrar(
    email: string,
    password: string,
    nombre: string,
    activoPrincipal: string
  ): Promise<AuthResponse> {
    if (!supabase) {
      return {
        exito: false,
        mensaje: 'Supabase no está configurado. Asegúrate de definir VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tus variables de entorno.',
      };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: {
            nombre: nombre.trim(),
            activo_principal: activoPrincipal,
          },
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        return { exito: false, mensaje: error.message };
      }

      if (!data.user) {
        return { exito: false, mensaje: 'No se pudo crear la cuenta en Supabase.' };
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
        rol: email.toLowerCase().includes('andres') || email.toLowerCase().includes('admin') ? 'Admin' : 'Miembro',
        bio: `Trader enfocado en ${activoPrincipal}. Miembro de AndyOnTrade - Raxen Capital.`,
        fechaRegistro: 'Hoy',
        insignias: [],
        publicacionesCount: 0,
        comentariosCount: 0,
      };

      // Guardar el perfil en la tabla 'profiles' de Supabase
      try {
        await supabase.from('profiles').upsert({
          id,
          nombre: nuevoPerfil.nombre,
          nickname: nuevoPerfil.nickname,
          avatar: nuevoPerfil.avatar,
          nivel: 1,
          xp: 50,
          rol: nuevoPerfil.rol,
          bio: nuevoPerfil.bio,
          fecha_registro: 'Hoy',
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
          ? 'Hemos enviado un correo de verificación a tu email. Por favor confirma tu cuenta para iniciar sesión.'
          : '¡Cuenta creada y confirmada exitosamente!',
      };
    } catch (err: any) {
      return { exito: false, mensaje: err.message || 'Error en el servidor de autenticación.' };
    }
  },

  // 2. Inicio de sesión real con Supabase
  async iniciarSesion(email: string, password: string): Promise<AuthResponse> {
    if (!supabase) {
      return {
        exito: false,
        mensaje: 'Supabase no está conectado. Revisa tus variables de entorno.',
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
            mensaje: 'Tu correo aún no ha sido confirmado. Por favor revisa tu bandeja de entrada o carpeta de spam para verificar tu cuenta.',
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

  // 3. Obtener o crear perfil en Supabase
  async obtenerPerfil(userId: string, authUser?: any): Promise<Usuario> {
    if (!supabase) {
      return this.crearPerfilFallback(userId, authUser);
    }

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profile) {
        return {
          id: profile.id,
          nombre: profile.nombre || authUser?.user_metadata?.nombre || 'Trader',
          nickname: profile.nickname || `@${(profile.nombre || 'trader').toLowerCase().replace(/\s+/g, '')}`,
          avatar: profile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
          nivel: profile.nivel || 1,
          xp: profile.xp || 50,
          rachaDias: profile.racha_dias || 1,
          rol: profile.rol || (authUser?.email?.includes('admin') || authUser?.email?.includes('andres') ? 'Admin' : 'Miembro'),
          bio: profile.bio || '',
          fechaRegistro: profile.fecha_registro || 'Hoy',
          insignias: [],
          publicacionesCount: 0,
          comentariosCount: 0,
        };
      }
    } catch (err) {
      console.warn('No se pudo obtener el perfil de Supabase:', err);
    }

    return this.crearPerfilFallback(userId, authUser);
  },

  crearPerfilFallback(userId: string, authUser?: any): Usuario {
    const nombre = authUser?.user_metadata?.nombre || authUser?.email?.split('@')[0] || 'Miembro';
    return {
      id: userId,
      nombre,
      nickname: `@${nombre.toLowerCase().replace(/\s+/g, '')}`,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      nivel: 1,
      xp: 50,
      rachaDias: 1,
      rol: authUser?.email?.includes('admin') || authUser?.email?.includes('andres') ? 'Admin' : 'Miembro',
      bio: '',
      fechaRegistro: 'Hoy',
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
    if (!supabase) return { exito: false, mensaje: 'Supabase no conectado.' };
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) return { exito: false, mensaje: error.message };
      return { exito: true, mensaje: 'Correo de verificación reenviado exitosamente.' };
    } catch (err: any) {
      return { exito: false, mensaje: err.message || 'Error al reenviar.' };
    }
  },
};
