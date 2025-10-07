import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('depoimentos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar todos os depoimentos:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Erro na API de admin depoimentos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, aprovado } = await request.json()

    if (!id || typeof aprovado !== 'boolean') {
      return NextResponse.json(
        { error: 'ID e status de aprovação são obrigatórios' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('depoimentos')
      .update({ aprovado })
      .eq('id', id)
      .select()

    if (error) {
      console.error('Erro ao atualizar depoimento:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Erro na API de admin depoimentos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}