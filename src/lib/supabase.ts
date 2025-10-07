import { createClient } from '@supabase/supabase-js'

// Verificar se as variáveis de ambiente estão definidas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Criar cliente apenas se as variáveis estiverem definidas
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Função para verificar se o Supabase está configurado
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey && supabase)
}

// Tipos para o banco de dados
export interface Lead {
  id?: number
  nome: string
  email: string
  telefone: string
  mensagem: string
  created_at?: string
}

export interface Depoimento {
  id?: number
  token: string
  nome: string
  depoimento: string
  avaliacao: number
  aprovado: boolean
  created_at?: string
}

export interface SiteConfig {
  id?: number
  titulo: string
  logo_url?: string
  consulta_imagem_url?: string
  nutricionista_imagem_url?: string
  updated_at?: string
}