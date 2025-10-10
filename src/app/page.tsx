"use client"

import { useState, useEffect } from 'react'
import { Star, Heart, Users, Award, Phone, Mail, MapPin, Clock, CheckCircle, ArrowRight, Menu, X, Camera, ChevronLeft, ChevronRight } from 'lucide-react'
import { adicionarLead, carregarConfigSync, type ConfigSite, type Depoimento } from '@/lib/data'

export default function NutricionistaLanding() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [config, setConfig] = useState<ConfigSite | null>(null)
  const [depoimentos, setDepoimentos] = useState<Depoimento[]>([])
  const [currentDepoimentoIndex, setCurrentDepoimentoIndex] = useState(0)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [nutricionistaImage, setNutricionistaImage] = useState<string | null>(null)
  const [consultaPersonalizadaImage, setConsultaPersonalizadaImage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    objetivo: '',
    detalhes: ''
  })

  useEffect(() => {
    // Carregar configuração
    setConfig(carregarConfigSync())
    
    // Carregar depoimentos aprovados da API
    carregarDepoimentosAprovados()
    
    // Carregar imagem da nutricionista do localStorage
    const savedImage = localStorage.getItem('nutri-profile-image')
    if (savedImage) {
      setNutricionistaImage(savedImage)
    }

    // Carregar imagem da consulta personalizada do localStorage
    const savedConsultaImage = localStorage.getItem('consulta-personalizada-image')
    if (savedConsultaImage) {
      setConsultaPersonalizadaImage(savedConsultaImage)
    }
  }, [])

  const carregarDepoimentosAprovados = async () => {
    try {
      const response = await fetch('/api/depoimentos')
      const result = await response.json()
      
      if (result.success && result.data) {
        // Converter formato da API para formato do componente e limitar a 10
        const depoimentosFormatados = result.data.slice(0, 10).map((dep: any) => ({
          id: dep.id.toString(),
          nome: dep.nome,
          iniciais: dep.nome.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase(),
          texto: dep.depoimento,
          resultado: 'Cliente satisfeito',
          estrelas: dep.avaliacao || 5,
          ativo: dep.aprovado
        }))
        setDepoimentos(depoimentosFormatados)
      }
    } catch (error) {
      console.error('Erro ao carregar depoimentos:', error)
      // Manter array vazio se houver erro
      setDepoimentos([])
    }
  }

  const nextDepoimento = () => {
    setCurrentDepoimentoIndex((prev) => 
      prev === depoimentos.length - 1 ? 0 : prev + 1
    )
  }

  const prevDepoimento = () => {
    setCurrentDepoimentoIndex((prev) => 
      prev === 0 ? depoimentos.length - 1 : prev - 1
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar campos obrigatórios
    if (!formData.nome || !formData.email || !formData.telefone || !formData.objetivo) {
      alert('Por favor, preencha todos os campos obrigatórios.')
      return
    }
    
    if (isSubmitting) return
    
    setIsSubmitting(true)
    
    try {
      // Adicionar lead ao sistema
      await adicionarLead({
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        objetivo: formData.objetivo,
        detalhes: formData.detalhes
      })
      
      // Mostrar popup de sucesso
      setShowSuccessPopup(true)
      
      // Limpar formulário
      setFormData({ nome: '', email: '', telefone: '', objetivo: '', detalhes: '' })
    } catch (error) {
      console.error('Erro ao enviar formulário:', error)
      alert('Erro ao enviar formulário. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
    setIsMenuOpen(false)
  }

  if (!config) {
    return <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <Heart className="h-12 w-12 text-emerald-600 mx-auto mb-4 animate-pulse" />
        <p className="text-gray-600">Carregando...</p>
      </div>
    </div>
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Popup de Sucesso */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl">
            <div className="bg-emerald-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Solicitação Enviada!</h3>
            <p className="text-gray-600 mb-6">
              Obrigado pelo seu interesse! Entraremos em contato em breve para agendar sua consulta.
            </p>
            <button
              onClick={() => setShowSuccessPopup(false)}
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Header/Navigation */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-emerald-600" />
              <span className="text-xl font-bold text-gray-900">{config.nomeSite}</span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8 items-center">
              <button onClick={() => scrollToSection('inicio')} className="text-gray-700 hover:text-emerald-600 transition-colors">Início</button>
              <button onClick={() => scrollToSection('sobre')} className="text-gray-700 hover:text-emerald-600 transition-colors">Sobre</button>
              <button onClick={() => scrollToSection('servicos')} className="text-gray-700 hover:text-emerald-600 transition-colors">Serviços</button>
              <button onClick={() => scrollToSection('depoimentos')} className="text-gray-700 hover:text-emerald-600 transition-colors">Depoimentos</button>
              <button onClick={() => scrollToSection('contato')} className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors">Contato</button>
            </nav>

            {/* Mobile menu button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <div className="flex flex-col space-y-4">
                <button onClick={() => scrollToSection('inicio')} className="text-left text-gray-700 hover:text-emerald-600">Início</button>
                <button onClick={() => scrollToSection('sobre')} className="text-left text-gray-700 hover:text-emerald-600">Sobre</button>
                <button onClick={() => scrollToSection('servicos')} className="text-left text-gray-700 hover:text-emerald-600">Serviços</button>
                <button onClick={() => scrollToSection('depoimentos')} className="text-left text-gray-700 hover:text-emerald-600">Depoimentos</button>
                <button onClick={() => scrollToSection('contato')} className="text-left bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 w-fit">Contato</button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section id="inicio" className="pt-16 bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                {config.heroTitulo.split(' ').map((word, index) => (
                  <span key={index} className={
                    word.includes('saúde') || word.includes('nutrição') ? 'text-emerald-600' : ''
                  }>
                    {word}{' '}
                  </span>
                ))}
              </h1>
              <p className="text-xl text-gray-600 mt-6 leading-relaxed">
                {config.heroSubtitulo}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <button 
                  onClick={() => scrollToSection('contato')}
                  className="bg-emerald-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-emerald-700 transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  Agendar Consulta
                  <ArrowRight className="inline ml-2 h-5 w-5" />
                </button>
                <button 
                  onClick={() => scrollToSection('sobre')}
                  className="border-2 border-emerald-600 text-emerald-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-emerald-600 hover:text-white transition-all duration-300"
                >
                  Saiba Mais
                </button>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600">{config.estatisticas.clientes}</div>
                  <div className="text-gray-600">Clientes Atendidos</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600">{config.estatisticas.sucesso}</div>
                  <div className="text-gray-600">Taxa de Sucesso</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600">{config.estatisticas.experiencia}</div>
                  <div className="text-gray-600">Anos de Experiência</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="bg-emerald-100 rounded-xl p-6 text-center">
                  {consultaPersonalizadaImage ? (
                    <div className="relative mb-6">
                      <img 
                        src={consultaPersonalizadaImage} 
                        alt="Consulta Personalizada" 
                        className="w-full h-40 object-cover rounded-xl shadow-lg"
                      />
                      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1 shadow-lg">
                        <p className="text-emerald-800 font-bold text-sm">Consulta Personalizada</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Heart className="h-10 w-10 text-white" />
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Consulta Personalizada</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Avaliação completa e plano alimentar sob medida para seus objetivos específicos
                  </p>
                  <div className="flex items-center justify-center space-x-2 text-emerald-700">
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">Resultados comprovados</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sobre Section */}
      <section id="sobre" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              {nutricionistaImage ? (
                <div className="relative bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl p-4 h-96">
                  <img 
                    src={nutricionistaImage} 
                    alt="Nutricionista" 
                    className="w-full h-full object-cover rounded-xl shadow-lg"
                  />
                  {/* CRN overlay profissional */}
                  <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
                    <p className="text-emerald-800 font-bold text-sm">CRN: {config.crn}</p>
                    <p className="text-emerald-700 text-xs">Nutricionista Clínica</p>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl p-8 h-96 flex items-center justify-center">
                  <div className="text-center">
                    <Award className="h-24 w-24 text-emerald-600 mx-auto mb-4" />
                    <p className="text-emerald-800 font-semibold text-lg">CRN: {config.crn}</p>
                    <p className="text-emerald-700">Nutricionista Clínica</p>
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Sobre a Nutricionista
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                {config.sobreTexto}
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-emerald-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Formação Acadêmica</h4>
                    <p className="text-gray-600">Graduação em Nutrição + Especialização em Nutrição Clínica</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-emerald-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Experiência Prática</h4>
                    <p className="text-gray-600">Mais de {config.estatisticas.clientes} pacientes atendidos com resultados comprovados</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-emerald-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Atualização Constante</h4>
                    <p className="text-gray-600">Sempre estudando as mais recentes descobertas da nutrição</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Serviços Section */}
      <section id="servicos" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Serviços Oferecidos
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Planos personalizados para cada objetivo, sempre com acompanhamento próximo e suporte contínuo
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Serviço 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="bg-emerald-100 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <Heart className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Emagrecimento Saudável</h3>
              <p className="text-gray-600 mb-6">
                Perca peso de forma sustentável, sem dietas restritivas. Plano alimentar balanceado e saboroso.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-emerald-600 mr-2" />Cardápio personalizado</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-emerald-600 mr-2" />Acompanhamento semanal</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-emerald-600 mr-2" />Suporte via WhatsApp</li>
              </ul>
            </div>

            {/* Serviço 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="bg-emerald-100 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Ganho de Massa Muscular</h3>
              <p className="text-gray-600 mb-6">
                Aumente sua massa magra com estratégias nutricionais específicas para hipertrofia.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-emerald-600 mr-2" />Plano hipercalórico</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-emerald-600 mr-2" />Timing de nutrientes</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-emerald-600 mr-2" />Suplementação orientada</li>
              </ul>
            </div>

            {/* Serviço 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="bg-emerald-100 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <Award className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Reeducação Alimentar</h3>
              <p className="text-gray-600 mb-6">
                Transforme sua relação com a comida e desenvolva hábitos saudáveis para toda vida.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-emerald-600 mr-2" />Educação nutricional</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-emerald-600 mr-2" />Mudança de hábitos</li>
                <li className="flex items-center"><CheckCircle className="h-4 w-4 text-emerald-600 mr-2" />Acompanhamento longo prazo</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Depoimentos Section */}
      <section id="depoimentos" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              O que dizem meus clientes
            </h2>
            <p className="text-xl text-gray-600">
              Resultados reais de pessoas que transformaram suas vidas
            </p>
          </div>

          {depoimentos.length > 0 ? (
            <div className="relative max-w-4xl mx-auto">
              {/* Carrossel de Depoimentos */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 md:p-12 shadow-xl">
                <div className="flex items-center mb-6">
                  {[...Array(depoimentos[currentDepoimentoIndex]?.estrelas || 5)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 text-lg md:text-xl mb-8 italic leading-relaxed">
                  "{depoimentos[currentDepoimentoIndex]?.texto}"
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-emerald-200 rounded-full w-14 h-14 flex items-center justify-center mr-4">
                      <span className="text-emerald-800 font-bold text-lg">
                        {depoimentos[currentDepoimentoIndex]?.iniciais}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg">
                        {depoimentos[currentDepoimentoIndex]?.nome}
                      </h4>
                      <p className="text-gray-600">
                        {depoimentos[currentDepoimentoIndex]?.resultado}
                      </p>
                    </div>
                  </div>
                  
                  {/* Contador de depoimentos */}
                  <div className="text-gray-500 text-sm">
                    {currentDepoimentoIndex + 1} / {depoimentos.length}
                  </div>
                </div>
              </div>

              {/* Botões de navegação */}
              {depoimentos.length > 1 && (
                <>
                  <button
                    onClick={prevDepoimento}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-3 shadow-lg hover:bg-emerald-50 transition-colors"
                    aria-label="Depoimento anterior"
                  >
                    <ChevronLeft className="h-6 w-6 text-emerald-600" />
                  </button>
                  <button
                    onClick={nextDepoimento}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-3 shadow-lg hover:bg-emerald-50 transition-colors"
                    aria-label="Próximo depoimento"
                  >
                    <ChevronRight className="h-6 w-6 text-emerald-600" />
                  </button>
                </>
              )}

              {/* Indicadores de posição */}
              {depoimentos.length > 1 && (
                <div className="flex justify-center mt-6 space-x-2">
                  {depoimentos.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentDepoimentoIndex(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === currentDepoimentoIndex 
                          ? 'w-8 bg-emerald-600' 
                          : 'w-2 bg-gray-300 hover:bg-emerald-300'
                      }`}
                      aria-label={`Ir para depoimento ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <p className="text-lg">Nenhum depoimento disponível no momento.</p>
              <p className="text-sm mt-2">Novos depoimentos serão exibidos após aprovação.</p>
            </div>
          )}
        </div>
      </section>

      {/* Contato Section */}
      <section id="contato" className="py-20 bg-gradient-to-br from-emerald-600 to-teal-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Pronto para transformar sua saúde?
            </h2>
            <p className="text-xl text-emerald-100">
              Agende sua consulta e comece sua jornada rumo a uma vida mais saudável
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Formulário */}
            <div className="bg-white rounded-2xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Solicite sua consulta</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome completo *</label>
                  <input
                    type="text"
                    required
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Seu nome completo"
                    disabled={isSubmitting}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">E-mail *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="seu@email.com"
                    disabled={isSubmitting}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telefone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.telefone}
                    onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="(11) 99999-9999"
                    disabled={isSubmitting}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Qual seu objetivo? *</label>
                  <select
                    required
                    value={formData.objetivo}
                    onChange={(e) => setFormData({...formData, objetivo: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    disabled={isSubmitting}
                  >
                    <option value="">Selecione seu objetivo</option>
                    <option value="emagrecimento">Emagrecimento</option>
                    <option value="ganho-massa">Ganho de massa muscular</option>
                    <option value="reeducacao">Reeducação alimentar</option>
                    <option value="outro">Outro objetivo</option>
                  </select>
                </div>

                {/* Campo de detalhes adicional */}
                {formData.objetivo && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Conte-nos mais sobre suas necessidades e expectativas
                    </label>
                    <textarea
                      rows={4}
                      value={formData.detalhes}
                      onChange={(e) => setFormData({...formData, detalhes: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Descreva o que você espera alcançar, suas dificuldades atuais, histórico de saúde relevante, etc."
                      disabled={isSubmitting}
                    />
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 px-6 rounded-lg text-lg font-semibold transition-colors ${
                    isSubmitting 
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {isSubmitting ? 'Enviando...' : 'Solicitar Consulta'}
                </button>
              </form>
            </div>

            {/* Informações de Contato */}
            <div className="text-white">
              <h3 className="text-2xl font-bold mb-8">Informações de Contato</h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <Phone className="h-6 w-6 text-emerald-200 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-emerald-100">Telefone</h4>
                    <p className="text-lg">{config.telefone}</p>
                    <p className="text-emerald-200 text-sm">WhatsApp disponível</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <Mail className="h-6 w-6 text-emerald-200 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-emerald-100">E-mail</h4>
                    <p className="text-lg">{config.email}</p>
                    <p className="text-emerald-200 text-sm">Resposta em até 24h</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <MapPin className="h-6 w-6 text-emerald-200 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-emerald-100">Localização</h4>
                    <p className="text-lg">{config.endereco}</p>
                    <p className="text-emerald-200 text-sm">Atendimento online</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <Clock className="h-6 w-6 text-emerald-200 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-emerald-100">Horário de Atendimento</h4>
                    {config.horarioAtendimento.split('\n').map((linha, index) => (
                      <p key={index} className="text-lg">{linha}</p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-12 p-6 bg-white/10 rounded-xl backdrop-blur-sm">
                <h4 className="font-bold text-xl mb-3">🎯 Primeira Consulta</h4>
                <p className="text-emerald-100 mb-4">
                  Na primeira consulta fazemos uma avaliação completa do seu estado nutricional, 
                  histórico de saúde e objetivos para criar um plano personalizado.
                </p>
                <p className="text-emerald-200 text-sm">
                  ✓ Avaliação antropométrica<br/>
                  ✓ Anamnese completa<br/>
                  ✓ Plano alimentar personalizado<br/>
                  ✓ Orientações e dicas práticas
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Heart className="h-8 w-8 text-emerald-500" />
              <span className="text-2xl font-bold">{config.nomeSite}</span>
            </div>
            <p className="text-gray-400 mb-4">
              Transformando vidas através da nutrição personalizada
            </p>
            <p className="text-gray-500 text-sm">
              © 2025 {config.nomeSite}. Todos os direitos reservados. | CRN: {config.crn}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}