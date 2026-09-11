import { supabase } from '../lib/supabaseClient';
import type { ComunidadMeta } from '../types';

export interface ComunidadDisponible {
  id: string;
  slug: string;
  name: string;
  role: 'owner' | 'admin' | 'moderator' | 'member';
  settings: Partial<ComunidadMeta>;
}

const ACTIVE_KEY = 'community_active_id';

export const communityService = {
  async listarOCrear(nombre = 'Aquí va el nombre de tu comunidad'): Promise<ComunidadDisponible[]> {
    if (!supabase) return [];
    let { data, error } = await supabase
      .from('community_members')
      .select('role, communities(id, slug, name, settings)')
      .eq('status', 'active');

    if (error) throw error;
    if (!data?.length) {
      const creada = await supabase.rpc('create_community', { p_name: nombre, p_slug: null });
      if (creada.error) throw creada.error;
      ({ data, error } = await supabase
        .from('community_members')
        .select('role, communities(id, slug, name, settings)')
        .eq('status', 'active'));
      if (error) throw error;
    }

    return (data || []).flatMap((row: any) => {
      const c = Array.isArray(row.communities) ? row.communities[0] : row.communities;
      return c ? [{ id: c.id, slug: c.slug, name: c.name, role: row.role, settings: c.settings || {} }] : [];
    });
  },

  elegirActiva(comunidades: ComunidadDisponible[]): ComunidadDisponible | null {
    const guardada = localStorage.getItem(ACTIVE_KEY);
    const activa = comunidades.find((c) => c.id === guardada) || comunidades[0] || null;
    if (activa) localStorage.setItem(ACTIVE_KEY, activa.id);
    return activa;
  },

  guardarActiva(id: string) {
    localStorage.setItem(ACTIVE_KEY, id);
  },

  async crear(nombre: string): Promise<string> {
    if (!supabase) throw new Error('Supabase no está configurado.');
    const { data, error } = await supabase.rpc('create_community', { p_name: nombre, p_slug: null });
    if (error) throw error;
    return data as string;
  },

  async actualizar(id: string, ajustes: Partial<ComunidadMeta>) {
    if (!supabase) return;
    const { error } = await supabase
      .from('communities')
      .update({ name: ajustes.nombre, settings: ajustes, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  },

  async idsMiembros(communityId: string): Promise<string[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('community_members')
      .select('user_id')
      .eq('community_id', communityId)
      .eq('status', 'active');
    if (error) throw error;
    return (data || []).map((row: any) => row.user_id);
  },
};
