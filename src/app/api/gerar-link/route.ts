import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nome, email } = body

    if (!nome || !email) {
      return NextResponse.json({ error: 'Nome e email são obrigatórios' }, { status: 400 })
    }

    // Gerar token único para o depoimento
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    
    // Criar link do depoimento
    const depoimentoLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/depoimento/${token}`

    return NextResponse.json({ 
      success: true, 
      message: 'Link de depoimento gerado com sucesso!',
      token,
      link: depoimentoLink,
      nome,
      email
    })
  } catch (error) {
    console.error('Erro ao gerar link:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}