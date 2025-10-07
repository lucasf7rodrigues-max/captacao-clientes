// Sistema de fallback para dados locais quando Supabase não está configurado
export interface LocalData {
  leads: any[]
  depoimentos: any[]
  config: {
    titulo: string
    logo_url?: string
    consulta_imagem_url?: string
    nutricionista_imagem_url?: string
  }
}

// Dados padrão
const defaultData: LocalData = {
  leads: [],
  depoimentos: [],
  config: {
    titulo: 'NutriVida',
    logo_url: '',
    consulta_imagem_url: '',
    nutricionista_imagem_url: ''
  }
}

// Verificar se estamos no servidor ou cliente
const isServer = typeof window === 'undefined'

// Funções para gerenciar dados locais
export const localData = {
  get: (): LocalData => {
    if (isServer) return defaultData
    
    try {
      const stored = localStorage.getItem('nutrivida-data')
      return stored ? JSON.parse(stored) : defaultData
    } catch {
      return defaultData
    }
  },

  set: (data: LocalData) => {
    if (isServer) return
    
    try {
      localStorage.setItem('nutrivida-data', JSON.stringify(data))
    } catch (error) {
      console.error('Erro ao salvar dados locais:', error)
    }
  },

  addLead: (lead: any) => {
    if (isServer) return
    
    const data = localData.get()
    data.leads.unshift({ ...lead, id: Date.now(), created_at: new Date().toISOString() })
    localData.set(data)
  },

  addDepoimento: (depoimento: any) => {
    if (isServer) return
    
    const data = localData.get()
    data.depoimentos.unshift({ 
      ...depoimento, 
      id: Date.now(), 
      created_at: new Date().toISOString(),
      aprovado: false 
    })
    localData.set(data)
  },

  updateConfig: (config: any) => {
    if (isServer) return
    
    const data = localData.get()
    data.config = { ...data.config, ...config }
    localData.set(data)
  },

  updateDepoimento: (id: number, updates: any) => {
    if (isServer) return
    
    const data = localData.get()
    const index = data.depoimentos.findIndex(d => d.id === id)
    if (index !== -1) {
      data.depoimentos[index] = { ...data.depoimentos[index], ...updates }
      localData.set(data)
    }
  }
}