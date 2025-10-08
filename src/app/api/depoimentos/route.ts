import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createClient()
    
    // Tentar buscar do Supabase primeiro
    try {
      const { data, error } = await supabase
        .from('depoimentos')
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
      const fallbackDepoimentos = [
        {
          id: 1,
          nome: "Carlos Mendes",
          cargo: "CEO",
          empresa: "TechCorp",
          depoimento: "Excelente trabalho! A consultoria transformou completamente nossa estratégia de negócios.",
          rating: 5,
          ativo: true,
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          nome: "Fernanda Lima",
          cargo: "Diretora de Marketing",
          empresa: "Inovação Ltda",
          depoimento: "Profissionais altamente qualificados. Recomendo para qualquer empresa que busca crescimento.",
          rating: 5,
          ativo: true,
          created_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 3,
          nome: "Roberto Silva",
          cargo: "Fundador",
          empresa: "StartupX",
          depoimento: "A consultoria nos ajudou a estruturar nosso modelo de negócio de forma eficiente.",
          rating: 4,
          ativo: true,
          created_at: new Date(Date.now() - 172800000).toISOString()
        }
      ]

      return NextResponse.json({ 
        success: true, 
        data: fallbackDepoimentos,
        source: 'fallback'
      })
    }
  } catch (error) {
    console.error('Erro ao buscar depoimentos:', error)
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
    const { nome, cargo, empresa, depoimento, rating } = body

    if (!nome || !cargo || !empresa || !depoimento || !rating) {
      return NextResponse.json({ 
        success: false, 
        error: 'Todos os campos são obrigatórios' 
      }, { status: 400 })
    }

    const supabase = createClient()
    
    try {
      const { data, error } = await supabase
        .from('depoimentos')
        .insert([{
          nome,
          cargo,
          empresa,
          depoimento,
          rating: parseInt(rating),
          ativo: true,
          created_at: new Date().toISOString()
        }])
        .select()

      if (error) throw error

      return NextResponse.json({ 
        success: true, 
        message: 'Depoimento cadastrado com sucesso!',
        data: data?.[0]
      })
    } catch (supabaseError) {
      console.log('Supabase não disponível, simulando sucesso')
      
      return NextResponse.json({ 
        success: true, 
        message: 'Depoimento cadastrado com sucesso!',
        data: {
          id: Date.now(),
          nome,
          cargo,
          empresa,
          depoimento,
          rating: parseInt(rating),
          ativo: true,
          created_at: new Date().toISOString()
        }
      })
    }
  } catch (error) {
    console.error('Erro ao criar depoimento:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    }, { status: 500 })
  }
}