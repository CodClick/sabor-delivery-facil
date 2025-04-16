
import { createClient } from '@supabase/supabase-js';

// Inicializar o cliente Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const supabase = createClient(supabaseUrl, supabaseKey);

export interface UserProfile {
  id: string; // Mantemos como string para compatibilidade com Firebase
  email: string;
  created_at?: string;
  last_sign_in?: string;
  name?: string;
  phone?: string;
}

// Função para salvar um novo usuário no Supabase
export async function saveUserToSupabase(user: UserProfile) {
  try {
    const { data, error } = await supabase
      .from('users')
      .upsert(
        { 
          id: user.id,
          email: user.email,
          created_at: user.created_at || new Date().toISOString(),
          last_sign_in: user.last_sign_in || new Date().toISOString(),
          name: user.name || null,
          phone: user.phone || null
        },
        { onConflict: 'id' }
      );

    if (error) {
      console.error('Erro ao salvar usuário no Supabase:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Erro ao conectar com Supabase:', error);
    throw error;
  }
}

// Função para buscar um usuário por ID
export async function getUserById(userId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Erro ao buscar usuário no Supabase:', error);
      return null;
    }

    return data as UserProfile;
  } catch (error) {
    console.error('Erro ao conectar com Supabase:', error);
    return null;
  }
}

export default supabase;
