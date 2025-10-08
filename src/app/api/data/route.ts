import { NextRequest, NextResponse } from 'next/server'

// Simulação de banco de dados em memória (em produção seria um banco real)
let serverData = {
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

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: serverData
    })
  } catch (error) {
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

    switch (type) {
      case 'ADD_LEAD':
        const newLead = {
          ...data,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          data: new Date().toISOString(),
          status: 'novo'
        }
        serverData.leads.unshift(newLead)
        serverData.lastUpdate = new Date().toISOString()
        break

      case 'UPDATE_LEADS':
        serverData.leads = data
        serverData.lastUpdate = new Date().toISOString()
        break

      case 'UPDATE_DEPOIMENTOS':
        serverData.depoimentos = data
        serverData.lastUpdate = new Date().toISOString()
        break

      case 'UPDATE_CONFIG':
        serverData.config = { ...serverData.config, ...data }
        serverData.lastUpdate = new Date().toISOString()
        break

      default:
        return NextResponse.json(
          { success: false, error: 'Tipo de operação inválido' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data: serverData
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao salvar dados' },
      { status: 500 }
    )
  }
}