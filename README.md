# Loja Fitness

Site para uma marca de roupa fitness, com duas partes:

- **Site público** (`/`): catálogo de produtos com preço e disponibilidade, carrinho de
  compras (sem pagamento online) e finalização do pedido via WhatsApp.
- **Painel administrativo** (`/admin`): área protegida por login onde a dona da loja
  cadastra peças novas, edita preço/descrição/fotos e marca cada peça como
  "em estoque" ou "esgotado", além de poder ocultar peças do site sem excluí-las.

## Como funciona o "checkout"

Não existe pagamento pelo site. O cliente monta o carrinho, e ao clicar em
**"Finalizar pedido pelo WhatsApp"** o site monta uma mensagem com a lista de itens,
tamanhos, quantidades e o total, e abre uma conversa no WhatsApp
(`https://wa.me/<numero>`) já com essa mensagem pronta. A confirmação e o pagamento
são combinados diretamente pelo WhatsApp.

## Rodando localmente

```bash
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# edite o .env com o número de WhatsApp, nome da loja e senha do admin

python app.py
```

O site sobe em `http://localhost:5000`. O painel fica em `http://localhost:5000/admin`
(usuário/senha definidos em `.env`, padrão `admin` / `troque-esta-senha` — **troque isso
antes de publicar o site**).

Sem configurar o Supabase (seção abaixo), o site usa um banco SQLite local
(`instance/loja.db`) — ótimo para navegar e testar o catálogo/admin. Só o envio de
fotos de produto exige o Supabase Storage configurado, mesmo local.

Na primeira execução o banco é criado automaticamente com 3 produtos de exemplo
(um deles já marcado como esgotado, só para mostrar como fica). Pode editar ou
excluir esses produtos de exemplo pelo painel.

## Configuração (arquivo `.env`)

| Variável | Para que serve |
| --- | --- |
| `SECRET_KEY` | chave aleatória usada para proteger sessão/login. |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | login do painel `/admin`. |
| `WHATSAPP_NUMBER` | número que recebe os pedidos, formato `55DDDNUMERO` (ex: `5561996994875`). |
| `STORE_NAME` | nome exibido no site e no painel. |
| `DATABASE_URL` | opcional local; string de conexão do Postgres do Supabase em produção. |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | credenciais do projeto Supabase (para salvar as fotos). |
| `SUPABASE_STORAGE_BUCKET` | nome do bucket público onde as fotos ficam salvas. |

## Estrutura do projeto

```
app.py                  # ponto de entrada
vercel.json              # configuração de deploy na Vercel
store/
  __init__.py            # cria e configura o app Flask
  models.py               # modelo do Produto
  routes_public.py        # catálogo, página do produto, carrinho
  routes_admin.py          # login e CRUD de produtos
  auth.py                   # proteção das rotas do admin
  storage.py                 # upload/remoção de fotos no Supabase Storage
  seed.py                     # produtos de exemplo criados na 1ª execução
  templates/                   # HTML (Jinja2)
  static/
    css/style.css               # visual do site
    js/cart.js                   # carrinho (guardado no navegador do cliente)
```

Cada peça tem: nome, categoria, preço, tamanhos (texto livre, ex: "P, M, G, GG"),
cor, descrição, foto e dois interruptores independentes:

- **Em estoque / Esgotado** — controla se dá para adicionar ao carrinho no site.
  Um item esgotado continua aparecendo no catálogo (marcado como esgotado) em vez
  de sumir, para o cliente saber que a peça existe.
- **Visível / Oculto** — controla se a peça aparece no site. Útil para tirar algo
  do ar temporariamente sem apagar o cadastro.

## Publicando o site (Vercel + Supabase)

O site guarda os produtos num banco de dados e as fotos num serviço de
armazenamento — ambos fornecidos pelo [Supabase](https://supabase.com). A
[Vercel](https://vercel.com) só serve o próprio site (as páginas), lendo esse
banco e esse armazenamento a cada visita.

### 1. Configurar o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com) (ou use um que já
   tenha).
2. **Banco de dados:** em *Project Settings → Database → Connection pooling*,
   copie a string no modo **Transaction** (porta `6543`) — é a que vai na
   variável `DATABASE_URL`. Não use a conexão direta (porta `5432`): a Vercel
   roda o site em várias instâncias curtas ao mesmo tempo, e só o pooler
   aguenta esse tipo de uso.
3. **Fotos:** em *Storage*, crie um bucket novo (ex: `product-images`) marcado
   como **Public bucket** — assim as fotos ficam acessíveis por um link
   direto, sem precisar de senha, do jeito que uma vitrine online precisa.
4. Em *Project Settings → API*, copie:
   - **Project URL** → variável `SUPABASE_URL`.
   - **service_role secret key** → variável `SUPABASE_SERVICE_ROLE_KEY`
     (essa chave dá acesso total ao projeto — nunca cole ela em nenhum lugar
     além das variáveis de ambiente da Vercel).

### 2. Publicar na Vercel

1. Crie uma conta em [vercel.com](https://vercel.com) (dá para entrar com o
   GitHub).
2. Clique em **Add New** → **Project** e importe o repositório
   `felipepersonal2311/app`.
3. Em **Environment Variables**, adicione todas as variáveis do
   `.env.example`: `SECRET_KEY`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`,
   `WHATSAPP_NUMBER`, `STORE_NAME`, `DATABASE_URL`, `SUPABASE_URL`,
   `SUPABASE_SERVICE_ROLE_KEY` e `SUPABASE_STORAGE_BUCKET` (com os valores do
   Supabase que você copiou no passo anterior).
4. Clique em **Deploy**. Em pouco menos de um minuto o site já está no ar.
5. A Vercel mostra o link do projeto, algo como
   `https://app-<algo>.vercel.app` (dá para trocar por um domínio próprio
   depois, se quiser). O painel fica em `<esse link>/admin`.

Diferente de hospedagens tradicionais, aqui não existe risco de "disco
apagado" — os produtos e fotos ficam guardados no Supabase, que é permanente,
não na própria Vercel.

## Ideias para evoluir depois

- Login com senha "de verdade" (hash) se um dia tiver mais de uma pessoa administrando.
- Controle de estoque por tamanho (hoje o estoque é por peça, não por tamanho).
- Busca por nome no catálogo.
- Integração de pagamento (Pix, cartão) quando fizer sentido sair do fluxo por WhatsApp.
