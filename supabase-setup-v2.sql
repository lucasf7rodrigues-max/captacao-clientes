-- ============================================================================
-- SCRIPT DE ATUALIZAÇÃO DO SUPABASE - Versão 2
-- ============================================================================
-- Este script adiciona o campo 'status' na tabela leads e atualiza as políticas
-- ============================================================================

-- ============================================================================
-- 1. ADICIONAR CAMPO STATUS NA TABELA LEADS (se não existir)
-- ============================================================================

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'leads' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE public.leads 
        ADD COLUMN status TEXT DEFAULT 'novo' CHECK (status IN ('novo', 'contatado', 'agendado', 'convertido'));
        
        RAISE NOTICE 'Campo status adicionado com sucesso!';
    ELSE
        RAISE NOTICE 'Campo status já existe.';
    END IF;
END $$;

-- ============================================================================
-- 2. ATUALIZAR REGISTROS EXISTENTES (definir status como 'novo')
-- ============================================================================

UPDATE public.leads 
SET status = 'novo' 
WHERE status IS NULL;

-- ============================================================================
-- 3. CRIAR ÍNDICE PARA O CAMPO STATUS (melhor performance)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);

-- ============================================================================
-- FIM DO SCRIPT
-- ============================================================================

-- Para executar este script:
-- 1. Aceda ao Supabase Dashboard (https://supabase.com/dashboard)
-- 2. Selecione o seu projeto
-- 3. Vá para "SQL Editor"
-- 4. Cole este script completo
-- 5. Clique em "Run" para executar

-- NOTA: Este script pode ser executado múltiplas vezes sem causar erros.
