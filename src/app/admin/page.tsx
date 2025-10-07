"use client"

import { useState, useEffect } from 'react'
import { 
  Settings, 
  Users, 
  MessageSquare, 
  Image, 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  Star,
  Plus,
  Edit,
  Trash2,
  Save,
  Eye,
  BarChart3,
  Upload,
  X,
  Download,
  Calendar,
  Filter,
  Lock,
  Link,
  Copy,
  CheckCircle,
  Heart,
  Camera
} from 'lucide-react'
import { 
  carregarLeads, 
  carregarDepoimentos, 
  carregarConfig,
  salvarLeads,
  salvarDepoimentos,
  salvarConfig,
  type Lead,
  type Depoimento,
  type ConfigSite
} from '@/lib/data'

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('login')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loginData, setLoginData] = useState({ username: '', password: '' })
  const [leads, setLeads] = useState<Lead[]>([])
  const [depoimentos, setDepoimentos] = useState<Depoimento[]>([])
  const [configSite, setConfigSite] = useState<ConfigSite | null>(null)
  const [editingDepoimento, setEditingDepoimento] = useState<Depoimento | null>(null)
  const [showDepoimentoForm, setShowDepoimentoForm] = useState(false)
  const [filtroData, setFiltroData] = useState({ inicio: '', fim: '' })
  const [filtroMes, setFiltroMes] = useState('')
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [generatedLink, setGeneratedLink] = useState('')
  const [copySuccess, setCopySuccess] = useState(false)
  const [consultaPersonalizadaImage, setConsultaPersonalizadaImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Credenciais de acesso (em produção, isso seria mais seguro)
  const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'nutri2024@admin'
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadData()
    }
  }, [isAuthenticated])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [leadsData, depoimentosData, configData] = await Promise.all([
        carregarLeads(),
        carregarDepoimentos(),
        carregarConfig()
      ])

      setLeads(leadsData)
      setDepoimentos(depoimentosData)
      setConfigSite(configData)
      
      // Carregar imagens do localStorage
      const savedImages = localStorage.getItem('nutri-images')
      if (savedImages) {
        setUploadedImages(JSON.parse(savedImages))
      }

      // Carregar imagem da consulta personalizada
      const savedConsultaImage = localStorage.getItem('consulta-personalizada-image')
      if (savedConsultaImage) {
        setConsultaPersonalizadaImage(savedConsultaImage)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (loginData.username === ADMIN_CREDENTIALS.username && 
        loginData.password === ADMIN_CREDENTIALS.password) {
      setIsAuthenticated(true)
      setActiveTab('dashboard')
    } else {
      alert('Credenciais inválidas!')
    }
  }

  const formatarDataBrasil = (dataISO: string): string => {
    const data = new Date(dataISO)
    return data.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo'
    })
  }

  const filtrarLeadsPorData = (leads: Lead[]) => {
    let leadsFiltrados = [...leads]

    if (filtroMes) {
      leadsFiltrados = leadsFiltrados.filter(lead => {
        const dataLead = new Date(lead.data)
        const mesAno = `${dataLead.getFullYear()}-${String(dataLead.getMonth() + 1).padStart(2, '0')}`
        return mesAno === filtroMes
      })
    }

    if (filtroData.inicio && filtroData.fim) {
      leadsFiltrados = leadsFiltrados.filter(lead => {
        const dataLead = new Date(lead.data)
        const inicio = new Date(filtroData.inicio)
        const fim = new Date(filtroData.fim)
        return dataLead >= inicio && dataLead <= fim
      })
    }

    return leadsFiltrados
  }

  const exportarParaExcel = () => {
    const leadsFiltrados = filtrarLeadsPorData(leads)
    
    // Criar cabeçalho CSV
    const cabecalho = ['Nome', 'Email', 'Telefone', 'Objetivo', 'Detalhes', 'Data', 'Status']
    
    // Converter dados para CSV
    const linhas = leadsFiltrados.map(lead => [
      lead.nome,
      lead.email,
      lead.telefone,
      lead.objetivo,
      lead.detalhes || '',
      formatarDataBrasil(lead.data),
      lead.status
    ])
    
    // Combinar cabeçalho e dados
    const csvContent = [cabecalho, ...linhas]
      .map(linha => linha.map(campo => `"${campo}"`).join(','))
      .join('\n')
    
    // Criar e baixar arquivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `leads_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const gerarLinkDepoimento = (lead: Lead) => {
    // Gerar token único
    const token = btoa(`${lead.id}-${Date.now()}`).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16)
    
    // Salvar token no localStorage
    const savedTokens = localStorage.getItem('depoimento-tokens') || '{}'
    const tokens = JSON.parse(savedTokens)
    tokens[token] = {
      leadId: lead.id,
      nome: lead.nome,
      email: lead.email,
      geradoEm: new Date().toISOString(),
      usado: false
    }
    localStorage.setItem('depoimento-tokens', JSON.stringify(tokens))
    
    // Gerar link
    const baseUrl = window.location.origin
    const link = `${baseUrl}/depoimento/${token}`
    
    setGeneratedLink(link)
    setSelectedLead(lead)
    setShowLinkModal(true)
  }

  const copiarLink = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      // Fallback para navegadores mais antigos
      const textArea = document.createElement('textarea')
      textArea.value = generatedLink
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string
        const newImages = [...uploadedImages, imageUrl]
        setUploadedImages(newImages)
        localStorage.setItem('nutri-images', JSON.stringify(newImages))
      }
      reader.readAsDataURL(file)
    }
  }

  const deleteImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index)
    setUploadedImages(newImages)
    localStorage.setItem('nutri-images', JSON.stringify(newImages))
  }

  const setProfileImage = (imageUrl: string) => {
    localStorage.setItem('nutri-profile-image', imageUrl)
    alert('Imagem definida como foto de perfil da nutricionista!')
  }

  const setConsultaImage = (imageUrl: string) => {
    localStorage.setItem('consulta-personalizada-image', imageUrl)
    setConsultaPersonalizadaImage(imageUrl)
    alert('Imagem definida para a seção "Consulta Personalizada"!')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'novo': return 'bg-blue-100 text-blue-800'
      case 'contatado': return 'bg-yellow-100 text-yellow-800'
      case 'agendado': return 'bg-purple-100 text-purple-800'
      case 'convertido': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const updateLeadStatus = async (leadId: string, newStatus: Lead['status']) => {
    const leadsAtualizados = leads.map(lead => 
      lead.id === leadId ? { ...lead, status: newStatus } : lead
    )
    setLeads(leadsAtualizados)
    await salvarLeads(leadsAtualizados)
  }

  const deleteLead = async (leadId: string) => {
    const leadsAtualizados = leads.filter(lead => lead.id !== leadId)
    setLeads(leadsAtualizados)
    await salvarLeads(leadsAtualizados)
  }

  const saveDepoimento = async (depoimento: Omit<Depoimento, 'id'>) => {
    let depoimentosAtualizados
    
    if (editingDepoimento) {
      depoimentosAtualizados = depoimentos.map(d => 
        d.id === editingDepoimento.id ? { ...depoimento, id: editingDepoimento.id } : d
      )
    } else {
      const newDepoimento = {
        ...depoimento,
        id: Date.now().toString()
      }
      depoimentosAtualizados = [...depoimentos, newDepoimento]
    }
    
    setDepoimentos(depoimentosAtualizados)
    await salvarDepoimentos(depoimentosAtualizados)
    setEditingDepoimento(null)
    setShowDepoimentoForm(false)
  }

  const deleteDepoimento = async (id: string) => {
    const depoimentosAtualizados = depoimentos.filter(d => d.id !== id)
    setDepoimentos(depoimentosAtualizados)
    await salvarDepoimentos(depoimentosAtualizados)
  }

  const saveConfigSite = async () => {
    if (configSite) {
      await salvarConfig(configSite)
      alert('Configurações salvas com sucesso! As mudanças aparecerão na página principal.')
    }
  }

  const DepoimentoForm = () => {
    const [formData, setFormData] = useState({
      nome: editingDepoimento?.nome || '',
      iniciais: editingDepoimento?.iniciais || '',
      texto: editingDepoimento?.texto || '',
      resultado: editingDepoimento?.resultado || '',
      estrelas: editingDepoimento?.estrelas || 5
    })

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      saveDepoimento(formData)
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {editingDepoimento ? 'Editar Depoimento' : 'Novo Depoimento'}
            </h3>
            <button 
              onClick={() => {
                setShowDepoimentoForm(false)
                setEditingDepoimento(null)
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input
                type="text"
                required
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Iniciais</label>
              <input
                type="text"
                required
                maxLength={2}
                value={formData.iniciais}
                onChange={(e) => setFormData({...formData, iniciais: e.target.value.toUpperCase()})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Depoimento</label>
              <textarea
                required
                rows={3}
                value={formData.texto}
                onChange={(e) => setFormData({...formData, texto: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resultado</label>
              <input
                type="text"
                required
                value={formData.resultado}
                onChange={(e) => setFormData({...formData, resultado: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Ex: Perdeu 10kg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estrelas</label>
              <select
                value={formData.estrelas}
                onChange={(e) => setFormData({...formData, estrelas: Number(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value={5}>5 estrelas</option>
                <option value={4}>4 estrelas</option>
                <option value={3}>3 estrelas</option>
              </select>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 transition-colors"
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDepoimentoForm(false)
                  setEditingDepoimento(null)
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // Modal do Link de Depoimento
  const LinkModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Link de Depoimento Gerado</h3>
          <button 
            onClick={() => setShowLinkModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Link gerado para: <strong>{selectedLead?.nome}</strong>
            </p>
            <div className="bg-gray-50 p-3 rounded-md border">
              <p className="text-sm font-mono break-all">{generatedLink}</p>
            </div>
          </div>
          
          <button
            onClick={copiarLink}
            className={`w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-colors ${
              copySuccess 
                ? 'bg-green-600 text-white' 
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {copySuccess ? (
              <>
                <CheckCircle className="h-4 w-4" />
                <span>Link Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copiar Link</span>
              </>
            )}
          </button>
          
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-xs text-blue-800">
              <strong>💡 Como usar:</strong><br/>
              1. Copie o link acima<br/>
              2. Envie para o cliente via WhatsApp, email, etc.<br/>
              3. O cliente preencherá o formulário com seu nome já preenchido<br/>
              4. O depoimento aparecerá automaticamente no site
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  // Tela de Login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-emerald-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
            <p className="text-gray-600 mt-2">Acesso restrito - Digite suas credenciais</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Usuário</label>
              <input
                type="text"
                required
                value={loginData.username}
                onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Digite seu usuário"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
              <input
                type="password"
                required
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Digite sua senha"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
            >
              Entrar no Painel
            </button>
          </form>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 text-center">
              <strong>Credenciais de demonstração:</strong><br/>
              Usuário: admin<br/>
              Senha: nutri2024@admin
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!configSite || isLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Settings className="h-12 w-12 text-emerald-600 mx-auto mb-4 animate-pulse" />
        <p className="text-gray-600">Carregando painel...</p>
      </div>
    </div>
  }

  const leadsFiltrados = filtrarLeadsPorData(leads)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Settings className="h-8 w-8 text-emerald-600" />
              <h1 className="text-xl font-bold text-gray-900">Painel Administrativo - {configSite.nomeSite}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <a 
                href="/" 
                target="_blank"
                className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Eye className="h-4 w-4" />
                <span>Ver Site</span>
              </a>
              <button
                onClick={() => setIsAuthenticated(false)}
                className="text-gray-500 hover:text-gray-700"
                title="Sair"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <nav className="bg-white rounded-lg shadow-sm p-4">
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors ${
                      activeTab === 'dashboard' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <BarChart3 className="h-5 w-5" />
                    <span>Dashboard</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('leads')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors ${
                      activeTab === 'leads' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Users className="h-5 w-5" />
                    <span>Leads</span>
                    {leads.filter(l => l.status === 'novo').length > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {leads.filter(l => l.status === 'novo').length}
                      </span>
                    )}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('depoimentos')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors ${
                      activeTab === 'depoimentos' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <MessageSquare className="h-5 w-5" />
                    <span>Depoimentos</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('configuracoes')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors ${
                      activeTab === 'configuracoes' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Settings className="h-5 w-5" />
                    <span>Configurações</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('imagens')}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors ${
                      activeTab === 'imagens' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Image className="h-5 w-5" />
                    <span>Imagens</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Dashboard */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Users className="h-8 w-8 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Total de Leads</p>
                        <p className="text-2xl font-semibold text-gray-900">{leads.length}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <MessageSquare className="h-8 w-8 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Depoimentos</p>
                        <p className="text-2xl font-semibold text-gray-900">{depoimentos.length}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Star className="h-8 w-8 text-yellow-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Leads Novos</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {leads.filter(l => l.status === 'novo').length}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <BarChart3 className="h-8 w-8 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Convertidos</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {leads.filter(l => l.status === 'convertido').length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Leads */}
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Leads Recentes</h3>
                  </div>
                  <div className="p-6">
                    {leads.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Nenhum lead ainda. Quando alguém preencher o formulário do site, aparecerá aqui!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {leads.slice(0, 5).map((lead) => (
                          <div key={lead.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">{lead.nome}</p>
                              <p className="text-sm text-gray-500">{lead.email} • {lead.telefone}</p>
                              <p className="text-sm text-gray-500">Objetivo: {lead.objetivo}</p>
                              <p className="text-xs text-gray-400">{formatarDataBrasil(lead.data)}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(lead.status)}`}>
                              {lead.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Leads */}
            {activeTab === 'leads' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-2xl font-bold text-gray-900">Gerenciar Leads</h2>
                  
                  {/* Filtros e Exportação */}
                  <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <div className="flex gap-2">
                      <input
                        type="month"
                        value={filtroMes}
                        onChange={(e) => setFiltroMes(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                        title="Filtrar por mês"
                      />
                      <input
                        type="date"
                        value={filtroData.inicio}
                        onChange={(e) => setFiltroData({...filtroData, inicio: e.target.value})}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="Data início"
                      />
                      <input
                        type="date"
                        value={filtroData.fim}
                        onChange={(e) => setFiltroData({...filtroData, fim: e.target.value})}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="Data fim"
                      />
                    </div>
                    
                    <button
                      onClick={exportarParaExcel}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>Exportar Excel</span>
                    </button>
                  </div>
                </div>
                
                <div className="text-sm text-gray-500">
                  Mostrando {leadsFiltrados.length} de {leads.length} leads
                </div>
                
                {leadsFiltrados.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                    <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum lead encontrado</h3>
                    <p className="text-gray-500 mb-4">
                      {leads.length === 0 
                        ? "Quando visitantes preencherem o formulário de contato do seu site, eles aparecerão aqui."
                        : "Nenhum lead encontrado com os filtros aplicados."
                      }
                    </p>
                    <a 
                      href="/" 
                      target="_blank"
                      className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Ver Site</span>
                    </a>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Cliente
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Contato
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Objetivo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Detalhes
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Data
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Ações
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {leadsFiltrados.map((lead) => (
                            <tr key={lead.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{lead.nome}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{lead.email}</div>
                                <div className="text-sm text-gray-500">{lead.telefone}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{lead.objetivo}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900 max-w-xs truncate" title={lead.detalhes}>
                                  {lead.detalhes || '-'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatarDataBrasil(lead.data)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <select
                                  value={lead.status}
                                  onChange={(e) => updateLeadStatus(lead.id, e.target.value as Lead['status'])}
                                  className={`text-xs font-medium rounded-full px-2 py-1 border-0 ${getStatusColor(lead.status)}`}
                                >
                                  <option value="novo">Novo</option>
                                  <option value="contatado">Contatado</option>
                                  <option value="agendado">Agendado</option>
                                  <option value="convertido">Convertido</option>
                                </select>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => gerarLinkDepoimento(lead)}
                                    className="text-emerald-600 hover:text-emerald-900"
                                    title="Gerar link de depoimento"
                                  >
                                    <Link className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => deleteLead(lead.id)}
                                    className="text-red-600 hover:text-red-900"
                                    title="Excluir lead"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Depoimentos */}
            {activeTab === 'depoimentos' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Gerenciar Depoimentos</h2>
                  <button
                    onClick={() => setShowDepoimentoForm(true)}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Novo Depoimento</span>
                  </button>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {depoimentos.map((depoimento) => (
                    <div key={depoimento.id} className="bg-white rounded-lg shadow-sm p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="bg-emerald-100 rounded-full w-10 h-10 flex items-center justify-center">
                            <span className="text-emerald-800 font-bold">{depoimento.iniciais}</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{depoimento.nome}</h4>
                            <p className="text-sm text-gray-500">{depoimento.resultado}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setEditingDepoimento(depoimento)
                              setShowDepoimentoForm(true)
                            }}
                            className="text-blue-600 hover:text-blue-800"
                            title="Editar depoimento"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteDepoimento(depoimento.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Excluir depoimento"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center mb-3">
                        {[...Array(depoimento.estrelas)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      
                      <p className="text-gray-700 text-sm italic">"{depoimento.texto}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Configurações */}
            {activeTab === 'configuracoes' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Configurações do Site</h2>
                  <button
                    onClick={saveConfigSite}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>Salvar Alterações</span>
                  </button>
                </div>
                
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Informações Básicas */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Informações Básicas</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Site</label>
                        <input
                          type="text"
                          value={configSite.nomeSite}
                          onChange={(e) => setConfigSite({...configSite, nomeSite: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CRN</label>
                        <input
                          type="text"
                          value={configSite.crn}
                          onChange={(e) => setConfigSite({...configSite, crn: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                        <input
                          type="text"
                          value={configSite.telefone}
                          onChange={(e) => setConfigSite({...configSite, telefone: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                        <input
                          type="email"
                          value={configSite.email}
                          onChange={(e) => setConfigSite({...configSite, email: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                        <input
                          type="text"
                          value={configSite.endereco}
                          onChange={(e) => setConfigSite({...configSite, endereco: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Horário de Atendimento</label>
                        <textarea
                          rows={3}
                          value={configSite.horarioAtendimento}
                          onChange={(e) => setConfigSite({...configSite, horarioAtendimento: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Conteúdo do Site */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Conteúdo do Site</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Título Principal (Hero)</label>
                        <input
                          type="text"
                          value={configSite.heroTitulo}
                          onChange={(e) => setConfigSite({...configSite, heroTitulo: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo (Hero)</label>
                        <textarea
                          rows={3}
                          value={configSite.heroSubtitulo}
                          onChange={(e) => setConfigSite({...configSite, heroSubtitulo: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Texto Sobre Você</label>
                        <textarea
                          rows={4}
                          value={configSite.sobreTexto}
                          onChange={(e) => setConfigSite({...configSite, sobreTexto: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Estatísticas</h4>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Clientes</label>
                            <input
                              type="text"
                              value={configSite.estatisticas.clientes}
                              onChange={(e) => setConfigSite({
                                ...configSite, 
                                estatisticas: {...configSite.estatisticas, clientes: e.target.value}
                              })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Taxa Sucesso</label>
                            <input
                              type="text"
                              value={configSite.estatisticas.sucesso}
                              onChange={(e) => setConfigSite({
                                ...configSite, 
                                estatisticas: {...configSite.estatisticas, sucesso: e.target.value}
                              })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Experiência</label>
                            <input
                              type="text"
                              value={configSite.estatisticas.experiencia}
                              onChange={(e) => setConfigSite({
                                ...configSite, 
                                estatisticas: {...configSite.estatisticas, experiencia: e.target.value}
                              })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Imagens */}
            {activeTab === 'imagens' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Gerenciar Imagens</h2>
                  <label className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2 cursor-pointer">
                    <Upload className="h-4 w-4" />
                    <span>Upload de Imagem</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm p-6">
                  {uploadedImages.length === 0 ? (
                    <div className="text-center py-12">
                      <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma imagem carregada</h3>
                      <p className="text-gray-500 mb-4">
                        Clique no botão "Upload de Imagem" para adicionar suas fotos.
                      </p>
                      <p className="text-sm text-gray-400">
                        Formatos aceitos: JPG, PNG, GIF, WebP
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {uploadedImages.map((imageUrl, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={imageUrl}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg shadow-sm"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                            <button
                              onClick={() => setProfileImage(imageUrl)}
                              className="bg-emerald-500 text-white p-2 rounded-full hover:bg-emerald-600 transition-colors"
                              title="Usar como foto de perfil da nutricionista"
                            >
                              <Star className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setConsultaImage(imageUrl)}
                              className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
                              title="Usar na seção Consulta Personalizada"
                            >
                              <Heart className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteImage(index)}
                              className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                              title="Excluir imagem"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">💡 Dicas para suas imagens:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Use fotos profissionais suas para gerar mais confiança</li>
                    <li>• Adicione imagens de antes/depois dos seus clientes (com autorização)</li>
                    <li>• Inclua fotos do seu consultório ou ambiente de trabalho</li>
                    <li>• Mantenha qualidade alta mas tamanho otimizado (máx 2MB por imagem)</li>
                    <li>• <strong>⭐ Estrela:</strong> Define como foto de perfil da nutricionista</li>
                    <li>• <strong>💚 Coração:</strong> Define para a seção "Consulta Personalizada"</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal do Depoimento */}
      {showDepoimentoForm && <DepoimentoForm />}
      
      {/* Modal do Link */}
      {showLinkModal && <LinkModal />}
    </div>
  )
}