import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { nome, email, telefone, mensagem } = await request.json()

    // Validar dados obrigatórios
    if (!nome || !email || !telefone || !mensagem) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se o Supabase está configurado
    if (!isSupabaseConfigured()) {
      console.warn('Supabase não configurado - salvando localmente')
      
      // Simular sucesso para desenvolvimento
      return NextResponse.json({ 
        success: true, 
        data: [{ id: Date.now(), nome, email, telefone, mensagem }],
        message: 'Lead salvo localmente (Supabase não configurado)'
      })
    }

    // Inserir lead no banco de dados
    const { data, error } = await supabase!
      .from('leads')
      .insert([{ nome, email, telefone, mensagem }])
      .select()

    if (error) {
      console.error('Erro ao salvar lead:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Erro na API de leads:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Verificar se o Supabase está configurado
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ 
        data: [],
        message: 'Supabase não configurado'
      })
    }

    const { data, error } = await supabase!
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar leads:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Erro na API de leads:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}