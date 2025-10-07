import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export async function GET() {
  try {
    // Verificar se o Supabase está configurado
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: true,
        data: {
          leads: [],
          depoimentos: getDepoimentosPadrao(),
          config: getConfigPadrao(),
          lastUpdate: new Date().toISOString()
        },
        message: 'Usando dados padrão (Supabase não configurado)'
      })
    }

    // Buscar dados do Supabase
    const [leadsResult, depoimentosResult] = await Promise.all([
      supabase!.from('leads').select('*').order('created_at', { ascending: false }),
      supabase!.from('depoimentos').select('*').eq('aprovado', true)
    ])

    return NextResponse.json({
      success: true,
      data: {
        leads: leadsResult.data || [],
        depoimentos: depoimentosResult.data || getDepoimentosPadrao(),
        config: getConfigPadrao(),
        lastUpdate: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Erro na API de dados:', error)
    
    // Retornar dados padrão em caso de erro
    return NextResponse.json({
      success: true,
      data: {
        leads: [],
        depoimentos: getDepoimentosPadrao(),
        config: getConfigPadrao(),
        lastUpdate: new Date().toISOString()
      },
      message: 'Usando dados padrão devido a erro'
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json()

    // Verificar se o Supabase está configurado
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: true,
        data: {
          leads: [],
          depoimentos: getDepoimentosPadrao(),
          config: getConfigPadrao(),
          lastUpdate: new Date().toISOString()
        },
        message: 'Operação simulada (Supabase não configurado)'
      })
    }

    switch (type) {
      case 'ADD_LEAD':
        const { error: leadError } = await supabase!
          .from('leads')
          .insert([{
            nome: data.nome,
            email: data.email,
            telefone: data.telefone,
            mensagem: data.objetivo + (data.detalhes ? `\n\n${data.detalhes}` : '')
          }])

        if (leadError) throw leadError
        break

      default:
        return NextResponse.json({
          success: false,
          error: 'Tipo de operação não suportado'
        }, { status: 400 })
    }

    // Retornar dados atualizados
    const [leadsResult, depoimentosResult] = await Promise.all([
      supabase!.from('leads').select('*').order('created_at', { ascending: false }),
      supabase!.from('depoimentos').select('*').eq('aprovado', true)
    ])

    return NextResponse.json({
      success: true,
      data: {
        leads: leadsResult.data || [],
        depoimentos: depoimentosResult.data || getDepoimentosPadrao(),
        config: getConfigPadrao(),
        lastUpdate: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Erro na API de dados:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

function getConfigPadrao() {
  return {
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
}

function getDepoimentosPadrao() {
  return [
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