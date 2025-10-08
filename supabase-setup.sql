-- ============================================================================
-- SCRIPT DE CONFIGURAÇÃO DO SUPABASE
-- ============================================================================
-- Este script cria as tabelas necessárias e configura as políticas de segurança
-- (Row Level Security - RLS) para permitir que o site funcione corretamente.
-- ============================================================================

-- ============================================================================
-- 1. CRIAR TABELAS (se não existirem)
-- ============================================================================

-- Tabela de Leads
CREATE TABLE IF NOT EXISTS public.leads (
    id BIGSERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    telefone TEXT NOT NULL,
    mensagem TEXT,
    status TEXT DEFAULT 'novo',
    prioridade TEXT DEFAULT 'media',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Depoimentos
CREATE TABLE IF NOT EXISTS public.depoimentos (
    id BIGSERIAL PRIMARY KEY,
    token TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    depoimento TEXT NOT NULL,
    avaliacao INTEGER NOT NULL CHECK (avaliacao >= 1 AND avaliacao <= 5),
    aprovado BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Configuração do Site
CREATE TABLE IF NOT EXISTS public.site_config (
    id INTEGER PRIMARY KEY DEFAULT 1,
    titulo TEXT NOT NULL DEFAULT 'NutriVida',
    logo_url TEXT,
    consulta_imagem_url TEXT,
    nutricionista_imagem_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT single_row CHECK (id = 1)
);

-- ============================================================================
-- 2. HABILITAR ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.depoimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 3. REMOVER POLÍTICAS ANTIGAS (se existirem)
-- ============================================================================

DROP POLICY IF EXISTS "Permitir leitura pública de leads" ON public.leads;
DROP POLICY IF EXISTS "Permitir inserção pública de leads" ON public.leads;
DROP POLICY IF EXISTS "Permitir atualização pública de leads" ON public.leads;
DROP POLICY IF EXISTS "Permitir exclusão pública de leads" ON public.leads;

DROP POLICY IF EXISTS "Permitir leitura pública de depoimentos aprovados" ON public.depoimentos;
DROP POLICY IF EXISTS "Permitir inserção pública de depoimentos" ON public.depoimentos;
DROP POLICY IF EXISTS "Permitir leitura de todos depoimentos" ON public.depoimentos;
DROP POLICY IF EXISTS "Permitir atualização de depoimentos" ON public.depoimentos;
DROP POLICY IF EXISTS "Permitir exclusão de depoimentos" ON public.depoimentos;

DROP POLICY IF EXISTS "Permitir leitura pública de config" ON public.site_config;
DROP POLICY IF EXISTS "Permitir atualização pública de config" ON public.site_config;

-- ============================================================================
-- 4. CRIAR POLÍTICAS RLS PARA LEADS
-- ============================================================================

-- Permitir que qualquer pessoa insira leads (para formulário público)
CREATE POLICY "Permitir inserção pública de leads"
ON public.leads
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Permitir leitura de todos os leads (necessário para o painel admin)
CREATE POLICY "Permitir leitura pública de leads"
ON public.leads
FOR SELECT
TO anon, authenticated
USING (true);

-- Permitir atualização de leads (necessário para o painel admin)
CREATE POLICY "Permitir atualização pública de leads"
ON public.leads
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Permitir exclusão de leads (necessário para o painel admin)
CREATE POLICY "Permitir exclusão pública de leads"
ON public.leads
FOR DELETE
TO anon, authenticated
USING (true);

-- ============================================================================
-- 5. CRIAR POLÍTICAS RLS PARA DEPOIMENTOS
-- ============================================================================

-- Permitir que qualquer pessoa insira depoimentos
CREATE POLICY "Permitir inserção pública de depoimentos"
ON public.depoimentos
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Permitir leitura apenas de depoimentos aprovados (para o site público)
CREATE POLICY "Permitir leitura pública de depoimentos aprovados"
ON public.depoimentos
FOR SELECT
TO anon, authenticated
USING (aprovado = true);

-- Permitir leitura de todos os depoimentos (para o painel admin)
-- Nota: Esta política permite que o admin veja depoimentos não aprovados
CREATE POLICY "Permitir leitura de todos depoimentos"
ON public.depoimentos
FOR SELECT
TO anon, authenticated
USING (true);

-- Permitir atualização de depoimentos (necessário para aprovar/reprovar)
CREATE POLICY "Permitir atualização de depoimentos"
ON public.depoimentos
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Permitir exclusão de depoimentos (necessário para o painel admin)
CREATE POLICY "Permitir exclusão de depoimentos"
ON public.depoimentos
FOR DELETE
TO anon, authenticated
USING (true);

-- ============================================================================
-- 6. CRIAR POLÍTICAS RLS PARA CONFIGURAÇÃO DO SITE
-- ============================================================================

-- Permitir leitura pública da configuração
CREATE POLICY "Permitir leitura pública de config"
ON public.site_config
FOR SELECT
TO anon, authenticated
USING (true);

-- Permitir atualização da configuração
CREATE POLICY "Permitir atualização pública de config"
ON public.site_config
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- ============================================================================
-- 7. INSERIR CONFIGURAÇÃO PADRÃO (se não existir)
-- ============================================================================

INSERT INTO public.site_config (id, titulo)
VALUES (1, 'NutriVida')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 8. CRIAR ÍNDICES PARA MELHOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_depoimentos_aprovado ON public.depoimentos(aprovado);
CREATE INDEX IF NOT EXISTS idx_depoimentos_created_at ON public.depoimentos(created_at DESC);

-- ============================================================================
-- 9. CRIAR FUNÇÃO PARA ATUALIZAR updated_at AUTOMATICAMENTE
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================================
-- 10. CRIAR TRIGGERS PARA ATUALIZAR updated_at
-- ============================================================================

DROP TRIGGER IF EXISTS update_leads_updated_at ON public.leads;
CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_site_config_updated_at ON public.site_config;
CREATE TRIGGER update_site_config_updated_at
    BEFORE UPDATE ON public.site_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FIM DO SCRIPT
-- ============================================================================

-- Para executar este script:
-- 1. Aceda ao Supabase Dashboard (https://supabase.com/dashboard)
-- 2. Selecione o seu projeto
-- 3. Vá para "SQL Editor"
-- 4. Cole este script completo
-- 5. Clique em "Run" para executar

-- IMPORTANTE: Este script é idempotente, ou seja, pode ser executado
-- múltiplas vezes sem causar erros ou duplicações.
