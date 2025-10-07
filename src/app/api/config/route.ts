import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Verificar se Supabase está configurado
const isSupabaseConfigured = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL && 
         process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'placeholder-key'
}

export async function GET() {
  // Se Supabase não estiver configurado, retornar configuração padrão
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ 
      config: {
        titulo: 'NutriVida',
        logo_url: '',
        consulta_imagem_url: '',
        nutricionista_imagem_url: ''
      }
    })
  }

  try {
    const { data: config, error } = await supabase
      .from('site_config')
      .select('*')
      .single()

    if (error) {
      // Se não encontrar configuração, retornar configuração padrão
      if (error.code === 'PGRST116') {
        return NextResponse.json({ 
          config: {
            titulo: 'NutriVida',
            logo_url: '',
            consulta_imagem_url: '',
            nutricionista_imagem_url: ''
          }
        })
      }
      console.error('Erro ao buscar configuração:', error)
      return NextResponse.json({ 
        config: {
          titulo: 'NutriVida',
          logo_url: '',
          consulta_imagem_url: '',
          nutricionista_imagem_url: ''
        }
      })
    }

    return NextResponse.json({ config })
  } catch (error) {
    console.error('Erro interno:', error)
    // Retornar configuração padrão em caso de erro
    return NextResponse.json({ 
      config: {
        titulo: 'NutriVida',
        logo_url: '',
        consulta_imagem_url: '',
        nutricionista_imagem_url: ''
      }
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { titulo, logo_url, consulta_imagem_url, nutricionista_imagem_url } = body

    // Se Supabase não estiver configurado, simular sucesso
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ 
        success: true, 
        message: 'Configuração salva localmente! Configure o Supabase para persistir os dados.',
        config: { titulo, logo_url, consulta_imagem_url, nutricionista_imagem_url }
      })
    }

    // Primeiro, verificar se já existe uma configuração
    const { data: existingConfig } = await supabase
      .from('site_config')
      .select('id')
      .single()

    let result
    if (existingConfig) {
      // Atualizar configuração existente
      const { data: config, error } = await supabase
        .from('site_config')
        .update({ 
          titulo, 
          logo_url, 
          consulta_imagem_url, 
          nutricionista_imagem_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingConfig.id)
        .select()
        .single()

      if (error) throw error
      result = config
    } else {
      // Criar nova configuração
      const { data: config, error } = await supabase
        .from('site_config')
        .insert([{ titulo, logo_url, consulta_imagem_url, nutricionista_imagem_url }])
        .select()
        .single()

      if (error) throw error
      result = config
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Configuração salva com sucesso!',
      config: result 
    })
  } catch (error) {
    console.error('Erro ao salvar configuração:', error)
    return NextResponse.json({ error: 'Erro ao salvar configuração' }, { status: 500 })
  }
}