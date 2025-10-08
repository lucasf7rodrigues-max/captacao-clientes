# Guia de Configuração da Vercel

## Passo 1: Aceder às Configurações do Projeto

1. Aceda ao [Dashboard da Vercel](https://vercel.com/dashboard)
2. Selecione o seu projeto (`captacao-clientes`)
3. Clique em **"Settings"** (Configurações)
4. No menu lateral, clique em **"Environment Variables"** (Variáveis de Ambiente)

## Passo 2: Adicionar as Variáveis de Ambiente

Adicione as seguintes variáveis de ambiente **uma por uma**:

### Variável 1: NEXT_PUBLIC_SUPABASE_URL

- **Key (Nome):** `NEXT_PUBLIC_SUPABASE_URL`
- **Value (Valor):** `https://qqsserdtybmiimagvyfr.supabase.co`
- **Environment:** Selecione **Production**, **Preview** e **Development**
- Clique em **"Save"**

### Variável 2: NEXT_PUBLIC_SUPABASE_ANON_KEY

- **Key (Nome):** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value (Valor):** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxc3NlcmR0eWJtaWltYWd2eWZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NTQwNTksImV4cCI6MjA3NTQzMDA1OX0.gD_bpCMxKb3syA-iFCySucnih7pms8X7DZn8fA6HwgA`
- **Environment:** Selecione **Production**, **Preview** e **Development**
- Clique em **"Save"**

### Variável 3: SUPABASE_SERVICE_ROLE_KEY

- **Key (Nome):** `SUPABASE_SERVICE_ROLE_KEY`
- **Value (Valor):** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxc3NlcmR0eWJtaWltYWd2eWZyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTg1NDA1OSwiZXhwIjoyMDc1NDMwMDU5fQ.M_MOOMGQN83AY1OUaA6I261fTF51Xq26ECHifM4qp7Y`
- **Environment:** Selecione **Production**, **Preview** e **Development**
- Clique em **"Save"**

## Passo 3: Fazer Redeploy do Projeto

Após adicionar todas as variáveis de ambiente, é **obrigatório** fazer um novo deploy para que as alterações tenham efeito:

1. Vá para a aba **"Deployments"** (Implantações)
2. Encontre o último deployment
3. Clique nos três pontos (**...**) ao lado do deployment
4. Selecione **"Redeploy"**
5. Confirme clicando em **"Redeploy"** novamente

**Ou simplesmente faça um novo commit no GitHub:**

```bash
git add .
git commit -m "fix: configurar variáveis de ambiente do Supabase"
git push
```

## Passo 4: Verificar se Funcionou

Após o redeploy estar completo:

1. Aceda ao seu site em produção
2. Preencha o formulário de "Solicitar Consulta"
3. Aceda ao Painel de Administração
4. Verifique se o lead aparece na lista

## ⚠️ Importante

- **Nunca partilhe** a `SUPABASE_SERVICE_ROLE_KEY` publicamente
- As variáveis que começam com `NEXT_PUBLIC_` são expostas no cliente (browser)
- A `SUPABASE_SERVICE_ROLE_KEY` só deve ser usada em API Routes (servidor)

## 🔍 Troubleshooting

Se após o redeploy o problema persistir:

1. Verifique se as variáveis foram salvas corretamente
2. Verifique se o redeploy foi concluído com sucesso
3. Limpe o cache do navegador (Ctrl+Shift+Delete)
4. Teste em modo anónimo/privado do navegador
5. Verifique os logs da Vercel em **"Deployments" > "View Function Logs"**
