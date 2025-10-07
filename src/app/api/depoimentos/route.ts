import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { nome, depoimento, avaliacao } = await request.json()

    // Validar dados obrigatórios
    if (!nome || !depoimento || !avaliacao) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar avaliação
    if (avaliacao < 1 || avaliacao > 5) {
      return NextResponse.json(
        { error: 'Avaliação deve ser entre 1 e 5' },
        { status: 400 }
      )
    }

    // Gerar token único
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

    // Inserir depoimento no banco de dados
    const { data, error } = await supabase
      .from('depoimentos')
      .insert([{ token, nome, depoimento, avaliacao, aprovado: false }])
      .select()

    if (error) {
      console.error('Erro ao salvar depoimento:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, token, data })
  } catch (error) {
    console.error('Erro na API de depoimentos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('depoimentos')
      .select('*')
      .eq('aprovado', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar depoimentos:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Erro na API de depoimentos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}