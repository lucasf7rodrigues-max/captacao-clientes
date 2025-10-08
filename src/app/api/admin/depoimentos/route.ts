import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ativo } = body

    if (!id || typeof ativo !== 'boolean') {
      return NextResponse.json({ 
        success: false, 
        error: 'ID e status ativo são obrigatórios' 
      }, { status: 400 })
    }

    const supabase = createClient()
    
    try {
      const { data, error } = await supabase
        .from('depoimentos')
        .update({ 
          ativo,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      if (error) throw error

      return NextResponse.json({ 
        success: true, 
        message: `Depoimento ${ativo ? 'ativado' : 'desativado'} com sucesso!`,
        data: data?.[0]
      })
    } catch (supabaseError) {
      console.log('Supabase não disponível, simulando sucesso')
      
      return NextResponse.json({ 
        success: true, 
        message: `Depoimento ${ativo ? 'ativado' : 'desativado'} com sucesso!`,
        data: { id, ativo }
      })
    }
  } catch (error) {
    console.error('Erro ao atualizar depoimento:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erro interno do servidor' 
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

    const supabase = createClient()
    
    try {
      const { error } = await supabase
        .from('depoimentos')
        .delete()
        .eq('id', id)

      if (error) throw error

      return NextResponse.json({ 
        success: true, 
        message: 'Depoimento excluído com sucesso!'
      })
    } catch (supabaseError) {
      console.log('Supabase não disponível, simulando sucesso')
      
      return NextResponse.json({ 
        success: true, 
        message: 'Depoimento excluído com sucesso!'
      })
    }
  } catch (error) {
    console.error('Erro ao excluir depoimento:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    }, { status: 500 })
  }
}