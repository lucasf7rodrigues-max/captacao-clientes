import { NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export async function GET() {
  try {
    // Verificar se as variáveis de ambiente estão configuradas
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        success: false,
        error: 'Variáveis de ambiente do Supabase não configuradas',
        details: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseAnonKey,
          environment: process.env.NODE_ENV
        }
      }, { status: 500 })
    }

    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({
        success: false,
        error: 'Cliente Supabase não inicializado',
        details: {
          configured: isSupabaseConfigured(),
          client: !!supabase
        }
      }, { status: 500 })
    }

    // Testar conexão com uma query simples
    const { data, error } = await supabase
      .from('leads')
      .select('count(*)', { count: 'exact', head: true })

    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Erro ao conectar com Supabase',
        details: {
          message: error.message,
          code: error.code,
          hint: error.hint
        }
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Conexão com Supabase funcionando',
      details: {
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
        supabaseUrl: supabaseUrl?.substring(0, 30) + '...',
        tablesAccessible: true
      }
    })

  } catch (error: any) {
    console.error('Erro no teste de conexão:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno no teste de conexão',
      details: {
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    }, { status: 500 })
  }
}

export async function POST() {
  try {
    // Testar inserção de dados
    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({
        success: false,
        error: 'Supabase não configurado'
      }, { status: 500 })
    }

    const testData = {
      nome: 'Teste de Conexão',
      email: 'teste@conexao.com',
      telefone: '(00) 00000-0000',
      mensagem: 'Teste de conectividade - ' + new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('leads')
      .insert([testData])
      .select()

    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Erro ao inserir dados de teste',
        details: error
      }, { status: 500 })
    }

    // Limpar dados de teste
    if (data && data[0]) {
      await supabase
        .from('leads')
        .delete()
        .eq('id', data[0].id)
    }

    return NextResponse.json({
      success: true,
      message: 'Teste de inserção funcionando',
      details: {
        inserted: !!data,
        cleaned: true
      }
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Erro no teste de inserção',
      details: error.message
    }, { status: 500 })
  }
}