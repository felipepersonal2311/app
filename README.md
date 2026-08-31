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
| `DATABASE_URL` | opcional; por padrão usa um arquivo SQLite em `instance/loja.db`. |

## Estrutura do projeto

```
app.py                  # ponto de entrada
store/
  __init__.py            # cria e configura o app Flask
  models.py               # modelo do Produto
  routes_public.py        # catálogo, página do produto, carrinho
  routes_admin.py          # login e CRUD de produtos
  auth.py                   # proteção das rotas do admin
  seed.py                    # produtos de exemplo criados na 1ª execução
  templates/                  # HTML (Jinja2)
  static/
    css/style.css              # visual do site
    js/cart.js                  # carrinho (guardado no navegador do cliente)
    uploads/products/            # fotos enviadas pelo painel
```

Cada peça tem: nome, categoria, preço, tamanhos (texto livre, ex: "P, M, G, GG"),
cor, descrição, foto e dois interruptores independentes:

- **Em estoque / Esgotado** — controla se dá para adicionar ao carrinho no site.
  Um item esgotado continua aparecendo no catálogo (marcado como esgotado) em vez
  de sumir, para o cliente saber que a peça existe.
- **Visível / Oculto** — controla se a peça aparece no site. Útil para tirar algo
  do ar temporariamente sem apagar o cadastro.

## Publicando o site no Render (deploy)

O repositório já vem com um `render.yaml`, então o [Render](https://render.com)
consegue configurar o serviço quase sozinho.

1. Crie uma conta em [render.com](https://render.com) (dá para entrar direto com a
   conta do GitHub).
2. No painel, clique em **New +** → **Blueprint**.
3. Escolha o repositório `felipepersonal2311/app` e a branch
   `claude/fitness-store-website-cdbjyu` (ou a branch principal, depois que o
   código for mesclado nela).
4. O Render vai ler o `render.yaml` e mostrar o serviço `loja-fitness` pronto para
   criar. Antes de confirmar, preencha:
   - `ADMIN_PASSWORD` — a senha que vai usar para entrar em `/admin` (o campo
     `sync: false` no `render.yaml` faz o Render pedir esse valor manualmente,
     em vez de guardá-lo no código).
   - Se quiser, ajuste `WHATSAPP_NUMBER` e `STORE_NAME` também por ali.
5. Clique em **Apply** / **Create**. O primeiro deploy leva alguns minutos.
6. Quando terminar, o Render mostra o link do site, algo como
   `https://loja-fitness.onrender.com` (o nome exato depende do que estiver
   disponível). Esse é o link para acessar o catálogo; o painel fica em
   `<esse link>/admin`.

**Atenção — plano gratuito e persistência de dados:** no plano gratuito do
Render, o disco onde ficam o banco de dados (`instance/loja.db`) e as fotos
enviadas (`store/static/uploads/products/`) é apagado a cada novo deploy. Ou
seja, tudo bem para testar e mostrar o site, mas os produtos cadastrados podem
sumir quando o código for atualizado de novo. Quando a loja for usar o site
"para valer", o ideal é migrar para um plano pago do Render (bem barato) e
adicionar um **disco persistente** apontando para as pastas `instance/` e
`store/static/uploads/products/` — isso pode ser feito depois, sem precisar
mudar o código do site.

## Ideias para evoluir depois

- Login com senha "de verdade" (hash) se um dia tiver mais de uma pessoa administrando.
- Controle de estoque por tamanho (hoje o estoque é por peça, não por tamanho).
- Busca por nome no catálogo.
- Integração de pagamento (Pix, cartão) quando fizer sentido sair do fluxo por WhatsApp.
