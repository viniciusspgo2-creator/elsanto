# El Santo — Relatório técnico V4

**Data:** 14/11/2026  
**Base:** V3 (`EL-SANTO-NEXTJS-V3-REFINAMENTO-OPERACIONAL.zip`). Esta é uma cópia independente da V3; nenhuma alteração foi feita nos arquivos originais ou no servidor.

## Implementações desta rodada

1. **Alertas de pedidos no admin:** endpoint autenticado `/api/admin/order-alerts` (ADMIN/MANAGER/CASHIER), consultas leves de pedidos recebidos a cada 20 segundos, contador visível no cabeçalho e som ativado explicitamente pelo operador. A cozinha conserva seus avisos próprios.
2. **Atualização automática das telas:** dashboard a cada 30 segundos e pedidos a cada 15 segundos, somente com a aba visível. Atualizações silenciosas preservam a apresentação atual.
3. **Checkout idempotente:** reenvio do mesmo carrinho utiliza a mesma chave; alterações de itens, pagamento ou endereço geram uma nova chave. Evita que uma tentativa anterior seja confundida com um pedido editado.
4. **QR da mesa:** pedidos com token válido são associados à mesa, mesmo se a origem vier identificada como WEB; nome opcional na experiência de QR, aviso claro quando falta token.
5. **Suspensão de pedidos online:** API `/api/store/status` sem cache, estado atualizado no checkout, bloqueio visual e validação final no backend. **O PDV interno continua autorizado a registrar pedidos mesmo com o site online pausado.** O modo sem bloqueio manual é explicitamente descrito, não como horário automático já implementado.
6. **Contenção de abuso básica:** limites por minuto para criação de pedidos e consulta de taxas, em memória por instância. **Não substitui** proteção distribuída ou WAF em produção.
7. **PWA mais segura:** cache de páginas públicas sem parâmetros de consulta; exclusão de `/pedido`, `/admin`, `/entregador`, `/api` e dados dinâmicos; assets estáticos versionados do Next.js podem ser cacheados para carregar a interface pública offline. Limpeza de caches antigos e tela offline dedicada. Pedidos não são recebidos offline.
8. **Fotos reais no catálogo:** fotos enviadas pelo painel deixam de ser rotuladas como "imagem ilustrativa"; itens ainda sem foto continuam identificados corretamente.
9. **Auditoria automatizada:** `npm run audit` confere assets locais, ícones obrigatórios, cardápio impresso e a exclusão de rotas privadas do cache da PWA.
10. **Testes de regressão:** acrescentados testes de chave idempotente e suspensão de canais de pedido, sem mexer em valores e opções do cardápio oficial.

## Verificações efetivamente executadas

- `npm test` — **21 testes passaram**.
- `npm run audit` — passou (referências locais a assets e exclusão de rotas privadas).
- `node --check public/sw.js` — passou.
- Parser do TypeScript global — **93 arquivos TS/TSX sem diagnósticos de sintaxe**. Isso **não é** verificação completa de tipos.
- Tentativa de `npm install` — indisponível neste ambiente (sem conclusão de download do registry); `node_modules` ausente.
- `tsc --noEmit` — não homologado; pacotes React, Next e Prisma não foram instalados; relatório de erros inclui módulos ausentes.
- **Build real, banco, navegação e impressão física não foram homologados**.

## Pendências de produção

1. Instalar dependências num ambiente com acesso ao npm e executar `npm run build`, `npx prisma generate`, `npx tsc --noEmit` e `npm run audit`.
2. Subir PostgreSQL **descartável**, revisar o schema/migrações, rodar seed, criar credenciais seguras e testar pedidos/PDV/KDS, taxas e financeiro ponta a ponta.
3. Revalidar preços/opcionais ainda pendentes do cardápio e cadastrar preços das bebidas não identificadas nas fontes.
4. Configurar R2/S3 para upload persistente e revisar CORS/segurança.
5. Para mensagens automáticas no WhatsApp, usar integração oficial aprovada, respeitando políticas e eventual custo; `wa.me` permanece manual e gratuito.
6. Testar notificações, GPS e PWA em Android/iOS reais; GPS do navegador pode suspender em segundo plano.
7. Testar impressão 58/80 mm em impressora e navegador reais. Para impressão silenciosa é necessária integração local/hardware específica.
8. Caso seja necessário cálculo de frete por km, contratar ou hospedar geocodificador/roteador compatível. Sem ele, usar taxa fixa/por bairro.
9. Testar limites distribuídos, backups e monitoramento antes de publicar. Pix/cartão online via Mercado Pago/PagBank permanecem planejados, não ativos.
10. Configurar Vercel (segredos, banco, storage, domínio) e executar smoke tests em deployment de preview antes de produção.

**Nenhum deploy ou modificação em dados de clientes foi realizado nesta rodada.**
