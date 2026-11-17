# El Santo — Relatório técnico da rodada 3

**Data:** 14/11/2026  
**Base:** V2 do El Santo, construída a partir dos logotipos, imagens e dos dois cardápios oficiais disponibilizados pelo proprietário. O código original do Chat Z.AI não estava incluído no arquivo de pendências.

## Trabalho adicional realizado nesta rodada

1. **Integridade dos pedidos:** transições operacionais verificadas no servidor, atualização condicional para evitar sobrescrita concorrente, eventos de auditoria e sincronismo pedido/entrega.
2. **Entregadores:** atribuição e reatribuição protegidas, verificação da sequência de status, GPS aceito somente da entrega ativa do próprio motorista, recusa de localização ultrapassada e limpeza de localização ao finalizar.
3. **Histórico de pedidos:** timeline adaptada a retirada, mesa e delivery; recuperação local de links do próprio dispositivo sem armazenar nome, telefone ou endereço.
4. **Galeria administrável:** adicionar, editar, ordenar, ocultar e excluir itens; imagens publicadas são exibidas na página inicial, com fotos originais como fallback.
5. **Artigos/blog:** CRUD com publicação/rascunho, página de listagem e artigo individual, metadados públicos; conteúdo renderizado como texto sem interpretar HTML fornecido pelo editor.
6. **Uploads externos:** assinatura HTTPS temporária para S3/R2 e validação de tamanho/formato; depende de bucket, chaves, domínio e política CORS configurados. Arquivos não são gravados no sistema de arquivos efêmero da Vercel.
7. **Cozinha:** KDS com avisos sonoros opcionais, atualização periódica, distinção de novas comandas e estado READY separado da fila de preparo, preservando o histórico.
8. **PDV:** busca e filtro de catálogo, personalização de produtos, quantidades, desconto autorizado pelo operador, mesa/delivery/retirada e consulta de taxa antes de registrar. Toda cobrança é recalculada no backend.
9. **Cardápio admin:** editor estruturado de grupos de opções e adicionais, com limites mínimo/máximo e valores em centavos.
10. **Mesas:** geração local de QR Code SVG, sem transmissão de identificadores de mesa a gerador externo.
11. **Entregador offline:** fila local de ações com identificação de pendências e opção de descarte; sincronização posterior não significa que o servidor recebeu uma ação enquanto o aparelho estava sem conexão.
12. **IA:** escolha de Gemini/OpenAI, consulta protegida ao catálogo de modelos das contas configuradas, edição manual de ID e fallback mecânico. As APIs de inferência podem ter custo.
13. **Segurança e relatórios:** validação de upload, cabeçalhos de segurança e fronteira de dia/mês de São Paulo para métricas. Limitador de tentativas em memória é apenas auxiliar e deve ser substituído por limitador distribuído em produção.
14. **Validação de produção:** script `npm run smoke` para páginas públicas e autorização de rotas em uma implantação ativa, sem criar pedidos nem alterar dados.

## Testes realmente executados

- Testes Node de domínio: executar `npm test` para verificar novamente os casos implementados.
- Análise sintática dos arquivos TypeScript/TSX com transpilador TypeScript global. **Não substitui o `tsc --noEmit` nem o build real.**
- Verificação de integridade ZIP após empacotamento.

**Bloqueio:** não foi possível instalar `@prisma/client` ou executar `next build`, pois o acesso ao registro do npm está indisponível neste ambiente e não há conexão PostgreSQL real de testes. O projeto não foi homologado para produção, publicado na Vercel nem integrado a meios de pagamento.

## Funcionalidades que ainda exigem implementação ou homologação

- Checkout Pix/cartão com Mercado Pago/PagBank, webhooks e conciliação financeira: **não ativo**.
- Envio automático de WhatsApp via serviço oficial: **não ativo**. Link `wa.me` depende do envio pelo usuário; soluções não oficiais podem violar termos e não garantem confiabilidade.
- GPS com tela bloqueada e aviso automático de proximidade: requer app nativo/Traccar/servidor e testes de campo; o navegador pode suspender sensores.
- Cálculo de frete por km: requer endpoints reais de geocodificação e rotas via `GEOCODER_BASE_URL` e `ROUTER_BASE_URL`.
- Impressão ESC/POS silenciosa: não implementada; impressão de comanda pelo navegador (58/80mm) requer teste físico e driver.
- Financeiro: gerenciamento básico de pagamentos confirmados e despesas, ainda sem conciliação bancária, fechamento de caixa avançado e emissão fiscal.
- Menu: 38 itens cadastrados a partir de duas páginas, cinco rascunhos de opções não verificadas, bebidas sem preço oficial não inventadas.
- Autenticação e segurança: teste de penetração, monitoramento, rate limiter distribuído, backups automatizados e política LGPD dependem do ambiente de produção.
- Layout e recursos PWA: auditoria visual real e testes em Android/iOS necessários.
- Build completo, migração versionada do banco e teste transacional de pedidos em produção continuam pendentes.

## Caminho para homologação

1. Rodar `npm install`, `npx prisma generate`, `npx prisma migrate dev --name initial` em banco **descartável**, e inspecionar a migração antes de aplicação em produção.
2. Confirmar que `npm run build`, `npm test` e `npx tsc --noEmit` passaram.
3. Configurar `.env` no ambiente com segredos reais, PostgreSQL externo, backups e domínio.
4. Rodar seed em banco novo, conferir produtos e cadastrar admin com senha segura.
5. Testar ponta a ponta pedido público, mesa, retirada, PDV, cozinha, dashboard, motoboy, desconto, cancelamento, frete, galeria, blog e IA mecânica.
6. Verificar CORS do R2/S3 antes de tentar upload pelo admin.
7. Testar em aparelhos Android/iOS, impressoras reais e redes instáveis.
8. Com uma URL de preview, rodar `BASE_URL=https://... npm run smoke`.
9. Só depois disso configurar domínio e ativar pedidos reais.

**Nota de engenharia:** não é correto tratar esta entrega como sistema 100% finalizado ou cobrar clientes antes da validação ponta a ponta. As funções que requerem provedor externo não são simuladas como se estivessem conectadas.
