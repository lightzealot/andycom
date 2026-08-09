import { supabase } from '../lib/supabaseClient';

function normalizarTexto(txt?: string): string {
  if (!txt) return '';
  return txt
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .replace(/s$/, '');
}

// ── Envelope format for profiles.bio ──
// Stores BOTH the real user biography AND their posts in a single field.
// Format: {"__bio__": "real bio text", "__posts__": [...posts...]}
// Legacy: if bio starts with "[" it's old-style posts-only (bio is lost).
// Otherwise: bio is plain text with no posts.

export interface BioEnvelope {
  bio: string;
  avatar?: string;
  nickname?: string;
  xp?: number;
  nivel?: number;
  posts: any[];
  deletedPosts?: string[];
  deletedComments?: string[];
  communityMeta?: any;
  categorias?: string[];
}

export function parseBioEnvelope(rawBio: string | null | undefined): BioEnvelope {
  if (!rawBio) return { bio: '', posts: [] };

  // New envelope format with bio, avatar, xp, nickname, posts, communityMeta, and categories
  if (rawBio.startsWith('{"__bio__"') || rawBio.startsWith('{"__')) {
    try {
      const envelope = JSON.parse(rawBio);
      return {
        bio: envelope.__bio__ || '',
        avatar: envelope.__avatar__ || undefined,
        nickname: envelope.__nickname__ || undefined,
        xp: typeof envelope.__xp__ === 'number' ? envelope.__xp__ : undefined,
        nivel: typeof envelope.__nivel__ === 'number' ? envelope.__nivel__ : undefined,
        posts: Array.isArray(envelope.__posts__) ? envelope.__posts__ : [],
        deletedPosts: Array.isArray(envelope.__deleted_posts__) ? envelope.__deleted_posts__ : [],
        deletedComments: Array.isArray(envelope.__deleted_comments__) ? envelope.__deleted_comments__ : [],
        communityMeta: envelope.__community_meta__ || undefined,
        categorias: Array.isArray(envelope.__categories__) ? envelope.__categories__ : undefined,
      };
    } catch {
      return { bio: rawBio, posts: [] };
    }
  }

  // Legacy format: raw JSON array of posts (bio was lost)
  if (rawBio.startsWith('[')) {
    try {
      const posts = JSON.parse(rawBio);
      return { bio: '', posts: Array.isArray(posts) ? posts : [] };
    } catch {
      return { bio: rawBio, posts: [] };
    }
  }

  // Plain text bio, no posts
  return { bio: rawBio, posts: [] };
}

export function buildBioEnvelope(
  bio: string,
  posts: any[],
  xp?: number,
  nivel?: number,
  deletedPosts?: string[],
  deletedComments?: string[],
  avatar?: string,
  communityMeta?: any,
  categorias?: string[],
  nickname?: string
): string {
  const envelope: Record<string, any> = {
    __bio__: bio || '',
    __posts__: (posts || []).slice(0, 60),
  };
  if (avatar) envelope.__avatar__ = avatar;
  if (nickname) envelope.__nickname__ = nickname;
  if (typeof xp === 'number') envelope.__xp__ = xp;
  if (typeof nivel === 'number') envelope.__nivel__ = nivel;
  if (Array.isArray(deletedPosts) && deletedPosts.length > 0) envelope.__deleted_posts__ = deletedPosts.slice(-100);
  if (Array.isArray(deletedComments) && deletedComments.length > 0) envelope.__deleted_comments__ = deletedComments.slice(-100);
  if (communityMeta) envelope.__community_meta__ = communityMeta;
  if (Array.isArray(categorias) && categorias.length > 0) envelope.__categories__ = categorias;
  return JSON.stringify(envelope);
}

// ── Envelope format for courses.description ──
// Stores BOTH the course description AND its complete modules & lessons structure in Supabase courses.description
// Format: {"__desc__": "course description", "__modulos__": [...]}

export function parseCourseEnvelope(rawDesc: string | null | undefined): { descripcion: string; modulos: any[] } {
  if (!rawDesc) return { descripcion: '', modulos: [] };

  if (rawDesc.startsWith('{"__desc__"')) {
    try {
      const envelope = JSON.parse(rawDesc);
      return {
        descripcion: envelope.__desc__ || '',
        modulos: Array.isArray(envelope.__modulos__) ? envelope.__modulos__ : [],
      };
    } catch {
      return { descripcion: rawDesc, modulos: [] };
    }
  }

  // Si es JSON general
  try {
    const parsed = JSON.parse(rawDesc);
    if (parsed && typeof parsed === 'object' && ('__desc__' in parsed || '__modulos__' in parsed)) {
      return {
        descripcion: parsed.__desc__ || '',
        modulos: Array.isArray(parsed.__modulos__) ? parsed.__modulos__ : [],
      };
    }
  } catch {}

  return { descripcion: rawDesc, modulos: [] };
}

export function buildCourseEnvelope(descripcion: string, modulos: any[]): string {
  return JSON.stringify({
    __desc__: descripcion || '',
    __modulos__: modulos || [],
  });
}


export const dbService = {
  // Subida de archivos con fallback a Base64
  async subirArchivo(file: File, carpeta = 'posts'): Promise<string> {
    try {
      if (!supabase) {
        return this.convertirABase64(file);
      }

      const extension = file.name.split('.').pop();
      const nombreArchivo = `${carpeta}/${Date.now()}_${Math.random().toString(36).substring(7)}.${extension}`;
      
      const { data, error } = await supabase.storage
        .from('community_media')
        .upload(nombreArchivo, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        return this.convertirABase64(file);
      }

      const { data: urlData } = supabase.storage
        .from('community_media')
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (err) {
      return this.convertirABase64(file);
    }
  },

  convertirABase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  },

  // Perfiles de Usuario — resiliente a diferencias de esquema y con respaldo local
  async guardarPerfil(perfil: any): Promise<{ error: any | null; detalle?: string }> {
    // 1. Guardar siempre en almacenamiento local para asegurar persistencia inmediata
    try {
      const perfilesLocalesStr = localStorage.getItem('raxen_perfiles_cache') || '{}';
      const perfilesLocales = JSON.parse(perfilesLocalesStr);
      perfilesLocales[perfil.id] = { ...perfil, updated_at: new Date().toISOString() };
      localStorage.setItem('raxen_perfiles_cache', JSON.stringify(perfilesLocales));
      localStorage.setItem('raxen_usuario', JSON.stringify(perfil));
    } catch (e) {
      console.warn('[DB] No se pudo guardar en localStorage cache:', e);
    }

    if (!supabase) return { error: null };
    if (!perfil.id) return { error: 'ID vacío', detalle: 'Cierra sesión y vuelve a entrar.' };

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return { error: 'Sin sesión', detalle: 'Tu sesión expiró. Cierra sesión y vuelve a entrar.' };

      const uid = session.user.id;
      const nombreFinal = perfil.nombre?.trim() || 'Miembro';
      const nicknameFinal = perfil.nickname?.trim() || `@${nombreFinal.toLowerCase().replace(/\s+/g, '')}`;
      const avatarFinal = perfil.avatar || null;
      const xpFinal = Number(perfil.xp) || 0;
      const nivelFinal = Number(perfil.nivel) || 1;
      const rachaFinal = Number(perfil.rachaDias ?? perfil.racha_dias ?? 1);

      // Guardar también en claves locales independientes a prueba de fallos
      try {
        localStorage.setItem(`raxen_xp_${uid}`, String(xpFinal));
        localStorage.setItem(`raxen_nivel_${uid}`, String(nivelFinal));
      } catch (_) {}

      // Leer el envelope actual para incluir xp y nivel en el envelope de profiles.bio
      let bioText = perfil.bio;
      let postsActuales: any[] = [];
      let currentDeletedPosts: string[] | undefined;
      let currentDeletedComments: string[] | undefined;
      let currentMeta: any = undefined;
      let currentCats: string[] | undefined = undefined;
      try {
        const { data: currentProfile } = await supabase.from('profiles').select('bio, xp, points, nivel, level').eq('id', uid).single();
        const currentEnvelope = parseBioEnvelope(currentProfile?.bio);
        postsActuales = currentEnvelope.posts;
        currentDeletedPosts = currentEnvelope.deletedPosts;
        currentDeletedComments = currentEnvelope.deletedComments;
        currentMeta = currentEnvelope.communityMeta;
        currentCats = currentEnvelope.categorias;
        if (bioText === undefined || bioText === '') {
          bioText = currentEnvelope.bio;
        }
      } catch (_) {}

      const bioEnvelopeFinal = buildBioEnvelope(
        bioText || '',
        postsActuales,
        xpFinal,
        nivelFinal,
        currentDeletedPosts,
        currentDeletedComments,
        avatarFinal || undefined,
        currentMeta,
        currentCats
      );

      // Guardar avatar en cache local por usuario
      if (avatarFinal) {
        try {
          localStorage.setItem(`raxen_avatar_${uid}`, avatarFinal);
        } catch (_) {}
      }

      // En el UPDATE para profiles, NO enviamos 'id' en el cuerpo (el .eq('id', uid) ya lo especifica)
      const payloadEditable: Record<string, any> = {
        nombre: nombreFinal,
        full_name: nombreFinal,
        nickname: nicknameFinal,
        username: nicknameFinal,
        avatar: avatarFinal,
        avatar_url: avatarFinal,
        xp: xpFinal,
        points: xpFinal,
        nivel: nivelFinal,
        level: nivelFinal,
        racha_dias: rachaFinal,
        bio: bioEnvelopeFinal,
        updated_at: new Date().toISOString(),
      };

      console.info('[DB] Enviando payload editable con Avatar y XP a Supabase:', payloadEditable);

      // Sincronizar metadatos en Supabase Auth
      try {
        await supabase.auth.updateUser({
          data: {
            avatar: avatarFinal,
            avatar_url: avatarFinal,
            nombre: nombreFinal,
            full_name: nombreFinal,
          },
        });
      } catch (_) {}

      // Intentar primero UPDATE para solo modificar campos editables sin tocar las columnas protegidas
      const { error: errUpdate } = await supabase
        .from('profiles')
        .update(payloadEditable)
        .eq('id', uid);

      if (!errUpdate) {
        console.info('[DB] ✅ Perfil y Avatar actualizados exitosamente en Supabase');
        return { error: null };
      }

      // Fallback robusto con avatar, nombre y envelope
      const { error: errFallback } = await supabase
        .from('profiles')
        .update({
          avatar: avatarFinal,
          avatar_url: avatarFinal,
          nombre: nombreFinal,
          bio: bioEnvelopeFinal,
          updated_at: new Date().toISOString(),
        })
        .eq('id', uid);

      if (!errFallback) {
        console.info('[DB] ✅ Perfil y Avatar guardados con fallback en Supabase');
        return { error: null };
      }

      const detalle = `Código: ${errUpdate.code} | ${errUpdate.message}`;
      console.error('[DB] ❌ Error Supabase al guardar perfil:', detalle);
      return { error: errUpdate, detalle };
    } catch (err: any) {
      return { error: err, detalle: err?.message || 'Error desconocido' };
    }
  },

  // Publicaciones — persistencia garantizada en local y en Supabase
  // ARQUITECTURA: Cada usuario guarda SUS posts en su PROPIO profiles.bio (RLS lo permite).
  // Al cargar, se agregan los posts de TODOS los profiles.bio.
  async guardarPost(post: any) {
    // 1. Guardar en almacenamiento local para no perderse jamás al refrescar
    try {
      const postsLocalesStr = localStorage.getItem('raxen_posts') || '[]';
      const postsLocales: any[] = JSON.parse(postsLocalesStr);
      const normNuevo = normalizarTexto(post.titulo);
      const index = postsLocales.findIndex(
        (p) => p.id === post.id || (normNuevo && normalizarTexto(p.titulo) === normNuevo)
      );
      if (index >= 0) {
        postsLocales[index] = { ...postsLocales[index], ...post };
      } else {
        postsLocales.unshift(post);
      }
      localStorage.setItem('raxen_posts', JSON.stringify(postsLocales));
      localStorage.setItem(`raxen_post_edit_${post.id}`, JSON.stringify(post));
    } catch (e) {
      console.warn('[DB] Error guardando post en localStorage:', e);
    }

    if (!supabase) return;

    // 2. Guardar en el profiles.bio ÚNICAMENTE si el post le pertenece al usuario actual
    // RLS solo permite a cada usuario modificar su propio perfil
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) {
        return;
      }

      // No contaminar el bio del usuario autenticado con posts de otros autores
      const postAutorId = post.autorId || post.autor?.id;
      if (postAutorId && postAutorId !== userId) {
        return;
      }

      // Leer el envelope actual del perfil de ESTE usuario
      const { data: myProfile } = await supabase.from('profiles').select('bio').eq('id', userId).single();
      const envelope = parseBioEnvelope(myProfile?.bio);
      let misPosts = envelope.posts;

      // Crear una versión limpia del post para almacenar (sin datos circulares pesados)
      const postLimpio = {
        id: post.id,
        titulo: post.titulo,
        contenido: post.contenido,
        categoria: post.categoria,
        fijado: Boolean(post.fijado),
        fecha: post.fecha,
        likes: post.likes || 0,
        imagen: post.imagen || undefined,
        videoUrl: post.videoUrl || undefined,
        autorId: userId,
        autorNombre: post.autor?.nombre || 'Trader',
        autorNickname: post.autor?.nickname || '@trader',
        autorAvatar: post.autor?.avatar || '',
        autorRol: post.autor?.rol || 'Miembro',
      };

      const normP = normalizarTexto(post.titulo);
      const idxExistente = misPosts.findIndex(
        (p) => p.id === post.id || (normP && normalizarTexto(p.titulo) === normP)
      );
      if (idxExistente >= 0) {
        misPosts[idxExistente] = { ...misPosts[idxExistente], ...postLimpio };
      } else {
        misPosts.unshift(postLimpio);
      }

      // Guardar con envelope (preserva la bio real, XP y listas de eliminados)
      const { error: errBio } = await supabase
        .from('profiles')
        .update({
          bio: buildBioEnvelope(envelope.bio, misPosts, envelope.xp, envelope.nivel, envelope.deletedPosts, envelope.deletedComments),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (errBio) {
        console.warn('[DB] Error guardando posts en mi perfil:', errBio.message);
      } else {
        console.info('[DB] ✅ Post guardado en mi profiles.bio (bio preservada).');
      }
    } catch (e) {
      console.warn('[DB] Error en sincronización profiles.bio:', e);
    }

    // 4. Intentar insertar en tabla posts (puede fallar por RLS, no es crítico)
    try {
      let idValido = post.id;
      const esUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idValido);
      if (!esUuid) {
        idValido = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `a0eebc99-9c0b-4ef8-bb6d-${String(Date.now()).slice(-12).padStart(12, '0')}`;
        post.id = idValido;
      }

      const { data: { session } } = await supabase.auth.getSession();
      const authorId = session?.user?.id || '155d43f8-9a80-4e5e-8713-3fc52708c1d0';

      const payload = {
        id: idValido,
        author_id: authorId,
        title: post.titulo,
        content: post.contenido,
        is_pinned: Boolean(post.fijado),
        image_url: post.imagen || post.videoUrl || null,
        updated_at: new Date().toISOString(),
      };

      await supabase.from('posts').upsert({ ...payload, created_at: new Date().toISOString() }, { onConflict: 'id' });
    } catch (_) {
      // RLS may block this — that's OK, profiles.bio is the source of truth
    }

    // 5. Broadcast en canal de realtime para que llegue a todos los usuarios conectados
    try {
      if (supabase) {
        const canal = supabase.channel('realtime-sync-channel');
        canal.send({
          type: 'broadcast',
          event: 'nuevo_post',
          payload: post,
        });
      }
    } catch (_) {}
  },

  async cargarPosts(perfilesMap: Map<string, any>) {
    const postsPorId = new Map<string, any>();
    const postsVistos = new Set<string>();
    const eliminadosStr = localStorage.getItem('raxen_posts_eliminados') || '[]';
    const eliminadosIds: string[] = JSON.parse(eliminadosStr);
    const eliminadosComStr = localStorage.getItem('raxen_comentarios_eliminados') || '[]';
    const eliminadosComIds: string[] = JSON.parse(eliminadosComStr);

    const globalDeletedPosts = new Set<string>(eliminadosIds);
    const globalDeletedComments = new Set<string>(eliminadosComIds);

    let fijadosIds: string[] = [];
    try {
      const fijadosStr = localStorage.getItem('raxen_posts_fijados') || '[]';
      fijadosIds = JSON.parse(fijadosStr);
    } catch {}

    if (supabase) {
      // 1. FUENTE PRINCIPAL: Cargar posts de TODOS los profiles.bio
      // Cada usuario guarda sus posts en su propio perfil — aquí los agregamos todos
      try {
        const { data: allProfiles } = await supabase
          .from('profiles')
          .select('id, bio, nombre, full_name, nickname, username, avatar, avatar_url, rol, role, nivel, level, xp, points, racha_dias, fecha_registro, created_at');

        if (allProfiles && allProfiles.length > 0) {
          // Paso 1: Recopilar todas las listas de eliminados de los envelopes de todos los usuarios
          for (const profile of allProfiles) {
            const envelope = parseBioEnvelope(profile.bio);
            if (Array.isArray(envelope.deletedPosts)) {
              envelope.deletedPosts.forEach((id) => globalDeletedPosts.add(id));
            }
            if (Array.isArray(envelope.deletedComments)) {
              envelope.deletedComments.forEach((id) => globalDeletedComments.add(id));
            }
          }

          for (const profile of allProfiles) {
            // Use envelope parser to extract posts (handles new format, legacy, and plain text)
            const envelope = parseBioEnvelope(profile.bio);
            const userPosts = envelope.posts;

            if (userPosts.length === 0) continue;

            // Resolver el autor desde el perfil real
            const nombreAutor = profile.nombre || profile.full_name || 'Trader';
            const autorDelPerfil = {
              id: profile.id,
              nombre: nombreAutor,
              nickname: profile.nickname || profile.username || `@${nombreAutor.toLowerCase().replace(/\s+/g, '')}`,
              avatar: profile.avatar || profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(nombreAutor)}&background=0D0D0D&color=38bdf8&size=128`,
              nivel: profile.nivel || profile.level || 1,
              xp: profile.xp || profile.points || 0,
              rachaDias: profile.racha_dias || 0,
              rol: profile.rol || (profile.role === 'admin' ? 'Admin' : 'Miembro'),
              fechaRegistro: 'Reciente',
              insignias: [],
              publicacionesCount: 0,
              comentariosCount: 0,
            };

            for (const sp of userPosts) {
              if (!sp.id || globalDeletedPosts.has(sp.id)) continue;

              // Deduplicación estricta por ID y por firma única (título + contenido)
              const sig = `${(sp.titulo || '').trim().toLowerCase()}|${(sp.contenido || '').trim().slice(0, 100)}`;
              if (postsPorId.has(sp.id) || postsVistos.has(sig)) continue;
              postsVistos.add(sig);

              // Resolver el autor: usar el perfil del dueño del bio, o datos inline del post
              const autorFinal = perfilesMap.get(sp.autorId || profile.id) || autorDelPerfil;
              const comentariosLimpios = (sp.comentarios || []).filter((c: any) => !globalDeletedComments.has(c.id));

              postsPorId.set(sp.id, {
                id: sp.id,
                autor: {
                  ...autorFinal,
                  nombre: sp.autorNombre || autorFinal.nombre,
                  nickname: sp.autorNickname || autorFinal.nickname,
                  avatar: sp.autorAvatar || autorFinal.avatar,
                  rol: sp.autorRol || autorFinal.rol,
                },
                titulo: sp.titulo || 'Publicación',
                contenido: sp.contenido || '',
                categoria: sp.categoria || 'General',
                fijado: fijadosIds.includes(sp.id) || Boolean(sp.fijado),
                fecha: sp.fecha || 'Reciente',
                likes: sp.likes || 0,
                usuariosLiked: sp.usuariosLiked || [],
                imagen: sp.imagen || undefined,
                videoUrl: sp.videoUrl || undefined,
                comentarios: comentariosLimpios,
              });
            }
          }
        }
      } catch (err) {
        console.warn('[DB] Error cargando posts desde profiles.bio:', err);
      }

      // 2. Complementar con la tabla posts (si RLS lo permite para SELECT)
      try {
        const { data: postsData, error } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && postsData && postsData.length > 0) {
          for (const p of postsData) {
            if (eliminadosIds.includes(p.id)) continue;
            if (postsPorId.has(p.id)) continue; // profiles.bio tiene prioridad

            const autorReal = perfilesMap.get(p.author_id) || {
              id: p.author_id || 'desconocido',
              nombre: 'Trader',
              nickname: '@trader',
              avatar: `https://ui-avatars.com/api/?name=Trader&background=0D0D0D&color=38bdf8&size=128`,
              nivel: 1, xp: 0, rachaDias: 0, rol: 'Miembro' as const,
              fechaRegistro: 'Reciente', insignias: [], publicacionesCount: 0, comentariosCount: 0,
            };

            postsPorId.set(p.id, {
              id: p.id,
              autor: autorReal,
              titulo: p.title || 'Publicación',
              contenido: p.content || '',
              categoria: p.category || 'General',
              fijado: Boolean(p.is_pinned),
              fecha: p.created_at
                ? new Date(p.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
                : 'Reciente',
              likes: p.likes || 0,
              usuariosLiked: [],
              imagen: p.image_url || undefined,
              videoUrl: p.image_url?.includes('youtube') || p.image_url?.includes('youtu.be') ? p.image_url : undefined,
              comentarios: [],
            });
          }
        }
      } catch (err) {
        console.warn('[DB] Error cargando posts de tabla posts:', err);
      }

      // 3. Cargar comentarios de la tabla comments en Supabase y agregarlos al post correspondiente
      try {
        const { data: commentsData } = await supabase
          .from('comments')
          .select('*, profiles(*)')
          .order('created_at', { ascending: true });

        if (commentsData && commentsData.length > 0) {
          for (const c of commentsData) {
            if (globalDeletedComments.has(c.id)) continue;
            const postObj = postsPorId.get(c.post_id);
            if (postObj) {
              const perfil = c.profiles;
              const autorComentario = perfilesMap.get(c.author_id) || {
                id: c.author_id,
                nombre: perfil?.nombre || perfil?.full_name || 'Trader',
                nickname: perfil?.nickname || `@${(perfil?.nombre || 'trader').toLowerCase().replace(/\s+/g, '')}`,
                avatar: perfil?.avatar_url || perfil?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(perfil?.nombre || 'T')}&background=0D0D0D&color=38bdf8&size=128`,
                nivel: perfil?.level || perfil?.nivel || 1,
                xp: perfil?.xp || perfil?.points || 0,
                rachaDias: perfil?.racha_dias || 1,
                rol: perfil?.role === 'admin' || perfil?.rol === 'Admin' ? 'Admin' : 'Miembro',
                fechaRegistro: 'Reciente',
                insignias: [],
                publicacionesCount: 0,
                comentariosCount: 0,
              };

              const nuevoCom = {
                id: c.id,
                postId: c.post_id,
                autor: autorComentario,
                contenido: c.content,
                fecha: c.created_at ? new Date(c.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : 'Ahora',
                likes: 0,
                usuariosLiked: [],
              };

              if (!postObj.comentarios) postObj.comentarios = [];
              if (!postObj.comentarios.some((existing: any) => existing.id === c.id)) {
                postObj.comentarios.push(nuevoCom);
              }
            }
          }
        }
      } catch (err) {
        console.warn('[DB] Error cargando comentarios en posts:', err);
      }
    }

    let postsMapeados = Array.from(postsPorId.values());

    // 4. Respaldo local únicamente si la nube estuviera inaccesible
    try {
      if (postsMapeados.length === 0) {
        const localesStr = localStorage.getItem('raxen_posts') || '[]';
        const locales: any[] = JSON.parse(localesStr);
        postsMapeados = locales.filter((loc) => !eliminadosIds.includes(loc.id));
      }
      localStorage.setItem('raxen_posts', JSON.stringify(postsMapeados));
    } catch {}

    return postsMapeados;
  },

  async sincronizarFeedCompleto(posts: any[]) {
    try {
      localStorage.setItem('raxen_posts', JSON.stringify(posts));
      if (supabase) {
        // Sincronizar solo MIS posts a MI profiles.bio (RLS solo permite self-update)
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        if (userId) {
          // Filtrar solo los posts que me pertenecen
          const misPosts = posts
            .filter((p) => p.autor?.id === userId || p.autorId === userId)
            .map((p) => ({
              id: p.id,
              titulo: p.titulo,
              contenido: p.contenido,
              categoria: p.categoria,
              fijado: Boolean(p.fijado),
              fecha: p.fecha,
              likes: p.likes || 0,
              imagen: p.imagen || undefined,
              videoUrl: p.videoUrl || undefined,
              autorId: userId,
              autorNombre: p.autor?.nombre || p.autorNombre || 'Trader',
              autorNickname: p.autor?.nickname || p.autorNickname || '@trader',
              autorAvatar: p.autor?.avatar || p.autorAvatar || '',
              autorRol: p.autor?.rol || p.autorRol || 'Miembro',
            }));

          // Read current bio to preserve it (including XP and deleted lists)
          const { data: myProfile } = await supabase.from('profiles').select('bio').eq('id', userId).single();
          const currentEnvelope = parseBioEnvelope(myProfile?.bio);

          await supabase.from('profiles').update({
            bio: buildBioEnvelope(
              currentEnvelope.bio,
              misPosts,
              currentEnvelope.xp,
              currentEnvelope.nivel,
              currentEnvelope.deletedPosts,
              currentEnvelope.deletedComments
            ),
            updated_at: new Date().toISOString(),
          }).eq('id', userId);
        }
      }
    } catch (e) {
      console.warn('[DB] Error sincronizando feed completo:', e);
    }
  },

  // Eliminación de publicaciones — borrado permanente y seguro en local y en la nube
  async eliminarPost(postId: string) {
    try {
      // 1. Guardar en lista negra de eliminados
      const eliminadosStr = localStorage.getItem('raxen_posts_eliminados') || '[]';
      const eliminados: string[] = JSON.parse(eliminadosStr);
      if (!eliminados.includes(postId)) {
        eliminados.push(postId);
        localStorage.setItem('raxen_posts_eliminados', JSON.stringify(eliminados));
      }

      // 2. Eliminar de raxen_posts en localStorage
      const postsLocalesStr = localStorage.getItem('raxen_posts') || '[]';
      const postsLocales: any[] = JSON.parse(postsLocalesStr);
      const filtrados = postsLocales.filter((p) => p.id !== postId);
      localStorage.setItem('raxen_posts', JSON.stringify(filtrados));

      // 3. Registrar en Supabase: en lista de eliminados del envelope y eliminar de mis posts
      if (supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const userId = session?.user?.id;
          if (userId) {
            const { data: myProfile } = await supabase.from('profiles').select('bio').eq('id', userId).single();
            const envelope = parseBioEnvelope(myProfile?.bio);
            const nuevos = envelope.posts.filter((p) => p.id !== postId);
            const nuevosDeleted = Array.from(new Set([...(envelope.deletedPosts || []), postId]));
            await supabase.from('profiles').update({
              bio: buildBioEnvelope(envelope.bio, nuevos, envelope.xp, envelope.nivel, nuevosDeleted, envelope.deletedComments),
              updated_at: new Date().toISOString(),
            }).eq('id', userId);
          }
        } catch (_) {}

        // 4. Eliminar de la tabla posts en Supabase
        try {
          await supabase.from('posts').delete().eq('id', postId);
        } catch (_) {}

        // 5. Broadcast a todos los usuarios
        try {
          const canal = supabase.channel('realtime-sync-channel');
          canal.send({
            type: 'broadcast',
            event: 'eliminar_post',
            payload: postId,
          });
        } catch (_) {}
      }
    } catch (e) {
      console.warn('[DB] Error eliminando post:', e);
    }
  },

  // Comentarios — persistencia garantizada en local y en Supabase
  async guardarComentario(postId: string, comentario: any) {
    // 1. Guardar en almacenamiento local para no perderse jamás
    try {
      const clave = `raxen_comentarios_${postId}`;
      const localesStr = localStorage.getItem(clave) || '[]';
      const locales: any[] = JSON.parse(localesStr);
      locales.push(comentario);
      localStorage.setItem(clave, JSON.stringify(locales));

      // Actualizar también dentro de raxen_posts
      const postsStr = localStorage.getItem('raxen_posts') || '[]';
      const postsLocales: any[] = JSON.parse(postsStr);
      const postIdx = postsLocales.findIndex((p) => p.id === postId);
      if (postIdx >= 0) {
        if (!postsLocales[postIdx].comentarios) postsLocales[postIdx].comentarios = [];
        postsLocales[postIdx].comentarios.push(comentario);
        localStorage.setItem('raxen_posts', JSON.stringify(postsLocales));
      }
    } catch (e) {
      console.warn('[DB] Error guardando comentario en localStorage:', e);
    }

    if (!supabase) return;

    try {
      let idValido = comentario.id;
      const esUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idValido);
      if (!esUuid) {
        idValido = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `a0eebc99-9c0b-4ef8-bb6d-${String(Date.now()).slice(-12).padStart(12, '0')}`;
      }

      const payload = {
        id: idValido,
        post_id: postId,
        author_id: comentario.autor.id,
        content: comentario.contenido,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.info('[DB] Guardando comentario en Supabase:', payload);
      const { error } = await supabase.from('comments').insert(payload);
      if (error) {
        console.warn('[DB] Supabase error al insertar comentario:', error.message);
      } else {
        console.info('[DB] ✅ Comentario guardado con éxito en Supabase');
      }
    } catch (err) {
      console.warn('Error guardando comentario en Supabase:', err);
    }
  },

  async cargarComentarios(postId: string) {
    const comentariosMapeados: any[] = [];
    const eliminadosStr = localStorage.getItem('raxen_comentarios_eliminados') || '[]';
    const eliminadosIds: string[] = JSON.parse(eliminadosStr);

    // 1. Cargar desde Supabase
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('comments')
          .select('*, profiles(*)')
          .eq('post_id', postId)
          .order('created_at', { ascending: true });

        if (error) {
          console.warn('[DB] Error cargando comentarios:', error.message);
        }

        if (data && data.length > 0) {
          for (const c of data) {
            // Si el comentario fue eliminado por el usuario, no cargarlo jamás
            if (eliminadosIds.includes(c.id)) continue;

            const perfil = c.profiles;
            comentariosMapeados.push({
              id: c.id,
              postId: c.post_id,
              autor: {
                id: c.author_id,
                nombre: perfil?.nombre || perfil?.full_name || 'Trader',
                nickname: perfil?.nickname || `@${(perfil?.nombre || 'trader').toLowerCase().replace(/\s+/g, '')}`,
                avatar: perfil?.avatar_url || perfil?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(perfil?.nombre || 'T')}&background=0D0D0D&color=38bdf8&size=128`,
                nivel: perfil?.level || perfil?.nivel || 1,
                xp: perfil?.xp || perfil?.points || 0,
                rachaDias: perfil?.racha_dias || 1,
                rol: perfil?.role === 'admin' || perfil?.rol === 'Admin' ? 'Admin' : 'Miembro',
                fechaRegistro: 'Reciente',
                insignias: [],
                publicacionesCount: 0,
                comentariosCount: 0,
              },
              contenido: c.content,
              fecha: c.created_at ? new Date(c.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : 'Ahora',
              likes: 0,
              usuariosLiked: [],
            });
          }
        }
      } catch (err) {
        console.warn('Error cargando comentarios de Supabase:', err);
      }
    }

    // 2. Fusionar con los guardados en localStorage (excluyendo eliminados)
    try {
      const localesStr = localStorage.getItem(`raxen_comentarios_${postId}`) || '[]';
      const locales: any[] = JSON.parse(localesStr);
      for (const loc of locales) {
        if (!eliminadosIds.includes(loc.id)) {
          if (!comentariosMapeados.some((m) => m.id === loc.id || (m.contenido === loc.contenido && m.autor.id === loc.autor.id))) {
            comentariosMapeados.push(loc);
          }
        }
      }
    } catch {}

    return comentariosMapeados;
  },

  // Eliminación de Comentarios — borrado permanente y seguro
  async eliminarComentario(postId: string, comentarioId: string) {
    try {
      // 1. Eliminar de raxen_comentarios_{postId}
      const clave = `raxen_comentarios_${postId}`;
      const localesStr = localStorage.getItem(clave) || '[]';
      const locales: any[] = JSON.parse(localesStr);
      const filtrados = locales.filter((c) => c.id !== comentarioId);
      localStorage.setItem(clave, JSON.stringify(filtrados));

      // 2. Eliminar de raxen_posts
      const postsStr = localStorage.getItem('raxen_posts') || '[]';
      const postsLocales: any[] = JSON.parse(postsStr);
      const postIdx = postsLocales.findIndex((p) => p.id === postId);
      if (postIdx >= 0 && postsLocales[postIdx].comentarios) {
        postsLocales[postIdx].comentarios = postsLocales[postIdx].comentarios.filter((c: any) => c.id !== comentarioId);
        localStorage.setItem('raxen_posts', JSON.stringify(postsLocales));
      }

      // 3. Registrar en lista negra de eliminados para que NUNCA vuelva a revivir
      const eliminadosStr = localStorage.getItem('raxen_comentarios_eliminados') || '[]';
      const eliminados: string[] = JSON.parse(eliminadosStr);
      if (!eliminados.includes(comentarioId)) {
        eliminados.push(comentarioId);
        localStorage.setItem('raxen_comentarios_eliminados', JSON.stringify(eliminados));
      }

      // 4. Registrar en Supabase: en lista de comentarios eliminados del envelope
      if (supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const userId = session?.user?.id;
          if (userId) {
            const { data: myProfile } = await supabase.from('profiles').select('bio').eq('id', userId).single();
            const envelope = parseBioEnvelope(myProfile?.bio);
            const nuevosDeleted = Array.from(new Set([...(envelope.deletedComments || []), comentarioId]));
            await supabase.from('profiles').update({
              bio: buildBioEnvelope(envelope.bio, envelope.posts, envelope.xp, envelope.nivel, envelope.deletedPosts, nuevosDeleted),
              updated_at: new Date().toISOString(),
            }).eq('id', userId);
          }
        } catch (_) {}

        console.info('[DB] Eliminando comentario en Supabase:', comentarioId);
        const { error } = await supabase.from('comments').delete().eq('id', comentarioId);
        if (error) {
          console.error('[DB] Error eliminando comentario en Supabase:', error.message);
        }

        try {
          const canal = supabase.channel('realtime-sync-channel');
          canal.send({
            type: 'broadcast',
            event: 'eliminar_comentario',
            payload: { postId, comentarioId },
          });
        } catch (_) {}
      }
    } catch (err) {
      console.warn('Error eliminando comentario:', err);
    }
  },

  // Cursos — persistencia garantizada en local y en la nube
  async cargarCursos(): Promise<any[]> {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase.from('courses').select('*').order('created_at', { ascending: true });
      if (error || !data) {
        console.warn('[DB] Error cargando cursos:', error?.message);
        return [];
      }

      return data.map((c: any) => {
        const { descripcion, modulos } = parseCourseEnvelope(c.description);

        // Si el admin tenía modulos guardados localmente, usarlos como fallback si la base de datos no tiene modulos
        let modulosFinales = modulos;
        if (!modulosFinales || modulosFinales.length === 0) {
          try {
            const cachedModStr = localStorage.getItem(`raxen_modulos_${c.id}`);
            if (cachedModStr) {
              modulosFinales = JSON.parse(cachedModStr);
            }
          } catch {}
        }

        return {
          id: c.id,
          titulo: c.title || c.titulo || 'Curso de Trading',
          descripcion: descripcion || '',
          imagen: c.cover_url || c.imagen || '/raxen-banner.png',
          nivelRequerido: c.required_level || c.nivel_requerido || 1,
          categoria: c.categoria || c.category || 'Fundamentos',
          progresoPorcentaje: 0,
          modulos: modulosFinales && modulosFinales.length > 0 ? modulosFinales : [
            {
              id: `mod-${c.id}`,
              titulo: 'Módulo 1: Fundamentos & Práctica',
              lecciones: [],
            }
          ],
        };
      });
    } catch (err) {
      console.warn('[DB] Error al cargar cursos desde Supabase:', err);
      return [];
    }
  },

  async guardarCurso(curso: any) {
    // 1. Asegurar ID en formato UUID válido para Postgres
    let idValido = curso.id;
    const esUuidValido = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idValido);
    if (!esUuidValido) {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        idValido = crypto.randomUUID();
        curso.id = idValido;
      } else {
        idValido = 'a0eebc99-9c0b-4ef8-bb6d-' + String(Date.now()).slice(-12).padStart(12, '0');
        curso.id = idValido;
      }
    }

    // 2. Guardar en almacenamiento local como respaldo
    try {
      const cursosLocalesStr = localStorage.getItem('raxen_cursos') || '[]';
      const cursosLocales: any[] = JSON.parse(cursosLocalesStr);
      const index = cursosLocales.findIndex((c) => c.id === curso.id);
      if (index >= 0) {
        cursosLocales[index] = curso;
      } else {
        cursosLocales.push(curso);
      }
      localStorage.setItem('raxen_cursos', JSON.stringify(cursosLocales));

      if (curso.modulos && curso.modulos.length > 0) {
        localStorage.setItem(`raxen_modulos_${curso.id}`, JSON.stringify(curso.modulos));
      }
    } catch (e) {
      console.warn('[DB] Error guardando curso en localStorage:', e);
    }

    if (!supabase) return;

    try {
      // 3. Generar slug obligatorio (requerido por Supabase courses)
      const slug = (curso.titulo || 'curso')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || `curso-${Date.now()}`;

      // 4. Empaquetar descripción y estructura completa de módulos en el sobre JSON para que todos los usuarios lo reciban
      const descEnvelope = buildCourseEnvelope(curso.descripcion, curso.modulos || []);

      const payload: Record<string, any> = {
        id: idValido,
        title: curso.titulo,
        slug: slug,
        description: descEnvelope,
        cover_url: curso.imagen || '/raxen-banner.png',
        required_level: Number(curso.nivelRequerido) || 1,
        is_published: true,
        updated_at: new Date().toISOString(),
      };

      console.info('[DB] Guardando curso en Supabase con temario completo para todos los usuarios:', payload);
      const { data, error } = await supabase.from('courses').upsert(payload, { onConflict: 'id' }).select();
      if (error) {
        console.error('[DB] Supabase error al guardar curso:', error.message);
      } else {
        console.info('[DB] ✅ Curso y temario sincronizado en Supabase con éxito para todos los usuarios:', data);
      }
    } catch (err) {
      console.warn('Error al guardar curso en Supabase:', err);
    }
  },

  // Eventos
  async guardarEvento(evento: any) {
    try {
      if (!supabase) return;
      await supabase.from('events').upsert({
        id: evento.id,
        titulo: evento.titulo,
        descripcion: evento.descripcion,
        anfitrion_id: evento.anfitrion.id,
        fecha_inicio: evento.fechaInicio,
        duracion: evento.duracion,
        tipo: evento.tipo,
        link_reunion: evento.linkReunion,
        banner: evento.banner,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Supabase offline fallback:', err);
    }
  },

  // Eliminación de Cursos
  async eliminarCurso(cursoId: string) {
    try {
      // Eliminar de localStorage
      const cursosLocalesStr = localStorage.getItem('raxen_cursos') || '[]';
      const cursosLocales: any[] = JSON.parse(cursosLocalesStr);
      const filtrados = cursosLocales.filter((c) => c.id !== cursoId);
      localStorage.setItem('raxen_cursos', JSON.stringify(filtrados));

      if (!supabase) return;
      console.info('[DB] Eliminando curso en Supabase:', cursoId);
      const { error } = await supabase.from('courses').delete().eq('id', cursoId);
      if (error) {
        console.error('[DB] Error eliminando curso en Supabase:', error.message);
      }
    } catch (err) {
      console.warn('Error eliminando curso:', err);
    }
  },

  // Eliminación de Eventos
  async eliminarEvento(eventoId: string) {
    try {
      if (!supabase) return;
      console.info('[DB] Eliminando evento en Supabase:', eventoId);
      const { error } = await supabase.from('events').delete().eq('id', eventoId);
      if (error) {
        console.error('[DB] Error eliminando evento en Supabase:', error.message);
      }
    } catch (err) {
      console.warn('Error eliminando evento:', err);
    }
  },

  // Mensajes
  async guardarMensaje(msg: any) {
    try {
      if (!supabase) return;
      await supabase.from('direct_messages').insert({
        id: msg.id,
        remitente_id: msg.remitenteId,
        destinatario_id: msg.destinatarioId,
        texto: msg.texto,
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Supabase offline fallback:', err);
    }
  },
};
