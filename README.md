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

## Publicando o site (deploy)

Qualquer serviço que rode aplicações Python/Flask serve, por exemplo
[Render](https://render.com), [Railway](https://railway.app) ou PythonAnywhere.
Passos gerais:

1. Suba o código para um repositório Git.
2. No serviço escolhido, aponte para esse repositório e configure o comando de start,
   por exemplo: `gunicorn app:app` (adicione `gunicorn` ao `requirements.txt` se o
   serviço pedir um servidor WSGI de produção).
3. Configure as variáveis de ambiente do arquivo `.env.example` no painel do serviço
   (principalmente `SECRET_KEY`, `ADMIN_PASSWORD` e `WHATSAPP_NUMBER`).
4. Garanta que a pasta `instance/` (banco de dados) e `store/static/uploads/products/`
   (fotos) fiquem num disco persistente — a maioria desses serviços tem um plano
   gratuito com disco efêmero, então para não perder produtos/fotos a cada deploy
   vale conferir a opção de "persistent disk" do serviço escolhido.

## Ideias para evoluir depois

- Login com senha "de verdade" (hash) se um dia tiver mais de uma pessoa administrando.
- Controle de estoque por tamanho (hoje o estoque é por peça, não por tamanho).
- Busca por nome no catálogo.
- Integração de pagamento (Pix, cartão) quando fizer sentido sair do fluxo por WhatsApp.
