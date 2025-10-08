import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    // Coletar informações de diagnóstico
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      
      // Variáveis de ambiente
      supabase: {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        urlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...' || 'não definida',
        keyPrefix: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...' || 'não definida'
      },
      
      // Headers da requisição
      headers: {
        userAgent: '',
        host: '',
        origin: '',
        referer: ''
      },
      
      // Informações do servidor
      server: {
        platform: process.platform,
        nodeVersion: process.version,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    }

    return NextResponse.json({
      success: true,
      data: diagnostics
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Testar envio de lead completo
    const testLead = {
      nome: 'Teste Produção',
      email: 'teste@producao.com',
      telefone: '(11) 99999-9999',
      objetivo: 'emagrecimento',
      detalhes: 'Teste de conectividade em produção - ' + new Date().toISOString()
    }

    // Fazer requisição para a própria API de leads
    const baseUrl = request.headers.get('host')
    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    const apiUrl = `${protocol}://${baseUrl}/api/leads`

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testLead)
    })

    const result = await response.json()

    return NextResponse.json({
      success: true,
      testResult: {
        apiResponse: result,
        statusCode: response.status,
        apiUrl: apiUrl,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      details: {
        name: error.name,
        cause: error.cause
      }
    }, { status: 500 })
  }
}