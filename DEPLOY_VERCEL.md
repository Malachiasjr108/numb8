
# 🚀 Deploy do NUMB8 na Vercel

## Passo 1: Criar repositório GitHub

1. Vá em https://github.com/new
2. Crie um repositório chamado `numb8-site`
3. **NÃO adicione README, .gitignore ou license** (já temos aqui)

## Passo 2: Subir o código para o GitHub

No seu computador, baixe o arquivo `numb8_projeto_completo.zip` e extraia.

Depois, abra o terminal na pasta extraída e execute:

```bash
git init
git add .
git commit -m "Initial commit - NUMB8 site"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/numb8-site.git
git push -u origin main
```

## Passo 3: Conectar com Vercel

1. Vá em https://vercel.com
2. Clique em **"Add New Project"**
3. Importe o repositório `numb8-site` do GitHub
4. **NÃO clique em Deploy ainda!**

## Passo 4: Configurar variáveis de ambiente

Na página de configuração do projeto na Vercel, adicione estas variáveis:

### **Firebase (OBRIGATÓRIO):**
```
FIREBASE_CLIENT_EMAIL=seu-email@numb8-c5322.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nSUA_CHAVE_AQUI\n-----END PRIVATE KEY-----
```

### **AWS S3 (TEMPORÁRIO - depois vamos migrar):**
```
AWS_PROFILE=hosted_storage
AWS_REGION=us-west-2
AWS_BUCKET_NAME=abacusai-apps-aeeae8e41ae72633308e494e-us-west-2
AWS_FOLDER_PREFIX=4556/
```

**⚠️ ATENÇÃO:** O S3 acima é da Abacus.AI e pode parar de funcionar. 
Vamos configurar Firebase Storage depois!

## Passo 5: Deploy!

1. Clique em **"Deploy"**
2. Aguarde 2-3 minutos
3. Seu site estará em: `https://numb8-site.vercel.app`

## Passo 6: Configurar domínio personalizado (numb8.com)

1. No painel da Vercel, vá em **Settings → Domains**
2. Adicione: `numb8.com` e `www.numb8.com`
3. A Vercel vai te dar instruções de DNS
4. Vá no GoDaddy e configure:
   - **Tipo A**: aponte para o IP da Vercel
   - **CNAME**: `www` aponte para `cname.vercel-dns.com`

---

## 🔧 Próximos passos (depois do deploy):

### Migrar de S3 para Firebase Storage (RECOMENDADO)

O S3 atual é da Abacus.AI. Para ter controle total, vamos usar Firebase Storage (grátis até 5GB):

1. Ative Firebase Storage no console do Firebase
2. Eu modifico o código para usar Firebase ao invés de S3
3. Re-deploy automático na Vercel

---

## 💰 Custos finais:

✅ **Vercel:** $0/mês (grátis)
✅ **Firebase:** $0/mês (grátis até 5GB)
✅ **Domínio GoDaddy:** ~$12/ano
✅ **Abacus.AI:** $0 (você cancela depois)

**TOTAL: $0/mês** 🎉

---

## 🆘 Precisa de ajuda?

Volte aqui e me avise em qual passo você está com dúvida!
