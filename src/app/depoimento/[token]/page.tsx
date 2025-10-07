"use client"

import { useState, useEffect } from 'react'
import { Star, Heart, CheckCircle, ArrowLeft } from 'lucide-react'
import { salvarDepoimentos, carregarDepoimentos, type Depoimento } from '@/lib/data'

interface DepoimentoPageProps {
  params: {
    token: string
  }
}

export default function DepoimentoPage({ params }: DepoimentoPageProps) {
  const [leadData, setLeadData] = useState<{ nome: string; email: string } | null>(null)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    texto: '',
    resultado: '',
    estrelas: 5
  })

  useEffect(() => {
    // Recuperar dados do lead baseado no token
    if (typeof window !== 'undefined') {
      const savedTokens = localStorage.getItem('depoimento-tokens')
      if (savedTokens) {
        try {
          const tokens = JSON.parse(savedTokens)
          const tokenData = tokens[params.token]
          if (tokenData && !tokenData.usado) {
            setLeadData(tokenData)
          }
        } catch (error) {
          console.error('Erro ao carregar token:', error)
        }
      }
    }
  }, [params.token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!leadData || isSubmitting) return

    // Validar campos obrigatórios
    if (!formData.texto.trim() || !formData.resultado.trim()) {
      alert('Por favor, preencha todos os campos obrigatórios.')
      return
    }

    setIsSubmitting(true)

    try {
      // Criar novo depoimento
      const novoDepoimento: Depoimento = {
        id: Date.now().toString(),
        nome: leadData.nome,
        iniciais: leadData.nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
        texto: formData.texto.trim(),
        resultado: formData.resultado.trim(),
        estrelas: formData.estrelas
      }

      // Salvar depoimento
      const depoimentosExistentes = await carregarDepoimentos()
      const novosDepoimentos = [...depoimentosExistentes, novoDepoimento]
      await salvarDepoimentos(novosDepoimentos)

      // Marcar token como usado
      if (typeof window !== 'undefined') {
        const savedTokens = localStorage.getItem('depoimento-tokens')
        if (savedTokens) {
          const tokens = JSON.parse(savedTokens)
          if (tokens[params.token]) {
            tokens[params.token].usado = true
            tokens[params.token].dataUso = new Date().toISOString()
            localStorage.setItem('depoimento-tokens', JSON.stringify(tokens))
          }
        }
      }

      setShowSuccessPopup(true)
    } catch (error) {
      console.error('Erro ao salvar depoimento:', error)
      alert('Erro ao enviar depoimento. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!leadData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Heart className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Link Inválido</h3>
          <p className="text-gray-600 mb-6">
            Este link de depoimento não é válido ou já foi utilizado.
          </p>
          <a 
            href="/"
            className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar ao Site</span>
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      {/* Popup de Sucesso */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl">
            <div className="bg-emerald-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Depoimento Enviado!</h3>
            <p className="text-gray-600 mb-6">
              Obrigado por compartilhar sua experiência! Seu depoimento foi salvo com sucesso e aparecerá no site.
            </p>
            <a 
              href="/"
              className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Ver no Site</span>
            </a>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Heart className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Compartilhe sua Experiência</h1>
          <p className="text-gray-600">
            Olá, <strong>{leadData.nome}</strong>! Gostaríamos de saber como foi sua experiência conosco.
          </p>
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Como foi sua experiência? Conte-nos sobre os resultados obtidos: *
              </label>
              <textarea
                required
                rows={4}
                value={formData.texto}
                onChange={(e) => setFormData({...formData, texto: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Descreva sua experiência, como se sentiu durante o processo, quais mudanças notou..."
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Qual foi o principal resultado alcançado? *
              </label>
              <input
                type="text"
                required
                value={formData.resultado}
                onChange={(e) => setFormData({...formData, resultado: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Ex: Perdeu 10kg, Ganhou massa muscular, Melhorou a saúde..."
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Como você avalia nosso atendimento?
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({...formData, estrelas: star})}
                    className={`p-1 transition-colors ${
                      star <= formData.estrelas ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                    disabled={isSubmitting}
                  >
                    <Star className="h-8 w-8 fill-current" />
                  </button>
                ))}
                <span className="ml-3 text-sm text-gray-600">
                  {formData.estrelas} de 5 estrelas
                </span>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <h4 className="font-semibold text-emerald-900 mb-2">📝 Dicas para um bom depoimento:</h4>
              <ul className="text-sm text-emerald-800 space-y-1">
                <li>• Seja específico sobre os resultados obtidos</li>
                <li>• Mencione como se sentia antes e como se sente agora</li>
                <li>• Destaque o que mais gostou no atendimento</li>
                <li>• Seja sincero e autêntico em suas palavras</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 px-6 rounded-lg text-lg font-semibold transition-colors ${
                isSubmitting 
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Depoimento'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            Seu depoimento nos ajuda a melhorar nossos serviços e pode inspirar outras pessoas.
          </p>
        </div>
      </div>
    </div>
  )
}