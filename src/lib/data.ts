// Sistema de dados para o site de nutrição
// Versão com API para produção

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

// Função para fazer requisições à API
async function apiRequest(method: 'GET' | 'POST', data?: any) {
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    }

    if (method === 'POST' && data) {
      options.body = JSON.stringify(data)
    }

    const response = await fetch('/api/data', options)
    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Erro na API')
    }

    return result.data
  } catch (error) {
    console.error('Erro na API:', error)
    // Fallback para localStorage em caso de erro
    return getFallbackData()
  }
}

// Fallback para localStorage
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

// Inicializar cache
async function initializeCache() {
  if (cache.initialized) return

  try {
    const data = await apiRequest('GET')
    if (data) {
      cache.leads = data.leads || []
      cache.depoimentos = data.depoimentos || getDepoimentosPadrao()
      cache.config = data.config || getConfigPadrao()
      cache.lastUpdate = data.lastUpdate
      cache.initialized = true

      // Salvar no localStorage como backup
      if (typeof window !== 'undefined') {
        localStorage.setItem('nutri-leads', JSON.stringify(cache.leads))
        localStorage.setItem('nutri-depoimentos', JSON.stringify(cache.depoimentos))
        localStorage.setItem('nutri-config', JSON.stringify(cache.config))
      }
    }
  } catch (error) {
    console.error('Erro ao inicializar cache:', error)
    // Usar dados do localStorage como fallback
    const fallbackData = getFallbackData()
    if (fallbackData) {
      cache.leads = fallbackData.leads
      cache.depoimentos = fallbackData.depoimentos
      cache.config = fallbackData.config
      cache.lastUpdate = fallbackData.lastUpdate
    }
    cache.initialized = true
  }
}

// Funções públicas
export async function carregarLeads(): Promise<Lead[]> {
  await initializeCache()
  return [...cache.leads]
}

export function carregarLeadsSync(): Lead[] {
  if (!cache.initialized) {
    // Tentar carregar do localStorage para uso síncrono
    const fallbackData = getFallbackData()
    return fallbackData?.leads || []
  }
  return [...cache.leads]
}

export async function adicionarLead(lead: Omit<Lead, 'id' | 'data' | 'status'>): Promise<void> {
  try {
    const data = await apiRequest('POST', {
      type: 'ADD_LEAD',
      data: lead
    })

    if (data) {
      cache.leads = data.leads
      cache.lastUpdate = data.lastUpdate

      // Backup no localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('nutri-leads', JSON.stringify(cache.leads))
      }
    }
  } catch (error) {
    console.error('Erro ao adicionar lead:', error)
    // Fallback: adicionar apenas no localStorage
    if (typeof window !== 'undefined') {
      const newLead: Lead = {
        ...lead,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        data: new Date().toISOString(),
        status: 'novo'
      }
      cache.leads.unshift(newLead)
      localStorage.setItem('nutri-leads', JSON.stringify(cache.leads))
    }
  }
}

export async function salvarLeads(leads: Lead[]): Promise<void> {
  try {
    const data = await apiRequest('POST', {
      type: 'UPDATE_LEADS',
      data: leads
    })

    if (data) {
      cache.leads = data.leads
      cache.lastUpdate = data.lastUpdate

      // Backup no localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('nutri-leads', JSON.stringify(cache.leads))
      }
    }
  } catch (error) {
    console.error('Erro ao salvar leads:', error)
    // Fallback: salvar apenas no localStorage
    if (typeof window !== 'undefined') {
      cache.leads = leads
      localStorage.setItem('nutri-leads', JSON.stringify(leads))
    }
  }
}

export async function carregarDepoimentos(): Promise<Depoimento[]> {
  await initializeCache()
  return [...cache.depoimentos]
}

export function carregarDepoimentosSync(): Depoimento[] {
  if (!cache.initialized) {
    const fallbackData = getFallbackData()
    return fallbackData?.depoimentos || getDepoimentosPadrao()
  }
  return [...cache.depoimentos]
}

export async function salvarDepoimentos(depoimentos: Depoimento[]): Promise<void> {
  try {
    const data = await apiRequest('POST', {
      type: 'UPDATE_DEPOIMENTOS',
      data: depoimentos
    })

    if (data) {
      cache.depoimentos = data.depoimentos
      cache.lastUpdate = data.lastUpdate

      // Backup no localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('nutri-depoimentos', JSON.stringify(cache.depoimentos))
      }
    }
  } catch (error) {
    console.error('Erro ao salvar depoimentos:', error)
    // Fallback: salvar apenas no localStorage
    if (typeof window !== 'undefined') {
      cache.depoimentos = depoimentos
      localStorage.setItem('nutri-depoimentos', JSON.stringify(depoimentos))
    }
  }
}

export async function carregarConfig(): Promise<ConfigSite> {
  await initializeCache()
  return { ...cache.config! }
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
    const data = await apiRequest('POST', {
      type: 'UPDATE_CONFIG',
      data: config
    })

    if (data) {
      cache.config = data.config
      cache.lastUpdate = data.lastUpdate

      // Backup no localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('nutri-config', JSON.stringify(cache.config))
      }
    }
  } catch (error) {
    console.error('Erro ao salvar config:', error)
    // Fallback: salvar apenas no localStorage
    if (typeof window !== 'undefined') {
      cache.config = config
      localStorage.setItem('nutri-config', JSON.stringify(config))
    }
  }
}

// Função para sincronização manual
export async function sincronizarDados(): Promise<void> {
  cache.initialized = false
  await initializeCache()
}