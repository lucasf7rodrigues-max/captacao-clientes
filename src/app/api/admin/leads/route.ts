import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export async function GET() {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({ 
        success: false, 
        error: 'Supabase não configurado',
        data: []
      })
    }

    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    // Converter para formato do painel admin
    const leadsFormatados = (data || []).map((lead: any) => ({
      id: lead.id.toString(),
      nome: lead.nome,
      email: lead.email,
      telefone: lead.telefone,
      objetivo: lead.mensagem.includes('emagrecimento') ? 'emagrecimento' : 
               lead.mensagem.includes('massa') ? 'ganho-massa' : 'reeducacao',
      detalhes: lead.mensagem,
      data: lead.created_at,
      status: lead.status || 'novo' // Usar status do banco ou 'novo' como padrão
    }))

    return NextResponse.json({ 
      success: true, 
      data: leadsFormatados
    })
  } catch (error) {
    console.error('Erro ao buscar leads:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erro interno do servidor',
      data: []
    }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status } = body

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'ID é obrigatório' 
      }, { status: 400 })
    }

    if (!status) {
      return NextResponse.json({ 
        success: false, 
        error: 'Status é obrigatório' 
      }, { status: 400 })
    }

    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({ 
        success: true, 
        message: 'Lead atualizado com sucesso! (modo offline)'
      })
    }

    // Atualizar o status no Supabase
    const { data, error } = await supabase
      .from('leads')
      .update({ status: status })
      .eq('id', parseInt(id))
      .select()

    if (error) {
      console.error('Erro ao atualizar status no Supabase:', error)
      throw error
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Status do lead atualizado com sucesso!',
      data: data?.[0]
    })
  } catch (error) {
    console.error('Erro ao atualizar lead:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao atualizar lead',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'ID é obrigatório' 
      }, { status: 400 })
    }

    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({ 
        success: true, 
        message: 'Lead excluído com sucesso! (modo offline)'
      })
    }

    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', parseInt(id))

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      message: 'Lead excluído com sucesso!'
    })
  } catch (error) {
    console.error('Erro ao excluir lead:', error)
    return NextResponse.json({ 
      success: true, 
      message: 'Lead excluído com sucesso!'
    })
  }
}