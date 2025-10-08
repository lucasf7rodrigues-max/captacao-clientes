// Sistema de dados para o site de nutrição
// Versão refatorada que usa API Routes para segurança

export interface Lead {
  id: string
  nome: string
  email: string
  telefone: string
  objetivo: string
  detalhes?: string
  data: string
  status: 'novo' | 'contatado' | 'agendado' | 'convertido'
}

export interface Depoimento {
  id: string
  nome: string
  iniciais: string
  texto: string
  resultado: string
  estrelas: number
  ativo?: boolean
}

export interface ConfigSite {
  nomeSite: string
  crn: string
  telefone: string
  email: string
  endereco: string
  horarioAtendimento: string
  heroTitulo: string
  heroSubtitulo: string
  sobreTexto: string
  estatisticas: {
    clientes: string
    sucesso: string
    experiencia: string
  }
}

// Cache local para melhor performance
let cache = {
  leads: [] as Lead[],
  depoimentos: [] as Depoimento[],
  config: null as ConfigSite | null,
  lastUpdate: null as string | null,
  initialized: false
}

function getConfigPadrao(): ConfigSite {
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

function getDepoimentosPadrao(): Depoimento[] {
  return [
    {
      id: '1',
      nome: 'Maria Silva',
      iniciais: 'MS',
      texto: 'Perdi 15kg em 4 meses seguindo o plano alimentar. Me sinto muito mais disposta e saudável!',
      resultado: 'Perdeu 15kg',
      estrelas: 5,
      ativo: true
    },
    {
      id: '2',
      nome: 'João Santos',
      iniciais: 'JS',
      texto: 'Consegui ganhar massa muscular de forma saudável. O acompanhamento foi fundamental para meus resultados.',
      resultado: 'Ganhou 8kg de massa magra',
      estrelas: 5,
      ativo: true
    },
    {
      id: '3',
      nome: 'Ana Costa',
      iniciais: 'AC',
      texto: 'Aprendi a me alimentar melhor e agora tenho muito mais energia no dia a dia. Recomendo!',
      resultado: 'Melhorou disposição e saúde',
      estrelas: 5,
      ativo: true
    }
  ]
}

// Fallback para localStorage (apenas para leitura inicial)
function getFallbackData() {
  if (typeof window === 'undefined') return null

  try {
    const leads = localStorage.getItem('nutri-leads')
    const depoimentos = localStorage.getItem('nutri-depoimentos')
    const config = localStorage.getItem('nutri-config')

    return {
      leads: leads ? JSON.parse(leads) : [],
      depoimentos: depoimentos ? JSON.parse(depoimentos) : getDepoimentosPadrao(),
      config: config ? JSON.parse(config) : getConfigPadrao(),
      lastUpdate: new Date().toISOString()
    }
  } catch (error) {
    console.error('Erro no fallback:', error)
    return {
      leads: [],
      depoimentos: getDepoimentosPadrao(),
      config: getConfigPadrao(),
      lastUpdate: new Date().toISOString()
    }
  }
}

// Inicializar cache
async function initializeCache() {
  if (cache.initialized) return

  try {
    // Carregar dados padrão primeiro
    const fallbackData = getFallbackData()
    if (fallbackData) {
      cache.leads = fallbackData.leads
      cache.depoimentos = fallbackData.depoimentos
      cache.config = fallbackData.config
      cache.lastUpdate = fallbackData.lastUpdate
    } else {
      cache.depoimentos = getDepoimentosPadrao()
      cache.config = getConfigPadrao()
    }
    
    cache.initialized = true
  } catch (error) {
    console.error('Erro ao inicializar cache:', error)
    cache.depoimentos = getDepoimentosPadrao()
    cache.config = getConfigPadrao()
    cache.initialized = true
  }
}

// ============================================================================
// FUNÇÕES PÚBLICAS - LEADS
// ============================================================================

export async function carregarLeads(): Promise<Lead[]> {
  try {
    const response = await fetch('/api/leads', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const result = await response.json()

    if (result.success && result.data) {
      cache.leads = result.data
      return result.data
    }

    return []
  } catch (error) {
    console.error('Erro ao carregar leads:', error)
    return []
  }
}

export function carregarLeadsSync(): Lead[] {
  if (!cache.initialized) {
    const fallbackData = getFallbackData()
    return fallbackData?.leads || []
  }
  return [...cache.leads]
}

export async function adicionarLead(lead: Omit<Lead, 'id' | 'data' | 'status'>): Promise<void> {
  try {
    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lead)
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Erro ao adicionar lead')
    }

    // Atualizar cache local
    if (result.data) {
      const newLead: Lead = {
        id: result.data.id?.toString() || Date.now().toString(),
        nome: lead.nome,
        email: lead.email,
        telefone: lead.telefone,
        objetivo: lead.objetivo,
        detalhes: lead.detalhes,
        data: result.data.created_at || new Date().toISOString(),
        status: 'novo'
      }
      cache.leads.unshift(newLead)
    }
  } catch (error) {
    console.error('Erro ao adicionar lead:', error)
    throw error
  }
}

export async function salvarLeads(leads: Lead[]): Promise<void> {
  cache.leads = leads
  
  // Salvar no localStorage como backup
  if (typeof window !== 'undefined') {
    localStorage.setItem('nutri-leads', JSON.stringify(leads))
  }
}

// ============================================================================
// FUNÇÕES PÚBLICAS - DEPOIMENTOS
// ============================================================================

export async function carregarDepoimentos(): Promise<Depoimento[]> {
  await initializeCache()
  
  try {
    const response = await fetch('/api/depoimentos', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const result = await response.json()

    if (result.success && result.data) {
      cache.depoimentos = result.data
      return result.data
    }

    return cache.depoimentos
  } catch (error) {
    console.error('Erro ao carregar depoimentos:', error)
    return cache.depoimentos
  }
}

export function carregarDepoimentosSync(): Depoimento[] {
  if (!cache.initialized) {
    const fallbackData = getFallbackData()
    return fallbackData?.depoimentos || getDepoimentosPadrao()
  }
  return [...cache.depoimentos]
}

export async function salvarDepoimentos(depoimentos: Depoimento[]): Promise<void> {
  cache.depoimentos = depoimentos
  
  // Salvar no localStorage como backup
  if (typeof window !== 'undefined') {
    localStorage.setItem('nutri-depoimentos', JSON.stringify(depoimentos))
  }
}

// ============================================================================
// FUNÇÕES PÚBLICAS - CONFIGURAÇÃO
// ============================================================================

export async function carregarConfig(): Promise<ConfigSite> {
  await initializeCache()
  
  try {
    const response = await fetch('/api/config', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const result = await response.json()

    if (result.success && result.data) {
      cache.config = result.data
      return result.data
    }

    return cache.config || getConfigPadrao()
  } catch (error) {
    console.error('Erro ao carregar config:', error)
    return cache.config || getConfigPadrao()
  }
}

export function carregarConfigSync(): ConfigSite {
  if (!cache.initialized || !cache.config) {
    const fallbackData = getFallbackData()
    return fallbackData?.config || getConfigPadrao()
  }
  return { ...cache.config }
}

export async function salvarConfig(config: ConfigSite): Promise<void> {
  try {
    const response = await fetch('/api/config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config)
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Erro ao salvar configuração')
    }

    cache.config = config
    
    // Salvar no localStorage como backup
    if (typeof window !== 'undefined') {
      localStorage.setItem('nutri-config', JSON.stringify(config))
    }
  } catch (error) {
    console.error('Erro ao salvar config:', error)
    throw error
  }
}

// Função para sincronização manual
export async function sincronizarDados(): Promise<void> {
  cache.initialized = false
  await initializeCache()
}
