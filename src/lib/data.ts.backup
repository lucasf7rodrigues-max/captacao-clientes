// Sistema de dados para o site de nutrição
// Versão com integração completa Supabase + fallback local

import { supabase, isSupabaseConfigured } from './supabase'

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

// Função para fazer requisições à API com Supabase
async function apiRequestWithSupabase(method: 'GET' | 'POST', data?: any) {
  try {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase não configurado')
    }

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

// Função para interagir diretamente com Supabase
async function supabaseRequest(operation: string, data?: any) {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase não configurado')
    }

    switch (operation) {
      case 'GET_LEADS':
        const { data: leadsData, error: leadsError } = await supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (leadsError) throw leadsError
        
        // Converter formato do Supabase para formato local
        return (leadsData || []).map((lead: any) => ({
          id: lead.id.toString(),
          nome: lead.nome,
          email: lead.email,
          telefone: lead.telefone,
          objetivo: lead.mensagem.includes('emagrecimento') ? 'emagrecimento' : 
                   lead.mensagem.includes('massa') ? 'ganho-massa' : 'reeducacao',
          detalhes: lead.mensagem,
          data: lead.created_at,
          status: 'novo' as const
        }))

      case 'ADD_LEAD':
        const { data: newLeadData, error: newLeadError } = await supabase
          .from('leads')
          .insert([{
            nome: data.nome,
            email: data.email,
            telefone: data.telefone,
            mensagem: `Objetivo: ${data.objetivo}. Detalhes: ${data.detalhes || 'Não informado'}`
          }])
          .select()
        
        if (newLeadError) throw newLeadError
        return newLeadData

      case 'GET_DEPOIMENTOS':
        const { data: depData, error: depError } = await supabase
          .from('depoimentos')
          .select('*')
          .eq('aprovado', true)
          .order('created_at', { ascending: false })
        
        if (depError) throw depError
        
        // Converter formato do Supabase para formato local
        return (depData || []).map((dep: any) => ({
          id: dep.id.toString(),
          nome: dep.nome,
          iniciais: dep.nome.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase(),
          texto: dep.depoimento,
          resultado: 'Cliente satisfeito',
          estrelas: dep.avaliacao || 5,
          ativo: dep.aprovado
        }))

      case 'ADD_DEPOIMENTO':
        const { data: newDepData, error: newDepError } = await supabase
          .from('depoimentos')
          .insert([{
            token: `token_${Date.now()}`,
            nome: data.nome,
            depoimento: data.texto,
            avaliacao: data.estrelas,
            aprovado: true
          }])
          .select()
        
        if (newDepError) throw newDepError
        return newDepData

      case 'GET_CONFIG':
        const { data: configData, error: configError } = await supabase
          .from('site_config')
          .select('*')
          .limit(1)
          .single()
        
        if (configError && configError.code !== 'PGRST116') throw configError
        
        // Se não existe config, criar uma padrão
        if (!configData) {
          const defaultConfig = getConfigPadrao()
          const { data: newConfigData, error: insertError } = await supabase
            .from('site_config')
            .insert([{
              titulo: defaultConfig.nomeSite,
              logo_url: null,
              consulta_imagem_url: null,
              nutricionista_imagem_url: null
            }])
            .select()
            .single()
          
          if (insertError) throw insertError
          return defaultConfig
        }
        
        return {
          ...getConfigPadrao(),
          nomeSite: configData.titulo || getConfigPadrao().nomeSite
        }

      case 'UPDATE_CONFIG':
        const { data: updatedConfig, error: updateError } = await supabase
          .from('site_config')
          .upsert([{
            id: 1,
            titulo: data.nomeSite,
            logo_url: data.logoUrl || null,
            consulta_imagem_url: data.consultaImagemUrl || null,
            nutricionista_imagem_url: data.nutricionistaImagemUrl || null
          }])
          .select()
        
        if (updateError) throw updateError
        return data

      default:
        throw new Error('Operação não suportada')
    }
  } catch (error) {
    console.error('Erro no Supabase:', error)
    throw error
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

// Inicializar cache com Supabase
async function initializeCache() {
  if (cache.initialized) return

  try {
    if (isSupabaseConfigured()) {
      // Tentar carregar do Supabase
      const [leadsData, depoimentosData, configData] = await Promise.all([
        supabaseRequest('GET_LEADS').catch(() => []),
        supabaseRequest('GET_DEPOIMENTOS').catch(() => getDepoimentosPadrao()),
        supabaseRequest('GET_CONFIG').catch(() => getConfigPadrao())
      ])

      cache.leads = leadsData || []
      cache.depoimentos = depoimentosData || getDepoimentosPadrao()
      cache.config = configData || getConfigPadrao()
      cache.lastUpdate = new Date().toISOString()
      cache.initialized = true

      // Salvar no localStorage como backup
      if (typeof window !== 'undefined') {
        localStorage.setItem('nutri-leads', JSON.stringify(cache.leads))
        localStorage.setItem('nutri-depoimentos', JSON.stringify(cache.depoimentos))
        localStorage.setItem('nutri-config', JSON.stringify(cache.config))
      }
    } else {
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
    if (isSupabaseConfigured()) {
      await supabaseRequest('ADD_LEAD', lead)
      // Recarregar dados do Supabase
      cache.leads = await supabaseRequest('GET_LEADS')
    } else {
      // Fallback: adicionar apenas no localStorage
      const newLead: Lead = {
        ...lead,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        data: new Date().toISOString(),
        status: 'novo'
      }
      cache.leads.unshift(newLead)
    }

    // Sempre salvar no localStorage como backup
    if (typeof window !== 'undefined') {
      localStorage.setItem('nutri-leads', JSON.stringify(cache.leads))
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
    cache.leads = leads
    
    // Sempre salvar no localStorage como backup
    if (typeof window !== 'undefined') {
      localStorage.setItem('nutri-leads', JSON.stringify(leads))
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
    cache.depoimentos = depoimentos
    
    // Sempre salvar no localStorage como backup
    if (typeof window !== 'undefined') {
      localStorage.setItem('nutri-depoimentos', JSON.stringify(depoimentos))
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
    if (isSupabaseConfigured()) {
      await supabaseRequest('UPDATE_CONFIG', config)
    }
    
    cache.config = config
    
    // Sempre salvar no localStorage como backup
    if (typeof window !== 'undefined') {
      localStorage.setItem('nutri-config', JSON.stringify(config))
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