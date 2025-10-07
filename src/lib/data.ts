// Simulação de dados para demonstração
// Em produção, isso seria substituído por um banco de dados real

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
  telefone: string
  email: string
  endereco: string
  horarioAtendimento: string
  crn: string
  sobreTexto: string
  heroTitulo: string
  heroSubtitulo: string
  estatisticas: {
    clientes: string
    sucesso: string
    experiencia: string
  }
}

// Função para formatar nome (primeira letra maiúscula)
const formatarNome = (nome: string): string => {
  return nome.toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
}

// Função para formatar telefone
const formatarTelefone = (telefone: string): string => {
  // Remove todos os caracteres não numéricos
  const numeros = telefone.replace(/\D/g, '')
  
  // Se tem 11 dígitos (celular com DDD)
  if (numeros.length === 11) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`
  }
  // Se tem 10 dígitos (fixo com DDD)
  else if (numeros.length === 10) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`
  }
  // Se já está formatado ou tem formato diferente, retorna como está
  return telefone
}

// Dados iniciais para demonstração
export const leadsIniciais: Lead[] = [
  {
    id: '1',
    nome: 'Maria Silva',
    email: 'maria@email.com',
    telefone: '(11) 99999-9999',
    objetivo: 'emagrecimento',
    detalhes: 'Preciso perder 10kg para meu casamento',
    data: '2024-01-15T14:30:00.000Z',
    status: 'novo'
  },
  {
    id: '2',
    nome: 'João Santos',
    email: 'joao@email.com',
    telefone: '(11) 88888-8888',
    objetivo: 'ganho-massa',
    detalhes: 'Quero ganhar massa muscular para competir',
    data: '2024-01-14T09:15:00.000Z',
    status: 'contatado'
  },
  {
    id: '3',
    nome: 'Ana Costa',
    email: 'ana@email.com',
    telefone: '(11) 77777-7777',
    objetivo: 'reeducacao',
    detalhes: 'Tenho diabetes e preciso melhorar minha alimentação',
    data: '2024-01-13T16:45:00.000Z',
    status: 'agendado'
  },
  {
    id: '4',
    nome: 'Carlos Oliveira',
    email: 'carlos@email.com',
    telefone: '(11) 66666-6666',
    objetivo: 'emagrecimento',
    detalhes: 'Quero perder barriga e melhorar minha saúde',
    data: '2024-01-12T11:20:00.000Z',
    status: 'convertido'
  }
]

export const depoimentosIniciais: Depoimento[] = [
  {
    id: '1',
    nome: 'Maria Silva',
    iniciais: 'M',
    texto: 'Perdi 15kg em 4 meses de forma saudável e sem passar fome. O acompanhamento foi fundamental para meu sucesso!',
    resultado: 'Perdeu 15kg',
    estrelas: 5
  },
  {
    id: '2',
    nome: 'João Santos',
    iniciais: 'J',
    texto: 'Consegui ganhar massa muscular seguindo as orientações. Profissional muito competente e atenciosa!',
    resultado: 'Ganhou 8kg de massa',
    estrelas: 5
  },
  {
    id: '3',
    nome: 'Ana Costa',
    iniciais: 'A',
    texto: 'Mudou completamente minha relação com a comida. Hoje tenho uma alimentação equilibrada e prazerosa!',
    resultado: 'Reeducação alimentar',
    estrelas: 5
  }
]

export const configInicial: ConfigSite = {
  nomeSite: 'NutriVida',
  telefone: '(11) 98244-9680',
  email: 'contato@nutrivida.com',
  endereco: 'São Paulo, SP',
  horarioAtendimento: 'Segunda a Sexta: 8h às 18h\nSábado: 8h às 12h',
  crn: '12345',
  sobreTexto: 'Sou formada em Nutrição pela Universidade Federal, com especialização em Nutrição Clínica e Esportiva. Há mais de 5 anos ajudo pessoas a transformarem sua relação com a comida e alcançarem seus objetivos de saúde.',
  heroTitulo: 'Transforme sua saúde com nutrição personalizada',
  heroSubtitulo: 'Nutricionista especializada em emagrecimento saudável, ganho de massa muscular e reeducação alimentar. Planos personalizados que cabem na sua rotina.',
  estatisticas: {
    clientes: '500+',
    sucesso: '95%',
    experiencia: '5+'
  }
}

// Funções utilitárias para localStorage (simulando backend)
export const salvarLeads = (leads: Lead[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('nutri-leads', JSON.stringify(leads))
  }
}

export const carregarLeads = (): Lead[] => {
  if (typeof window !== 'undefined') {
    const dados = localStorage.getItem('nutri-leads')
    return dados ? JSON.parse(dados) : leadsIniciais
  }
  return leadsIniciais
}

export const salvarDepoimentos = (depoimentos: Depoimento[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('nutri-depoimentos', JSON.stringify(depoimentos))
  }
}

export const carregarDepoimentos = (): Depoimento[] => {
  if (typeof window !== 'undefined') {
    const dados = localStorage.getItem('nutri-depoimentos')
    return dados ? JSON.parse(dados) : depoimentosIniciais
  }
  return depoimentosIniciais
}

export const salvarConfig = (config: ConfigSite) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('nutri-config', JSON.stringify(config))
  }
}

export const carregarConfig = (): ConfigSite => {
  if (typeof window !== 'undefined') {
    const dados = localStorage.getItem('nutri-config')
    return dados ? JSON.parse(dados) : configInicial
  }
  return configInicial
}

export const adicionarLead = (lead: Omit<Lead, 'id' | 'data' | 'status'>) => {
  const leads = carregarLeads()
  
  // Formatar dados antes de salvar
  const novoLead: Lead = {
    ...lead,
    nome: formatarNome(lead.nome),
    telefone: formatarTelefone(lead.telefone),
    id: Date.now().toString(),
    data: new Date().toISOString(), // Salva com horário completo
    status: 'novo'
  }
  
  const leadsAtualizados = [novoLead, ...leads]
  salvarLeads(leadsAtualizados)
  return novoLead
}