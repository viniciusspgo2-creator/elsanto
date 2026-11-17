# EL SANTO — Cocina • Fuego • Tradición

Projeto Next.js / React / TypeScript reconstruído a partir dos materiais do restaurante. Inclui identidade visual original, site público, cardápio e carrinho, backend de pedidos, rastreamento por link privado, painel de operação, PDV básico, cozinha (KDS), mesas com QR, financeiro gerencial, gestão de produtos e configurações, e área do entregador.

> **Situação da entrega:** base de implementação e integração, **não é um sistema de produção homologado**. Testes de funções puras passaram, e os arquivos TS/TSX passaram na inspeção sintática; o build Next.js completo e os testes ponta a ponta **ainda precisam rodar num ambiente com acesso ao npm e PostgreSQL**. As duas páginas oficiais do cardápio foram recebidas depois e transcritas em 38 produtos, com cinco rascunhos para confirmar opções. Nenhum preço foi inventado.

## Atualização V5 — acabamento visual premium (14/11/2026)

A V5 preserva funcionalidades e dados da V4 e adiciona uma camada editorial independente (`app/premium.css`), hero sem wash amarelo, melhoria dos cards, navegação mobile com acesso direto a acompanhar pedido, modal de produto com navegação por teclado, admin com agrupamento funcional e seletor claro/escuro persistente, dashboard refinado e refinamentos na área do entregador. **Não houve deploy.**

Validação desta rodada: `npm test` (26 testes), `npm run audit`, verificação sintática de TS/TSX e análise de CSS. O `next build` continua **não homologado**, pois o registry do npm não está acessível neste ambiente. Leia `docs/RELATORIO-RODADA-5-ACABAMENTO-VISUAL.md`.

## Atualização V4 — alertas, pedidos seguros e PWA

Nesta versão, pedidos aguardando aceite aparecem em um indicador do cabeçalho administrativo com atualização periódica; o operador pode ativar o som. Pedidos e dashboard atualizam automaticamente. A criação de pedidos reaproveita a chave idempotente apenas quando o conteúdo do checkout continua idêntico. O cliente de mesa não precisa informar nome; o QR precisa identificar uma mesa válida.

O restaurante pode pausar pedidos online sem parar o PDV. A PWA agora isola páginas privadas e oferece `/offline.html`. O acompanhamento do pedido e o envio de novas compras exigem conexão. Há limites por IP em memória, mas produção com várias instâncias precisa de limitador distribuído.

Validação local V4: `npm test` (21 testes), `npm run audit` e verificação sintática. **Ainda não há comprovação de compilação Next.js ou homologação PostgreSQL** porque as dependências não puderam ser instaladas no ambiente. Consulte `docs/RELATORIO-RODADA-4.md`.

## Principais rotas

| Ambiente | URL |
|---|---|
| Inicial | `/` |
| Cardápio | `/cardapio` |
| Sobre nós | `/sobre` |
| Contato | `/contato` |
| Acompanhar pedido | `/pedido` e `/pedido/[token]` |
| Login administrativo | `/admin/login` |
| Dashboard | `/admin` |
| Pedidos | `/admin/pedidos` |
| Cozinha / KDS | `/admin/cozinha` |
| PDV / balcão | `/admin/pdv` |
| Cardápio admin | `/admin/cardapio` |
| Mesas / QR | `/admin/mesas` |
| Entregadores | `/admin/entregas` |
| Financeiro | `/admin/financeiro` |
| Promoções | `/admin/marketing` |
| Configurações | `/admin/configuracoes` |
| Galeria | `/admin/galeria` |
| Blog admin | `/admin/blog` |
| Blog público | `/blog` |
| Login entregador | `/entregador/login` |
| Painel entregador | `/entregador` |

## Rodar localmente

Requer **Node.js >= 22**, npm, PostgreSQL 16 e acesso à internet para instalar as dependências.

```bash
npm install
cp .env.example .env
# Configure DATABASE_URL, AUTH_SECRET (32+ caracteres aleatórios), ADMIN_EMAIL e ADMIN_PASSWORD (12+ caracteres).
docker compose up -d postgres  # opcional, para Postgres local
npx prisma generate
npx prisma db push           # inicialização de banco para desenvolvimento; veja observação abaixo
npm run db:seed
npm run dev
```

Abra `http://localhost:3000`.

**Atenção:** `prisma db push` é adequado para inicialização/dev. Antes da produção, gere e revise migrações versionadas a partir do esquema e utilize `prisma migrate deploy` em novos ambientes. Nunca aplique mudanças destrutivas num banco que já contém pedidos sem backup e revisão.

`ADMIN_PASSWORD` só é usado no seed se o admin ainda não existir. Não substitui senha de conta pré-existente. O login não possui credenciais hardcoded. Não coloque `.env` no Git.

## Deploy na Vercel

1. Envie o código para um repositório privado de sua propriedade.
2. Crie um projeto Next.js na Vercel apontando para o repositório.
3. Configure **DATABASE_URL**, **AUTH_SECRET**, **NEXT_PUBLIC_APP_URL**, e opcionalmente **OPENAI_API_KEY**, **GEMINI_API_KEY**.
4. Inicialize o banco, gere as migrações/revise alterações e rode seed com ambiente seguro. Não execute seed num banco de produção sem revisar dados existentes.
5. Rode `npm run build` e verifique a compilação e as rotas.
6. Teste ponta a ponta o cardápio, checkout, painel admin, impressora, mesa e entregador antes de abrir pedidos reais.
7. Configure o domínio definitivo em Vercel e atualize `NEXT_PUBLIC_APP_URL`.

**Avisos de implantação:** a Vercel não fornece automaticamente um PostgreSQL persistente; configure um serviço externo e backups. A localização do entregador pelo navegador depende de HTTPS/permissão e pode parar ao bloquear a tela. Pagamentos via Pix/cartão são apenas modalidades informadas ao restaurante nesta versão — **não há gateway online ativo**.

## Cardápio e preços oficiais

O seed (`prisma/seed.ts`) agora importa **38 produtos e preços extraídos das duas páginas oficiais**, em `public/images/cardapio-oficial-{1,2}.jpg`. A seção de cardápio impresso tem ampliação interativa. Cinco itens com personalização/sabores a confirmar ficam em **rascunho**; bebidas sem preço nas imagens não foram inventadas. **O seed não altera produtos existentes**. Veja `docs/CARDAPIO-OFICIAL.md`.

Atenção: muitos pratos ainda compartilham fotos reais ilustrativas da casa, não necessariamente fotos daquele produto individual. As imagens devem ser substituídas e revisadas pelo lojista.

## Funcionalidades presentes

- Site com imagens reais e identidade El Santo, hero sem overlay amarelo no scroll, galeria, cards interativos e botão único de atendimento.
- Modo mecânico do bot, com opção de IA por OpenAI/Gemini via chave do servidor, modelo configurável. Respostas de IA dependem da API e podem ter custo.
- Cardápio com categoria, busca, personalização, carrinho local e checkout sem cadastro.
- Revalidação de preços e modificadores no servidor; pedidos persistidos no PostgreSQL com controle de reenvio (`idempotencyKey`).
- Link privado de acompanhamento gerado via HMAC; status consultado periodicamente, WhatsApp com mensagem pronta por iniciativa do usuário.
- Admin Light/Dark, métricas básicas reais, pedidos, KDS, PDV balcão/mesa/delivery com personalização e desconto, taxas fixas/por bairro, cálculo por km condicionado a serviços próprios, mesas com QR, financeiro de receita confirmada e despesas, cadastro de entregadores, conteúdo básico e popup por URL.
- Área do entregador com login, pedidos atribuídos, endereço, Google Maps e Waze, status e consentimento para GPS periódico; fila local de ações pendentes com tentativa de sincronização.
- PWA com manifest e service worker para recursos públicos, com limitações de offline explicitadas.

## Limites conhecidos e pendências relevantes

- **Não foi possível executar build** nesta sessão: o registro do npm ficou indisponível (`EAI_AGAIN`). Não houve simulação de deploy.
- Não há integração oficial de envio automático WhatsApp, Mercado Pago ou PagBank.
- Para aviso automático via WhatsApp é necessária uma integração permitida pela Meta ou outro provedor, sujeitos a termos e possíveis tarifas. Abrir um link `wa.me` **não é envio automático**.
- Rastreamento do entregador pelo navegador é experimental; sem segundo plano garantido. O cliente agora vê a última posição recente em mapa OSM incorporado durante a entrega; ainda não há geofencing ou mapa MapLibre com rota. Traccar ou aplicativo nativo requer configuração separada.
- Taxas por bairro, taxa fixa e opção por km foram implementadas no código. O modo por km **só funciona** com geocodificação/roteamento externos configurados e testados; não há distância inventada. Veja `docs/DELIVERY-TAXAS-E-MAPA.md`.
- Impressão térmica: a tela por pedido `/admin/imprimir/[id]` agora formata a comanda nas larguras de 58/80 mm para impressão via navegador; ESC/POS, driver local e impressora real ainda precisam de homologação.
- Upload persistente da galeria/banner depende de storage compatível com Vercel; URLs externas funcionam no marketing. A galeria e o blog CMS agora possuem rotas e edição pelo painel. As promoções avançadas e financeiro com conciliação e fechamento de caixa completo permanecem pendentes.
- O QR das mesas agora é gerado localmente em SVG no servidor, sem expor tokens a geradores externos. Requer instalar o pacote `qrcode` antes do build.
- Falta habilitar e testar com PostgreSQL real, executar scripts E2E e testes de produção/mobile.

Veja [docs/IMPLEMENTACAO.md](docs/IMPLEMENTACAO.md) para checklist e [docs/GITHUB-RESEARCH.md](docs/GITHUB-RESEARCH.md) para referências open-source.

## Avanços da rodada 2 (14/11/2026)

- Preços oficiais, categorias e cinco itens protegidos como rascunho.
- Ampliação das páginas impressas no site.
- Cotação de entrega no checkout e regras editáveis no painel (fixa, por bairro, por km com serviço configurado, frete grátis).
- Mapinha de localização mais recente durante o trajeto, sem simulação de GPS.
- Testes de catálogo e regras de entrega.
- Comanda individual para impressão por navegador (58/80 mm) com autorização por perfil, sem emissão fiscal.

Leia também `docs/CARDAPIO-OFICIAL.md` e `docs/DELIVERY-TAXAS-E-MAPA.md`.


## Rodada 3 — refino operacional e CMS (14/11/2026)

A V3 acrescenta **editor de adicionais e PDV**, validações de concorrência dos pedidos, melhorias na cozinha, galeria e blog editáveis, QR de mesa no próprio servidor e escolha de modelos de IA consultados junto às APIs configuradas. O atendimento mecânico segue independente das APIs.

Para upload de imagens no admin, configure `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`, `S3_REGION`, `S3_PUBLIC_BASE_URL` e o CORS do bucket. Sem esses valores, o upload indica que está indisponível; nenhuma imagem é gravada no disco da Vercel.

O teste de fumaça para uma implantação ativa é `BASE_URL=https://SEU-SITE npm run smoke`; verifica páginas públicas e proteção dos endpoints, sem gerar pedidos.

**Importante:** este pacote foi validado com testes de domínio e sintaxe, mas **não foi possível instalar dependências, rodar `next build` ou conectar um PostgreSQL real neste ambiente.** A ausência dessa validação impede tratar o projeto como concluído para produção. Consulte `docs/RELATORIO-RODADA-3.md` para pendências e roteiro de homologação.
