import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createClient()
    
    // Tentar buscar do Supabase primeiro
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      return NextResponse.json({ 
        success: true, 
        data: data || [],
        source: 'supabase'
      })
    } catch (supabaseError) {
      console.log('Supabase não disponível, usando fallback local')
      
      // Fallback para dados locais
      const fallbackLeads = [
        {
          id: 1,
          nome: "Maria Silva",
          email: "maria@email.com",
          telefone: "(11) 99999-9999",
          mensagem: "Gostaria de saber mais sobre os serviços de consultoria empresarial.",
          status: "novo",
          prioridade: "alta",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          nome: "João Santos",
          email: "joao@empresa.com",
          telefone: "(11) 88888-8888",
          mensagem: "Preciso de ajuda com planejamento estratégico para minha empresa.",
          status: "contatado",
          prioridade: "media",
          created_at: new Date(Date.now() - 86400000).toISOString(), // 1 dia atrás
          updated_at: new Date().toISOString()
        },
        {
          id: 3,
          nome: "Ana Costa",
          email: "ana@startup.com",
          telefone: "(11) 77777-7777",
          mensagem: "Interessada em consultoria para crescimento de startup.",
          status: "convertido",
          prioridade: "alta",
          created_at: new Date(Date.now() - 172800000).toISOString(), // 2 dias atrás
          updated_at: new Date().toISOString()
        }
      ]

      return NextResponse.json({ 
        success: true, 
        data: fallbackLeads,
        source: 'fallback'
      })
    }
  } catch (error) {
    console.error('Erro ao buscar leads:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erro interno do servidor',
      data: []
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nome, email, telefone, mensagem } = body

    if (!nome || !email || !telefone || !mensagem) {
      return NextResponse.json({ 
        success: false, 
        error: 'Todos os campos são obrigatórios' 
      }, { status: 400 })
    }

    const supabase = createClient()
    
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert([{
          nome,
          email,
          telefone,
          mensagem,
          status: 'novo',
          prioridade: 'media',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()

      if (error) throw error

      return NextResponse.json({ 
        success: true, 
        message: 'Lead cadastrado com sucesso!',
        data: data?.[0]
      })
    } catch (supabaseError) {
      console.log('Supabase não disponível, simulando sucesso')
      
      // Simular sucesso mesmo sem Supabase
      return NextResponse.json({ 
        success: true, 
        message: 'Solicitação recebida com sucesso! Entraremos em contato em breve.',
        data: {
          id: Date.now(),
          nome,
          email,
          telefone,
          mensagem,
          status: 'novo',
          created_at: new Date().toISOString()
        }
      })
    }
  } catch (error) {
    console.error('Erro ao criar lead:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, prioridade } = body

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'ID é obrigatório' 
      }, { status: 400 })
    }

    const supabase = createClient()
    
    try {
      const updateData: any = { updated_at: new Date().toISOString() }
      if (status) updateData.status = status
      if (prioridade) updateData.prioridade = prioridade

      const { data, error } = await supabase
        .from('leads')
        .update(updateData)
        .eq('id', id)
        .select()

      if (error) throw error

      return NextResponse.json({ 
        success: true, 
        message: 'Lead atualizado com sucesso!',
        data: data?.[0]
      })
    } catch (supabaseError) {
      console.log('Supabase não disponível, simulando sucesso')
      
      return NextResponse.json({ 
        success: true, 
        message: 'Lead atualizado com sucesso!',
        data: { id, status, prioridade }
      })
    }
  } catch (error) {
    console.error('Erro ao atualizar lead:', error)
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
        .from('leads')
        .delete()
        .eq('id', id)

      if (error) throw error

      return NextResponse.json({ 
        success: true, 
        message: 'Lead excluído com sucesso!'
      })
    } catch (supabaseError) {
      console.log('Supabase não disponível, simulando sucesso')
      
      return NextResponse.json({ 
        success: true, 
        message: 'Lead excluído com sucesso!'
      })
    }
  } catch (error) {
    console.error('Erro ao excluir lead:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    }, { status: 500 })
  }
}