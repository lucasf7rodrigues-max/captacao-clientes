import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export async function GET() {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      // Fallback para dados locais quando Supabase não está configurado
      const fallbackData = {
        leads: [],
        depoimentos: [
          {
            id: '1',
            nome: 'Maria Silva',
            iniciais: 'MS',
            texto: 'Perdi 15kg em 4 meses seguindo o plano alimentar. Me sinto muito mais disposta e saudável!',
            resultado: 'Perdeu 15kg',
            estrelas: 5
          },
          {
            id: '2',
            nome: 'João Santos',
            iniciais: 'JS',
            texto: 'Consegui ganhar massa muscular de forma saudável. O acompanhamento foi fundamental para meus resultados.',
            resultado: 'Ganhou 8kg de massa magra',
            estrelas: 5
          },
          {
            id: '3',
            nome: 'Ana Costa',
            iniciais: 'AC',
            texto: 'Aprendi a me alimentar melhor e agora tenho muito mais energia no dia a dia. Recomendo!',
            resultado: 'Melhorou disposição e saúde',
            estrelas: 5
          }
        ],
        config: {
          nomeSite: "NutriVida",
          crn: "12345-SP",
          telefone: "(11) 99999-9999",
          email: "contato@nutrivida.com",
          endereco: "São Paulo, SP",
          horarioAtendimento: "Segunda a Sexta: 8h às 18h\nSábado: 8h às 12h",
          heroTitulo: "Transforme sua saúde com nutrição personalizada",
          heroSubtitulo: "Planos alimentares sob medida para seus objetivos, com acompanhamento profissional e resultados comprovados.",
          sobreTexto: "Sou uma nutricionista apaixonada por ajudar pessoas a alcançarem seus objetivos de saúde através da alimentação. Com anos de experiência e centenas de pacientes atendidos, desenvolvo planos personalizados que se adaptam ao seu estilo de vida.",
          estatisticas: {
            clientes: "500+",
            sucesso: "95%",
            experiencia: "8+"
          }
        },
        lastUpdate: new Date().toISOString()
      }

      return NextResponse.json({
        success: true,
        data: fallbackData,
        source: 'fallback'
      })
    }

    // Buscar dados do Supabase
    const [leadsResult, depoimentosResult, configResult] = await Promise.allSettled([
      supabase.from('leads').select('*').order('created_at', { ascending: false }),
      supabase.from('depoimentos').select('*').eq('aprovado', true).order('created_at', { ascending: false }),
      supabase.from('site_config').select('*').limit(1).single()
    ])

    // Processar leads
    let leads = []
    if (leadsResult.status === 'fulfilled' && leadsResult.value.data) {
      leads = leadsResult.value.data.map((lead: any) => ({
        id: lead.id.toString(),
        nome: lead.nome,
        email: lead.email,
        telefone: lead.telefone,
        objetivo: lead.mensagem.includes('emagrecimento') ? 'emagrecimento' : 
                 lead.mensagem.includes('massa') ? 'ganho-massa' : 'reeducacao',
        detalhes: lead.mensagem,
        data: lead.created_at,
        status: 'novo'
      }))
    }

    // Processar depoimentos
    let depoimentos = []
    if (depoimentosResult.status === 'fulfilled' && depoimentosResult.value.data) {
      depoimentos = depoimentosResult.value.data.map((dep: any) => ({
        id: dep.id.toString(),
        nome: dep.nome,
        iniciais: dep.nome.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase(),
        texto: dep.depoimento,
        resultado: 'Cliente satisfeito',
        estrelas: dep.avaliacao || 5,
        ativo: dep.aprovado
      }))
    }

    // Se não há depoimentos no banco, usar padrão
    if (depoimentos.length === 0) {
      depoimentos = [
        {
          id: '1',
          nome: 'Maria Silva',
          iniciais: 'MS',
          texto: 'Perdi 15kg em 4 meses seguindo o plano alimentar. Me sinto muito mais disposta e saudável!',
          resultado: 'Perdeu 15kg',
          estrelas: 5
        },
        {
          id: '2',
          nome: 'João Santos',
          iniciais: 'JS',
          texto: 'Consegui ganhar massa muscular de forma saudável. O acompanhamento foi fundamental para meus resultados.',
          resultado: 'Ganhou 8kg de massa magra',
          estrelas: 5
        },
        {
          id: '3',
          nome: 'Ana Costa',
          iniciais: 'AC',
          texto: 'Aprendi a me alimentar melhor e agora tenho muito mais energia no dia a dia. Recomendo!',
          resultado: 'Melhorou disposição e saúde',
          estrelas: 5
        }
      ]
    }

    // Processar configuração
    let config = {
      nomeSite: "NutriVida",
      crn: "12345-SP",
      telefone: "(11) 99999-9999",
      email: "contato@nutrivida.com",
      endereco: "São Paulo, SP",
      horarioAtendimento: "Segunda a Sexta: 8h às 18h\nSábado: 8h às 12h",
      heroTitulo: "Transforme sua saúde com nutrição personalizada",
      heroSubtitulo: "Planos alimentares sob medida para seus objetivos, com acompanhamento profissional e resultados comprovados.",
      sobreTexto: "Sou uma nutricionista apaixonada por ajudar pessoas a alcançarem seus objetivos de saúde através da alimentação. Com anos de experiência e centenas de pacientes atendidos, desenvolvo planos personalizados que se adaptam ao seu estilo de vida.",
      estatisticas: {
        clientes: "500+",
        sucesso: "95%",
        experiencia: "8+"
      }
    }

    if (configResult.status === 'fulfilled' && configResult.value.data) {
      config.nomeSite = configResult.value.data.titulo || config.nomeSite
    }

    return NextResponse.json({
      success: true,
      data: {
        leads,
        depoimentos,
        config,
        lastUpdate: new Date().toISOString()
      },
      source: 'supabase'
    })
  } catch (error) {
    console.error('Erro ao carregar dados:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao carregar dados' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body

    if (!isSupabaseConfigured() || !supabase) {
      // Fallback: simular sucesso sem Supabase
      return NextResponse.json({
        success: true,
        data: {
          leads: [],
          depoimentos: [],
          config: {},
          lastUpdate: new Date().toISOString()
        },
        source: 'fallback'
      })
    }

    switch (type) {
      case 'ADD_LEAD':
        const { error: leadError } = await supabase
          .from('leads')
          .insert([{
            nome: data.nome,
            email: data.email,
            telefone: data.telefone,
            mensagem: `Objetivo: ${data.objetivo}. Detalhes: ${data.detalhes || 'Não informado'}`
          }])

        if (leadError) throw leadError
        break

      case 'UPDATE_LEADS':
        // Para atualização de leads, não fazemos nada no Supabase por enquanto
        // pois seria necessário mapear cada lead individual
        break

      case 'UPDATE_DEPOIMENTOS':
        // Para depoimentos, inserir novos se necessário
        for (const depoimento of data) {
          if (!depoimento.id.startsWith('temp_')) {
            continue // Pular depoimentos que já existem
          }
          
          const { error: depError } = await supabase
            .from('depoimentos')
            .insert([{
              token: `token_${Date.now()}_${Math.random()}`,
              nome: depoimento.nome,
              depoimento: depoimento.texto,
              avaliacao: depoimento.estrelas,
              aprovado: true
            }])

          if (depError) console.error('Erro ao inserir depoimento:', depError)
        }
        break

      case 'UPDATE_CONFIG':
        const { error: configError } = await supabase
          .from('site_config')
          .upsert([{
            id: 1,
            titulo: data.nomeSite,
            logo_url: null,
            consulta_imagem_url: null,
            nutricionista_imagem_url: null
          }])

        if (configError) throw configError
        break

      default:
        return NextResponse.json(
          { success: false, error: 'Tipo de operação inválido' },
          { status: 400 }
        )
    }

    // Retornar dados atualizados
    const updatedData = await GET()
    return updatedData
  } catch (error) {
    console.error('Erro ao salvar dados:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao salvar dados' },
      { status: 500 }
    )
  }
}