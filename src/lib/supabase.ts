import { createClient } from '@supabase/supabase-js'

// Verificar se as variáveis de ambiente estão definidas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Log para debug em produção (sem expor chaves)
if (process.env.NODE_ENV === 'development') {
  console.log('🔗 Supabase Config:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    urlPrefix: supabaseUrl?.substring(0, 30) + '...',
    keyPrefix: supabaseAnonKey?.substring(0, 20) + '...'
  })
}

// Criar cliente apenas se as variáveis estiverem definidas
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false, // Para APIs server-side
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    })
  : null

// Função para verificar se o Supabase está configurado
export const isSupabaseConfigured = () => {
  const configured = !!(supabaseUrl && supabaseAnonKey && supabase)
  
  if (!configured && process.env.NODE_ENV === 'development') {
    console.warn('⚠️ Supabase não configurado:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      hasClient: !!supabase
    })
  }
  
  return configured
}

// Tipos para o banco de dados (alinhados com a estrutura real)
export interface Lead {
  id?: number
  nome: string
  email: string
  telefone: string
  mensagem: string
  created_at?: string
  updated_at?: string
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

// Função para criar cliente (compatibilidade)
export function createSupabaseClient() {
  if (!supabase) {
    throw new Error('Supabase não configurado - verifique as variáveis de ambiente')
  }
  return supabase
}

// Função para testar conexão
export async function testSupabaseConnection() {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      success: false,
      error: 'Supabase não configurado'
    }
  }

  try {
    const { data, error } = await supabase
      .from('leads')
      .select('count(*)', { count: 'exact', head: true })

    if (error) {
      return {
        success: false,
        error: error.message,
        details: error
      }
    }

    return {
      success: true,
      message: 'Conexão funcionando'
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    }
  }
}

// Função para inicializar tabelas (se necessário)
export async function initializeSupabaseTables() {
  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, error: 'Supabase não configurado' }
  }

  try {
    // Verificar se tabela leads existe
    const { error: leadsError } = await supabase
      .from('leads')
      .select('id')
      .limit(1)

    if (leadsError && leadsError.code === 'PGRST116') {
      console.log('📋 Tabela leads não encontrada - pode precisar ser criada')
      return {
        success: false,
        error: 'Tabela leads não existe',
        suggestion: 'Execute o SQL de criação das tabelas no Supabase'
      }
    }

    return { success: true, message: 'Tabelas verificadas' }
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    }
  }
}